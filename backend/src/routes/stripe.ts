import express from 'express'
import Stripe from 'stripe'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import Conversation from '../models/Conversation'
import Invoice from '../models/Invoice'
import User from '../models/User'

const router = express.Router()

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover'
})

// Webhook secret for signature verification
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

// Create a payment intent for a consultation
router.post('/create-payment-intent', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { conversationId } = req.body
    const userId = req.user!.userId
    const userRole = req.user!.role

    // Only business users can pay for consultations
    if (userRole !== 'business') {
      return res.status(403).json({ error: 'Solo i clienti possono effettuare pagamenti' })
    }

    // Find the conversation
    const conversation = await Conversation.findById(conversationId)
      .populate('businessUserId', 'name email')
      .populate('adminUserId', 'name')

    if (!conversation) {
      return res.status(404).json({ error: 'Conversazione non trovata' })
    }

    // Verify the conversation belongs to the user
    if (conversation.businessUserId._id.toString() !== userId) {
      return res.status(403).json({ error: 'Non autorizzato' })
    }

    // Check if already paid
    if (conversation.fatturata || conversation.stripePaymentStatus === 'succeeded') {
      return res.status(400).json({ error: 'Questa consulenza è già stata pagata' })
    }

    // Check if amount is valid
    if (!conversation.importo || conversation.importo <= 0) {
      return res.status(400).json({ error: 'Importo non valido' })
    }

    // Calculate total with VAT (22% IVA italiana)
    const totalAmount = Math.round(conversation.importo * 1.22 * 100) // Convert to cents

    // Create or retrieve existing payment intent
    let paymentIntent: Stripe.PaymentIntent

    if (conversation.stripePaymentIntentId) {
      // Retrieve existing payment intent
      try {
        paymentIntent = await stripe.paymentIntents.retrieve(conversation.stripePaymentIntentId)

        // If canceled or succeeded, create a new one
        if (paymentIntent.status === 'canceled' || paymentIntent.status === 'succeeded') {
          paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount,
            currency: 'eur',
            metadata: {
              conversationId: (conversation._id as any).toString(),
              businessUserId: userId,
              adminUserId: conversation.adminUserId?._id.toString() || '',
              argomento: conversation.argomento,
              tipo: conversation.tipo
            },
            description: `Consulenza: ${conversation.argomento}`
          })

          // Update conversation with new payment intent
          conversation.stripePaymentIntentId = paymentIntent.id
          conversation.stripePaymentStatus = 'pending'
          await conversation.save()
        }
      } catch (error) {
        // Payment intent not found, create new one
        paymentIntent = await stripe.paymentIntents.create({
          amount: totalAmount,
          currency: 'eur',
          metadata: {
            conversationId: (conversation._id as any).toString(),
            businessUserId: userId,
            adminUserId: conversation.adminUserId?._id.toString() || '',
            argomento: conversation.argomento,
            tipo: conversation.tipo
          },
          description: `Consulenza: ${conversation.argomento}`
        })

        conversation.stripePaymentIntentId = paymentIntent.id
        conversation.stripePaymentStatus = 'pending'
        await conversation.save()
      }
    } else {
      // Create new payment intent
      paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: 'eur',
        metadata: {
          conversationId: (conversation._id as any).toString(),
          businessUserId: userId,
          adminUserId: conversation.adminUserId?._id.toString() || '',
          argomento: conversation.argomento,
          tipo: conversation.tipo
        },
        description: `Consulenza: ${conversation.argomento}`
      })

      // Save payment intent ID to conversation
      conversation.stripePaymentIntentId = paymentIntent.id
      conversation.stripePaymentStatus = 'pending'
      await conversation.save()
    }

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    res.status(500).json({ error: 'Errore nella creazione del pagamento' })
  }
})

// Get payment status for a conversation
router.get('/payment-status/:conversationId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { conversationId } = req.params
    const userId = req.user!.userId
    const userRole = req.user!.role

    const conversation = await Conversation.findById(conversationId)

    if (!conversation) {
      return res.status(404).json({ error: 'Conversazione non trovata' })
    }

    // Verify user has access
    if (
      (userRole === 'business' && conversation.businessUserId.toString() !== userId) ||
      (userRole === 'admin' && conversation.adminUserId?.toString() !== userId)
    ) {
      return res.status(403).json({ error: 'Non autorizzato' })
    }

    res.json({
      fatturata: conversation.fatturata,
      stripePaymentStatus: conversation.stripePaymentStatus,
      stripePaymentIntentId: conversation.stripePaymentIntentId,
      paidAt: conversation.paidAt,
      importo: conversation.importo
    })
  } catch (error) {
    console.error('Error fetching payment status:', error)
    res.status(500).json({ error: 'Errore nel recupero dello stato del pagamento' })
  }
})

// Stripe webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']

  if (!sig) {
    return res.status(400).send('Missing signature')
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await handlePaymentSuccess(paymentIntent)
      break

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent
      await handlePaymentFailed(failedPayment)
      break

    case 'payment_intent.canceled':
      const canceledPayment = event.data.object as Stripe.PaymentIntent
      await handlePaymentCanceled(canceledPayment)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  res.json({ received: true })
})

// Helper: Handle successful payment
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const conversationId = paymentIntent.metadata.conversationId

    if (!conversationId) {
      console.error('Missing conversationId in payment intent metadata')
      return
    }

    const conversation = await Conversation.findById(conversationId)
      .populate('businessUserId', 'name email company')
      .populate('adminUserId', 'name')

    if (!conversation) {
      console.error('Conversation not found:', conversationId)
      return
    }

    // Update conversation
    conversation.fatturata = true
    conversation.stripePaymentStatus = 'succeeded'
    conversation.paidAt = new Date()
    await conversation.save()

    // Helper function to format date for Italian locale
    const formatItalianDate = (date: Date) => {
      if (!date) return ''
      const d = new Date(date)
      const day = d.getDate().toString().padStart(2, '0')
      const month = (d.getMonth() + 1).toString().padStart(2, '0')
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    }

    // Create permanent invoice record
    const invoice = new Invoice({
      conversationId: (conversation._id as any),
      businessUserId: conversation.businessUserId._id,
      adminUserId: conversation.adminUserId!._id,
      numero: `INV-${(conversation._id as any).toString().slice(-6).toUpperCase()}`,
      cliente: (conversation.businessUserId as any).name || 'Cliente sconosciuto',
      clienteEmail: (conversation.businessUserId as any).email || '',
      azienda: (conversation.businessUserId as any).company || 'Non specificata',
      consulente: (conversation.adminUserId as any).name || 'Non assegnato',
      servizio: conversation.argomento,
      tipo: conversation.tipo,
      importo: conversation.importo,
      iva: conversation.importo * 0.22,
      totale: conversation.importo * 1.22,
      status: 'paid',
      dataEmissione: formatItalianDate(conversation.paidAt || new Date()),
      dataPagamento: formatItalianDate(conversation.paidAt || new Date()),
      stripePaymentIntentId: paymentIntent.id,
      stripePaymentStatus: 'succeeded'
    })

    await invoice.save()

    console.log('✅ Payment succeeded and invoice created:', conversationId)
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

// Helper: Handle failed payment
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const conversationId = paymentIntent.metadata.conversationId

    if (!conversationId) {
      console.error('Missing conversationId in payment intent metadata')
      return
    }

    const conversation = await Conversation.findById(conversationId)

    if (!conversation) {
      console.error('Conversation not found:', conversationId)
      return
    }

    // Update conversation
    conversation.stripePaymentStatus = 'failed'
    await conversation.save()

    console.log('❌ Payment failed for conversation:', conversationId)
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

// Helper: Handle canceled payment
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    const conversationId = paymentIntent.metadata.conversationId

    if (!conversationId) {
      console.error('Missing conversationId in payment intent metadata')
      return
    }

    const conversation = await Conversation.findById(conversationId)

    if (!conversation) {
      console.error('Conversation not found:', conversationId)
      return
    }

    // Update conversation
    conversation.stripePaymentStatus = 'canceled'
    await conversation.save()

    console.log('🚫 Payment canceled for conversation:', conversationId)
  } catch (error) {
    console.error('Error handling payment cancellation:', error)
  }
}

export default router
