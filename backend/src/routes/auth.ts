import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import speakeasy from 'speakeasy'
import crypto from 'crypto'
import User from '../models/User'
import Session from '../models/Session'
import { UAParser } from 'ua-parser-js'
import { validate } from '../middleware/validate'
import { loginSchema, registerSchema, verify2FASchema } from '../validators/auth'
import { sendPasswordResetEmail } from '../utils/emailService'

const router = Router()

// Generate JWT Token
const generateToken = (userId: string, role: 'business' | 'admin'): string => {
  const JWT_SECRET = process.env.JWT_SECRET

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables')
  }

  // Token expires after 6 hours of inactivity
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '6h' })
}

// Validation helpers
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// Password validation is now handled by Zod schema in validators/auth.ts

const validateName = (name: string): { valid: boolean; sanitized?: string; error?: string } => {
  const trimmed = name.trim()
  if (trimmed.length < 2) {
    return { valid: false, error: 'Il nome deve essere di almeno 2 caratteri' }
  }
  if (trimmed.length > 100) {
    return { valid: false, error: 'Il nome è troppo lungo (massimo 100 caratteri)' }
  }
  if (!/^[a-zA-ZÀ-ÿ\s'\-]+$/.test(trimmed)) {
    return { valid: false, error: 'Il nome contiene caratteri non validi' }
  }
  const sanitized = trimmed.replace(/\s+/g, ' ')
  return { valid: true, sanitized }
}

// Login
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const normalizedEmail = email.trim().toLowerCase()

    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide' })
    }

    const isPasswordValid = await user.comparePassword(password.trim())
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenziali non valide' })
    }

    // Allow login for business users even if not approved yet
    // They will see the pending screen in the frontend

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Return a temporary response indicating 2FA is required
      return res.json({
        success: true,
        requires2FA: true,
        userId: user._id,
        message: 'Inserisci il codice di autenticazione'
      })
    }

    const token = generateToken((user._id as any).toString(), user.role)

    // Parse user agent
    const userAgent = req.headers['user-agent'] || 'Unknown'
    const parser = new UAParser(userAgent)
    const ua = parser.getResult()

    // Create session
    try {
      await Session.create({
        userId: user._id,
        token: token,
        userAgent: userAgent,
        browser: ua.browser.name || 'Unknown',
        os: ua.os.name || 'Unknown',
        device: ua.device.type || 'desktop',
        ip: req.ip || req.socket.remoteAddress || 'Unknown',
        location: 'Unknown', // TODO: Add geolocation service
        lastActivity: new Date()
      })
    } catch (error) {
      console.error('Error creating session:', error)
      // Non blocchiamo il login se fallisce la creazione della sessione
    }

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
        registrationApprovalStatus: user.registrationApprovalStatus,
        pivaFormSubmitted: user.pivaFormSubmitted,
        pivaApprovalStatus: user.pivaApprovalStatus
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Verify 2FA code and complete login
router.post('/login/verify-2fa', async (req: Request, res: Response) => {
  try {
    const { userId, token: twoFAToken } = req.body

    if (!userId || !twoFAToken) {
      return res.status(400).json({ error: 'User ID e codice 2FA sono richiesti' })
    }

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ error: '2FA non è attivato per questo utente' })
    }

    // Verify the 2FA token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: twoFAToken,
      window: 2
    })

    if (!verified) {
      return res.status(401).json({ error: 'Codice di verifica non valido' })
    }

    // Generate JWT token
    const token = generateToken((user._id as any).toString(), user.role)

    // Parse user agent and create session
    const userAgent = req.headers['user-agent'] || 'Unknown'
    const parser = new UAParser(userAgent)
    const ua = parser.getResult()

    try {
      await Session.create({
        userId: user._id,
        token: token,
        userAgent: userAgent,
        browser: ua.browser.name || 'Unknown',
        os: ua.os.name || 'Unknown',
        device: ua.device.type || 'desktop',
        ip: req.ip || req.socket.remoteAddress || 'Unknown',
        location: 'Unknown',
        lastActivity: new Date()
      })
    } catch (error) {
      console.error('Error creating session:', error)
    }

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
        registrationApprovalStatus: user.registrationApprovalStatus,
        pivaFormSubmitted: user.pivaFormSubmitted,
        pivaApprovalStatus: user.pivaApprovalStatus
      }
    })
  } catch (error) {
    console.error('2FA verification error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone, role = 'business' } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password e nome sono obbligatori' })
    }

    if (role === 'business' && !phone) {
      return res.status(400).json({ error: 'Il numero di telefono è obbligatorio' })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: 'Formato email non valido' })
    }

    const nameValidation = validateName(name)
    if (!nameValidation.valid) {
      return res.status(400).json({ error: nameValidation.error })
    }

    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      // Generic error message to prevent email enumeration
      return res.status(400).json({ error: 'Impossibile completare la registrazione. Verifica i tuoi dati.' })
    }

    const user = new User({
      email: normalizedEmail,
      password,
      name: nameValidation.sanitized,
      phone: phone?.trim() || undefined,
      role
    })

    await user.save()

    const token = generateToken((user._id as any).toString(), user.role)

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
        registrationApprovalStatus: user.registrationApprovalStatus,
        pivaFormSubmitted: user.pivaFormSubmitted,
        pivaApprovalStatus: user.pivaApprovalStatus
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return res.status(409).json({ error: 'Esiste già un utente con questa email' })
    }
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Forgot Password - Request password reset
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email è obbligatoria' })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: 'Formato email non valido' })
    }

    const user = await User.findOne({ email: normalizedEmail })

    // For security reasons, always return success even if email doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return res.json({
        success: true,
        message: 'Se l\'email esiste nel nostro sistema, riceverai le istruzioni per il reset della password'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // Save hashed token and expiration (1 hour)
    user.resetPasswordToken = hashedToken
    user.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour
    await user.save()

    // Generate reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`

    // Send email with reset link
    try {
      await sendPasswordResetEmail(user.email, resetUrl)
      console.log('Password reset email sent successfully')
    } catch (emailError) {
      console.error('Failed to send password reset email')
      // Don't log sensitive information even in development
    }

    res.json({
      success: true,
      message: 'Se l\'email esiste nel nostro sistema, riceverai le istruzioni per il reset della password'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Reset Password - Set new password with token
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ error: 'Token e nuova password sono obbligatori' })
    }

    // Password validation is handled by Zod schema

    // Hash the token from URL to compare with database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({ error: 'Token non valido o scaduto' })
    }

    // Update password (will be hashed by pre-save hook)
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    // Invalidate all existing sessions for security
    await Session.deleteMany({ userId: user._id })

    res.json({
      success: true,
      message: 'Password reimpostata con successo. Puoi ora effettuare il login.'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Rimuovi la chiamata a connectDB dalle routes - ora è fatto all'avvio del server
export default router