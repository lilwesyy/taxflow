import { Router, Response } from 'express'
import User from '../models/User'
import Conversation from '../models/Conversation'
import Document from '../models/Document'
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

// Get all clients (business users) - Admin only
router.get('/list', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const clients = await User.find({
      role: 'business',
      registrationApprovalStatus: 'approved',
      pivaApprovalStatus: 'approved'
    })
      .select('-password -twoFactorSecret')
      .sort({ createdAt: -1 })

    // Calculate dynamic stats for each client
    const formattedClients = await Promise.all(clients.map(async client => {
      // Count conversations/consulenze
      const consulenzeCount = await Conversation.countDocuments({
        businessUserId: client._id
      })

      // Count documents
      const documentiCount = await Document.countDocuments({
        userId: client._id,
        deleted: false
      })

      return {
        id: client._id,
        nome: client.name,
        email: client.email,
        telefono: client.phone || '',
        company: client.company || '',
        status: client.status || 'new',
        piva: client.piva || 'Non disponibile',
        codiceAteco: client.codiceAteco || '',
        fatturato: client.fatturato || 0,
        dataRegistrazione: client.createdAt,
        ultimaAttivita: client.ultimaAttivita || client.updatedAt,
        consulenze: consulenzeCount,
        pendingRequests: client.pendingRequests || 0,
        indirizzo: client.address || '',
        codiceFiscale: client.fiscalCode || '',
        regimeContabile: client.regimeContabile || 'Forfettario',
        aliquotaIva: client.aliquotaIva || '5%',
        fatturePagate: client.fatturePagate || 0,
        fattureInAttesa: client.fattureInAttesa || 0,
        documentiForniti: documentiCount,
        prossimaTasse: client.prossimaTasse,
        note: client.note || '',
        attivitaRecenti: client.attivitaRecenti || []
      }
    }))

    res.json({
      success: true,
      clients: formattedClients
    })
  } catch (error) {
    console.error('Get clients error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Get single client by ID - Admin only
router.get('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const client = await User.findOne({ _id: id, role: 'business' })
      .select('-password -twoFactorSecret')

    if (!client) {
      return res.status(404).json({ error: 'Cliente non trovato' })
    }

    // Calculate dynamic stats
    const consulenzeCount = await Conversation.countDocuments({
      businessUserId: client._id
    })

    const documentiCount = await Document.countDocuments({
      userId: client._id,
      deleted: false
    })

    const formattedClient = {
      id: client._id,
      nome: client.name,
      email: client.email,
      telefono: client.phone || '',
      company: client.company || '',
      status: client.status || 'new',
      piva: client.piva || 'Non disponibile',
      codiceAteco: client.codiceAteco || '',
      fatturato: client.fatturato || 0,
      dataRegistrazione: client.createdAt,
      ultimaAttivita: client.ultimaAttivita || client.updatedAt,
      consulenze: consulenzeCount,
      pendingRequests: client.pendingRequests || 0,
      indirizzo: client.address || '',
      codiceFiscale: client.fiscalCode || '',
      regimeContabile: client.regimeContabile || 'Forfettario',
      aliquotaIva: client.aliquotaIva || '5%',
      fatturePagate: client.fatturePagate || 0,
      fattureInAttesa: client.fattureInAttesa || 0,
      documentiForniti: documentiCount,
      prossimaTasse: client.prossimaTasse,
      note: client.note || '',
      attivitaRecenti: client.attivitaRecenti || []
    }

    res.json({
      success: true,
      client: formattedClient
    })
  } catch (error) {
    console.error('Get client error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Update client data - Admin only
router.put('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const client = await User.findOne({ _id: id, role: 'business' })

    if (!client) {
      return res.status(404).json({ error: 'Cliente non trovato' })
    }

    const {
      name, email, phone, company, piva, codiceAteco, regimeContabile,
      aliquotaIva, fatturato, status, pendingRequests, consulenze,
      fatturePagate, fattureInAttesa, documentiForniti, prossimaTasse,
      note, address, fiscalCode
    } = req.body

    // Update fields if provided
    if (name !== undefined) client.name = name
    if (email !== undefined) client.email = email
    if (phone !== undefined) client.phone = phone
    if (company !== undefined) client.company = company
    if (piva !== undefined) client.piva = piva
    if (codiceAteco !== undefined) client.codiceAteco = codiceAteco
    if (regimeContabile !== undefined) client.regimeContabile = regimeContabile
    if (aliquotaIva !== undefined) client.aliquotaIva = aliquotaIva
    if (fatturato !== undefined) client.fatturato = fatturato
    if (status !== undefined) client.status = status
    if (pendingRequests !== undefined) client.pendingRequests = pendingRequests
    if (consulenze !== undefined) client.consulenze = consulenze
    if (fatturePagate !== undefined) client.fatturePagate = fatturePagate
    if (fattureInAttesa !== undefined) client.fattureInAttesa = fattureInAttesa
    if (documentiForniti !== undefined) client.documentiForniti = documentiForniti
    if (prossimaTasse !== undefined) client.prossimaTasse = prossimaTasse
    if (note !== undefined) client.note = note
    if (address !== undefined) client.address = address
    if (fiscalCode !== undefined) client.fiscalCode = fiscalCode

    // Update ultimaAttivita
    client.ultimaAttivita = new Date()

    await client.save()

    const updatedClient = await User.findById(id).select('-password -twoFactorSecret')

    res.json({
      success: true,
      client: updatedClient
    })
  } catch (error) {
    console.error('Update client error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Add activity log to client - Admin only
router.post('/:id/activity', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { action, detail } = req.body

    if (!action || !detail) {
      return res.status(400).json({ error: 'Azione e dettaglio sono richiesti' })
    }

    const client = await User.findOne({ _id: id, role: 'business' })

    if (!client) {
      return res.status(404).json({ error: 'Cliente non trovato' })
    }

    if (!client.attivitaRecenti) {
      client.attivitaRecenti = []
    }

    client.attivitaRecenti.unshift({
      date: new Date(),
      action,
      detail
    })

    // Keep only last 50 activities
    if (client.attivitaRecenti.length > 50) {
      client.attivitaRecenti = client.attivitaRecenti.slice(0, 50)
    }

    client.ultimaAttivita = new Date()
    await client.save()

    res.json({
      success: true,
      message: 'Attività aggiunta con successo'
    })
  } catch (error) {
    console.error('Add activity error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

export default router
