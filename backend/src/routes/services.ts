import express from 'express'
import Stripe from 'stripe'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import User from '../models/User'
import PurchasedService from '../models/PurchasedService'

const router = express.Router()

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover'
})

// Service prices in cents (€998.00 = 99800 cents)
const SERVICE_PRICES = {
  business_plan: 99800,
  analisi_swot: 99800
}

// Purchase service - Create Stripe Checkout
router.post('/purchase-service', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const userRole = req.user!.role
    const { serviceType } = req.body

    // Only business users can purchase
    if (userRole !== 'business') {
      return res.status(403).json({ error: 'Solo i clienti possono acquistare servizi' })
    }

    // Validate service type
    if (!serviceType || !['business_plan', 'analisi_swot'].includes(serviceType)) {
      return res.status(400).json({ error: 'Tipo di servizio non valido' })
    }

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    // Check if user already purchased this service
    const existingService = await PurchasedService.findOne({
      userId: user._id,
      serviceType: serviceType
    })

    if (existingService) {
      return res.status(400).json({
        error: 'Hai già acquistato questo servizio',
        existingService
      })
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

    // Create Stripe Checkout Session (one-time payment)
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: serviceType === 'business_plan'
                ? 'Business Plan Predittivo VisionFlow'
                : 'Analisi SWOT Evolutio',
              description: serviceType === 'business_plan'
                ? 'Sistema di pianificazione strategica con analisi predittiva'
                : 'Matrice strategica avanzata SWOT'
            },
            unit_amount: SERVICE_PRICES[serviceType as keyof typeof SERVICE_PRICES]
          },
          quantity: 1
        }
      ],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?payment=success&service=${serviceType}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?payment=canceled&service=${serviceType}`,
      metadata: {
        userId: (user._id as any).toString(),
        serviceType: serviceType
      }
    })

    res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    })
  } catch (error) {
    console.error('Error creating service checkout:', error)
    res.status(500).json({
      error: 'Errore nella creazione del checkout',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get purchased services
router.get('/get-services', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const userRole = req.user!.role
    const { serviceType, status } = req.query

    let query: any = {}

    // Business users can only see their own services
    if (userRole === 'business') {
      query.userId = userId
      if (serviceType) {
        query.serviceType = serviceType
      }

      const services = await PurchasedService.find(query).sort({ purchasedAt: -1 })
      return res.json({ services })
    }

    // Admin can see all services
    if (userRole === 'admin') {
      if (serviceType) {
        query.serviceType = serviceType
      }
      if (status) {
        query.status = status
      }

      const services = await PurchasedService.find(query)
        .populate('userId', 'name email')
        .populate('completedBy', 'name email')
        .populate('assignedToConsultant', 'name email')
        .sort({ purchasedAt: -1 })

      return res.json({ services })
    }

    return res.status(403).json({ error: 'Non autorizzato' })
  } catch (error) {
    console.error('Error fetching services:', error)
    res.status(500).json({
      error: 'Errore nel recupero dei servizi',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Update service status (admin only)
router.post('/update-status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role
    const adminUserId = req.user!.userId

    // Only admin can update status
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Solo gli admin possono aggiornare lo stato' })
    }

    const { serviceId, status } = req.body

    if (!serviceId || !status) {
      return res.status(400).json({ error: 'Service ID e status sono obbligatori' })
    }

    if (!['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Status non valido' })
    }

    const service = await PurchasedService.findById(serviceId)
      .populate('assignedToConsultant', 'name email')
    if (!service) {
      return res.status(404).json({ error: 'Servizio non trovato' })
    }

    // Check if another consultant is already working on this
    if (status === 'in_progress' && service.assignedToConsultant) {
      const assignedConsultantId = (service.assignedToConsultant as any)._id || service.assignedToConsultant
      if (assignedConsultantId.toString() !== adminUserId) {
        const consultant = service.assignedToConsultant as any
        return res.status(409).json({
          error: 'Questo servizio è già in lavorazione da un altro consulente',
          assignedTo: consultant.name || 'Altro consulente'
        })
      }
    }

    // Update status
    service.status = status

    // Assign consultant when moving to in_progress
    if (status === 'in_progress') {
      service.assignedToConsultant = adminUserId as any
    }

    // Clear assignment when moving back to pending or suspending
    if (status === 'pending') {
      service.assignedToConsultant = undefined
    }

    await service.save()

    res.json({
      success: true,
      message: 'Status aggiornato con successo',
      service
    })
  } catch (error) {
    console.error('Error updating service status:', error)
    res.status(500).json({
      error: 'Errore nell\'aggiornamento dello status',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Suspend work on service (admin only) - removes assignment but keeps in_progress status
router.post('/suspend-work', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role
    const adminUserId = req.user!.userId

    // Only admin can suspend work
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Solo gli admin possono sospendere il lavoro' })
    }

    const { serviceId } = req.body

    if (!serviceId) {
      return res.status(400).json({ error: 'Service ID è obbligatorio' })
    }

    const service = await PurchasedService.findById(serviceId)
    if (!service) {
      return res.status(404).json({ error: 'Servizio non trovato' })
    }

    // Check if this consultant is the one working on it
    if (service.assignedToConsultant && service.assignedToConsultant.toString() !== adminUserId) {
      return res.status(403).json({ error: 'Non puoi sospendere il lavoro di un altro consulente' })
    }

    // Clear assignment but keep status as in_progress
    service.assignedToConsultant = undefined
    await service.save()

    res.json({
      success: true,
      message: 'Lavoro sospeso con successo',
      service
    })
  } catch (error) {
    console.error('Error suspending work:', error)
    res.status(500).json({
      error: 'Errore nella sospensione del lavoro',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Complete service with content (admin only)
router.post('/complete-service', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role
    const adminUserId = req.user!.userId

    // Only admin can complete services
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Solo gli admin possono completare i servizi' })
    }

    const { serviceId, content, pdfUrl } = req.body

    if (!serviceId) {
      return res.status(400).json({ error: 'Service ID è obbligatorio' })
    }

    const service = await PurchasedService.findById(serviceId)
    if (!service) {
      return res.status(404).json({ error: 'Servizio non trovato' })
    }

    // Update content based on service type
    if (service.serviceType === 'business_plan') {
      service.businessPlanContent = {
        executiveSummary: content.executiveSummary || '',
        objective: content.objective || '',
        marketAnalysis: content.marketAnalysis || '',
        timeSeriesForecasting: content.timeSeriesForecasting || '',
        budgetSimulation: content.budgetSimulation || '',
        alerts: content.alerts || '',
        pdfUrl: pdfUrl || ''
      }
    } else if (service.serviceType === 'analisi_swot') {
      service.analisiSWOTContent = {
        strengths: content.strengths || '',
        weaknesses: content.weaknesses || '',
        opportunities: content.opportunities || '',
        threats: content.threats || '',
        strategicSummary: content.strategicSummary || '',
        recommendedActions: content.recommendedActions || '',
        pdfUrl: pdfUrl || ''
      }
    }

    // Mark as completed
    service.status = 'completed'
    service.completedBy = adminUserId as any
    service.completedAt = new Date()
    service.assignedToConsultant = undefined // Clear assignment when completed

    await service.save()

    res.json({
      success: true,
      message: 'Servizio completato con successo',
      service
    })
  } catch (error) {
    console.error('Error completing service:', error)
    res.status(500).json({
      error: 'Errore nel completamento del servizio',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router
