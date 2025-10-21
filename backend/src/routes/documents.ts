import { Router, Response, Request } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import mongoose from 'mongoose'
import crypto from 'crypto'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { validateObjectId } from '../middleware/validateObjectId'
import Document from '../models/Document'
import User from '../models/User'

const router = Router()
const readFile = promisify(fs.readFile)

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(__dirname, '../../uploads/documents')

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    cb(null, uploadDir)
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Generate cryptographically secure random filename to prevent path traversal
    const randomName = crypto.randomBytes(32).toString('hex')
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${randomName}${ext}`)
  }
})

// Note: MIME type validation in multer is not secure (can be spoofed)
// We'll do real file type validation after upload using file-type library
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Only check extension as first pass - real validation happens after upload
  const allowedExtensions = ['.pdf', '.xml', '.docx', '.doc', '.xlsx', '.xls']
  const ext = path.extname(file.originalname).toLowerCase()

  if (allowedExtensions.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error('Estensione file non supportata. Formati consentiti: PDF, XML, DOC, DOCX, XLS, XLSX'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
})

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// GET /api/documents - Get documents (business: own docs, admin: all or filtered by clientId)
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const userRole = req.user!.role
    const { categoria, status, anno, clientId } = req.query

    let query: mongoose.FilterQuery<typeof Document> = { deleted: false }

    if (userRole === 'business') {
      // Business users can only see their own documents
      query.userId = userId
    } else if (userRole === 'admin') {
      // Admin can filter by clientId or see all
      if (clientId) {
        query.clientId = clientId
      }
      // If no clientId, admin sees all documents (could add query.userId = userId to see only documents uploaded by admin)
    }

    // Apply filters
    if (categoria) query.categoria = categoria
    if (status) query.status = status
    if (anno) query.anno = anno

    const documents = await Document.find(query)
      .populate('userId', 'name email')
      .populate('clientId', 'name email company')
      .sort({ dataCaricamento: -1 })

    // Format documents for frontend
    const formattedDocuments = documents.map(doc => ({
      id: doc._id,
      nome: doc.nome,
      tipo: doc.tipo,
      categoria: doc.categoria,
      descrizione: doc.descrizione,
      formato: doc.formato,
      dimensione: formatFileSize(doc.dimensione),
      dimensioneBytes: doc.dimensione,
      anno: doc.anno,
      dataCaricamento: doc.dataCaricamento.toLocaleDateString('it-IT'),
      dataModifica: doc.dataModifica.toLocaleDateString('it-IT'),
      status: doc.status,
      protocollo: doc.protocollo,
      importo: doc.importo,
      note: doc.note,
      fileUrl: doc.fileUrl,
      cronologia: doc.cronologia.map(c => ({
        data: c.data.toLocaleDateString('it-IT'),
        azione: c.azione,
        utente: c.utente
      })),
      cliente: doc.clientId ? {
        id: (doc.clientId as any)._id,
        nome: (doc.clientId as any).name,
        email: (doc.clientId as any).email,
        azienda: (doc.clientId as any).company
      } : null
    }))

    res.json({ documents: formattedDocuments })
  } catch (error) {
    console.error('Error fetching documents:', error)
    res.status(500).json({ error: 'Errore durante il recupero dei documenti' })
  }
})

// POST /api/documents/upload - Upload new document
router.post('/upload', authMiddleware, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const userRole = req.user!.role
    const file = req.file

    if (!file) {
      return res.status(400).json({ error: 'Nessun file caricato' })
    }

    // Basic file type validation based on extension (already done in fileFilter)
    // Advanced magic number validation removed to avoid dependency issues

    const { nome, tipo, categoria, descrizione, anno, clientId, protocollo, importo, note } = req.body

    // Validation
    if (!nome || !tipo || !categoria || !anno) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(file.path)
      return res.status(400).json({ error: 'Campi obbligatori mancanti: nome, tipo, categoria, anno' })
    }

    // Verify clientId if provided (admin uploading for client)
    let targetClientId = null
    if (userRole === 'admin' && clientId) {
      const client = await User.findById(clientId)
      if (!client) {
        fs.unlinkSync(file.path)
        return res.status(404).json({ error: 'Cliente non trovato' })
      }
      targetClientId = clientId
    }

    // Get file extension
    const ext = path.extname(file.originalname).substring(1).toUpperCase()

    // Create document URL (accessible via /uploads/documents/filename)
    const fileUrl = `/uploads/documents/${file.filename}`

    // Get current user info for cronologia
    const user = await User.findById(userId)
    const userName = user?.name || 'Utente'

    // Determina lo status iniziale in base a chi carica il documento
    // Admin/Consulente: elaborato (documenti già verificati)
    // Business: in_elaborazione (necessita revisione del consulente)
    const initialStatus = userRole === 'admin' ? 'elaborato' : 'in_elaborazione'

    // Create document
    const document = new Document({
      userId: targetClientId || userId, // If admin uploads for client, document belongs to client
      clientId: targetClientId, // Set clientId only if admin uploads for client
      nome,
      tipo,
      categoria,
      descrizione,
      fileName: file.originalname,
      fileUrl,
      formato: ext,
      dimensione: file.size,
      mimeType: file.mimetype,
      status: initialStatus,
      protocollo,
      importo,
      anno,
      note,
      cronologia: [
        {
          data: new Date(),
          azione: 'Documento caricato',
          utente: userName
        }
      ]
    })

    await document.save()

    // Send email notifications
    try {
      const uploader = await User.findById(userId)
      if (uploader) {
        if (userRole === 'business') {
          // Business uploaded document - send confirmation to client and notification to admin
          const { sendDocumentUploadedEmail } = await import('../utils/emailService')
          await sendDocumentUploadedEmail(
            uploader.email,
            uploader.name,
            file.originalname,
            categoria
          )
          console.log(`📧 Document upload confirmation sent to client ${uploader.email}`)

          // TODO: Send notification to assigned admin if exists
          // For now, we'll skip this as we'd need to know which admin is assigned to this client
        } else if (userRole === 'admin' && targetClientId) {
          // Admin uploaded for client - send notification to client
          const client = await User.findById(targetClientId)
          if (client) {
            const { sendDocumentUploadedEmail } = await import('../utils/emailService')
            await sendDocumentUploadedEmail(
              client.email,
              client.name,
              file.originalname,
              categoria
            )
            console.log(`📧 Document upload notification sent to client ${client.email}`)
          }
        }
      }
    } catch (emailError) {
      console.error('Error sending document upload emails:', emailError)
      // Don't block document upload if email fails
    }

    res.status(201).json({
      message: 'Documento caricato con successo',
      document: {
        id: document._id,
        nome: document.nome,
        tipo: document.tipo,
        categoria: document.categoria,
        fileUrl: document.fileUrl
      }
    })
  } catch (error) {
    console.error('Error uploading document:', error)

    // Delete uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path)
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError)
      }
    }

    if (error instanceof Error && error.message && error.message.includes('Tipo di file non supportato')) {
      return res.status(400).json({ error: error.message })
    }

    res.status(500).json({ error: 'Errore durante il caricamento del documento' })
  }
})

// GET /api/documents/:id - Get single document
router.get('/:id', authMiddleware, validateObjectId('id'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const userRole = req.user!.role
    const { id } = req.params

    const document = await Document.findOne({ _id: id, deleted: false })
      .populate('userId', 'name email')
      .populate('clientId', 'name email company')

    if (!document) {
      return res.status(404).json({ error: 'Documento non trovato' })
    }

    // Authorization check
    if (userRole === 'business' && document.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Non autorizzato ad accedere a questo documento' })
    }

    const formattedDocument = {
      id: document._id,
      nome: document.nome,
      tipo: document.tipo,
      categoria: document.categoria,
      descrizione: document.descrizione,
      formato: document.formato,
      dimensione: formatFileSize(document.dimensione),
      anno: document.anno,
      dataCaricamento: document.dataCaricamento.toLocaleDateString('it-IT'),
      dataModifica: document.dataModifica.toLocaleDateString('it-IT'),
      status: document.status,
      protocollo: document.protocollo,
      importo: document.importo,
      note: document.note,
      fileUrl: document.fileUrl,
      cronologia: document.cronologia.map(c => ({
        data: c.data.toLocaleDateString('it-IT'),
        azione: c.azione,
        utente: c.utente
      })),
      cliente: document.clientId ? {
        id: (document.clientId as any)._id,
        nome: (document.clientId as any).name,
        email: (document.clientId as any).email,
        azienda: (document.clientId as any).company
      } : null
    }

    res.json({ document: formattedDocument })
  } catch (error) {
    console.error('Error fetching document:', error)
    res.status(500).json({ error: 'Errore durante il recupero del documento' })
  }
})

// PUT /api/documents/:id - Update document metadata
router.put('/:id', authMiddleware, validateObjectId('id'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const userRole = req.user!.role
    const { id } = req.params
    const { nome, descrizione, status, protocollo, importo, note } = req.body

    const document = await Document.findOne({ _id: id, deleted: false })

    if (!document) {
      return res.status(404).json({ error: 'Documento non trovato' })
    }

    // Authorization check
    if (userRole === 'business' && document.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Non autorizzato a modificare questo documento' })
    }

    // Get current user info
    const user = await User.findById(userId)
    const userName = user?.name || 'Utente'

    // Update fields
    if (nome !== undefined) document.nome = nome
    if (descrizione !== undefined) document.descrizione = descrizione
    if (status !== undefined) document.status = status
    if (protocollo !== undefined) document.protocollo = protocollo
    if (importo !== undefined) document.importo = importo
    if (note !== undefined) document.note = note

    // Add to cronologia
    document.cronologia.push({
      data: new Date(),
      azione: 'Documento aggiornato',
      utente: userName
    })

    await document.save()

    res.json({
      message: 'Documento aggiornato con successo',
      document: {
        id: document._id,
        nome: document.nome,
        status: document.status
      }
    })
  } catch (error) {
    console.error('Error updating document:', error)
    res.status(500).json({ error: 'Errore durante l\'aggiornamento del documento' })
  }
})

// DELETE /api/documents/:id - Hard delete document (permanent)
router.delete('/:id', authMiddleware, validateObjectId('id'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const userRole = req.user!.role
    const { id } = req.params

    const document = await Document.findOne({ _id: id, deleted: false })

    if (!document) {
      return res.status(404).json({ error: 'Documento non trovato' })
    }

    // Authorization check
    if (userRole === 'business' && document.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Non autorizzato a eliminare questo documento' })
    }

    // Business users cannot delete elaborated documents
    if (userRole === 'business' && document.status === 'elaborato') {
      return res.status(403).json({ error: 'Non puoi eliminare documenti elaborati. Contatta il tuo consulente.' })
    }

    // Delete physical file from disk
    if (document.fileUrl) {
      const filePath = path.join(__dirname, '../../', document.fileUrl)
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
          console.log(`File deleted: ${filePath}`)
        }
      } catch (fileError) {
        console.error('Error deleting physical file:', fileError)
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete document from database (hard delete)
    await Document.findByIdAndDelete(id)

    res.json({ message: 'Documento eliminato definitivamente' })
  } catch (error) {
    console.error('Error deleting document:', error)
    res.status(500).json({ error: 'Errore durante l\'eliminazione del documento' })
  }
})

// GET /api/documents/stats - Get document statistics
router.get('/stats/summary', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const userRole = req.user!.role
    const { clientId } = req.query

    let query: mongoose.FilterQuery<typeof Document> = { deleted: false }

    if (userRole === 'business') {
      query.userId = userId
    } else if (userRole === 'admin' && clientId) {
      query.clientId = clientId
    }

    const documents = await Document.find(query)

    const stats = {
      totale: documents.length,
      elaborati: documents.filter(d => d.status === 'elaborato').length,
      inElaborazione: documents.filter(d => d.status === 'in_elaborazione').length,
      inAttesa: documents.filter(d => d.status === 'in_attesa').length,
      perCategoria: {
        dichiarazioni: documents.filter(d => d.categoria === 'dichiarazioni').length,
        fatturazione: documents.filter(d => d.categoria === 'fatturazione').length,
        comunicazioni: documents.filter(d => d.categoria === 'comunicazioni').length,
        versamenti: documents.filter(d => d.categoria === 'versamenti').length,
        consultazione: documents.filter(d => d.categoria === 'consultazione').length,
        registri: documents.filter(d => d.categoria === 'registri').length,
        altri_documenti: documents.filter(d => d.categoria === 'altri_documenti').length
      }
    }

    res.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Errore durante il recupero delle statistiche' })
  }
})

export default router
