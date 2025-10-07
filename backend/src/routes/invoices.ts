import express from 'express'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import Invoice from '../models/Invoice'

const router = express.Router()

// Get all invoices for the authenticated user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const userRole = req.user!.role

    // Query based on user role
    let query: any = {}

    if (userRole === 'business') {
      // Business users see only their own invoices
      query.businessUserId = userId
    } else if (userRole === 'admin') {
      // Admin users can optionally filter by businessUserId
      const { businessUserId } = req.query
      if (businessUserId) {
        query.businessUserId = businessUserId
      }
      // If no filter, admin sees all invoices
    } else {
      return res.status(403).json({ error: 'Non autorizzato' })
    }

    // Get invoices sorted by most recent first
    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .populate('businessUserId', 'name email company')
      .populate('adminUserId', 'name')

    res.json({
      success: true,
      invoices: invoices
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    res.status(500).json({ error: 'Errore durante il recupero delle fatture' })
  }
})

// Get a specific invoice by ID
router.get('/:invoiceId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { invoiceId } = req.params
    const userId = req.user!.userId
    const userRole = req.user!.role

    const invoice = await Invoice.findById(invoiceId)
      .populate('businessUserId', 'name email company')
      .populate('adminUserId', 'name')

    if (!invoice) {
      return res.status(404).json({ error: 'Fattura non trovata' })
    }

    // Check access permissions
    if (userRole === 'business' && invoice.businessUserId._id.toString() !== userId) {
      return res.status(403).json({ error: 'Non autorizzato ad accedere a questa fattura' })
    }

    res.json({
      success: true,
      invoice: invoice
    })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    res.status(500).json({ error: 'Errore durante il recupero della fattura' })
  }
})

export default router
