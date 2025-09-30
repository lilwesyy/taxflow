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

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// User model type
interface IUser extends mongoose.Document {
  email: string
  password: string
  name: string
  role: 'business' | 'admin'
  comparePassword(candidatePassword: string): Promise<boolean>
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

// Rate limiting storage (in-memory - per deployment instance)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minuti

const checkRateLimit = (identifier: string): { allowed: boolean; remainingTime?: number } => {
  const now = Date.now()
  const attempt = loginAttempts.get(identifier)

  if (!attempt) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now })
    return { allowed: true }
  }

  // Reset se è passato il periodo di lockout
  if (now - attempt.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now })
    return { allowed: true }
  }

  // Blocca se superato il limite
  if (attempt.count >= MAX_ATTEMPTS) {
    const remainingTime = Math.ceil((LOCKOUT_DURATION - (now - attempt.lastAttempt)) / 1000)
    return { allowed: false, remainingTime }
  }

  // Incrementa tentativi
  attempt.count++
  attempt.lastAttempt = now
  return { allowed: true }
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

    const { email, password } = body

    // Validazione presenza campi
    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400, headers: corsHeaders })
    }

    // Validazione tipo campi
    if (typeof email !== 'string' || typeof password !== 'string') {
      return Response.json({ error: 'Email and password must be strings' }, { status: 400, headers: corsHeaders })
    }

    // Trim e normalizzazione email
    const normalizedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()

    // Validazione formato email
    if (!isValidEmail(normalizedEmail)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400, headers: corsHeaders })
    }

    // Validazione lunghezza password
    if (trimmedPassword.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400, headers: corsHeaders })
    }

    if (trimmedPassword.length > 128) {
      return Response.json({ error: 'Password is too long' }, { status: 400, headers: corsHeaders })
    }

    // Rate limiting
    const rateLimitCheck = checkRateLimit(normalizedEmail)
    if (!rateLimitCheck.allowed) {
      return Response.json({
        error: `Too many login attempts. Please try again in ${rateLimitCheck.remainingTime} seconds`
      }, { status: 429, headers: corsHeaders })
    }

    // Connessione DB
    await connectDB()

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401, headers: corsHeaders })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(trimmedPassword)
    if (!isPasswordValid) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401, headers: corsHeaders })
    }

    // Reset rate limit on successful login
    loginAttempts.delete(normalizedEmail)

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
    }, { headers: corsHeaders })
  } catch (error: any) {
    console.error('Login error:', error)

    // Gestione errori specifici di MongoDB
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      return Response.json({ error: 'Database connection error' }, { status: 503, headers: corsHeaders })
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