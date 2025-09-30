import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

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
    type: mongoose.Schema.Types.Mixed,
    default: {
      emailNewClient: true,
      emailNewRequest: true,
      emailPayment: false,
      pushNotifications: true,
      weeklyReport: true
    }
  }
}, { timestamps: true, strict: false })

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

export async function GET(request: Request) {
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

    // Connect to database
    await connectDB()

    // Find user
    const user = await User.findById(decoded.userId).select('-password')
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('User found, notificationSettings:', user.notificationSettings)

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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })
  } catch (error: any) {
    console.error('Get user error:', error)

    // Gestione errori specifici di MongoDB
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      return Response.json({ error: 'Database connection error' }, { status: 503 })
    }

    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}