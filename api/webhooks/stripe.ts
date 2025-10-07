import type { VercelRequest, VercelResponse } from '@vercel/node'
import mongoose from 'mongoose'
import Stripe from 'stripe'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mircoraffaele1:RzpajVO0YHTG2p7S@cluster0.jgzik.mongodb.net/taxflow?retryWrites=true&w=majority&appName=Cluster0'
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''

if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia'
})

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  subscriptionStatus: { type: String },
  subscriptionCurrentPeriodStart: { type: Date },
  subscriptionCurrentPeriodEnd: { type: Date },
  subscriptionCancelAtPeriodEnd: { type: Boolean },
  status: { type: String },
  pivaApprovalStatus: { type: String }
}, { timestamps: true, strict: false })

const User = mongoose.models.User || mongoose.model('User', UserSchema)

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connections[0].readyState) return
  await mongoose.connect(MONGODB_URI)
}

export const config = {
  api: {
    bodyParser: false, // Stripe requires raw body
  },
}

// Helper to read raw body
async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await connectDB()

    const rawBody = await getRawBody(req)
    const sig = req.headers['stripe-signature']

    if (!sig) {
      return res.status(400).json({ error: 'No signature provided' })
    }

    let event: Stripe.Event

    // Verify webhook signature
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return res.status(400).json({ error: 'Invalid signature' })
    }

    console.log(`Processing webhook event: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (!userId) {
          console.error('No userId in session metadata')
          break
        }

        const user = await User.findById(userId)
        if (!user) {
          console.error(`User ${userId} not found`)
          break
        }

        // Update user with subscription ID if subscription was created
        if (session.subscription) {
          user.stripeSubscriptionId = session.subscription as string
          user.subscriptionStatus = 'trialing' // Will be updated by subscription.created event
          await user.save()
        }

        console.log(`Checkout completed for user ${userId}`)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const userId = subscription.metadata?.userId

        // Find user by stripeCustomerId or userId in metadata
        const query = userId
          ? { _id: userId }
          : { stripeCustomerId: customerId }

        const user = await User.findOne(query)

        if (!user) {
          console.error(`User not found for subscription ${subscription.id}`)
          break
        }

        // Update subscription details
        user.stripeSubscriptionId = subscription.id
        user.subscriptionStatus = subscription.status as any
        user.subscriptionCurrentPeriodStart = new Date(subscription.current_period_start * 1000)
        user.subscriptionCurrentPeriodEnd = new Date(subscription.current_period_end * 1000)
        user.subscriptionCancelAtPeriodEnd = subscription.cancel_at_period_end

        // If subscription is active, update user status
        if (subscription.status === 'active') {
          user.status = 'active'
        }

        await user.save()

        console.log(`Subscription ${event.type} for user ${user._id}: ${subscription.status}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const user = await User.findOne({ stripeCustomerId: customerId })

        if (!user) {
          console.error(`User not found for deleted subscription ${subscription.id}`)
          break
        }

        user.subscriptionStatus = 'canceled'
        user.status = 'inactive'
        await user.save()

        console.log(`Subscription deleted for user ${user._id}`)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const user = await User.findOne({ stripeCustomerId: customerId })

        if (!user) {
          console.error(`User not found for invoice ${invoice.id}`)
          break
        }

        // If this is the first successful payment
        if (user.subscriptionStatus !== 'active') {
          user.subscriptionStatus = 'active'
          user.status = 'active'
          await user.save()

          // TODO: Send welcome email with dashboard access
          console.log(`First payment succeeded for user ${user._id}. Account activated.`)
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const user = await User.findOne({ stripeCustomerId: customerId })

        if (!user) {
          console.error(`User not found for failed invoice ${invoice.id}`)
          break
        }

        user.subscriptionStatus = 'past_due'
        await user.save()

        // TODO: Send payment failed email notification
        console.log(`Payment failed for user ${user._id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return res.status(200).json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return res.status(500).json({
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
