import express from 'express'
import axios from 'axios'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { generateFatturaPAXML, validateInvoiceData } from '../utils/fatturaPA'

const router = express.Router()

// Aruba API Base URLs
const ARUBA_AUTH_URL = 'https://api.arubabusiness.it' // Authentication
const ARUBA_FE_BASE_URLS = {
  DEMO: 'https://demows.fatturazioneelettronica.aruba.it',
  PRODUZIONE: 'https://ws.fatturazioneelettronica.aruba.it'
}

// In-memory token cache (in production, use Redis or database)
let arubaTokenCache: {
  token: string | null
  expiresAt: number | null
} = {
  token: null,
  expiresAt: null
}

/**
 * Get Aruba authentication token (cached for 30 minutes)
 */
async function getArubaToken(): Promise<string> {
  const now = Date.now()

  // Return cached token if still valid
  if (arubaTokenCache.token && arubaTokenCache.expiresAt && now < arubaTokenCache.expiresAt) {
    return arubaTokenCache.token
  }

  if (!process.env.ARUBA_USERNAME || !process.env.ARUBA_PASSWORD || !process.env.ARUBA_API_KEY) {
    throw new Error('Aruba credentials not configured')
  }

  try {
    // Base64 encode password as required by Aruba Business API
    const base64Password = Buffer.from(process.env.ARUBA_PASSWORD).toString('base64')

    // Prepare form data
    const formData = new URLSearchParams()
    formData.append('grant_type', 'password')
    formData.append('username', process.env.ARUBA_USERNAME)
    formData.append('password', base64Password)

    const response = await axios.post(
      `${ARUBA_AUTH_URL}/auth/token`,
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization-Key': process.env.ARUBA_API_KEY
        }
      }
    )

    const token = response.data.access_token || response.data.token

    if (!token) {
      throw new Error('Invalid response from Aruba authentication')
    }

    // Cache token for 25 minutes (token expires in 30 minutes)
    arubaTokenCache = {
      token: token,
      expiresAt: now + (25 * 60 * 1000)
    }

    return token
  } catch (error: any) {
    console.error('Aruba authentication error:', error.response?.data || error.message)
    throw new Error('Failed to authenticate with Aruba')
  }
}

/**
 * POST /api/aruba/authenticate
 * Test Aruba authentication and FE API access (admin only)
 */
router.post('/authenticate', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Only allow admin users
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }

    const token = await getArubaToken()

    // Test if token works with FE API by fetching invoice list
    const environment = process.env.ARUBA_ENVIRONMENT || 'DEMO'
    const feBaseUrl = ARUBA_FE_BASE_URLS[environment as keyof typeof ARUBA_FE_BASE_URLS]

    try {
      const testResponse = await axios.get(
        `${feBaseUrl}/services/invoice/sent/list`,
        {
          params: { limit: 1 },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      res.json({
        success: true,
        message: 'Successfully authenticated with Aruba Business API',
        service: 'Aruba Business',
        feApiAccess: true,
        feApiMessage: 'Fatturazione Elettronica API accessible',
        environment: environment,
        tokenExpiry: arubaTokenCache.expiresAt
      })
    } catch (feError: any) {
      // Token works for auth but not for FE API
      res.json({
        success: true,
        message: 'Authenticated with Aruba Business API, but FE API access failed',
        service: 'Aruba Business',
        feApiAccess: false,
        feApiError: feError.response?.data || feError.message,
        tokenExpiry: arubaTokenCache.expiresAt
      })
    }
  } catch (error: any) {
    console.error('Authentication error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to authenticate with Aruba'
    })
  }
})

/**
 * POST /api/aruba/invoice/send
 * Generate FatturaPA XML and send invoice to Aruba FE (protected - requires auth)
 */
router.post('/invoice/send', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { invoiceData, cedenteData } = req.body

    if (!invoiceData || !cedenteData) {
      return res.status(400).json({ message: 'Invoice data and cedente data are required' })
    }

    // Validate invoice data
    const validationErrors = validateInvoiceData(invoiceData, cedenteData)
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      })
    }

    // Generate FatturaPA XML
    const xml = generateFatturaPAXML(invoiceData, cedenteData)

    // Get authentication token
    const token = await getArubaToken()

    const environment = process.env.ARUBA_ENVIRONMENT || 'DEMO'
    const feBaseUrl = ARUBA_FE_BASE_URLS[environment as keyof typeof ARUBA_FE_BASE_URLS]

    // Send invoice to Aruba Fatturazione Elettronica
    // The XML is sent as base64-encoded string according to Aruba FE API specs
    const base64XML = Buffer.from(xml, 'utf-8').toString('base64')

    const response = await axios.post(
      `${feBaseUrl}/services/invoice/upload`,
      {
        dataFile: base64XML
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    )

    res.json({
      success: true,
      message: 'Invoice sent successfully to SDI',
      uploadFileName: response.data.uploadFileName,
      data: response.data,
      xml: xml // Return XML for debugging purposes
    })
  } catch (error: any) {
    console.error('Invoice send error:', error.response?.data || error.message)
    res.status(500).json({
      success: false,
      message: error.response?.data?.errorDescription || 'Failed to send invoice',
      errorCode: error.response?.data?.errorCode,
      error: error.response?.data
    })
  }
})

/**
 * GET /api/aruba/invoice/status/:uploadFileName
 * Get invoice status from Aruba FE by upload filename
 */
router.get('/invoice/status/:uploadFileName', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { uploadFileName } = req.params

    if (!uploadFileName) {
      return res.status(400).json({ message: 'Upload filename is required' })
    }

    // Get authentication token
    const token = await getArubaToken()

    const environment = process.env.ARUBA_ENVIRONMENT || 'DEMO'
    const feBaseUrl = ARUBA_FE_BASE_URLS[environment as keyof typeof ARUBA_FE_BASE_URLS]

    // Get invoice status from Aruba FE
    const response = await axios.get(
      `${feBaseUrl}/services/invoice/sent/getByUploadFileName`,
      {
        params: { uploadFileName },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    res.json({
      success: true,
      data: response.data
    })
  } catch (error: any) {
    console.error('Invoice status error:', error.response?.data || error.message)
    res.status(500).json({
      success: false,
      message: error.response?.data?.errorDescription || 'Failed to get invoice status'
    })
  }
})

/**
 * GET /api/aruba/invoices
 * Get list of sent invoices from Aruba FE
 */
router.get('/invoices', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { fromDate, toDate, limit = 50 } = req.query

    // Get authentication token
    const token = await getArubaToken()

    const environment = process.env.ARUBA_ENVIRONMENT || 'DEMO'
    const feBaseUrl = ARUBA_FE_BASE_URLS[environment as keyof typeof ARUBA_FE_BASE_URLS]

    // Get invoices from Aruba FE
    const response = await axios.get(
      `${feBaseUrl}/services/invoice/sent/list`,
      {
        params: {
          fromDate,
          toDate,
          limit
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    res.json({
      success: true,
      data: response.data
    })
  } catch (error: any) {
    console.error('Get invoices error:', error.response?.data || error.message)
    res.status(500).json({
      success: false,
      message: error.response?.data?.errorDescription || 'Failed to get invoices'
    })
  }
})

export default router
