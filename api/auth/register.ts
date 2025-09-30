import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// MongoDB User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['business', 'admin'], default: 'business' }
}, { timestamps: true })

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// User model type
interface IUser extends mongoose.Document {
  email: string
  password: string
  name: string
  role: 'business' | 'admin'
}

// User model
const User = (mongoose.models.User || mongoose.model('User', UserSchema)) as mongoose.Model<IUser>

// Database connection
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return mongoose.connections[0]
  }

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Vercel-Admin-taxflow-db:6aWf0UVqFNzkVVEQ@taxflow-db.vvbfmn6.mongodb.net/?retryWrites=true&w=majority'

  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    return mongoose.connections[0]
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw error
  }
}

// Generate JWT Token
const generateToken = (userId: string): string => {
  const JWT_SECRET = process.env.JWT_SECRET || 'taxflow_jwt_secret_key_2024'
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' })
}

// Email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// Password strength validation
const validatePasswordStrength = (password: string): { valid: boolean; error?: string } => {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' }
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password is too long' }
  }

  // Almeno una lettera maiuscola
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' }
  }

  // Almeno una lettera minuscola
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' }
  }

  // Almeno un numero
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' }
  }

  return { valid: true }
}

// Name validation and sanitization
const validateName = (name: string): { valid: boolean; sanitized?: string; error?: string } => {
  const trimmed = name.trim()

  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters long' }
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Name is too long (max 100 characters)' }
  }

  // Permetti solo lettere, spazi, apostrofi e trattini
  if (!/^[a-zA-ZÀ-ÿ\s'\-]+$/.test(trimmed)) {
    return { valid: false, error: 'Name contains invalid characters' }
  }

  // Sanitizza: rimuovi spazi multipli
  const sanitized = trimmed.replace(/\s+/g, ' ')

  return { valid: true, sanitized }
}

// Role validation
const isValidRole = (role: string): boolean => {
  return ['business', 'admin'].includes(role)
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function POST(request: Request) {
  try {
    // Parse body con gestione errori
    let body: any
    try {
      body = await request.json()
    } catch (e) {
      return Response.json({ error: 'Invalid JSON in request body' }, { status: 400, headers: corsHeaders })
    }

    const { email, password, name, role = 'business' } = body

    // Validazione presenza campi obbligatori
    if (!email || !password || !name) {
      return Response.json({ error: 'Email, password, and name are required' }, { status: 400, headers: corsHeaders })
    }

    // Validazione tipo campi
    if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') {
      return Response.json({ error: 'Email, password, and name must be strings' }, { status: 400, headers: corsHeaders })
    }

    if (role && typeof role !== 'string') {
      return Response.json({ error: 'Role must be a string' }, { status: 400, headers: corsHeaders })
    }

    // Normalizzazione email
    const normalizedEmail = email.trim().toLowerCase()

    // Validazione formato email
    if (!isValidEmail(normalizedEmail)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400, headers: corsHeaders })
    }

    // Validazione forza password
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.valid) {
      return Response.json({ error: passwordValidation.error }, { status: 400, headers: corsHeaders })
    }

    // Validazione e sanitizzazione nome
    const nameValidation = validateName(name)
    if (!nameValidation.valid) {
      return Response.json({ error: nameValidation.error }, { status: 400, headers: corsHeaders })
    }

    // Validazione ruolo
    if (!isValidRole(role)) {
      return Response.json({ error: 'Invalid role. Must be "business" or "admin"' }, { status: 400, headers: corsHeaders })
    }

    // Connessione DB
    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return Response.json({ error: 'User already exists with this email' }, { status: 409, headers: corsHeaders })
    }

    // Create new user con dati sanitizzati
    const user = new User({
      email: normalizedEmail,
      password, // Sarà hashato dal pre-save hook
      name: nameValidation.sanitized,
      role
    })

    await user.save()

    // Generate token
    const token = generateToken(user._id.toString())

    return Response.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }, { status: 201, headers: corsHeaders })
  } catch (error: any) {
    console.error('Registration error:', error)

    // Gestione errori specifici di MongoDB
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      return Response.json({ error: 'Database connection error' }, { status: 503, headers: corsHeaders })
    }

    // Gestione errori di duplicazione (fallback)
    if (error.code === 11000) {
      return Response.json({ error: 'User already exists with this email' }, { status: 409, headers: corsHeaders })
    }

    // Gestione errori di validazione Mongoose
    if (error.name === 'ValidationError') {
      return Response.json({ error: 'Validation error: ' + error.message }, { status: 400, headers: corsHeaders })
    }

    return Response.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}