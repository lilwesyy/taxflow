import express from 'express'
import axios from 'axios'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import User from '../models/User'

const router = express.Router()

// Fattura Elettronica API Configuration
const FATTURA_API_KEY = process.env.FATTURA_ELETTRONICA_API_KEY || ''
const FATTURA_API_MODE = process.env.FATTURA_ELETTRONICA_API_MODE || 'test'
const FATTURA_API_URL = FATTURA_API_MODE === 'prod'
  ? 'https://fattura-elettronica-api.it/ws2.0/prod'
  : 'https://fattura-elettronica-api.it/ws2.0/test'

// Bearer token cache
interface TokenCache {
  token: string
  expires: Date
}

let cachedToken: TokenCache | null = null

/**
 * Helper function to get authentication headers with Bearer token caching
 * First call uses Basic Auth, subsequent calls use cached Bearer token
 */
async function getFatturaElettronicaHeaders(): Promise<Record<string, string>> {
  if (!FATTURA_API_KEY) {
    throw new Error('Fattura Elettronica API key not configured')
  }

  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expires > new Date()) {
    console.log('🔑 Using cached Bearer token (expires:', cachedToken.expires.toISOString() + ')')
    return {
      'Authorization': `Bearer ${cachedToken.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  // Use Basic Auth for first call
  const apiKeyTrimmed = FATTURA_API_KEY.trim()
  const auth = Buffer.from(`${apiKeyTrimmed}:`).toString('base64')

  console.log('🔐 Using Basic Auth (token not cached or expired)')

  return {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

/**
 * Update token cache from response headers
 */
function updateTokenCache(headers: any) {
  const token = headers['x-auth-token']
  const expires = headers['x-auth-expires']

  if (token && expires) {
    cachedToken = {
      token,
      expires: new Date(expires)
    }
    console.log('✅ Bearer token cached (expires:', expires + ')')
  }
}

/**
 * POST /api/fatturaelettronica/aziende
 * Create a new company
 */
router.post('/aziende', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'business') {
      return res.status(403).json({ message: 'Only business users can create companies' })
    }

    const userId = req.user.userId
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if user already has company configured
    if (user.fatturaElettronica?.aziendaId) {
      return res.status(400).json({
        message: 'Company already configured',
        company: user.fatturaElettronica
      })
    }

    // Extract company data from request
    const { ragione_sociale, piva, cfis, ...optionalData } = req.body

    if (!ragione_sociale || !piva || !cfis) {
      return res.status(400).json({
        message: 'Missing required fields: ragione_sociale, piva, and cfis are required'
      })
    }

    console.log('📤 Creating company on Fattura Elettronica API...')

    const headers = await getFatturaElettronicaHeaders()
    const response = await axios.post(
      `${FATTURA_API_URL}/aziende`,
      {
        ragione_sociale,
        piva,
        cfis,
        ...optionalData
      },
      { headers }
    )

    // Update token cache
    updateTokenCache(response.headers)

    const companyData = response.data

    // Save company data to user
    user.fatturaElettronica = {
      aziendaId: companyData.id,
      piva: companyData.piva,
      cfis: companyData.cfis,
      ragioneSociale: companyData.ragione_sociale,
      indirizzo: companyData.indirizzo,
      cap: companyData.cap,
      citta: companyData.citta,
      provincia: companyData.provincia,
      paese: companyData.paese,
      formaGiuridica: companyData.forma_giuridica,
      tipoRegimeFiscale: companyData.tipo_regime_fiscale,
      telefono: companyData.telefono_amministrazione,
      email: companyData.email_amministrazione,
      iban: companyData.iban,
      createdAt: new Date(companyData.data_inserimento || Date.now())
    }

    await user.save()

    console.log('✅ Company created:', companyData.id)

    res.json({
      success: true,
      message: 'Company created successfully',
      company: companyData
    })
  } catch (error: any) {
    console.error('Create company error:', error.response?.data || error.message)

    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to create company',
      error: error.response?.data || error.message
    })
  }
})

/**
 * GET /api/fatturaelettronica/aziende
 * Get user's company data
 */
router.get('/aziende', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'business') {
      return res.status(403).json({ message: 'Only business users can access company data' })
    }

    const userId = req.user.userId
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if user has company data locally
    if (!user.fatturaElettronica?.aziendaId) {
      return res.json({
        success: false,
        message: 'No company configured',
        hasCompany: false
      })
    }

    // Fetch fresh company data from API
    try {
      const headers = await getFatturaElettronicaHeaders()
      const response = await axios.get(
        `${FATTURA_API_URL}/aziende/${user.fatturaElettronica.aziendaId}`,
        { headers }
      )

      updateTokenCache(response.headers)

      res.json({
        success: true,
        company: response.data
      })
    } catch (apiError: any) {
      console.error('API error fetching company:', apiError.response?.data || apiError.message)

      // Fallback to local data if API fails
      res.json({
        success: true,
        company: user.fatturaElettronica,
        note: 'Data from local cache (API error)'
      })
    }
  } catch (error: any) {
    console.error('Get company error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get company data'
    })
  }
})

/**
 * PUT /api/fatturaelettronica/aziende
 * Update company data
 */
router.put('/aziende', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'business') {
      return res.status(403).json({ message: 'Only business users can update companies' })
    }

    const userId = req.user.userId
    const user = await User.findById(userId)

    if (!user || !user.fatturaElettronica?.aziendaId) {
      return res.status(404).json({ message: 'Company not found' })
    }

    console.log('📝 Updating company:', user.fatturaElettronica.aziendaId)

    const headers = await getFatturaElettronicaHeaders()
    const response = await axios.put(
      `${FATTURA_API_URL}/aziende/${user.fatturaElettronica.aziendaId}`,
      req.body,
      { headers }
    )

    updateTokenCache(response.headers)

    const updatedData = response.data

    // Update local cache
    user.fatturaElettronica = {
      ...user.fatturaElettronica,
      piva: updatedData.piva || user.fatturaElettronica.piva,
      cfis: updatedData.cfis || user.fatturaElettronica.cfis,
      ragioneSociale: updatedData.ragione_sociale || user.fatturaElettronica.ragioneSociale,
      indirizzo: updatedData.indirizzo,
      cap: updatedData.cap,
      citta: updatedData.citta,
      provincia: updatedData.provincia,
      paese: updatedData.paese,
      formaGiuridica: updatedData.forma_giuridica,
      tipoRegimeFiscale: updatedData.tipo_regime_fiscale,
      telefono: updatedData.telefono_amministrazione,
      email: updatedData.email_amministrazione,
      iban: updatedData.iban
    }

    await user.save()

    console.log('✅ Company updated')

    res.json({
      success: true,
      message: 'Company updated successfully',
      company: updatedData
    })
  } catch (error: any) {
    console.error('Update company error:', error.response?.data || error.message)

    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to update company',
      error: error.response?.data || error.message
    })
  }
})

/**
 * DELETE /api/fatturaelettronica/aziende
 * Delete company
 */
router.delete('/aziende', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'business') {
      return res.status(403).json({ message: 'Only business users can delete companies' })
    }

    const userId = req.user.userId
    const user = await User.findById(userId)

    if (!user || !user.fatturaElettronica?.aziendaId) {
      return res.status(404).json({ message: 'Company not found' })
    }

    console.log('🗑️  Deleting company:', user.fatturaElettronica.aziendaId)

    const headers = await getFatturaElettronicaHeaders()
    await axios.delete(
      `${FATTURA_API_URL}/aziende/${user.fatturaElettronica.aziendaId}`,
      { headers }
    )

    // Remove company data from user
    user.fatturaElettronica = undefined
    await user.save()

    console.log('✅ Company deleted')

    res.json({
      success: true,
      message: 'Company deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete company error:', error.response?.data || error.message)

    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to delete company',
      error: error.response?.data || error.message
    })
  }
})

/**
 * POST /api/fatturaelettronica/fatture
 * Send invoice (supports both JSON and XML)
 */
router.post('/fatture', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'business') {
      return res.status(403).json({ message: 'Only business users can send invoices' })
    }

    const user = await User.findById(req.user.userId)

    if (!user || !user.fatturaElettronica?.piva) {
      return res.status(404).json({
        message: 'Company not configured. Please configure your company first.'
      })
    }

    const { format = 'json', data } = req.body

    if (!data) {
      return res.status(400).json({
        message: 'Invoice data is required'
      })
    }

    console.log('📤 Sending invoice via Fattura Elettronica API...')
    console.log('Format:', format)
    console.log('Company P.IVA:', user.fatturaElettronica.piva)

    const headers = await getFatturaElettronicaHeaders()

    // Adjust Content-Type based on format
    if (format === 'xml') {
      headers['Content-Type'] = 'application/xml'
    }

    const response = await axios.post(
      `${FATTURA_API_URL}/fatture`,
      data,
      { headers }
    )

    updateTokenCache(response.headers)

    console.log('✅ Invoice sent:', response.data.id)

    res.json({
      success: true,
      message: 'Invoice sent successfully',
      invoice: response.data
    })
  } catch (error: any) {
    console.error('Send invoice error:', error.response?.data || error.message)

    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to send invoice',
      error: error.response?.data || error.message
    })
  }
})

/**
 * GET /api/fatturaelettronica/fatture
 * Get list of invoices with optional filters
 */
router.get('/fatture', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'business') {
      return res.status(403).json({ message: 'Only business users can access invoices' })
    }

    const user = await User.findById(req.user.userId)

    if (!user || !user.fatturaElettronica?.piva) {
      return res.status(404).json({
        message: 'Company not configured'
      })
    }

    const {
      page = '1',
      per_page = '100',
      unread,
      date_from,
      date_to,
      partita_iva,
      numero_documento,
      tipo_documento
    } = req.query

    console.log('📥 Fetching invoices...')

    const headers = await getFatturaElettronicaHeaders()
    const params: any = {
      page: parseInt(page as string),
      per_page: parseInt(per_page as string)
    }

    // Add optional filters
    if (unread) params.unread = unread
    if (date_from) params.date_from = date_from
    if (date_to) params.date_to = date_to
    if (partita_iva) params.partita_iva = partita_iva
    if (numero_documento) params.numero_documento = numero_documento
    if (tipo_documento) params.tipo_documento = tipo_documento

    const response = await axios.get(
      `${FATTURA_API_URL}/fatture`,
      {
        params,
        headers
      }
    )

    updateTokenCache(response.headers)

    const invoices = response.data || []

    console.log(`✅ Fetched ${invoices.length} invoices`)

    res.json({
      success: true,
      invoices,
      total: invoices.length,
      hasMore: response.headers['link']?.includes('rel="next"')
    })
  } catch (error: any) {
    console.error('Get invoices error:', error.response?.data || error.message)

    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to get invoices',
      error: error.response?.data || error.message
    })
  }
})

/**
 * GET /api/fatturaelettronica/fatture/:id/pdf
 * Download invoice PDF
 */
router.get('/fatture/:id/pdf', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'business') {
      return res.status(403).json({ message: 'Only business users can download PDFs' })
    }

    const { id } = req.params

    console.log('📄 Downloading PDF for invoice:', id)

    const headers = await getFatturaElettronicaHeaders()
    const response = await axios.get(
      `${FATTURA_API_URL}/fatture/${id}/pdf`,
      {
        headers,
        responseType: 'arraybuffer'
      }
    )

    updateTokenCache(response.headers)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="fattura_${id}.pdf"`)
    res.send(response.data)
  } catch (error: any) {
    console.error('Download PDF error:', error.response?.data || error.message)

    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to download PDF'
    })
  }
})

/**
 * GET /api/fatturaelettronica/status
 * Test API connection and get account status (admin only)
 */
router.get('/status', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }

    const headers = await getFatturaElettronicaHeaders()

    // Try to make a simple API call to test connection
    const response = await axios.get(
      `${FATTURA_API_URL}/aziende`,
      {
        params: { per_page: 1 },
        headers
      }
    )

    updateTokenCache(response.headers)

    res.json({
      success: true,
      message: 'Successfully connected to Fattura Elettronica API',
      apiUrl: FATTURA_API_URL,
      mode: FATTURA_API_MODE,
      tokenCached: cachedToken !== null,
      tokenExpires: cachedToken?.expires
    })
  } catch (error: any) {
    console.error('Status check error:', error.response?.data || error.message)

    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to connect to Fattura Elettronica API',
      error: error.response?.data || error.message
    })
  }
})

export default router
