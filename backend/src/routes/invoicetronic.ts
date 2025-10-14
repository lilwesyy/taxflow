import express from 'express'
import axios from 'axios'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import User from '../models/User'

const router = express.Router()

// Invoicetronic API Configuration
const INVOICETRONIC_API_URL = process.env.INVOICETRONIC_API_URL || 'https://api.invoicetronic.com/v1'
const INVOICETRONIC_API_KEY = process.env.INVOICETRONIC_API_KEY || ''

/**
 * Helper function to create Invoicetronic API headers with Basic Auth
 */
function getInvoicetronicHeaders() {
  if (!INVOICETRONIC_API_KEY) {
    throw new Error('Invoicetronic API key not configured')
  }

  // Basic authentication: API key as username, empty password
  const auth = Buffer.from(`${INVOICETRONIC_API_KEY}:`).toString('base64')

  return {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

/**
 * POST /api/invoicetronic/company/create
 * Create a company in Invoicetronic for the authenticated business user
 */
router.post('/company/create', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Only allow business users to create their own company
    if (req.user?.role !== 'business') {
      return res.status(403).json({ message: 'Only business users can create companies' })
    }

    const userId = req.user.userId

    // Get user from database
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if user already has a company in Invoicetronic
    if (user.invoicetronic?.companyId) {
      return res.status(400).json({
        message: 'Company already exists in Invoicetronic',
        companyId: user.invoicetronic.companyId
      })
    }

    // Validate required fields
    const { vat, fiscalCode, name } = req.body

    if (!vat || !fiscalCode || !name) {
      return res.status(400).json({
        message: 'Missing required fields: vat, fiscalCode, and name are required'
      })
    }

    // Ensure VAT has country code (default to IT if not present)
    const formattedVat = vat.match(/^[A-Z]{2}/) ? vat : `IT${vat}`

    // First, check if company already exists on Invoicetronic
    let invoicetronicCompany
    try {
      const listResponse = await axios.get(
        `${INVOICETRONIC_API_URL}/company`,
        {
          params: { page: 1, page_size: 100 },
          headers: getInvoicetronicHeaders()
        }
      )

      const existingCompanies = listResponse.data || []

      // Check if a company with this VAT already exists
      const existingCompany = existingCompanies.find((c: any) =>
        c.vat === formattedVat || c.fiscal_code === fiscalCode
      )

      if (existingCompany) {
        // Company already exists, use it instead of creating a new one
        console.log('Company already exists on Invoicetronic, using existing:', existingCompany.id)
        invoicetronicCompany = existingCompany
      } else {
        // Company doesn't exist, create it
        const companyData = {
          vat: formattedVat,
          fiscal_code: fiscalCode,
          name: name
        }

        const response = await axios.post(
          `${INVOICETRONIC_API_URL}/company`,
          companyData,
          {
            headers: getInvoicetronicHeaders()
          }
        )

        invoicetronicCompany = response.data
      }
    } catch (listError: any) {
      // If list fails, try to create directly
      console.error('Error checking existing companies:', listError.message)

      const companyData = {
        vat: formattedVat,
        fiscal_code: fiscalCode,
        name: name
      }

      const response = await axios.post(
        `${INVOICETRONIC_API_URL}/company`,
        companyData,
        {
          headers: getInvoicetronicHeaders()
        }
      )

      invoicetronicCompany = response.data
    }

    // Update user with Invoicetronic company info
    user.invoicetronic = {
      companyId: invoicetronicCompany.id,
      vat: formattedVat,
      fiscalCodeIT: fiscalCode,
      companyName: name,
      createdAt: new Date()
    }

    await user.save()

    res.json({
      success: true,
      message: 'Company created successfully in Invoicetronic',
      company: {
        id: invoicetronicCompany.id,
        vat: formattedVat,
        fiscalCode: fiscalCode,
        name: name
      }
    })
  } catch (error: any) {
    console.error('Invoicetronic company creation error:', error.response?.data || error.message)

    // Handle specific Invoicetronic API errors
    if (error.response?.status === 400) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company data',
        error: error.response?.data
      })
    }

    if (error.response?.status === 422) {
      return res.status(422).json({
        success: false,
        message: 'Validation error',
        error: error.response?.data
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create company in Invoicetronic',
      error: error.message
    })
  }
})

/**
 * GET /api/invoicetronic/company
 * Get the authenticated user's company from Invoicetronic
 */
router.get('/company', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'business') {
      return res.status(403).json({ message: 'Only business users can access company data' })
    }

    const userId = req.user.userId

    // Get user from database
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if user has a company in our DB first
    if (!user.invoicetronic?.companyId) {
      // Try to fetch from Invoicetronic API to see if company exists there
      try {
        const response = await axios.get(
          `${INVOICETRONIC_API_URL}/company`,
          {
            params: {
              page: 1,
              page_size: 100
            },
            headers: getInvoicetronicHeaders()
          }
        )

        const companies = response.data

        // If we have companies, return the first one (assuming one company per user)
        if (companies && companies.length > 0) {
          const company = companies[0]

          // Update user with this company info
          user.invoicetronic = {
            companyId: company.id,
            vat: company.vat,
            fiscalCodeIT: company.fiscal_code,
            companyName: company.name,
            createdAt: new Date(company.created)
          }
          await user.save()

          return res.json({
            success: true,
            company: {
              id: company.id,
              vat: company.vat,
              fiscalCode: company.fiscal_code,
              name: company.name,
              createdAt: company.created
            }
          })
        }

        // No companies found
        return res.json({
          success: false,
          message: 'No company found',
          hasCompany: false
        })
      } catch (apiError: any) {
        console.error('Invoicetronic API error:', apiError.response?.data || apiError.message)
        return res.json({
          success: false,
          message: 'No company found',
          hasCompany: false
        })
      }
    }

    // Return company from our DB
    res.json({
      success: true,
      company: {
        id: user.invoicetronic.companyId,
        vat: user.invoicetronic.vat,
        fiscalCode: user.invoicetronic.fiscalCodeIT,
        name: user.invoicetronic.companyName,
        createdAt: user.invoicetronic.createdAt
      }
    })
  } catch (error: any) {
    console.error('Get company error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get company data'
    })
  }
})

/**
 * GET /api/invoicetronic/status
 * Get account status from Invoicetronic (admin only)
 */
router.get('/status', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Only allow admin users
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Get account status from Invoicetronic
    const response = await axios.get(
      `${INVOICETRONIC_API_URL}/status`,
      {
        headers: getInvoicetronicHeaders()
      }
    )

    const statusData = response.data

    res.json({
      success: true,
      message: 'Successfully connected to Invoicetronic API',
      apiUrl: INVOICETRONIC_API_URL,
      sandboxMode: process.env.INVOICETRONIC_SANDBOX_MODE === 'true',
      operationLeft: statusData.operation_left,
      signatureLeft: statusData.signature_left
    })
  } catch (error: any) {
    console.error('Invoicetronic status error:', error.response?.data || error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to connect to Invoicetronic API',
      error: error.response?.data || error.message
    })
  }
})

/**
 * GET /api/invoicetronic/test
 * Test Invoicetronic API connection (admin only)
 * @deprecated Use /status instead
 */
router.get('/test', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Only allow admin users
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Try to make a simple API call to test the connection
    await axios.get(
      `${INVOICETRONIC_API_URL}/company`,
      {
        headers: getInvoicetronicHeaders()
      }
    )

    res.json({
      success: true,
      message: 'Successfully connected to Invoicetronic API',
      apiUrl: INVOICETRONIC_API_URL,
      sandboxMode: process.env.INVOICETRONIC_SANDBOX_MODE === 'true'
    })
  } catch (error: any) {
    console.error('Invoicetronic test error:', error.response?.data || error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to connect to Invoicetronic API',
      error: error.response?.data || error.message
    })
  }
})

/**
 * POST /api/invoicetronic/invoice/send
 * Send an invoice via Invoicetronic
 * (Placeholder - will be implemented based on Invoicetronic invoice API)
 */
router.post('/invoice/send', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'business') {
      return res.status(403).json({ message: 'Only business users can send invoices' })
    }

    // Get user from database
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if user has a company in Invoicetronic
    if (!user.invoicetronic?.companyId) {
      return res.status(400).json({
        success: false,
        message: 'No company found. Please create a company first.'
      })
    }

    // TODO: Implement invoice sending based on Invoicetronic API documentation
    // This is a placeholder for now

    res.json({
      success: true,
      message: 'Invoice sending endpoint - to be implemented',
      companyId: user.invoicetronic.companyId
    })
  } catch (error: any) {
    console.error('Invoice send error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to send invoice'
    })
  }
})

/**
 * GET /api/invoicetronic/invoices
 * Get list of invoices
 * (Placeholder - will be implemented based on Invoicetronic API)
 */
router.get('/invoices', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'business') {
      return res.status(403).json({ message: 'Only business users can access invoices' })
    }

    // Get user from database
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if user has a company in Invoicetronic
    if (!user.invoicetronic?.companyId) {
      return res.status(404).json({
        success: false,
        message: 'No company found'
      })
    }

    // TODO: Implement invoice list fetching based on Invoicetronic API documentation
    // This is a placeholder for now

    res.json({
      success: true,
      message: 'Invoice list endpoint - to be implemented',
      companyId: user.invoicetronic.companyId,
      invoices: []
    })
  } catch (error: any) {
    console.error('Get invoices error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get invoices'
    })
  }
})

export default router
