import express from 'express'
import multer from 'multer'
import path from 'path'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import Conversation from '../models/Conversation'
import Message from '../models/Message'
import User from '../models/User'
import mongoose from 'mongoose'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, 'uploads/chat/')
  },
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (_req: any, file: any, cb: any) => {
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
    console.log('🔍 User requesting consultants:', req.user)

    if (userRole !== 'business') {
      return res.status(403).json({ error: 'Solo i clienti possono vedere i consulenti' })
    }

    // Get all admin users
    const consultants = await User.find({ role: 'admin' })
      .select('name email professionalRole bio')
      .lean()

    console.log('👥 Found consultants:', consultants.length)
    console.log('Consultants:', consultants)

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
    const formattedMessages = messages.map((msg: any) => ({
      id: msg._id,
      mittente: msg.senderRole === userRole ? (userRole === 'business' ? 'user' : 'consulente') : (userRole === 'business' ? 'consulente' : 'cliente'),
      nome: msg.senderId?.name || 'Utente',
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
router.post('/upload', authenticateToken, (upload.array('files', 5) as any), async (req: any, res: any) => {
  try {
    const files = req.files as any[]

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nessun file caricato' })
    }

    const uploadedFiles = files.map((file: any) => ({
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
    const query: any = { conversationId }
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
    const formattedMessages = messages.map((msg: any) => ({
      id: msg._id,
      mittente: msg.senderRole === userRole ? (userRole === 'business' ? 'user' : 'consulente') : (userRole === 'business' ? 'consulente' : 'cliente'),
      nome: msg.senderId?.name || 'Utente',
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

    if (userRole !== 'business') {
      return res.status(403).json({ error: 'Solo i clienti possono creare nuove conversazioni' })
    }

    // Verify admin exists if adminUserId is provided
    if (adminUserId) {
      const admin = await User.findById(adminUserId)
      if (!admin || admin.role !== 'admin') {
        return res.status(400).json({ error: 'Consulente non valido' })
      }
    }

    const conversation = new Conversation({
      businessUserId: userId,
      adminUserId: adminUserId || undefined,
      argomento,
      tipo: tipo || 'consulenza_generale',
      importo: importo || 0,
      status: 'pending', // Always pending, admin must accept
      priority: 'medium'
    })

    await conversation.save()

    // Populate admin info before returning
    await conversation.populate('adminUserId', 'name email professionalRole')

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

export default router
