import { Router, Response } from 'express'
import Client from '../models/Client'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// GET /api/business-clients/list - Get all clients for the authenticated user
router.get('/list', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get all clients for this user, sorted by name
    const clients = await Client.find({ userId })
      .sort({ ragioneSociale: 1 })
      .lean()

    res.json({
      success: true,
      clients
    })
  } catch (error) {
    console.error('Error fetching clients:', error)
    res.status(500).json({ error: 'Errore nel caricamento dei clienti' })
  }
})

// GET /api/business-clients/:id - Get single client by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const client = await Client.findOne({ _id: id, userId }).lean()

    if (!client) {
      return res.status(404).json({ error: 'Cliente non trovato' })
    }

    res.json({
      success: true,
      client
    })
  } catch (error) {
    console.error('Error fetching client:', error)
    res.status(500).json({ error: 'Errore nel caricamento del cliente' })
  }
})

// POST /api/business-clients/create - Create new client
router.post('/create', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const {
      ragioneSociale,
      partitaIva,
      codiceFiscale,
      indirizzo,
      numeroCivico,
      cap,
      comune,
      provincia,
      nazione,
      email,
      telefono,
      pec,
      codiceDestinatario,
      note
    } = req.body

    // Validate required fields
    if (!ragioneSociale || !codiceFiscale || !indirizzo || !cap || !comune || !provincia) {
      return res.status(400).json({
        error: 'Campi obbligatori mancanti: ragione sociale, codice fiscale, indirizzo, CAP, comune, provincia'
      })
    }

    // Check if client with same fiscal code already exists for this user
    const existingClient = await Client.findOne({
      userId,
      codiceFiscale: codiceFiscale.toUpperCase()
    })

    if (existingClient) {
      return res.status(409).json({
        error: 'Esiste già un cliente con questo codice fiscale'
      })
    }

    // Create new client
    const client = new Client({
      userId,
      ragioneSociale: ragioneSociale.trim(),
      partitaIva: partitaIva?.trim(),
      codiceFiscale: codiceFiscale.toUpperCase().trim(),
      indirizzo: indirizzo.trim(),
      numeroCivico: numeroCivico?.trim(),
      cap: cap.trim(),
      comune: comune.trim(),
      provincia: provincia.toUpperCase().trim(),
      nazione: nazione?.toUpperCase().trim() || 'IT',
      email: email?.toLowerCase().trim(),
      telefono: telefono?.trim(),
      pec: pec?.toLowerCase().trim(),
      codiceDestinatario: codiceDestinatario?.toUpperCase().trim() || '0000000',
      note: note?.trim()
    })

    await client.save()

    res.status(201).json({
      success: true,
      message: 'Cliente creato con successo',
      client
    })
  } catch (error) {
    console.error('Error creating client:', error)
    res.status(500).json({ error: 'Errore nella creazione del cliente' })
  }
})

// PUT /api/business-clients/:id - Update client
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Find client and verify ownership
    const client = await Client.findOne({ _id: id, userId })

    if (!client) {
      return res.status(404).json({ error: 'Cliente non trovato' })
    }

    const {
      ragioneSociale,
      partitaIva,
      codiceFiscale,
      indirizzo,
      numeroCivico,
      cap,
      comune,
      provincia,
      nazione,
      email,
      telefono,
      pec,
      codiceDestinatario,
      note
    } = req.body

    // Update fields
    if (ragioneSociale) client.ragioneSociale = ragioneSociale.trim()
    if (partitaIva !== undefined) client.partitaIva = partitaIva?.trim()
    if (codiceFiscale) client.codiceFiscale = codiceFiscale.toUpperCase().trim()
    if (indirizzo) client.indirizzo = indirizzo.trim()
    if (numeroCivico !== undefined) client.numeroCivico = numeroCivico?.trim()
    if (cap) client.cap = cap.trim()
    if (comune) client.comune = comune.trim()
    if (provincia) client.provincia = provincia.toUpperCase().trim()
    if (nazione) client.nazione = nazione.toUpperCase().trim()
    if (email !== undefined) client.email = email?.toLowerCase().trim()
    if (telefono !== undefined) client.telefono = telefono?.trim()
    if (pec !== undefined) client.pec = pec?.toLowerCase().trim()
    if (codiceDestinatario !== undefined) client.codiceDestinatario = codiceDestinatario?.toUpperCase().trim()
    if (note !== undefined) client.note = note?.trim()

    await client.save()

    res.json({
      success: true,
      message: 'Cliente aggiornato con successo',
      client
    })
  } catch (error) {
    console.error('Error updating client:', error)
    res.status(500).json({ error: 'Errore nell\'aggiornamento del cliente' })
  }
})

// DELETE /api/business-clients/:id - Delete client
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Find and delete client (verify ownership)
    const result = await Client.deleteOne({ _id: id, userId })

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Cliente non trovato' })
    }

    res.json({
      success: true,
      message: 'Cliente eliminato con successo'
    })
  } catch (error) {
    console.error('Error deleting client:', error)
    res.status(500).json({ error: 'Errore nell\'eliminazione del cliente' })
  }
})

export default router
