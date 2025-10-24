import { Router, Request, Response } from 'express'
import Newsletter from '../models/Newsletter'
import { sendNewsletterLaunchEmail } from '../utils/emailService'

const router = Router()

// Email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// POST /api/newsletter/subscribe - Subscribe to newsletter
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email è richiesta'
      })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email non valida'
      })
    }

    // Check if email already exists
    const existingEmail = await Newsletter.findOne({ email: email.toLowerCase() })
    if (existingEmail) {
      return res.status(200).json({
        success: true,
        message: 'Email già registrata! Ti avviseremo al lancio.',
        alreadySubscribed: true
      })
    }

    // Create new newsletter subscription
    const subscription = new Newsletter({
      email: email.toLowerCase()
    })

    await subscription.save()

    return res.status(201).json({
      success: true,
      message: 'Grazie per l\'iscrizione! Ti avviseremo al lancio.',
      alreadySubscribed: false
    })

  } catch (error: any) {
    console.error('Newsletter subscription error:', error)

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'Email già registrata! Ti avviseremo al lancio.',
        alreadySubscribed: true
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Errore durante la registrazione. Riprova più tardi.'
    })
  }
})

// GET /api/newsletter/subscribe - Get all subscribers (stats)
router.get('/subscribe', async (req: Request, res: Response) => {
  try {
    const subscribers = await Newsletter.find({}).sort({ subscribedAt: -1 })
    const total = await Newsletter.countDocuments()
    const notified = await Newsletter.countDocuments({ notified: true })
    const pending = await Newsletter.countDocuments({ notified: false })

    return res.status(200).json({
      success: true,
      stats: {
        total,
        notified,
        pending
      },
      subscribers
    })

  } catch (error) {
    console.error('Get subscribers error:', error)
    return res.status(500).json({
      success: false,
      message: 'Errore durante il recupero degli iscritti'
    })
  }
})

// POST /api/newsletter/notify - Send notification emails to all subscribers
router.post('/notify', async (req: Request, res: Response) => {
  try {
    // Get all subscribers who haven't been notified yet
    const subscribers = await Newsletter.find({ notified: false })

    if (subscribers.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No subscribers to notify',
        sent: 0,
        failed: 0
      })
    }

    // Send emails
    let sentCount = 0
    let failedCount = 0
    const errors: string[] = []

    for (const subscriber of subscribers) {
      try {
        await sendNewsletterLaunchEmail(subscriber.email)

        // Mark as notified
        subscriber.notified = true
        subscriber.notifiedAt = new Date()
        await subscriber.save()

        sentCount++
      } catch (error) {
        console.error(`Failed to send email to ${subscriber.email}:`, error)
        failedCount++
        errors.push(subscriber.email)
      }
    }

    return res.status(200).json({
      success: true,
      message: `Emails sent successfully`,
      sent: sentCount,
      failed: failedCount,
      total: subscribers.length,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Notify subscribers error:', error)
    return res.status(500).json({
      success: false,
      message: 'Error sending notifications'
    })
  }
})

export default router
