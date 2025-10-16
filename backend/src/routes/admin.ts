import { Router, Response } from 'express'
import User from '../models/User'
import FatturaElettronica from '../models/FatturaElettronica'
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

/**
 * GET /api/admin/client/:clientId/invoices
 * Get all invoices for a specific business client
 */
router.get('/client/:clientId/invoices', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { clientId } = req.params

    // Verify the client exists and is a business user
    const client = await User.findOne({ _id: clientId, role: 'business' })
    if (!client) {
      return res.status(404).json({ error: 'Cliente non trovato' })
    }

    // Get all invoices from the client
    const invoices = await FatturaElettronica.find({ userId: clientId })
      .sort({ dataInvio: -1 })
      .lean()

    // Transform to API format
    const formattedInvoices = invoices.map((inv: any) => ({
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
      pagamento: inv.pagamento,
      identificativoSdI: inv.identificativoSdI,
      sdiStato: inv.sdiStato,
      sdiStatoDescrizione: inv.sdiStatoDescrizione
    }))

    res.json({
      success: true,
      invoices: formattedInvoices
    })
  } catch (error) {
    console.error('Error fetching client invoices:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

/**
 * GET /api/admin/client/:clientId/clients
 * Get all clients (destinatari) of a specific business client
 */
router.get('/client/:clientId/clients', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { clientId } = req.params

    // Verify the client exists and is a business user
    const client = await User.findOne({ _id: clientId, role: 'business' })
    if (!client) {
      return res.status(404).json({ error: 'Cliente non trovato' })
    }

    // Get unique destinatari from invoices
    const invoices = await FatturaElettronica.find({ userId: clientId })
      .select('destinatario')
      .lean()

    // Extract unique clients based on CF or P.IVA
    const clientsMap = new Map()
    invoices.forEach((inv: any) => {
      const dest = inv.destinatario
      if (!dest) return

      const key = dest.codiceFiscale || dest.partitaIva
      if (key && !clientsMap.has(key)) {
        // Clean address: if it contains CAP/city/province, extract only street and number
        let cleanIndirizzo = dest.indirizzo || ''

        // If address contains a comma followed by numbers (likely CAP), take only the part before the first comma
        if (cleanIndirizzo && dest.cap && cleanIndirizzo.includes(',')) {
          // Check if the address contains the CAP or city - if so, split at first comma
          const firstCommaIndex = cleanIndirizzo.indexOf(',')
          const addressBeforeComma = cleanIndirizzo.substring(0, firstCommaIndex).trim()

          // If what comes after comma looks like it contains location info (numbers for CAP, city names, etc)
          // then use only the part before comma
          if (firstCommaIndex > 0 && addressBeforeComma.length > 0) {
            cleanIndirizzo = addressBeforeComma
          }
        }

        clientsMap.set(key, {
          denominazione: dest.denominazione,
          ragioneSociale: dest.denominazione,
          partitaIva: dest.partitaIva,
          codiceFiscale: dest.codiceFiscale,
          indirizzo: cleanIndirizzo,
          cap: dest.cap,
          comune: dest.comune,
          provincia: dest.provincia,
          nazione: dest.nazione || 'IT',
          email: dest.email || '',
          pec: dest.pec || '',
          telefono: dest.telefono || ''
        })
      }
    })

    const clients = Array.from(clientsMap.values())

    res.json({
      success: true,
      clients
    })
  } catch (error) {
    console.error('Error fetching client clients:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

export default router
