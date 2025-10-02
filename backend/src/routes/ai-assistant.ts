import express, { Response } from 'express'
import OpenAI from 'openai'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import Message from '../models/Message'
import Conversation from '../models/Conversation'
import User from '../models/User'
import mongoose from 'mongoose'

const router = express.Router()

// Initialize OpenAI lazily to ensure env vars are loaded
let openai: OpenAI | null = null
const getOpenAI = () => {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }
  return openai
}

const AI_ASSISTANT_ID = 'ai-assistant'

const getSystemPrompt = (userName: string, userRole: 'business' | 'admin') => {
  const roleDescription = userRole === 'business'
    ? 'un cliente che cerca consulenza fiscale'
    : 'un consulente fiscale professionista'

  return `Sei un assistente fiscale esperto specializzato nel regime forfettario italiano.

Stai parlando con ${userName}, che è ${roleDescription}.

Fornisci consulenze chiare, precise e professionali su:
- Apertura Partita IVA forfettaria
- Calcolo imposte e contributi
- Limiti di fatturato
- Requisiti e incompatibilità
- Business plan e strategie fiscali

${userRole === 'business'
  ? 'Adatta il tuo linguaggio per spiegare concetti fiscali in modo comprensibile anche per chi non è esperto.'
  : 'Puoi usare terminologia tecnica appropriata, dato che stai parlando con un professionista del settore.'}

Rispondi sempre in modo cortese, professionale e in italiano.`
}

// Get or create AI conversation
router.get('/conversation', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const userRole = req.user!.role

    // Find existing AI conversation
    let conversation = await Conversation.findOne({
      businessUserId: new mongoose.Types.ObjectId(userId),
      tipo: 'AI Assistant'
    })

    // Create if doesn't exist
    if (!conversation) {
      conversation = await Conversation.create({
        businessUserId: new mongoose.Types.ObjectId(userId),
        tipo: 'AI Assistant',
        argomento: 'Assistente Personale AI',
        status: 'active',
        priority: 'medium',
        fatturata: false,
        importo: 0,
        lastMessageAt: new Date()
      })

      // Create welcome message
      await Message.create({
        conversationId: conversation._id,
        senderId: new mongoose.Types.ObjectId(userId),
        senderRole: 'admin',
        testo: 'Ciao! Sono il tuo assistente fiscale AI. Come posso aiutarti oggi con il regime forfettario?',
        stato: 'delivered'
      })
    }

    res.json({
      id: (conversation._id as any).toString(),
      tipo: conversation.tipo,
      argomento: conversation.argomento,
      status: conversation.status,
      lastMessageAt: conversation.lastMessageAt
    })
  } catch (error) {
    console.error('Error getting AI conversation:', error)
    res.status(500).json({ error: 'Errore nel recuperare la conversazione AI' })
  }
})

// Get AI conversation messages
router.get('/conversation/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId

    const conversation = await Conversation.findOne({
      businessUserId: new mongoose.Types.ObjectId(userId),
      tipo: 'AI Assistant'
    })

    if (!conversation) {
      return res.json([])
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .lean()

    const transformed = messages.map((msg) => ({
      id: msg._id.toString(),
      conversationId: msg.conversationId.toString(),
      testo: msg.testo,
      timestamp: msg.createdAt,
      stato: msg.stato,
      mittente: msg.senderRole === 'admin' ? 'ai' : 'user',
      nome: msg.senderRole === 'admin' ? 'AI Assistant' : 'Tu'
    }))

    res.json(transformed)
  } catch (error) {
    console.error('Error getting AI messages:', error)
    res.status(500).json({ error: 'Errore nel recuperare i messaggi' })
  }
})

// Send message to AI
router.post('/conversation/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const userRole = req.user!.role
    const { testo } = req.body

    if (!testo || testo.trim() === '') {
      return res.status(400).json({ error: 'Il messaggio non può essere vuoto' })
    }

    // Get user info for personalized prompt
    const user = await User.findById(userId).select('name').lean()
    const userName = user?.name || 'Utente'

    // Get or create conversation
    let conversation = await Conversation.findOne({
      businessUserId: new mongoose.Types.ObjectId(userId),
      tipo: 'AI Assistant'
    })

    if (!conversation) {
      conversation = await Conversation.create({
        businessUserId: new mongoose.Types.ObjectId(userId),
        tipo: 'AI Assistant',
        argomento: 'Assistente Personale AI',
        status: 'active',
        priority: 'medium',
        fatturata: false,
        importo: 0,
        lastMessageAt: new Date()
      })
    }

    // Save user message
    const userMessage = await Message.create({
      conversationId: conversation._id,
      senderId: new mongoose.Types.ObjectId(userId),
      senderRole: userRole,
      testo: testo.trim(),
      stato: 'delivered'
    })

    // Get conversation history for context
    const previousMessages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean()

    // Build personalized system prompt
    const systemPrompt = getSystemPrompt(userName, userRole)

    const conversationHistory: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...previousMessages.slice(0, -1).map((msg): OpenAI.Chat.ChatCompletionMessageParam => ({
        role: msg.senderRole === 'admin' ? 'assistant' : 'user',
        content: msg.testo
      })),
      { role: 'user', content: testo.trim() }
    ]

    // Call OpenAI API with gpt-3.5-turbo (cheaper model)
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: conversationHistory,
      temperature: 0.7,
      max_tokens: 500
    })

    const aiResponse = completion.choices[0].message.content || 'Mi dispiace, non ho capito. Puoi riformulare la domanda?'

    // Save AI response
    const aiMessage = await Message.create({
      conversationId: conversation._id,
      senderId: new mongoose.Types.ObjectId(userId),
      senderRole: 'admin',
      testo: aiResponse,
      stato: 'delivered'
    })

    // Update conversation timestamp
    conversation.lastMessageAt = new Date()
    await conversation.save()

    res.json({
      userMessage: {
        id: (userMessage._id as any).toString(),
        conversationId: userMessage.conversationId.toString(),
        testo: userMessage.testo,
        timestamp: userMessage.createdAt,
        stato: userMessage.stato,
        mittente: 'user',
        nome: 'Tu'
      },
      aiMessage: {
        id: (aiMessage._id as any).toString(),
        conversationId: aiMessage.conversationId.toString(),
        testo: aiMessage.testo,
        timestamp: aiMessage.createdAt,
        stato: aiMessage.stato,
        mittente: 'ai',
        nome: 'AI Assistant'
      }
    })
  } catch (error) {
    console.error('Error sending message to AI:', error)
    res.status(500).json({ error: 'Errore nell\'inviare il messaggio' })
  }
})

export default router
