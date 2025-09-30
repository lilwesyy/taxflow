import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// MongoDB User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['business', 'admin'], default: 'business' },
  phone: { type: String },
  professionalRole: { type: String },
  bio: { type: String },
  address: { type: String },
  fiscalCode: { type: String },
  registrationNumber: { type: String },
  notificationSettings: {
    emailNewClient: { type: Boolean, default: true },
    emailNewRequest: { type: Boolean, default: true },
    emailPayment: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: true }
  }
}, { timestamps: true })

// User model type
interface NotificationSettings {
  emailNewClient: boolean
  emailNewRequest: boolean
  emailPayment: boolean
  pushNotifications: boolean
  weeklyReport: boolean
}

interface IUser extends mongoose.Document {
  email: string
  password: string
  name: string
  role: 'business' | 'admin'
  phone?: string
  professionalRole?: string
  bio?: string
  address?: string
  fiscalCode?: string
  registrationNumber?: string
  notificationSettings?: NotificationSettings
  createdAt: Date
  updatedAt: Date
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
    return mongoose.connections[0]
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw error
  }
}

// Verify JWT token
const verifyToken = (token: string): { userId: string } => {
  const JWT_SECRET = process.env.JWT_SECRET || 'taxflow_jwt_secret_key_2024'
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch (error) {
    throw new Error('Invalid token')
  }
}

// Email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// Name validation
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

export async function PUT(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Verify token
    let decoded
    try {
      decoded = verifyToken(token)
    } catch (error) {
      return Response.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // Parse body
    let body: any
    try {
      body = await request.json()
    } catch (e) {
      return Response.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    const { name, email, phone, professionalRole, bio, address, fiscalCode, registrationNumber, currentPassword, newPassword, notificationSettings } = body

    // Connect to database
    await connectDB()

    // Find user
    const user = await User.findById(decoded.userId)
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Update name if provided
    if (name !== undefined) {
      if (typeof name !== 'string') {
        return Response.json({ error: 'Name must be a string' }, { status: 400 })
      }

      const nameValidation = validateName(name)
      if (!nameValidation.valid) {
        return Response.json({ error: nameValidation.error }, { status: 400 })
      }

      user.name = nameValidation.sanitized!
    }

    // Update email if provided
    if (email !== undefined) {
      if (typeof email !== 'string') {
        return Response.json({ error: 'Email must be a string' }, { status: 400 })
      }

      const normalizedEmail = email.trim().toLowerCase()

      if (!isValidEmail(normalizedEmail)) {
        return Response.json({ error: 'Invalid email format' }, { status: 400 })
      }

      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email: normalizedEmail })
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return Response.json({ error: 'Email already in use' }, { status: 409 })
      }

      user.email = normalizedEmail
    }

    // Update optional profile fields
    if (phone !== undefined) user.phone = phone?.trim() || undefined
    if (professionalRole !== undefined) user.professionalRole = professionalRole?.trim() || undefined
    if (bio !== undefined) user.bio = bio?.trim() || undefined
    if (address !== undefined) user.address = address?.trim() || undefined
    if (fiscalCode !== undefined) user.fiscalCode = fiscalCode?.trim().toUpperCase() || undefined
    if (registrationNumber !== undefined) user.registrationNumber = registrationNumber?.trim() || undefined

    // Update notification settings if provided
    if (notificationSettings !== undefined) {
      user.notificationSettings = notificationSettings
    }

    // Update password if provided
    if (newPassword !== undefined) {
      if (!currentPassword) {
        return Response.json({ error: 'Current password is required to change password' }, { status: 400 })
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isPasswordValid) {
        return Response.json({ error: 'Current password is incorrect' }, { status: 401 })
      }

      // Validate new password strength
      if (newPassword.length < 8) {
        return Response.json({ error: 'New password must be at least 8 characters long' }, { status: 400 })
      }

      if (newPassword.length > 128) {
        return Response.json({ error: 'New password is too long' }, { status: 400 })
      }

      if (!/[A-Z]/.test(newPassword)) {
        return Response.json({ error: 'New password must contain at least one uppercase letter' }, { status: 400 })
      }

      if (!/[a-z]/.test(newPassword)) {
        return Response.json({ error: 'New password must contain at least one lowercase letter' }, { status: 400 })
      }

      if (!/[0-9]/.test(newPassword)) {
        return Response.json({ error: 'New password must contain at least one number' }, { status: 400 })
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(newPassword, salt)
    }

    // Save user
    await user.save()

    return Response.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        professionalRole: user.professionalRole,
        bio: user.bio,
        address: user.address,
        fiscalCode: user.fiscalCode,
        registrationNumber: user.registrationNumber,
        notificationSettings: user.notificationSettings || {
          emailNewClient: true,
          emailNewRequest: true,
          emailPayment: false,
          pushNotifications: true,
          weeklyReport: true
        },
        updatedAt: user.updatedAt
      }
    })
  } catch (error: any) {
    console.error('Update user error:', error)

    // Gestione errori specifici di MongoDB
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      return Response.json({ error: 'Database connection error' }, { status: 503 })
    }

    // Gestione errori di duplicazione
    if (error.code === 11000) {
      return Response.json({ error: 'Email already in use' }, { status: 409 })
    }

    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}