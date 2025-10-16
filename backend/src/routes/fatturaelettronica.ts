import express from 'express'
import axios from 'axios'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import User from '../models/User'
import FatturaElettronica from '../models/FatturaElettronica'

const router = express.Router()

// Fattura Elettronica API Configuration
const FATTURA_API_USERNAME = process.env.FATTURA_ELETTRONICA_USERNAME || ''
const FATTURA_API_PASSWORD = process.env.FATTURA_ELETTRONICA_PASSWORD || ''
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
  if (!FATTURA_API_USERNAME || !FATTURA_API_PASSWORD) {
    throw new Error('Fattura Elettronica API credentials not configured (username and password required)')
  }

  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expires > new Date()) {
    // console.log('🔑 Using cached Bearer token (expires:', cachedToken.expires.toISOString() + ')')
    return {
      'Authorization': `Bearer ${cachedToken.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  // Use Basic Auth for first call
  const username = FATTURA_API_USERNAME.trim()
  const password = FATTURA_API_PASSWORD.trim()
  const auth = Buffer.from(`${username}:${password}`).toString('base64')

  console.log('🔐 Using Basic Auth with username:', username.substring(0, 5) + '***')

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
    // console.log('✅ Bearer token cached (expires:', expires + ')')
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

      // If company doesn't exist on API (404), clear local data
      if (apiError.response?.status === 404) {
        console.log('⚠️  Company not found on API, clearing local data')
        user.fatturaElettronica = undefined
        await user.save()

        return res.json({
          success: false,
          message: 'Company not found on API',
          hasCompany: false
        })
      }

      // For other errors, fallback to local data
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
    console.log('📋 Update payload:', JSON.stringify(req.body, null, 2))

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
    console.log('🌐 API Mode:', FATTURA_API_MODE)
    console.log('🔗 API URL:', FATTURA_API_URL)
    console.log('Format:', format)
    console.log('Company ID:', user.fatturaElettronica.aziendaId)
    console.log('Company P.IVA:', user.fatturaElettronica.piva)

    const headers = await getFatturaElettronicaHeaders()

    // Adjust Content-Type based on format
    if (format === 'xml') {
      headers['Content-Type'] = 'application/xml'
    }

    console.log('📋 Invoice payload:', JSON.stringify(data, null, 2))

    const response = await axios.post(
      `${FATTURA_API_URL}/fatture`,
      data,
      { headers }
    )

    updateTokenCache(response.headers)

    console.log('✅ Invoice sent:', response.data.id)

    // Salva la fattura nel database
    try {
      // Calcola i totali
      const righe = data.righe || []
      let importoTotale = 0
      let importoIVA = 0

      righe.forEach((riga: any) => {
        const prezzoUnitario = parseFloat(riga.PrezzoUnitario) || 0
        const quantita = riga.Quantita || 1
        const aliquotaIVA = riga.AliquotaIVA || 0

        const subtotale = prezzoUnitario * quantita
        const ivaRiga = (subtotale * aliquotaIVA) / 100

        importoTotale += subtotale
        importoIVA += ivaRiga
      })

      const importoTotaleConIVA = importoTotale + importoIVA

      const fatturaDb = new FatturaElettronica({
        userId: req.user.userId,
        aziendaId: user.fatturaElettronica.aziendaId,
        fatturaApiId: response.data.id.toString(),
        pivaMittente: data.piva_mittente,
        ragioneSocialeMittente: user.fatturaElettronica.ragioneSociale || user.name,
        destinatario: {
          codiceSDI: data.destinatario.CodiceSDI,
          partitaIva: data.destinatario.PartitaIVA,
          codiceFiscale: data.destinatario.CodiceFiscale,
          denominazione: data.destinatario.Denominazione,
          indirizzo: data.destinatario.Indirizzo,
          cap: data.destinatario.CAP,
          comune: data.destinatario.Comune,
          provincia: data.destinatario.Provincia,
          nazione: data.destinatario.Nazione || 'IT',
          pec: data.destinatario.PEC
        },
        documento: {
          numero: data.documento.Numero,
          data: data.documento.Data,
          tipo: data.documento.tipo
        },
        righe: righe.map((riga: any) => ({
          descrizione: riga.Descrizione,
          prezzoUnitario: parseFloat(riga.PrezzoUnitario) || 0,
          quantita: riga.Quantita || 1,
          unitaMisura: riga.UnitaMisura,
          aliquotaIVA: riga.AliquotaIVA || 0
        })),
        importoTotale,
        importoIVA,
        importoTotaleConIVA,
        pagamento: data.pagamento ? {
          modalitaPagamento: data.pagamento.ModalitaPagamento,
          iban: data.pagamento.IBAN,
          dataScadenza: data.pagamento.DataScadenza
        } : undefined,
        status: 'inviata',
        dataInvio: new Date(),
        payloadOriginale: data
      })

      await fatturaDb.save()
      console.log('💾 Fattura salvata nel database con ID:', fatturaDb._id)
    } catch (dbError: any) {
      console.error('⚠️ Errore nel salvataggio della fattura nel DB:', dbError.message)
      // Non blocchiamo la risposta se il DB fallisce
    }

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
 * Get list of invoices from local database
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
      date_from,
      date_to,
      status
    } = req.query

    // console.log('📥 Fetching invoices from database...')

    // Build query filters
    const query: any = { userId: req.user.userId }

    if (date_from || date_to) {
      query['documento.data'] = {}
      if (date_from) query['documento.data'].$gte = date_from
      if (date_to) query['documento.data'].$lte = date_to
    }

    if (status) {
      query.status = status
    }

    // Pagination
    const pageNum = parseInt(page as string)
    const perPage = parseInt(per_page as string)
    const skip = (pageNum - 1) * perPage

    // Fetch invoices from database
    const invoices = await FatturaElettronica.find(query)
      .sort({ dataInvio: -1 })
      .skip(skip)
      .limit(perPage)
      .lean()

    const total = await FatturaElettronica.countDocuments(query)

    // console.log(`✅ Fetched ${invoices.length} invoices from database (total: ${total})`)

    // Transform to API format for compatibility with frontend
    const transformedInvoices = invoices.map((inv: any) => ({
      id: inv.fatturaApiId,
      _id: inv._id,
      numero: inv.documento.numero,
      data: inv.documento.data,
      cliente: inv.destinatario.denominazione,
      pivaMittente: inv.pivaMittente,
      importo: inv.importoTotale,
      iva: inv.importoIVA,
      totale: inv.importoTotaleConIVA,
      status: inv.status,
      dataInvio: inv.dataInvio,
      righe: inv.righe,
      destinatario: inv.destinatario,
      pagamento: inv.pagamento
    }))

    res.json({
      success: true,
      invoices: transformedInvoices,
      sent: transformedInvoices, // For compatibility
      received: [], // We only track sent invoices
      total,
      hasMore: total > skip + invoices.length
    })
  } catch (error: any) {
    console.error('Get invoices error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to get invoices',
      error: error.message
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
 * Helper function to map SDI status to our internal status enum
 */
function mapSdiStatusToInternal(sdiStato: string): string {
  const statusMap: Record<string, string> = {
    'INVI': 'inviata',          // Inviata al SDI
    'PREN': 'presa_in_carico',  // Presa in carico dal SDI
    'CONS': 'consegnata',       // Consegnata al destinatario
    'NONC': 'non_consegnata',   // Non consegnata
    'ERRO': 'errore',           // Errore di elaborazione
    'ACCE': 'accettata',        // Accettata (PA)
    'RIFI': 'rifiutata',        // Rifiutata (PA)
    'DECO': 'accettata'         // Decorrenza termini (PA) - consideriamo come accettata
  }

  return statusMap[sdiStato] || 'in_attesa'
}

/**
 * POST /api/fatturaelettronica/fatture/:id/sync-status
 * Synchronize invoice status from Fattura Elettronica API
 */
router.post('/fatture/:id/sync-status', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'business') {
      return res.status(403).json({ message: 'Only business users can sync invoice status' })
    }

    const { id } = req.params // Can be MongoDB _id or fatturaApiId

    console.log('🔄 Syncing status for invoice:', id)

    // Find invoice in database - try both _id and fatturaApiId
    let fattura = null

    // Try finding by MongoDB _id first
    try {
      fattura = await FatturaElettronica.findOne({
        _id: id,
        userId: req.user.userId
      })
    } catch (error) {
      // If _id is not valid MongoDB ObjectId, it will throw error
      console.log('Not a valid MongoDB _id, trying fatturaApiId')
    }

    // If not found by _id, try by fatturaApiId
    if (!fattura) {
      fattura = await FatturaElettronica.findOne({
        fatturaApiId: id,
        userId: req.user.userId
      })
    }

    if (!fattura) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      })
    }

    console.log('📡 Fetching status from API for invoice ID:', fattura.fatturaApiId)

    // Fetch invoice status from API
    const headers = await getFatturaElettronicaHeaders()
    const response = await axios.get(
      `${FATTURA_API_URL}/fatture/${fattura.fatturaApiId}`,
      { headers }
    )

    updateTokenCache(response.headers)

    const apiData = response.data

    // console.log('📥 API Response:', JSON.stringify(apiData, null, 2))

    // Extract status information
    const sdiStato = apiData.sdi_stato || apiData.stato || 'INVI'
    const sdiStatoDescrizione = apiData.sdi_stato_descrizione || apiData.stato_descrizione || ''
    const identificativoSdI = apiData.sdi_identificativo || apiData.identificativo_sdi || fattura.identificativoSdI

    // Map to internal status
    const nuovoStatus = mapSdiStatusToInternal(sdiStato)

    console.log('✏️  Updating status:', {
      oldStatus: fattura.status,
      newStatus: nuovoStatus,
      sdiStato,
      sdiStatoDescrizione
    })

    // Update invoice in database
    fattura.status = nuovoStatus as any
    fattura.sdiStato = sdiStato
    fattura.sdiStatoDescrizione = sdiStatoDescrizione
    fattura.identificativoSdI = identificativoSdI
    fattura.ultimaVerificaStatus = new Date()

    await fattura.save()

    // console.log('✅ Status updated successfully')

    res.json({
      success: true,
      message: 'Invoice status synchronized successfully',
      invoice: {
        _id: fattura._id,
        fatturaApiId: fattura.fatturaApiId,
        numero: fattura.documento.numero,
        status: fattura.status,
        sdiStato: fattura.sdiStato,
        sdiStatoDescrizione: fattura.sdiStatoDescrizione,
        identificativoSdI: fattura.identificativoSdI,
        ultimaVerificaStatus: fattura.ultimaVerificaStatus
      }
    })
  } catch (error: any) {
    console.error('Sync status error:', error.response?.data || error.message)

    // If invoice not found on API, mark as error
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found on Fattura Elettronica API'
      })
    }

    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to sync invoice status',
      error: error.response?.data || error.message
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
