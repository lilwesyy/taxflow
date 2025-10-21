import express, { Request } from 'express'
import multer from 'multer'
import path from 'path'
import PDFDocument from 'pdfkit'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import Conversation from '../models/Conversation'
import Message from '../models/Message'
import User from '../models/User'
import Invoice from '../models/Invoice'
import mongoose from 'mongoose'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, 'uploads/chat/')
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Allow images and common document types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (extname && mimetype) {
      cb(null, true)
    } else {
      cb(new Error('Tipo di file non supportato'))
    }
  }
})

// Get all available consultants (admin users) - for business users
router.get('/consultants', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role

    if (userRole !== 'business') {
      return res.status(403).json({ error: 'Solo i clienti possono vedere i consulenti' })
    }

    // Get all admin users
    const consultants = await User.find({ role: 'admin' })
      .select('name email professionalRole bio')
      .lean()

    res.json(consultants)
  } catch (error) {
    console.error('Error fetching consultants:', error)
    res.status(500).json({ error: 'Errore nel recupero dei consulenti' })
  }
})

// Get all conversations for the logged-in user
router.get('/conversations', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const userRole = req.user!.role

    let conversations

    if (userRole === 'business') {
      // Business users see their conversations including pending (exclude AI Assistant)
      conversations = await Conversation.find({
        businessUserId: userId,
        tipo: { $ne: 'AI Assistant' }
      })
        .populate('adminUserId', 'name email professionalRole')
        .sort({ lastMessageAt: -1 })
        .lean()
    } else {
      // Admin users see conversations assigned to them AND pending requests (exclude AI Assistant)
      conversations = await Conversation.find({
        $or: [
          { adminUserId: userId },
          { status: 'pending', adminUserId: { $exists: false } },
          { status: 'pending', adminUserId: null }
        ],
        tipo: { $ne: 'AI Assistant' }
      })
        .populate('businessUserId', 'name email')
        .sort({ lastMessageAt: -1 })
        .lean()
    }

    // Get unread message count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          senderRole: userRole === 'business' ? 'admin' : 'business',
          stato: { $ne: 'read' }
        })

        // Get last message
        const lastMessage = await Message.findOne({ conversationId: conv._id })
          .sort({ createdAt: -1 })
          .select('testo createdAt')
          .lean()

        return {
          ...conv,
          messaggiNonLetti: unreadCount,
          ultimoMessaggio: lastMessage?.testo || '',
          orarioUltimoMessaggio: lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : ''
        }
      })
    )

    res.json(conversationsWithUnread)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    res.status(500).json({ error: 'Errore nel recupero delle conversazioni' })
  }
})

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { conversationId } = req.params
    const userId = req.user!.userId
    const userRole = req.user!.role

    // Verify user has access to this conversation
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({ error: 'Conversazione non trovata' })
    }

    if (
      (userRole === 'business' && conversation.businessUserId.toString() !== userId) ||
      (userRole === 'admin' && conversation.adminUserId?.toString() !== userId)
    ) {
      return res.status(403).json({ error: 'Non autorizzato' })
    }

    // Get messages
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name')
      .sort({ createdAt: 1 })
      .lean()

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        senderRole: userRole === 'business' ? 'admin' : 'business',
        stato: { $ne: 'read' }
      },
      { stato: 'read' }
    )

    // Format messages for frontend
    const formattedMessages = messages.map((msg) => ({
      id: msg._id,
      mittente: msg.senderRole === userRole ? (userRole === 'business' ? 'user' : 'consulente') : (userRole === 'business' ? 'consulente' : 'cliente'),
      nome: (msg.senderId as any)?.name || 'Utente',
      testo: msg.testo,
      timestamp: msg.createdAt.toISOString(),
      stato: msg.stato,
      attachments: msg.attachments
    }))

    res.json(formattedMessages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    res.status(500).json({ error: 'Errore nel recupero dei messaggi' })
  }
})

// Upload files
router.post('/upload', authenticateToken, upload.array('files', 5), async (req: AuthRequest, res) => {
  try {
    const files = req.files as Express.Multer.File[]

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nessun file caricato' })
    }

    const uploadedFiles = files.map((file) => ({
      filename: file.originalname,
      url: `/uploads/chat/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size
    }))

    res.json({ success: true, files: uploadedFiles })
  } catch (error) {
    console.error('Error uploading files:', error)
    res.status(500).json({ error: 'Errore nel caricamento dei file' })
  }
})

// Send a message
router.post('/conversations/:conversationId/messages', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { conversationId } = req.params
    const { testo, attachments } = req.body
    const userId = req.user!.userId
    const userRole = req.user!.role

    if ((!testo || testo.trim().length === 0) && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ error: 'Il messaggio deve contenere testo o allegati' })
    }

    // Verify user has access to this conversation
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({ error: 'Conversazione non trovata' })
    }

    if (
      (userRole === 'business' && conversation.businessUserId.toString() !== userId) ||
      (userRole === 'admin' && conversation.adminUserId?.toString() !== userId)
    ) {
      return res.status(403).json({ error: 'Non autorizzato' })
    }

    // Create message
    const message = new Message({
      conversationId,
      senderId: userId,
      senderRole: userRole,
      testo: testo?.trim() || '',
      stato: 'sent',
      attachments: attachments || []
    })

    await message.save()

    // Update conversation lastMessageAt
    conversation.lastMessageAt = new Date()
    await conversation.save()

    // Populate sender info
    await message.populate('senderId', 'name')

    // Format message for frontend
    const formattedMessage = {
      id: message._id,
      mittente: userRole === 'business' ? 'user' : 'consulente',
      nome: (message.senderId as any).name,
      testo: message.testo,
      timestamp: message.createdAt.toISOString(),
      stato: message.stato,
      attachments: message.attachments
    }

    // Send email notification if admin replied to client
    try {
      if (userRole === 'admin') {
        const client = await User.findById(conversation.businessUserId)
        const admin = await User.findById(userId)
        if (client && admin) {
          const { sendConsultationResponseEmail } = await import('../utils/emailService')
          await sendConsultationResponseEmail(
            client.email,
            client.name,
            conversation.argomento,
            admin.name
          )
          console.log(`📧 Consultation response email sent to client ${client.email}`)
        }
      }
    } catch (emailError) {
      console.error('Error sending consultation response email:', emailError)
      // Don't block message sending if email fails
    }

    res.status(201).json(formattedMessage)
  } catch (error) {
    console.error('Error sending message:', error)
    res.status(500).json({ error: 'Errore nell\'invio del messaggio' })
  }
})

// Get new messages since a specific timestamp (polling endpoint)
router.get('/conversations/:conversationId/messages/new', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { conversationId } = req.params
    const { since } = req.query
    const userId = req.user!.userId
    const userRole = req.user!.role

    // Verify user has access to this conversation
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({ error: 'Conversazione non trovata' })
    }

    if (
      (userRole === 'business' && conversation.businessUserId.toString() !== userId) ||
      (userRole === 'admin' && conversation.adminUserId?.toString() !== userId)
    ) {
      return res.status(403).json({ error: 'Non autorizzato' })
    }

    // Get new messages
    const query: mongoose.FilterQuery<typeof Message> = { conversationId }
    if (since) {
      query.createdAt = { $gt: new Date(since as string) }
    }

    const messages = await Message.find(query)
      .populate('senderId', 'name')
      .sort({ createdAt: 1 })
      .lean()

    // Mark new messages as read if they're from the other party
    await Message.updateMany(
      {
        conversationId,
        senderRole: userRole === 'business' ? 'admin' : 'business',
        stato: { $ne: 'read' },
        ...(since ? { createdAt: { $gt: new Date(since as string) } } : {})
      },
      { stato: 'read' }
    )

    // Format messages for frontend
    const formattedMessages = messages.map((msg) => ({
      id: msg._id,
      mittente: msg.senderRole === userRole ? (userRole === 'business' ? 'user' : 'consulente') : (userRole === 'business' ? 'consulente' : 'cliente'),
      nome: (msg.senderId as any)?.name || 'Utente',
      testo: msg.testo,
      timestamp: msg.createdAt.toISOString(),
      stato: msg.stato,
      attachments: msg.attachments
    }))

    res.json(formattedMessages)
  } catch (error) {
    console.error('Error fetching new messages:', error)
    res.status(500).json({ error: 'Errore nel recupero dei nuovi messaggi' })
  }
})

// Create a new conversation (typically initiated by business users)
router.post('/conversations', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { argomento, tipo, importo, adminUserId } = req.body
    const userId = req.user!.userId
    const userRole = req.user!.role

    let businessUserId: string
    let conversationAdminUserId: string | undefined

    if (userRole === 'business') {
      // Business user creating a conversation
      businessUserId = userId
      conversationAdminUserId = adminUserId || undefined

      // Verify admin exists if adminUserId is provided
      if (adminUserId) {
        const admin = await User.findById(adminUserId)
        if (!admin || admin.role !== 'admin') {
          return res.status(400).json({ error: 'Consulente non valido' })
        }
      }
    } else if (userRole === 'admin') {
      // Admin creating a conversation for a client
      if (!adminUserId) {
        return res.status(400).json({ error: 'businessUserId è richiesto quando un admin crea una conversazione' })
      }

      // Verify business user exists
      const businessUser = await User.findById(adminUserId)
      if (!businessUser || businessUser.role !== 'business') {
        return res.status(400).json({ error: 'Cliente non valido' })
      }

      businessUserId = adminUserId
      conversationAdminUserId = userId // Admin is the consultant
    } else {
      return res.status(403).json({ error: 'Non autorizzato a creare conversazioni' })
    }

    const conversation = new Conversation({
      businessUserId,
      adminUserId: conversationAdminUserId,
      argomento,
      tipo: tipo || 'consulenza_generale',
      importo: importo || 0,
      status: userRole === 'admin' ? 'active' : 'pending', // Auto-accept if admin creates it
      priority: 'medium'
    })

    await conversation.save()

    // Populate admin info before returning
    await conversation.populate('adminUserId', 'name email professionalRole')

    // Send emails for consultation request
    try {
      const client = await User.findById(businessUserId)
      if (client && userRole === 'business') {
        // Send confirmation email to client
        const { sendConsultationRequestEmail } = await import('../utils/emailService')
        await sendConsultationRequestEmail(
          client.email,
          client.name,
          argomento
        )
        console.log(`📧 Consultation request email sent to client ${client.email}`)

        // Send notification email to admin (if assigned)
        if (conversationAdminUserId) {
          const admin = await User.findById(conversationAdminUserId)
          if (admin) {
            const { sendNewConsultationNotificationToAdmin } = await import('../utils/emailService')
            const conversationUrl = `${process.env.FRONTEND_URL || 'https://taxflow.it'}/dashboard?conversationId=${conversation._id}`
            await sendNewConsultationNotificationToAdmin(
              admin.email,
              client.name,
              argomento,
              conversationUrl
            )
            console.log(`📧 New consultation notification sent to admin ${admin.email}`)
          }
        }
      }
    } catch (emailError) {
      console.error('Error sending consultation emails:', emailError)
      // Don't block conversation creation if email fails
    }

    res.status(201).json(conversation)
  } catch (error) {
    console.error('Error creating conversation:', error)
    res.status(500).json({ error: 'Errore nella creazione della conversazione' })
  }
})

// Assign an admin to a conversation (admin only)
router.patch('/conversations/:conversationId/assign', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { conversationId } = req.params
    const { adminUserId } = req.body
    const userRole = req.user!.role

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Solo gli admin possono assegnare conversazioni' })
    }

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({ error: 'Conversazione non trovata' })
    }

    // Verify the adminUserId is actually an admin
    const admin = await User.findById(adminUserId)
    if (!admin || admin.role !== 'admin') {
      return res.status(400).json({ error: 'Utente admin non valido' })
    }

    conversation.adminUserId = adminUserId
    conversation.status = 'active'
    await conversation.save()

    res.json(conversation)
  } catch (error) {
    console.error('Error assigning conversation:', error)
    res.status(500).json({ error: 'Errore nell\'assegnazione della conversazione' })
  }
})

// Accept a conversation request (admin only)
router.patch('/conversations/:conversationId/accept', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { conversationId } = req.params
    const userId = req.user!.userId
    const userRole = req.user!.role

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Solo i consulenti possono accettare richieste' })
    }

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({ error: 'Conversazione non trovata' })
    }

    if (conversation.status !== 'pending') {
      return res.status(400).json({ error: 'Questa conversazione non è in attesa di approvazione' })
    }

    // Assign admin and activate conversation
    conversation.adminUserId = new mongoose.Types.ObjectId(userId)
    conversation.status = 'active'
    await conversation.save()

    await conversation.populate('businessUserId', 'name email')

    res.json(conversation)
  } catch (error) {
    console.error('Error accepting conversation:', error)
    res.status(500).json({ error: 'Errore nell\'accettare la richiesta' })
  }
})

// Reject a conversation request (admin only)
router.delete('/conversations/:conversationId/reject', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { conversationId } = req.params
    const userRole = req.user!.role

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Solo i consulenti possono rifiutare richieste' })
    }

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({ error: 'Conversazione non trovata' })
    }

    if (conversation.status !== 'pending') {
      return res.status(400).json({ error: 'Questa conversazione non è in attesa di approvazione' })
    }

    // Delete conversation and its messages
    await Message.deleteMany({ conversationId: conversation._id })
    await Conversation.findByIdAndDelete(conversationId)

    res.json({ message: 'Richiesta rifiutata' })
  } catch (error) {
    console.error('Error rejecting conversation:', error)
    res.status(500).json({ error: 'Errore nel rifiutare la richiesta' })
  }
})

// Update conversation invoice amount (admin only)
router.patch('/conversations/:conversationId/invoice', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { conversationId } = req.params
    const { importo } = req.body
    const userId = req.user!.userId
    const userRole = req.user!.role

    // Only admins can set invoice amounts
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Solo i consulenti possono creare fatture' })
    }

    // Validate amount
    if (typeof importo !== 'number' || importo < 0) {
      return res.status(400).json({ error: 'Importo non valido' })
    }

    // Verify conversation exists and belongs to this admin
    const conversation = await Conversation.findById(conversationId)
      .populate('businessUserId', 'name email company')
      .populate('adminUserId', 'name')

    if (!conversation) {
      return res.status(404).json({ error: 'Conversazione non trovata' })
    }

    if (conversation.adminUserId?._id?.toString() !== userId) {
      return res.status(403).json({ error: 'Non hai i permessi per modificare questa conversazione' })
    }

    // Check if already paid - cannot modify paid invoices
    if (conversation.fatturata) {
      return res.status(400).json({ error: 'Non puoi modificare una fattura già pagata' })
    }

    // Update amount
    conversation.importo = importo
    await conversation.save()

    // Check if there's already a pending invoice for this conversation
    let invoice = await Invoice.findOne({
      conversationId: conversation._id,
      status: 'pending'
    })

    const formatItalianDate = (date: Date) => {
      return new Date(date).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    if (invoice && importo > 0) {
      // Update existing pending invoice
      invoice.importo = importo
      invoice.iva = importo * 0.22
      invoice.totale = importo * 1.22
      await invoice.save()
    } else if (!invoice && importo > 0) {
      // Create new pending invoice
      const numeroFattura = await (Invoice as any).generateInvoiceNumber()

      invoice = new Invoice({
        conversationId: conversation._id,
        numero: numeroFattura,
        businessUserId: (conversation.businessUserId as any)._id,
        adminUserId: (conversation.adminUserId as any)._id,
        cliente: (conversation.businessUserId as any).name,
        clienteEmail: (conversation.businessUserId as any).email,
        azienda: (conversation.businessUserId as any).company || '',
        consulente: (conversation.adminUserId as any).name || 'TaxFlow',
        servizio: conversation.argomento,
        tipo: conversation.tipo,
        importo: importo,
        iva: importo * 0.22,
        totale: importo * 1.22,
        status: 'pending',
        dataEmissione: formatItalianDate(new Date()),
        metodoPagamento: 'Carta di credito (Stripe)'
      })

      await invoice.save()
    } else if (invoice && importo === 0) {
      // Delete invoice if amount is set to 0
      await Invoice.deleteOne({ _id: invoice._id })
    }

    res.json({ message: 'Importo aggiornato con successo', importo })
  } catch (error) {
    console.error('Error updating invoice amount:', error)
    res.status(500).json({ error: 'Errore nell\'aggiornamento dell\'importo' })
  }
})

// Delete a conversation (admin only)
router.delete('/conversations/:conversationId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { conversationId } = req.params
    const userId = req.user!.userId
    const userRole = req.user!.role

    // Only admins can delete conversations
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Solo i consulenti possono eliminare le conversazioni' })
    }

    // Verify conversation exists and belongs to this admin
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({ error: 'Conversazione non trovata' })
    }

    if (conversation.adminUserId?.toString() !== userId) {
      return res.status(403).json({ error: 'Non hai i permessi per eliminare questa conversazione' })
    }

    // Delete all messages in the conversation
    await Message.deleteMany({ conversationId: conversation._id })

    // Delete the conversation
    await Conversation.findByIdAndDelete(conversationId)

    res.json({ message: 'Conversazione eliminata con successo' })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    res.status(500).json({ error: 'Errore nell\'eliminazione della conversazione' })
  }
})

// Get all invoices for admin (for invoicing/billing page)
router.get('/conversations/paid/list', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const userRole = req.user!.role

    // Only admins can view all invoices
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Non autorizzato' })
    }

    // Helper function to format date for Italian locale
    const formatItalianDate = (date: Date) => {
      if (!date) return ''
      const d = new Date(date)
      const day = d.getDate().toString().padStart(2, '0')
      const month = (d.getMonth() + 1).toString().padStart(2, '0')
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    }

    // Get all invoices (both paid and pending from Invoice model)
    // All admins can see all invoices (not filtered by adminUserId)
    const allInvoices = await Invoice.find({})
      .sort({ createdAt: -1 })
      .lean()

    const allTransactions = allInvoices.map((invoice) => ({
      id: invoice._id,
      conversationId: invoice.conversationId,
      numero: invoice.numero,
      cliente: invoice.cliente,
      email: invoice.clienteEmail,
      clienteEmail: invoice.clienteEmail,
      azienda: invoice.azienda,
      consulente: invoice.consulente,
      servizio: invoice.servizio,
      tipo: invoice.tipo,
      importo: invoice.importo,
      iva: invoice.iva,
      totale: invoice.totale,
      status: invoice.status,
      dataEmissione: invoice.dataEmissione,
      dataScadenza: invoice.dataEmissione,
      dataPagamento: invoice.dataPagamento,
      metodoPagamento: invoice.metodoPagamento || 'carta',
      stripePaymentIntentId: invoice.stripePaymentIntentId,
      stripePaymentStatus: invoice.stripePaymentStatus
    }))

    res.json(allTransactions)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    res.status(500).json({ error: 'Errore nel recupero delle transazioni' })
  }
})

// Update invoice amount (only for pending invoices)
router.patch('/invoices/:invoiceId/amount', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { invoiceId } = req.params
    const { importo } = req.body
    const userId = req.user!.userId
    const userRole = req.user!.role

    // Only admins can update invoices
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Solo i consulenti possono modificare le fatture' })
    }

    // Validate amount
    if (typeof importo !== 'number' || importo < 0) {
      return res.status(400).json({ error: 'Importo non valido' })
    }

    // Check if it's a paid invoice (from Invoice model)
    const paidInvoice = await Invoice.findById(invoiceId)
    if (paidInvoice) {
      return res.status(400).json({ error: 'Non puoi modificare una fattura già pagata' })
    }

    // It's a pending invoice (from Conversation model)
    // Extract the actual conversation ID (remove -PENDING suffix if present)
    const conversationId = invoiceId.replace('-PENDING', '')

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({ error: 'Fattura non trovata' })
    }

    // Verify admin ownership
    if (conversation.adminUserId?.toString() !== userId) {
      return res.status(403).json({ error: 'Non hai i permessi per modificare questa fattura' })
    }

    // Check if already paid
    if (conversation.fatturata) {
      return res.status(400).json({ error: 'Non puoi modificare una fattura già pagata' })
    }

    // Update amount
    conversation.importo = importo
    await conversation.save()

    res.json({
      message: 'Importo aggiornato con successo',
      importo,
      iva: importo * 0.22,
      totale: importo * 1.22
    })
  } catch (error) {
    console.error('Error updating invoice amount:', error)
    res.status(500).json({ error: 'Errore nell\'aggiornamento dell\'importo' })
  }
})

// Download invoice PDF
router.get('/invoices/:invoiceId/pdf', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { invoiceId } = req.params
    const userId = req.user!.userId
    const userRole = req.user!.role

    // Find the invoice
    const invoice = await Invoice.findById(invoiceId)
      .populate('businessUserId', 'name email company vatNumber address city zipCode province')
      .populate('adminUserId', 'name email')

    if (!invoice) {
      return res.status(404).json({ error: 'Fattura non trovata' })
    }

    // Verify user has access
    if (
      (userRole === 'business' && invoice.businessUserId._id.toString() !== userId) ||
      (userRole === 'admin' && invoice.adminUserId && invoice.adminUserId._id.toString() !== userId)
    ) {
      return res.status(403).json({ error: 'Non autorizzato' })
    }

    // Only allow PDF download for paid invoices
    if (invoice.status !== 'paid') {
      return res.status(400).json({ error: 'Solo le fatture pagate possono essere scaricate' })
    }

    // Create PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 })

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=fattura-${invoice.numero}.pdf`)

    // Pipe PDF to response
    doc.pipe(res)

    // Helper function to format currency
    const formatCurrency = (amount: number) => `€ ${amount.toFixed(2)}`

    // Colors
    const primaryColor = '#3b82f6'
    const textColor = '#1f2937'
    const lightGray = '#6b7280'

    // Add logo
    try {
      const logoPath = path.join(__dirname, '..', 'assets', 'logo.png')
      doc.image(logoPath, 50, 45, { width: 80 })
    } catch (error) {
      console.log('Logo not found, using text instead')
      doc.fontSize(24).fillColor(primaryColor).text('TaxFlow', 50, 50)
    }

    // Header with company info
    doc.fontSize(10).fillColor(lightGray)
      .text('Via Example 123', 50, 80)
      .text('00100 Roma, Italia', 50, 95)
      .text('P.IVA: IT12345678901', 50, 110)

    // Invoice title and number
    doc.fontSize(28).fillColor(textColor).text('FATTURA', 400, 50, { align: 'right' })
    doc.fontSize(12).fillColor(lightGray).text(`N. ${invoice.numero}`, 400, 85, { align: 'right' })

    // Horizontal line
    doc.strokeColor('#e5e7eb').lineWidth(1)
      .moveTo(50, 140).lineTo(545, 140).stroke()

    // Client information
    doc.fontSize(10).fillColor(lightGray).text('CLIENTE', 50, 160)
    doc.fontSize(12).fillColor(textColor)
      .text((invoice.businessUserId as any).name || 'N/A', 50, 180)
      .fontSize(10).fillColor(lightGray)
      .text((invoice.businessUserId as any).email || '', 50, 198)

    if ((invoice.businessUserId as any).company) {
      doc.text((invoice.businessUserId as any).company, 50, 213)
    }
    if ((invoice.businessUserId as any).vatNumber) {
      doc.text(`P.IVA: ${(invoice.businessUserId as any).vatNumber}`, 50, 228)
    }
    if ((invoice.businessUserId as any).address) {
      doc.text((invoice.businessUserId as any).address, 50, 243)
    }

    // Invoice details
    doc.fontSize(10).fillColor(lightGray).text('DATA EMISSIONE', 350, 160)
    doc.fontSize(12).fillColor(textColor).text(invoice.dataEmissione, 350, 180)

    if (invoice.dataPagamento) {
      doc.fontSize(10).fillColor(lightGray).text('DATA PAGAMENTO', 350, 205)
      doc.fontSize(12).fillColor(textColor).text(invoice.dataPagamento, 350, 225)
    }

    // Consultant info
    if (invoice.consulente) {
      doc.fontSize(10).fillColor(lightGray).text('CONSULENTE', 50, 280)
      doc.fontSize(12).fillColor(textColor).text(invoice.consulente, 50, 300)
    }

    // Service details section
    const tableTop = 350
    doc.fontSize(10).fillColor(lightGray)
      .text('DESCRIZIONE', 50, tableTop)
      .text('IMPORTO', 400, tableTop, { width: 90, align: 'right' })

    // Service row
    doc.strokeColor('#e5e7eb').lineWidth(1)
      .moveTo(50, tableTop + 20).lineTo(545, tableTop + 20).stroke()

    doc.fontSize(11).fillColor(textColor)
      .text(invoice.servizio, 50, tableTop + 30, { width: 300 })
    doc.fontSize(10).fillColor(lightGray)
      .text(`Tipo: ${invoice.tipo}`, 50, tableTop + 50, { width: 300 })
    doc.fontSize(12).fillColor(textColor)
      .text(formatCurrency(invoice.importo), 400, tableTop + 30, { width: 90, align: 'right' })

    // Totals section
    const totalsTop = tableTop + 100
    doc.strokeColor('#e5e7eb').lineWidth(1)
      .moveTo(350, totalsTop).lineTo(545, totalsTop).stroke()

    // Subtotal
    doc.fontSize(10).fillColor(lightGray)
      .text('Imponibile:', 350, totalsTop + 15)
    doc.fontSize(11).fillColor(textColor)
      .text(formatCurrency(invoice.importo), 450, totalsTop + 15, { width: 95, align: 'right' })

    // IVA
    doc.fontSize(10).fillColor(lightGray)
      .text('IVA (22%):', 350, totalsTop + 35)
    doc.fontSize(11).fillColor(textColor)
      .text(formatCurrency(invoice.iva), 450, totalsTop + 35, { width: 95, align: 'right' })

    // Total line
    doc.strokeColor('#e5e7eb').lineWidth(1)
      .moveTo(350, totalsTop + 55).lineTo(545, totalsTop + 55).stroke()

    // Total
    doc.fontSize(12).fillColor(primaryColor).font('Helvetica-Bold')
      .text('TOTALE:', 350, totalsTop + 65)
    doc.fontSize(14)
      .text(formatCurrency(invoice.totale), 450, totalsTop + 65, { width: 95, align: 'right' })

    // Payment status badge
    doc.font('Helvetica')
    if (invoice.status === 'paid') {
      doc.fontSize(10).fillColor('#059669')
        .text('✓ PAGATO', 350, totalsTop + 95, { width: 195, align: 'center' })
    }

    // Footer
    doc.fontSize(8).fillColor(lightGray)
      .text('TaxFlow - Gestione consulenze fiscali', 50, 750, { align: 'center', width: 495 })
      .text(`Fattura generata il ${new Date().toLocaleDateString('it-IT')}`, 50, 765, { align: 'center', width: 495 })

    // Payment info if available
    if (invoice.stripePaymentIntentId) {
      doc.fontSize(7).fillColor('#9ca3af')
        .text(`ID Transazione: ${invoice.stripePaymentIntentId}`, 50, 780, { align: 'center', width: 495 })
    }

    // Finalize PDF
    doc.end()

    console.log('✅ PDF invoice generated:', invoice.numero)
  } catch (error) {
    console.error('Error generating PDF:', error)
    res.status(500).json({ error: 'Errore nella generazione del PDF' })
  }
})

export default router
