import type { VercelRequest, VercelResponse } from '@vercel/node'
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

// User model
const User = mongoose.models.User || mongoose.model('User', UserSchema)

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await connectDB()

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate token
    const token = generateToken(user._id.toString())

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
}