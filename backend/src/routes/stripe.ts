import express from 'express'
import Stripe from 'stripe'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import Conversation from '../models/Conversation'
import Invoice from '../models/Invoice'
import User from '../models/User'
import PurchasedService from '../models/PurchasedService'
import {
  sendPivaApprovalEmail,
  sendPivaRejectionEmail,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendSubscriptionCreatedEmail,
  sendSubscriptionUpdatedEmail,
  sendSubscriptionCanceledEmail
} from '../utils/emailService'

const router = express.Router()

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover'
})

// Webhook secret for signature verification
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

// ====================================
// SUBSCRIPTION PLANS CONFIG
// ====================================
const SUBSCRIPTION_PLANS = [
  {
    id: 'piva-forfettari-annual',
    stripePriceId: process.env.STRIPE_PRICE_ANNUAL || 'price_1SFXReFtDiNzmnLqTmkvc331',
    name: 'P.IVA Forfettari - Annuale',
    price: 368.90,
    type: 'annual' as const,
    interval: 'year' as const
  },
  {
    id: 'piva-forfettari-monthly',
    stripePriceId: process.env.STRIPE_PRICE_MONTHLY || 'price_1SFXSAFtDiNzmnLq30etHrBg',
    name: 'P.IVA Forfettari - Mensile',
    price: 35.00,
    type: 'monthly' as const,
    interval: 'month' as const
  }
]

const SETUP_FEE = {
  stripePriceId: process.env.STRIPE_PRICE_SETUP || 'price_1SFXR4FtDiNzmnLqXalglNR6',
  price: 129.90
}

function getPlanById(planId: string) {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId)
}

// ====================================
// SUBSCRIPTION ROUTES
// ====================================

// Approve P.IVA request with subscription plan
router.post('/approve-with-plan', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role

    // Only admin can approve
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Solo gli admin possono approvare richieste' })
    }

    const { userId, planId } = req.body

    if (!userId || !planId) {
      return res.status(400).json({ error: 'userId e planId sono obbligatori' })
    }

    // Get subscription plan
    const selectedPlan = getPlanById(planId)

    if (!selectedPlan) {
      return res.status(400).json({ error: 'Piano non valido' })
    }

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    // Check if user has submitted P.IVA form
    if (!user.pivaFormSubmitted) {
      return res.status(400).json({ error: 'L\'utente non ha inviato la richiesta P.IVA' })
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
    user.subscriptionStatus = 'pending_payment' as any

    // Mark nested fields as modified for Mongoose
    user.markModified('selectedPlan')
    user.markModified('subscriptionStatus')

    await user.save()

    // Create pending invoice for setup fee + first subscription payment
    const invoiceNumber = await (Invoice as any).generateInvoiceNumber()
    const today = new Date().toISOString().split('T')[0]
    const setupFeeAmount = 129.90
    const subscriptionAmount = selectedPlan.price
    const totalAmount = setupFeeAmount + subscriptionAmount

    const invoice = new Invoice({
      businessUserId: user._id,
      numero: invoiceNumber,
      cliente: user.name,
      clienteEmail: user.email,
      azienda: user.company || '',
      servizio: `Setup P.IVA + ${selectedPlan.name}`,
      tipo: 'Abbonamento',
      importo: totalAmount,
      iva: 0, // IVA 0% per servizi finanziari
      totale: totalAmount,
      status: 'pending',
      dataEmissione: today,
      subscriptionPlanId: selectedPlan.id,
      subscriptionPlanName: selectedPlan.name,
      subscriptionInterval: selectedPlan.interval
    })

    await invoice.save()

    console.log(`✅ User ${userId} approved with plan ${planId}`)
    console.log('   - selectedPlan:', user.selectedPlan)
    console.log('   - subscriptionStatus:', user.subscriptionStatus)
    console.log(`✅ Invoice ${invoiceNumber} created (pending)`)

    // Send approval email
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'https://taxflow.it'
      const paymentUrl = `${frontendUrl}/dashboard?action=complete-payment`

      await sendPivaApprovalEmail(
        user.email,
        user.name,
        selectedPlan.name,
        totalAmount,
        paymentUrl
      )
      console.log(`📧 Approval email sent to ${user.email}`)
    } catch (emailError) {
      console.error('Error sending approval email:', emailError)
      // Don't block the approval process if email fails
    }

    res.json({
      success: true,
      message: 'Utente approvato. L\'utente deve completare il pagamento.',
      data: {
        userId: user._id,
        pivaApprovalStatus: user.pivaApprovalStatus,
        selectedPlan: user.selectedPlan,
        subscriptionStatus: user.subscriptionStatus,
        invoiceNumber: invoiceNumber
      }
    })
  } catch (error) {
    console.error('Error approving user with plan:', error)
    res.status(500).json({ error: 'Errore durante l\'approvazione' })
  }
})

// Reject P.IVA request with reason
router.post('/reject-piva', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role

    // Only admin can reject
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Solo gli admin possono rifiutare richieste' })
    }

    const { userId, reason } = req.body

    if (!userId || !reason) {
      return res.status(400).json({ error: 'userId e reason sono obbligatori' })
    }

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    // Check if user has submitted P.IVA form
    if (!user.pivaFormSubmitted) {
      return res.status(400).json({ error: 'L\'utente non ha inviato la richiesta P.IVA' })
    }

    // Update user with rejected status
    user.pivaApprovalStatus = 'rejected'
    user.pivaRejectionReason = reason

    await user.save()

    console.log(`❌ User ${userId} P.IVA request rejected`)
    console.log('   - Reason:', reason)

    // Send rejection email
    try {
      await sendPivaRejectionEmail(
        user.email,
        user.name,
        reason
      )
      console.log(`📧 Rejection email sent to ${user.email}`)
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError)
      // Don't block the rejection process if email fails
    }

    res.json({
      success: true,
      message: 'Richiesta P.IVA rifiutata',
      data: {
        userId: user._id,
        pivaApprovalStatus: user.pivaApprovalStatus,
        rejectionReason: reason
      }
    })
  } catch (error) {
    console.error('Error rejecting P.IVA request:', error)
    res.status(500).json({ error: 'Errore durante il rifiuto della richiesta' })
  }
})

// Create Stripe Checkout Session for subscription
router.post('/create-checkout', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const userRole = req.user!.role
    const { planId } = req.body

    // Only business users can create checkout
    if (userRole !== 'business') {
      return res.status(403).json({ error: 'Solo i clienti possono procedere al pagamento' })
    }

    // Validate plan ID
    if (!planId) {
      return res.status(400).json({ error: 'Piano non selezionato' })
    }

    // Find the selected plan
    const selectedPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === planId)
    if (!selectedPlan) {
      return res.status(400).json({ error: 'Piano non valido' })
    }

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    // Check if user has been approved
    if (user.pivaApprovalStatus !== 'approved') {
      return res.status(400).json({ error: 'La tua richiesta P.IVA non è ancora stata approvata' })
    }

    if (user.subscriptionStatus === 'active') {
      return res.status(400).json({ error: 'Hai già un abbonamento attivo' })
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = user.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: (user._id as any).toString()
        }
      })
      stripeCustomerId = customer.id
      user.stripeCustomerId = stripeCustomerId
      await user.save()
    }

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

    // Create Checkout Session with subscription + one-time setup fee
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: selectedPlan.stripePriceId,
          quantity: 1
        },
        {
          // One-time setup fee
          price: SETUP_FEE.stripePriceId,
          quantity: 1
        }
      ],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?payment=canceled`,
      metadata: {
        userId: (user._id as any).toString(),
        planId: selectedPlan.id
      },
      subscription_data: {
        metadata: {
          userId: (user._id as any).toString(),
          planId: selectedPlan.id
        }
      }
    })

    // Update pending invoice with checkout session ID
    await Invoice.findOneAndUpdate(
      {
        businessUserId: user._id,
        status: 'pending',
        subscriptionPlanId: user.selectedPlan.id
      },
      {
        stripeCheckoutSessionId: session.id
      },
      { sort: { createdAt: -1 } }
    )

    res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({
      error: 'Errore nella creazione della sessione di pagamento',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

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
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', errorMessage)
    return res.status(400).send(`Webhook Error: ${errorMessage}`)
  }

  // Handle the event
  switch (event.type) {
    // Consulenza Payment Events
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

    // Subscription Events (for P.IVA plans)
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutSessionCompleted(session)
      break

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionUpdated(subscription)
      break

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription
      await handleSubscriptionDeleted(deletedSubscription)
      break

    case 'invoice.payment_succeeded':
    case 'invoice.paid':
      const invoice = event.data.object as Stripe.Invoice
      await handleInvoicePaymentSucceeded(invoice)
      break

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice
      await handleInvoicePaymentFailed(failedInvoice)
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

    // Check if there's already a pending invoice for this conversation
    let invoice = await Invoice.findOne({
      conversationId: conversation._id,
      status: 'pending'
    })

    if (invoice) {
      // Update existing pending invoice to paid
      invoice.status = 'paid'
      invoice.dataPagamento = formatItalianDate(conversation.paidAt || new Date())
      invoice.stripePaymentIntentId = paymentIntent.id
      invoice.stripePaymentStatus = 'succeeded'
      invoice.metodoPagamento = 'Carta di credito (Stripe)'
      await invoice.save()
      console.log('✅ Payment succeeded and invoice updated to paid:', conversationId)
    } else {
      // Create permanent invoice record if no pending invoice exists (backward compatibility)
      invoice = new Invoice({
        conversationId: (conversation._id as any),
        businessUserId: conversation.businessUserId._id,
        adminUserId: conversation.adminUserId!._id,
        numero: await (Invoice as any).generateInvoiceNumber(),
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
        stripePaymentStatus: 'succeeded',
        metodoPagamento: 'Carta di credito (Stripe)'
      })

      await invoice.save()
      console.log('✅ Payment succeeded and invoice created:', conversationId)
    }

    // Send payment confirmation email to client
    try {
      const user = conversation.businessUserId as any
      if (user && user.email) {
        await sendPaymentSuccessEmail(
          user.email,
          user.name || 'Cliente',
          conversation.importo * 1.22, // Total with IVA
          `Consulenza: ${conversation.argomento}`,
          undefined // TODO: Add invoice PDF URL when available
        )
        console.log(`📧 Payment confirmation email sent to ${user.email}`)
      }
    } catch (emailError) {
      console.error('Error sending payment confirmation email:', emailError)
      // Don't block the payment success if email fails
    }
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

    // Send payment failed email to client
    try {
      const user = await User.findById(conversation.businessUserId)
      if (user && user.email) {
        const retryUrl = `${process.env.FRONTEND_URL || 'https://taxflow.it'}/dashboard?action=retry-payment&conversationId=${conversationId}`
        await sendPaymentFailedEmail(
          user.email,
          user.name,
          conversation.importo * 1.22, // Total with IVA
          retryUrl
        )
        console.log(`📧 Payment failed email sent to ${user.email}`)
      }
    } catch (emailError) {
      console.error('Error sending payment failed email:', emailError)
      // Don't block the payment failed handler if email fails
    }
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

// ====================================
// SUBSCRIPTION HANDLERS (for P.IVA plans)
// ====================================

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.userId
    const serviceType = session.metadata?.serviceType

    if (!userId) {
      console.error('No userId in checkout session metadata')
      return
    }

    const user = await User.findById(userId)
    if (!user) {
      console.error(`User ${userId} not found`)
      return
    }

    console.log(`🔍 Checkout session completed - User: ${userId}, Payment Status: ${session.payment_status}, Subscription: ${session.subscription}, Payment Intent: ${session.payment_intent}, Service Type: ${serviceType}`)

    // Check if this is a service purchase (Business Plan or Analisi SWOT)
    if (serviceType && ['business_plan', 'analisi_swot'].includes(serviceType)) {
      // Create PurchasedService record
      const purchasedService = new PurchasedService({
        userId: user._id,
        serviceType: serviceType,
        status: 'pending',
        stripePaymentIntentId: session.payment_intent as string,
        stripeCheckoutSessionId: session.id,
        amountPaid: session.amount_total || 0,
        purchasedAt: new Date()
      })

      await purchasedService.save()

      // Create invoice for the service purchase
      const numeroFattura = await (Invoice as any).generateInvoiceNumber()

      const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
      }

      const dataOggi = formatDate(new Date())
      const serviceName = serviceType === 'business_plan'
        ? 'Business Plan Predittivo VisionFlow'
        : 'Analisi SWOT Evolutio'

      // Amount is in cents, convert to euros
      const amountInEuros = (session.amount_total || 0) / 100

      const newInvoice = new Invoice({
        numero: numeroFattura,
        businessUserId: user._id,
        adminUserId: null,
        cliente: user.name,
        clienteEmail: user.email,
        azienda: user.company || user.name,
        consulente: 'TaxFlow',
        servizio: serviceName,
        tipo: 'Servizio',
        importo: amountInEuros,
        iva: 0,
        totale: amountInEuros,
        status: 'paid',
        dataEmissione: dataOggi,
        dataPagamento: dataOggi,
        metodoPagamento: 'Carta di credito (Stripe)',
        stripePaymentIntentId: session.payment_intent as string || '',
        stripeCheckoutSessionId: session.id,
        stripePaymentStatus: 'succeeded'
      })

      await newInvoice.save()

      console.log(`✅ Service ${serviceType} purchased by user ${userId}. Purchased Service ID: ${purchasedService._id}, Invoice: ${numeroFattura}`)
      return
    }

    // Update user with subscription ID if subscription was created
    if (session.subscription) {
      user.stripeSubscriptionId = session.subscription as string
      user.subscriptionStatus = 'active' as any
      user.status = 'active'
      await user.save()

      // For subscriptions, retrieve the subscription to get details
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string, {
        expand: ['latest_invoice.payment_intent']
      })

      const latestInvoice = subscription.latest_invoice as Stripe.Invoice
      const paymentIntent = (latestInvoice as any)?.payment_intent
      const paymentIntentId = typeof paymentIntent === 'string' ? paymentIntent : paymentIntent?.id
      const stripeInvoiceId = latestInvoice?.id

      console.log(`🔍 Subscription ID: ${subscription.id}, Latest Invoice: ${stripeInvoiceId}, Payment Intent: ${paymentIntentId}`)

      // Check if invoice already exists (using either payment_intent or subscription ID as unique identifier)
      const existingInvoice = await Invoice.findOne({
        businessUserId: user._id,
        $or: [
          { stripePaymentIntentId: paymentIntentId },
          { stripeSubscriptionId: session.subscription as string }
        ]
      })

      console.log(`🔍 Existing Invoice in DB: ${existingInvoice ? 'YES - ' + existingInvoice.numero : 'NO'}`)

      // Create invoice if it doesn't exist
      if (!existingInvoice) {
          // Create invoice record in database
          const numeroFattura = await (Invoice as any).generateInvoiceNumber()

          // Format date as DD/MM/YYYY
          const formatDate = (date: Date) => {
            const day = String(date.getDate()).padStart(2, '0')
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const year = date.getFullYear()
            return `${day}/${month}/${year}`
          }

          const dataOggi = formatDate(new Date())

          // Check if user has existing P.IVA to determine if setup fee was charged
          const hasExistingPiva = user.pivaRequestData?.hasExistingPiva || false
          const setupFee = hasExistingPiva ? 0 : SETUP_FEE.price
          const totalAmount = (user.selectedPlan?.price || 0) + setupFee

          const newInvoice = new Invoice({
            numero: numeroFattura,
            businessUserId: user._id,
            adminUserId: null,
            cliente: user.name,
            clienteEmail: user.email,
            azienda: user.company || user.name,
            consulente: 'TaxFlow',
            servizio: hasExistingPiva
              ? user.selectedPlan?.name || 'Abbonamento'
              : `${user.selectedPlan?.name || 'Abbonamento'} + Apertura P.IVA`,
            tipo: 'Abbonamento',
            importo: totalAmount,
            iva: 0,
            totale: totalAmount,
            status: 'paid',
            dataEmissione: dataOggi,
            dataPagamento: dataOggi,
            metodoPagamento: 'Carta di credito (Stripe)',
            stripePaymentIntentId: paymentIntentId || '',
            stripeSubscriptionId: session.subscription as string,
            stripePaymentStatus: 'succeeded'
          })

          await newInvoice.save()

          console.log(`✅ First payment completed for user ${user._id}. Account activated. Invoice ${numeroFattura} created.`)
        } else {
          console.log(`✅ First payment completed for user ${user._id}. Account activated. Invoice already exists.`)
        }

        // Send subscription created email
        try {
          if (user.selectedPlan && user.subscriptionCurrentPeriodEnd) {
            await sendSubscriptionCreatedEmail(
              user.email,
              user.name,
              user.selectedPlan.name,
              user.selectedPlan.price,
              user.selectedPlan.interval,
              user.subscriptionCurrentPeriodEnd
            )
            console.log(`📧 Subscription created email sent to ${user.email}`)
          }
        } catch (emailError) {
          console.error('Error sending subscription created email:', emailError)
          // Don't block the checkout if email fails
        }
    }

    console.log(`✅ Checkout completed for user ${userId}`)
  } catch (error) {
    console.error('Error handling checkout session completed:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string
    const userId = subscription.metadata?.userId

    // Find user by stripeCustomerId or userId in metadata
    const query = userId
      ? { _id: userId }
      : { stripeCustomerId: customerId }

    const user = await User.findOne(query)

    if (!user) {
      console.error(`User not found for subscription ${subscription.id}`)
      return
    }

    // Update subscription details
    user.stripeSubscriptionId = subscription.id
    user.subscriptionStatus = subscription.status as any

    // Safely convert Unix timestamps to Date objects
    const subData = subscription as any
    if (subData.current_period_start) {
      user.subscriptionCurrentPeriodStart = new Date(subData.current_period_start * 1000)
    }
    if (subData.current_period_end) {
      user.subscriptionCurrentPeriodEnd = new Date(subData.current_period_end * 1000)
    }
    if (subData.cancel_at_period_end !== undefined) {
      user.subscriptionCancelAtPeriodEnd = subData.cancel_at_period_end
    }

    // If subscription is active, update user status
    if (subscription.status === 'active') {
      user.status = 'active'
    }

    await user.save()

    console.log(`✅ Subscription updated for user ${user._id}: ${subscription.status}`)
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string

    const user = await User.findOne({ stripeCustomerId: customerId })

    if (!user) {
      console.error(`User not found for deleted subscription ${subscription.id}`)
      return
    }

    // Reset subscription data - user goes back to "pending_payment" state
    // This way they'll see the plan selection page again (like after P.IVA approval)
    const planName = user.selectedPlan?.name || 'Abbonamento'
    const periodEnd = user.subscriptionCurrentPeriodEnd

    user.stripeSubscriptionId = undefined
    user.subscriptionStatus = 'pending_payment' as any  // Back to payment selection state
    user.selectedPlan = undefined
    user.subscriptionCurrentPeriodStart = undefined
    user.subscriptionCurrentPeriodEnd = undefined
    user.subscriptionCancelAtPeriodEnd = false
    // Keep status as 'active' and pivaApprovalStatus as 'approved' so they can re-subscribe

    await user.save()

    console.log(`❌ Subscription deleted for user ${user._id} - reset to pending_payment state`)

    // Send subscription canceled email
    try {
      if (planName && periodEnd) {
        await sendSubscriptionCanceledEmail(
          user.email,
          user.name,
          planName,
          periodEnd
        )
        console.log(`📧 Subscription canceled email sent to ${user.email}`)
      }
    } catch (emailError) {
      console.error('Error sending subscription canceled email:', emailError)
      // Don't block the subscription deletion if email fails
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string

    const user = await User.findOne({ stripeCustomerId: customerId })

    if (!user) {
      console.error(`User not found for invoice ${invoice.id}`)
      return
    }

    // If this is the first successful payment
    if (user.subscriptionStatus !== 'active') {
      user.subscriptionStatus = 'active' as any
      user.status = 'active'
      await user.save()

      // Check if invoice already exists for this user and payment
      const existingInvoice = await Invoice.findOne({
        businessUserId: user._id,
        stripePaymentIntentId: (invoice as any).payment_intent as string
      })

      if (!existingInvoice) {
        // Create invoice record in database
        const numeroFattura = await (Invoice as any).generateInvoiceNumber()

        // Format date as DD/MM/YYYY
        const formatDate = (date: Date) => {
          const day = String(date.getDate()).padStart(2, '0')
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const year = date.getFullYear()
          return `${day}/${month}/${year}`
        }

        const dataOggi = formatDate(new Date())

        // Check if user has existing P.IVA to determine if setup fee was charged
        const hasExistingPiva = user.pivaRequestData?.hasExistingPiva || false
        const setupFee = hasExistingPiva ? 0 : SETUP_FEE.price
        const totalAmount = (user.selectedPlan?.price || 0) + setupFee

        const newInvoice = new Invoice({
          numero: numeroFattura,
          businessUserId: user._id,
          adminUserId: null,
          cliente: user.name,
          clienteEmail: user.email,
          azienda: user.company || user.name,
          consulente: 'TaxFlow',
          servizio: hasExistingPiva
            ? user.selectedPlan?.name || 'Abbonamento'
            : `${user.selectedPlan?.name || 'Abbonamento'} + Apertura P.IVA`,
          tipo: 'Abbonamento',
          importo: totalAmount,
          iva: 0, // Assuming no VAT for subscription
          totale: totalAmount,
          status: 'paid',
          dataEmissione: dataOggi,
          dataPagamento: dataOggi,
          metodoPagamento: 'Carta di credito (Stripe)',
          stripePaymentIntentId: (invoice as any).payment_intent as string || '',
          stripePaymentStatus: 'succeeded'
        })

        await newInvoice.save()

        console.log(`✅ First payment succeeded for user ${user._id}. Account activated. Invoice ${numeroFattura} created.`)
      } else {
        console.log(`✅ First payment succeeded for user ${user._id}. Account activated. Invoice already exists.`)
      }
    }
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string

    const user = await User.findOne({ stripeCustomerId: customerId })

    if (!user) {
      console.error(`User not found for failed invoice ${invoice.id}`)
      return
    }

    user.subscriptionStatus = 'past_due' as any
    await user.save()

    // TODO: Send payment failed email notification
    console.log(`❌ Payment failed for user ${user._id}`)
  } catch (error) {
    console.error('Error handling invoice payment failed:', error)
  }
}

// ====================================
// SUBSCRIPTION MANAGEMENT ENDPOINTS
// ====================================

// Cancel user subscription (business user only)
router.post('/subscription/cancel', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const userRole = req.user!.role

    if (userRole !== 'business') {
      return res.status(403).json({ error: 'Solo gli utenti business possono cancellare l\'abbonamento' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ error: 'Nessun abbonamento attivo trovato' })
    }

    // Cancel subscription at period end (so user can use it until expiry)
    const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true
    })

    // Update user data
    user.subscriptionCancelAtPeriodEnd = true
    await user.save()

    console.log(`📋 Subscription ${user.stripeSubscriptionId} will be canceled at period end for user ${userId}`)

    // Send cancellation email
    try {
      if (user.selectedPlan && user.subscriptionCurrentPeriodEnd) {
        await sendSubscriptionCanceledEmail(
          user.email,
          user.name,
          user.selectedPlan.name,
          user.subscriptionCurrentPeriodEnd
        )
        console.log(`📧 Subscription cancellation email sent to ${user.email}`)
      }
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError)
      // Don't block the cancellation if email fails
    }

    res.json({
      success: true,
      message: 'Abbonamento programmato per la cancellazione alla fine del periodo corrente',
      subscription: {
        id: subscription.id,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_end: (subscription as any).current_period_end
      }
    })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    res.status(500).json({ error: 'Errore durante la cancellazione dell\'abbonamento' })
  }
})

// Reactivate canceled subscription (undo cancel)
router.post('/subscription/reactivate', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const userRole = req.user!.role

    if (userRole !== 'business') {
      return res.status(403).json({ error: 'Solo gli utenti business possono riattivare l\'abbonamento' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ error: 'Nessun abbonamento trovato' })
    }

    // Reactivate by setting cancel_at_period_end to false
    const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: false
    })

    // Update user data
    user.subscriptionCancelAtPeriodEnd = false
    user.subscriptionStatus = 'active' as any
    await user.save()

    console.log(`✅ Subscription ${user.stripeSubscriptionId} reactivated for user ${userId}`)

    // Send reactivation email (using subscription updated email)
    try {
      if (user.selectedPlan) {
        await sendSubscriptionUpdatedEmail(
          user.email,
          user.name,
          user.selectedPlan.name, // old plan (same)
          user.selectedPlan.name, // new plan (same, just reactivated)
          user.selectedPlan.price
        )
        console.log(`📧 Subscription reactivation email sent to ${user.email}`)
      }
    } catch (emailError) {
      console.error('Error sending reactivation email:', emailError)
      // Don't block the reactivation if email fails
    }

    res.json({
      success: true,
      message: 'Abbonamento riattivato con successo',
      subscription: {
        id: subscription.id,
        cancel_at_period_end: subscription.cancel_at_period_end,
        status: subscription.status
      }
    })
  } catch (error) {
    console.error('Error reactivating subscription:', error)
    res.status(500).json({ error: 'Errore durante la riattivazione dell\'abbonamento' })
  }
})

// Get current subscription details
router.get('/subscription/current', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const userRole = req.user!.role

    if (userRole !== 'business') {
      return res.status(403).json({ error: 'Solo gli utenti business possono accedere all\'abbonamento' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    if (!user.stripeSubscriptionId) {
      return res.json({
        hasSubscription: false,
        subscription: null
      })
    }

    // Get subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)

    // Get period dates from subscription items (Stripe stores them there)
    const currentPeriodStart = subscription.items.data[0]?.current_period_start
    const currentPeriodEnd = subscription.items.data[0]?.current_period_end

    res.json({
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at,
        plan: user.selectedPlan
      }
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    res.status(500).json({ error: 'Errore durante il recupero dell\'abbonamento' })
  }
})

export default router
