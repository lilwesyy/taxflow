import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'

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
    return { valid: false, error: 'Password must be at least 8 characters long' }
  }
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' }
  }
  return { valid: true }
}

const validateName = (name: string): { valid: boolean; sanitized?: string; error?: string } => {
  const trimmed = name.trim()
  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters long' }
  }
  if (trimmed.length > 100) {
    return { valid: false, error: 'Name is too long (max 100 characters)' }
  }
  if (!/^[a-zA-ZÀ-ÿ\s'\-]+$/.test(trimmed)) {
    return { valid: false, error: 'Name contains invalid characters' }
  }
  const sanitized = trimmed.replace(/\s+/g, ' ')
  return { valid: true, sanitized }
}

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isPasswordValid = await user.comparePassword(password.trim())
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = generateToken((user._id as any).toString())

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
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role = 'business' } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' })
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
      return res.status(409).json({ error: 'User already exists with this email' })
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
      return res.status(409).json({ error: 'User already exists with this email' })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Rimuovi la chiamata a connectDB dalle routes - ora è fatto all'avvio del server
export default router