import type { VercelRequest, VercelResponse } from '@vercel/node'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mircoraffaele1:RzpajVO0YHTG2p7S@cluster0.jgzik.mongodb.net/taxflow?retryWrites=true&w=majority&appName=Cluster0'
const JWT_SECRET = process.env.JWT_SECRET || 'taxflow_jwt_secret_key_2024'

// User Schema and Model
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['business', 'admin'], default: 'business' },
  registrationApprovalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  pivaFormSubmitted: { type: Boolean, default: false },
  pivaApprovalStatus: { type: String, enum: ['pending', 'approved', 'rejected'] },

  // Stripe & Subscription
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  selectedPlan: {
    id: String,
    stripePriceId: String,
    name: String,
    price: Number,
    type: { type: String, enum: ['annual', 'monthly'] },
    interval: { type: String, enum: ['year', 'month'] }
  },
  subscriptionStatus: {
    type: String,
    enum: ['pending_payment', 'active', 'past_due', 'canceled', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid']
  },
  subscriptionCurrentPeriodStart: { type: Date },
  subscriptionCurrentPeriodEnd: { type: Date },
  subscriptionCancelAtPeriodEnd: { type: Boolean, default: false },

  // Other fields
  pivaRequestData: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, default: 'new' }
}, { timestamps: true, strict: false })

const User = mongoose.models.User || mongoose.model('User', UserSchema)

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connections[0].readyState) return
  await mongoose.connect(MONGODB_URI)
}

// Verify JWT token
function verifyToken(req: VercelRequest): { userId: string; role: string } | null {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
    return decoded
  } catch {
    return null
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await connectDB()

    // Verify admin authentication
    const auth = verifyToken(req)
    if (!auth || auth.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' })
    }

    const { userId, planId } = req.body

    if (!userId || !planId) {
      return res.status(400).json({ error: 'userId and planId are required' })
    }

    // Import subscription plans
    const { getPlanById } = await import('../../shared/subscriptionPlans')
    const selectedPlan = getPlanById(planId)

    if (!selectedPlan) {
      return res.status(400).json({ error: 'Invalid plan ID' })
    }

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if user has submitted P.IVA form
    if (!user.pivaFormSubmitted) {
      return res.status(400).json({ error: 'User has not submitted P.IVA request' })
    }

    // Update user with approved status and selected plan
    user.pivaApprovalStatus = 'approved'
    user.selectedPlan = {
      id: selectedPlan.id,
      stripePriceId: selectedPlan.stripePriceId,
      name: selectedPlan.name,
      price: selectedPlan.price,
      type: selectedPlan.type,
      interval: selectedPlan.interval
    }
    user.subscriptionStatus = 'pending_payment'

    await user.save()

    // TODO: Send email notification to user about approval and payment required

    return res.status(200).json({
      success: true,
      message: 'User approved with plan. User must now complete payment.',
      data: {
        userId: user._id,
        pivaApprovalStatus: user.pivaApprovalStatus,
        selectedPlan: user.selectedPlan,
        subscriptionStatus: user.subscriptionStatus
      }
    })

  } catch (error) {
    console.error('Error approving user with plan:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
