import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import speakeasy from 'speakeasy'
import User from '../models/User'
import Session from '../models/Session'
import { UAParser } from 'ua-parser-js'

const router = Router()

// Generate JWT Token
const generateToken = (userId: string): string => {
  const JWT_SECRET = process.env.JWT_SECRET || 'taxflow_jwt_secret_key_2024'
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' })
}

// Validation helpers
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

const validatePasswordStrength = (password: string): { valid: boolean; error?: string } => {
  if (password.length < 8) {
    return { valid: false, error: 'La password deve essere di almeno 8 caratteri' }
  }
  if (password.length > 128) {
    return { valid: false, error: 'La password è troppo lunga' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'La password deve contenere almeno una lettera maiuscola' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'La password deve contenere almeno una lettera minuscola' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'La password deve contenere almeno un numero' }
  }
  return { valid: true }
}

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
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password sono obbligatori' })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: 'Formato email non valido' })
    }

    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide' })
    }

    const isPasswordValid = await user.comparePassword(password.trim())
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenziali non valide' })
    }

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

    const token = generateToken((user._id as any).toString())

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
        role: user.role
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
    const token = generateToken((user._id as any).toString())

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
        role: user.role
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
    const { email, password, name, role = 'business' } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password e nome sono obbligatori' })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: 'Formato email non valido' })
    }

    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.error })
    }

    const nameValidation = validateName(name)
    if (!nameValidation.valid) {
      return res.status(400).json({ error: nameValidation.error })
    }

    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return res.status(409).json({ error: 'Esiste già un utente con questa email' })
    }

    const user = new User({
      email: normalizedEmail,
      password,
      name: nameValidation.sanitized,
      role
    })

    await user.save()

    const token = generateToken((user._id as any).toString())

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Esiste già un utente con questa email' })
    }
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Rimuovi la chiamata a connectDB dalle routes - ora è fatto all'avvio del server
export default router