import { Router, Response } from 'express'
import mongoose from 'mongoose'
import Feedback from '../models/Feedback'
import User from '../models/User'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

// Middleware to check if user is admin
const adminMiddleware = async (req: AuthRequest, res: Response, next: Function) => {
  try {
    const user = await User.findById(req.userId)
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Accesso negato. Solo gli admin possono accedere a questa risorsa.' })
    }
    next()
  } catch (error) {
    console.error('Admin middleware error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
}

// ============================================
// BUSINESS USER ENDPOINTS
// ============================================

// Get all feedback submitted by the current user (business)
router.get('/my-feedbacks', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const feedbacks = await Feedback.find({ clientId: req.userId })
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      feedbacks
    })
  } catch (error) {
    console.error('Get my feedbacks error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Create new feedback (business user)
router.post('/create', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    const {
      consultantId,
      consultantName,
      service,
      rating,
      title,
      message,
      category,
      recommend,
      positiveAspects,
      suggestions
    } = req.body

    // Validation
    if (!consultantName || !service || !rating || !title || !message) {
      return res.status(400).json({
        error: 'Campi richiesti: consultantName, service, rating, title, message'
      })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Il rating deve essere tra 1 e 5' })
    }

    const feedback = new Feedback({
      clientId: req.userId,
      clientName: user.name,
      clientCompany: user.company,
      consultantId: consultantId || null,
      consultantName,
      service,
      rating,
      title,
      message,
      category: category || 'Qualità Servizio',
      recommend: recommend !== undefined ? recommend : true,
      positiveAspects,
      suggestions,
      status: 'pending'
    })

    await feedback.save()

    // Send email notification to admin/consultant
    try {
      if (consultantId) {
        const consultant = await User.findById(consultantId)
        if (consultant && consultant.role === 'admin') {
          const { sendNewFeedbackNotificationToAdmin } = await import('../utils/emailService')
          const feedbackUrl = `${process.env.FRONTEND_URL || 'https://taxflow.it'}/dashboard?feedbackId=${feedback._id}`
          await sendNewFeedbackNotificationToAdmin(
            consultant.email,
            user.name,
            message,
            rating,
            feedbackUrl
          )
          console.log(`📧 New feedback notification sent to admin ${consultant.email}`)
        }
      }
    } catch (emailError) {
      console.error('Error sending feedback notification email:', emailError)
      // Don't block feedback creation if email fails
    }

    res.json({
      success: true,
      message: 'Feedback inviato con successo',
      feedback
    })
  } catch (error) {
    console.error('Create feedback error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Get single feedback by ID (owner or admin)
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const feedback = await Feedback.findById(id)

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback non trovato' })
    }

    // Check if user is owner or admin
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    const isOwner = feedback.clientId.toString() === req.userId
    const isAdmin = user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Non autorizzato a visualizzare questo feedback' })
    }

    res.json({
      success: true,
      feedback
    })
  } catch (error) {
    console.error('Get feedback error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Get available consultants list (for dropdown in create feedback)
router.get('/consultants/list', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Get all admin users as potential consultants
    const consultants = await User.find({ role: 'admin' })
      .select('name email professionalRole')
      .sort({ name: 1 })

    // Get feedback stats for each consultant
    const consultantsWithStats = await Promise.all(
      consultants.map(async (consultant) => {
        const feedbacks = await Feedback.find({ consultantId: consultant._id })
        const totalFeedbacks = feedbacks.length
        const avgRating = totalFeedbacks > 0
          ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks
          : 0

        return {
          id: consultant._id,
          name: consultant.name,
          specialization: consultant.professionalRole || 'Consulente',
          rating: Math.round(avgRating * 10) / 10,
          totalFeedbacks
        }
      })
    )

    res.json({
      success: true,
      consultants: consultantsWithStats
    })
  } catch (error) {
    console.error('Get consultants error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// ============================================
// ADMIN ENDPOINTS
// ============================================

// Get all feedbacks (admin only) - with filters
router.get('/admin/all', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { status, rating, category, consultantId } = req.query

    const query: mongoose.FilterQuery<typeof Feedback> = {}

    if (status && status !== 'all') {
      query.status = status as 'pending' | 'responded' | 'archived'
    }

    if (rating) {
      if (rating === '5') {
        query.rating = 5
      } else if (rating === '4') {
        query.rating = 4
      } else if (rating === '3') {
        query.rating = { $lte: 3 }
      }
    }

    if (category && category !== 'all') {
      query.category = category as string
    }

    if (consultantId) {
      query.consultantId = consultantId as string
    }

    const feedbacks = await Feedback.find(query)
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      feedbacks
    })
  } catch (error) {
    console.error('Get all feedbacks error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Respond to feedback (admin only)
router.post('/:id/respond', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { response } = req.body

    if (!response || !response.trim()) {
      return res.status(400).json({ error: 'La risposta non può essere vuota' })
    }

    const feedback = await Feedback.findById(id)
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback non trovato' })
    }

    if (feedback.status === 'responded') {
      return res.status(400).json({ error: 'Questo feedback ha già ricevuto una risposta' })
    }

    feedback.response = response.trim()
    feedback.responseDate = new Date()
    feedback.respondedBy = new mongoose.Types.ObjectId(req.userId)
    feedback.status = 'responded'

    await feedback.save()

    // Send email to client with response
    try {
      const client = await User.findById(feedback.clientId)
      if (client) {
        const { sendFeedbackResponseEmail } = await import('../utils/emailService')
        await sendFeedbackResponseEmail(
          client.email,
          client.name,
          feedback.message,
          response
        )
        console.log(`📧 Feedback response email sent to client ${client.email}`)
      }
    } catch (emailError) {
      console.error('Error sending feedback response email:', emailError)
      // Don't block feedback response if email fails
    }

    res.json({
      success: true,
      message: 'Risposta inviata con successo',
      feedback
    })
  } catch (error) {
    console.error('Respond to feedback error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Update feedback response (admin only)
router.put('/:id/response', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { response } = req.body

    if (!response || !response.trim()) {
      return res.status(400).json({ error: 'La risposta non può essere vuota' })
    }

    const feedback = await Feedback.findById(id)
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback non trovato' })
    }

    feedback.response = response.trim()
    feedback.responseDate = new Date()
    feedback.respondedBy = new mongoose.Types.ObjectId(req.userId)
    feedback.status = 'responded'

    await feedback.save()

    res.json({
      success: true,
      message: 'Risposta aggiornata con successo',
      feedback
    })
  } catch (error) {
    console.error('Update feedback response error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Archive feedback (admin only)
router.put('/:id/archive', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const feedback = await Feedback.findById(id)

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback non trovato' })
    }

    feedback.status = 'archived'
    await feedback.save()

    res.json({
      success: true,
      message: 'Feedback archiviato con successo',
      feedback
    })
  } catch (error) {
    console.error('Archive feedback error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Get consultant statistics (admin only)
router.get('/admin/consultant-stats', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const consultants = await User.find({ role: 'admin' })
      .select('name professionalRole')

    const stats = await Promise.all(
      consultants.map(async (consultant) => {
        const feedbacks = await Feedback.find({ consultantId: consultant._id })
        const totalFeedbacks = feedbacks.length
        const avgRating = totalFeedbacks > 0
          ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks
          : 0
        const respondedCount = feedbacks.filter(f => f.status === 'responded').length
        const responseRate = totalFeedbacks > 0
          ? Math.round((respondedCount / totalFeedbacks) * 100)
          : 0

        return {
          name: consultant.name,
          specialization: consultant.professionalRole || 'Consulente',
          totalFeedbacks,
          avgRating: Math.round(avgRating * 10) / 10,
          responseRate
        }
      })
    )

    res.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Get consultant stats error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Get feedback statistics (admin only)
router.get('/admin/statistics', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const totalFeedbacks = await Feedback.countDocuments()
    const pendingFeedbacks = await Feedback.countDocuments({ status: 'pending' })
    const respondedFeedbacks = await Feedback.countDocuments({ status: 'responded' })

    const allFeedbacks = await Feedback.find()
    const avgRating = allFeedbacks.length > 0
      ? allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allFeedbacks.length
      : 0

    const responseRate = totalFeedbacks > 0
      ? Math.round((respondedFeedbacks / totalFeedbacks) * 100)
      : 0

    res.json({
      success: true,
      statistics: {
        total: totalFeedbacks,
        pending: pendingFeedbacks,
        responded: respondedFeedbacks,
        avgRating: Math.round(avgRating * 10) / 10,
        responseRate
      }
    })
  } catch (error) {
    console.error('Get statistics error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

export default router
