import type { VercelRequest, VercelResponse } from '@vercel/node'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import Stripe from 'stripe'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mircoraffaele1:RzpajVO0YHTG2p7S@cluster0.jgzik.mongodb.net/taxflow?retryWrites=true&w=majority&appName=Cluster0'
const JWT_SECRET = process.env.JWT_SECRET || 'taxflow_jwt_secret_key_2024'
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''

if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia'
})

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['business', 'admin'], default: 'business' },

  stripeCustomerId: { type: String },
  selectedPlan: {
    id: String,
    stripePriceId: String,
    name: String,
    price: Number,
    type: { type: String, enum: ['annual', 'monthly'] },
    interval: { type: String, enum: ['year', 'month'] }
  },
  subscriptionStatus: { type: String },
  pivaApprovalStatus: { type: String }
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

    // Verify authentication
    const auth = verifyToken(req)
    if (!auth || auth.role !== 'business') {
      return res.status(403).json({ error: 'Unauthorized. Business user access required.' })
    }

    // Get plan ID from request body
    const { planId } = req.body
    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' })
    }

    // Import subscription plans
    const { SUBSCRIPTION_PLANS } = await import('../../frontend/src/config/subscriptionPlans')

    // Find the selected plan
    const selectedPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === planId)
    if (!selectedPlan) {
      return res.status(400).json({ error: 'Invalid plan ID' })
    }

    // Find user
    const user = await User.findById(auth.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if user has been approved
    if (user.pivaApprovalStatus !== 'approved') {
      return res.status(400).json({ error: 'Your P.IVA request has not been approved yet' })
    }

    if (user.subscriptionStatus === 'active') {
      return res.status(400).json({ error: 'You already have an active subscription' })
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = user.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      })
      stripeCustomerId = customer.id
      user.stripeCustomerId = stripeCustomerId
      await user.save()
    }

    // Import SETUP_FEE
    const { SETUP_FEE } = await import('../../frontend/src/config/subscriptionPlans')

    // Save selected plan to user
    user.selectedPlan = {
      id: selectedPlan.id,
      stripePriceId: selectedPlan.stripePriceId,
      name: selectedPlan.name,
      price: selectedPlan.price,
      type: selectedPlan.type,
      interval: selectedPlan.interval
    }
    await user.save()

    // Check if user already has P.IVA (no setup fee needed)
    const hasExistingPiva = user.pivaRequestData?.hasExistingPiva || false

    // Build line items - conditionally include setup fee
    const lineItems: Array<{ price: string; quantity: number }> = [
      {
        price: selectedPlan.stripePriceId,
        quantity: 1
      }
    ]

    // Only add setup fee if user doesn't have existing P.IVA
    if (!hasExistingPiva) {
      lineItems.push({
        price: SETUP_FEE.stripePriceId,
        quantity: 1
      })
    }

    // Create Checkout Session with subscription + conditional setup fee
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: lineItems,
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?payment=canceled`,
      metadata: {
        userId: user._id.toString(),
        planId: selectedPlan.id
      },
      subscription_data: {
        metadata: {
          userId: user._id.toString(),
          planId: selectedPlan.id
        }
      }
    })

    return res.status(200).json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
