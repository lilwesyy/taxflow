import { MessageSquare, Clock, CheckCircle, Search, Filter, Star, CreditCard, AlertCircle, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import Modal from '../../../common/Modal'
import chatService, { type Message, type Consultant } from '../../../../services/chat'
import stripeService from '../../../../services/stripe'
import { useAuth } from '../../../../context/AuthContext'
import { useToast } from '../../../../context/ToastContext'
import MessageList from '../../../chat/shared/MessageList'
import MessageInput from '../../../chat/shared/MessageInput'
import FilePreviewModal from '../../../chat/shared/FilePreviewModal'
import StripePaymentForm from '../../../payment/StripePaymentForm'
import type { ChatMessage } from '../../../chat/shared/types'
import { logger } from '../../../../utils/logger'

interface Conversation {
  id: string
  consulente: {
    nome: string
    specializzazione: string
    avatar: string
    email: string
  }
  status: string
  priority: string
  ultimoMessaggio: string
  orarioUltimoMessaggio: string
  dataUltimaAttivita: string
  messaggiNonLetti: number
  tipo: string
  argomento: string
  durataConsulenza?: string
  rating?: number
  fatturata?: boolean
  importo?: number
  paidAt?: string
}

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

export default function Consulenza() {
  useAuth()
  const { showToast } = useToast()
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [chatTab, setChatTab] = useState<'active' | 'archived'>('active')
  const [message, setMessage] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null)
  const [conversazioni, setConversazioni] = useState<Conversation[]>([])
  const [consulenti, setConsulenti] = useState<Consultant[]>([])
  const [messaggi, setMessaggi] = useState<{ [key: string]: Message[] }>({})
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [viewMode, setViewMode] = useState<'conversations' | 'consultants'>('conversations')
  const [aiConversationId, setAiConversationId] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewFile, setPreviewFile] = useState<{ url: string; filename: string; mimeType: string } | null>(null)
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null)
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)

  // Load conversations, consultants, and AI assistant on mount
  useEffect(() => {
    loadAIAssistant()
    loadConversations()
    loadConsultants()

    // Poll for conversation updates every 5 seconds
    const conversationPolling = setInterval(async () => {
      try {
        const data = await chatService.getConversations()
        const transformed = data.map((conv): Conversation => {
          const adminUser = typeof conv.adminUserId === 'object' && conv.adminUserId !== null
            ? conv.adminUserId as { name?: string; professionalRole?: string; email?: string }
            : null

          return {
            id: conv._id,
            consulente: {
              nome: adminUser?.name || 'Consulente non assegnato',
              specializzazione: adminUser?.professionalRole || 'In attesa di assegnazione',
              avatar: '👨‍💼',
              email: adminUser?.email || ''
            },
            status: conv.status,
            priority: conv.priority || 'medium',
            ultimoMessaggio: conv.ultimoMessaggio,
            orarioUltimoMessaggio: conv.orarioUltimoMessaggio,
            dataUltimaAttivita: new Date(conv.lastMessageAt).toLocaleDateString('it-IT'),
            messaggiNonLetti: conv.messaggiNonLetti,
            tipo: conv.tipo,
            argomento: conv.argomento,
            durataConsulenza: conv.durataConsulenza,
            rating: conv.rating,
            fatturata: conv.fatturata,
            importo: conv.importo ?? 0
          }
        })

        // Only update if there are actual changes (count or IDs differ, or status/payment changed)
        setConversazioni(prev => {
          if (prev.length !== transformed.length) {
            return transformed
          }

          const prevIds = prev.map(c => c.id).sort().join(',')
          const newIds = transformed.map(c => c.id).sort().join(',')

          if (prevIds !== newIds) {
            return transformed
          }

          // Check for status or payment changes
          const hasStatusChange = transformed.some(newConv => {
            const oldConv = prev.find(c => c.id === newConv.id)
            return oldConv && (
              oldConv.status !== newConv.status ||
              oldConv.fatturata !== newConv.fatturata ||
              oldConv.importo !== newConv.importo
            )
          })

          return hasStatusChange ? transformed : prev
        })
      } catch (error) {
        logger.error('Error polling conversations:', error)
      }
    }, 5000)

    return () => {
      clearInterval(conversationPolling)
    }
  }, [])

  const loadAIAssistant = async () => {
    try {
      const aiConv = await chatService.getAIConversation()
      setAiConversationId(aiConv.id)

      // Don't auto-select AI anymore - let loadConversations handle it
    } catch (error) {
      logger.error('Error loading AI assistant:', error)
    }
  }

  const loadConsultants = async () => {
    try {
      logger.debug('📞 Loading consultants...')
      const data = await chatService.getConsultants()
      logger.debug('✅ Consultants loaded:', data)
      setConsulenti(data)
    } catch (error) {
      logger.error('❌ Error loading consultants:', error)
    }
  }

  // Set up polling for active conversation
  useEffect(() => {
    if (activeChat) {
      // Check if it's the AI conversation
      if (activeChat === aiConversationId) {
        loadAIMessages()
        // No polling needed for AI - responses are instant
      } else {
        // Load messages for regular conversation
        loadMessages(activeChat)

        // Start polling for new messages
        chatService.startPolling(activeChat, (newMessages) => {
          setMessaggi((prev) => {
            const existingMessages = prev[activeChat] || []
            const existingIds = new Set(existingMessages.map(m => m.id))

            // Only add messages that don't already exist
            const newUniqueMessages = newMessages.filter(msg => !existingIds.has(msg.id))

            if (newUniqueMessages.length === 0) {
              return prev
            }

            return {
              ...prev,
              [activeChat]: [...existingMessages, ...newUniqueMessages]
            }
          })
        })
      }
    }

    // Cleanup: stop polling when conversation changes
    return () => {
      if (activeChat && activeChat !== aiConversationId) {
        chatService.stopPolling(activeChat)
      }
    }
  }, [activeChat, aiConversationId])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      chatService.stopAllPolling()
    }
  }, [])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const data = await chatService.getConversations()

      // Transform data to match component structure
      const transformed = data.map((conv): Conversation => {
        const adminUser = typeof conv.adminUserId === 'object' && conv.adminUserId !== null
          ? conv.adminUserId as { name?: string; professionalRole?: string; email?: string }
          : null

        return {
        id: conv._id,
        consulente: {
          nome: adminUser?.name || 'Consulente non assegnato',
          specializzazione: adminUser?.professionalRole || 'In attesa di assegnazione',
          avatar: '👨‍💼',
          email: adminUser?.email || ''
        },
        status: conv.status,
        priority: conv.priority || 'medium',
        ultimoMessaggio: conv.ultimoMessaggio,
        orarioUltimoMessaggio: conv.orarioUltimoMessaggio,
        dataUltimaAttivita: new Date(conv.lastMessageAt).toLocaleDateString('it-IT'),
        messaggiNonLetti: conv.messaggiNonLetti,
        tipo: conv.tipo,
        argomento: conv.argomento,
        durataConsulenza: conv.durataConsulenza,
        rating: conv.rating,
        fatturata: conv.fatturata,
        importo: conv.importo ?? 0
      }
      })

      setConversazioni(transformed)

      // Check if currently active chat still exists and is not archived
      if (activeChat && activeChat !== aiConversationId) {
        const activeConv = transformed.find(c => c.id === activeChat)
        if (!activeConv || activeConv.fatturata) {
          // Active chat was deleted/archived, reset selection
          setActiveChat(null)
        }
      }

      // Auto-select first active (non-archived) conversation if none selected
      // If no active conversations, select AI assistant
      if (!activeChat) {
        const activeConversations = transformed.filter(c => !c.fatturata)
        if (activeConversations.length > 0) {
          setActiveChat(activeConversations[0].id)
        } else if (aiConversationId) {
          setActiveChat(aiConversationId)
        }
      }
    } catch (error) {
      logger.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const messages = await chatService.getMessages(conversationId)
      setMessaggi((prev) => ({
        ...prev,
        [conversationId]: messages
      }))

      // Update conversation list to reflect read messages (badge removal)
      setConversazioni((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? { ...conv, messaggiNonLetti: 0 }
            : conv
        )
      )
    } catch (error) {
      logger.error('Error loading messages:', error)
    }
  }

  const loadAIMessages = async () => {
    if (!aiConversationId) return
    try {
      const messages = await chatService.getAIMessages()
      setMessaggi((prev) => ({
        ...prev,
        [aiConversationId]: messages
      }))
    } catch (error) {
      logger.error('Error loading AI messages:', error)
    }
  }

  const handleSendMessage = async (files: File[]) => {
    if ((!message.trim() && files.length === 0) || !activeChat || sending) return

    const messageText = message.trim()
    const filesToSend = [...files]

    setMessage('') // Clear input immediately

    try {
      setSending(true)

      let attachments: Array<{ url: string; filename: string; mimeType: string; size: number }> = []

      // Upload files first if any
      if (filesToSend.length > 0) {
        const uploadedFiles = await chatService.uploadFiles(filesToSend)
        attachments = uploadedFiles
      }

      // Check if sending to AI
      if (activeChat === aiConversationId) {
        // AI doesn't support attachments yet
        if (attachments.length > 0) {
          showToast('L\'AI Assistant non supporta allegati', 'warning')
          setSending(false)
          return
        }

        // Add user message immediately
        const tempUserMessage: Message = {
          id: `temp-user-${Date.now()}`,
          mittente: 'user',
          nome: 'Tu',
          testo: messageText,
          timestamp: new Date().toISOString(),
          stato: 'sent'
        }

        setMessaggi((prev) => ({
          ...prev,
          [activeChat]: [...(prev[activeChat] || []), tempUserMessage]
        }))

        // Show AI loading indicator
        setAiLoading(true)

        const { userMessage, aiMessage } = await chatService.sendAIMessage(messageText)

        // Replace temp message with real messages
        setMessaggi((prev) => ({
          ...prev,
          [activeChat]: [
            ...(prev[activeChat] || []).filter(m => m.id !== tempUserMessage.id),
            userMessage,
            aiMessage
          ]
        }))

        setAiLoading(false)
      } else {
        // Regular conversation
        const newMessage = await chatService.sendMessage(activeChat, messageText || '', attachments)

        // Add message to local state
        setMessaggi((prev) => ({
          ...prev,
          [activeChat]: [...(prev[activeChat] || []), newMessage]
        }))

        // Update conversation's last message
        const formattedTime = new Date(newMessage.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })

        setConversazioni((prev) =>
          prev.map((conv) =>
            conv.id === activeChat
              ? {
                  ...conv,
                  ultimoMessaggio: newMessage.testo,
                  orarioUltimoMessaggio: formattedTime
                }
              : conv
          )
        )
      }
    } catch (error) {
      logger.error('Error sending message:', error)
      showToast('Errore nell\'invio del messaggio', 'error')
      setAiLoading(false)
    } finally {
      setSending(false)
    }
  }

  const handlePreviewFile = (file: { url: string; filename: string; mimeType: string }) => {
    setPreviewFile(file)
    setShowPreview(true)
  }

  const handleDownloadFile = (url: string, filename: string) => {
    const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'
    const downloadUrl = `${apiBaseUrl}${url}`
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    link.click()
  }

  const filteredConversazioni = conversazioni.filter(conv => {
    const matchesSearch = conv.consulente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.argomento.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || conv.status === filterStatus
    const isArchived = conv.fatturata === true
    const matchesTab = chatTab === 'archived' ? isArchived : !isArchived
    return matchesSearch && matchesStatus && matchesTab
  })

  const filteredConsulenti = consulenti.filter(cons =>
    cons.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cons.professionalRole && cons.professionalRole.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleStartChat = async (consultant: Consultant) => {
    // Check if there's already an active (non-archived) chat with this consultant
    const hasActiveChat = conversazioni.some(conv =>
      conv.consulente.email === consultant.email &&
      !conv.fatturata
    )

    if (hasActiveChat) {
      showToast('Hai già una consulenza attiva con questo consulente. Completa quella in corso prima di richiederne una nuova.', 'error')
      return
    }

    setSelectedConsultant(consultant)
    setShowNewChatModal(true)
  }

  const getTipoLabel = (tipo: string) => {
    const labels: { [key: string]: string } = {
      'consulenza_fiscale': 'Consulenza Fiscale',
      'business_plan': 'Business Plan',
      'analisi_finanziaria': 'Analisi Finanziaria',
      'consulenza_generale': 'Consulenza Generale',
      'adempimenti_fiscali': 'Adempimenti Fiscali',
      'consulenza_immobiliare': 'Consulenza Immobiliare'
    }
    return labels[tipo] || tipo
  }

  const handleCreateConversation = async (tipo: string, messaggio: string) => {
    if (!selectedConsultant) return

    try {
      // Create conversation with formatted tipo as argomento
      const newConversation = await chatService.createConversation({
        argomento: getTipoLabel(tipo),
        tipo,
        adminUserId: selectedConsultant._id,
        importo: 0
      })

      // Send initial message
      await chatService.sendMessage(newConversation._id, messaggio, [])

      // Reload conversations to show the new pending conversation
      await loadConversations()

      // Close modal
      setShowNewChatModal(false)
      setSelectedConsultant(null)

      // Switch to conversations view and select the new conversation
      setViewMode('conversations')
      setActiveChat(newConversation._id)

      showToast('Richiesta di consulenza inviata con successo!', 'success')
    } catch (error) {
      logger.error('Error creating conversation:', error)
      showToast('Errore nella creazione della conversazione', 'error')
    }
  }

  const handleInitiatePayment = async () => {
    if (!activeChat || activeChat === aiConversationId) return

    try {
      setIsLoadingPayment(true)
      const { clientSecret } = await stripeService.createPaymentIntent(activeChat)
      setPaymentClientSecret(clientSecret)
    } catch (error) {
      logger.error('Error creating payment intent:', error)
      showToast(error instanceof Error ? error.message : 'Errore nell\'inizializzazione del pagamento', 'error')
      setShowPaymentModal(false)
    } finally {
      setIsLoadingPayment(false)
    }
  }

  const handlePaymentSuccess = async () => {
    try {
      showToast('Pagamento completato con successo!', 'success')
      setShowPaymentModal(false)
      setPaymentClientSecret(null)

      // Wait a bit for webhook to process, then reload conversations
      // Try multiple times with increasing delays to catch the update
      const maxAttempts = 5

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise(resolve => setTimeout(resolve, attempt === 0 ? 500 : 1000))

        // Fetch fresh data from server
        const freshConversations = await chatService.getConversations()
        const updatedConv = freshConversations.find((c) => c._id === activeChat)

        if (updatedConv?.fatturata) {
          // Payment confirmed, update state
          await loadConversations()
          break
        }
      }
    } catch (error) {
      logger.error('Error after payment:', error)
    }
  }

  const handleCancelPayment = () => {
    setShowPaymentModal(false)
    setPaymentClientSecret(null)
  }

  // Check if active chat is AI or regular conversation
  const conversazioneAttiva = activeChat === aiConversationId
    ? {
        id: aiConversationId,
        consulente: {
          nome: 'Assistente AI',
          specializzazione: 'Consulente Fiscale AI',
          avatar: '🤖',
          email: 'ai@taxflow.it'
        },
        status: 'active',
        priority: 'medium',
        argomento: 'Assistente Personale AI',
        tipo: 'AI Assistant',
        importo: 0,
        fatturata: true,
        messaggiNonLetti: 0,
        ultimoMessaggio: '',
        orarioUltimoMessaggio: '',
        dataUltimaAttivita: new Date().toLocaleDateString('it-IT'),
        durataConsulenza: undefined,
        rating: undefined
      }
    : conversazioni.find(conv => conv.id === activeChat)

  // Transform messages to ChatMessage format
  const chatMessages: ChatMessage[] = activeChat
    ? (messaggi[activeChat] || []).map((msg: Message) => ({
        id: msg.id,
        mittente: msg.mittente,
        nome: msg.nome,
        testo: msg.testo,
        timestamp: msg.timestamp,
        stato: msg.stato || 'sent',
        attachments: msg.attachments
      }))
    : []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-600'
      case 'pending': return 'bg-yellow-100 text-yellow-600'
      case 'scheduled': return 'bg-blue-100 text-blue-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Attiva'
      case 'pending': return 'In attesa'
      case 'scheduled': return 'Programmata'
      default: return 'Completata'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />
      case 'pending': return <Clock className="h-3 w-3" />
      case 'scheduled': return <Clock className="h-3 w-3" />
      default: return <CheckCircle className="h-3 w-3" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento conversazioni...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-120px)] flex items-center justify-center">
      {/* Main Chat Interface */}
      <div className="w-full h-full flex flex-col lg:flex-row bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
        {/* Sidebar Conversazioni */}
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col">
          {/* Header Sidebar */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            {/* Toggle between views */}
            <div className="flex mb-3 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('conversations')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'conversations'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Le Mie Chat ({conversazioni.length + (aiConversationId ? 1 : 0)})
              </button>
              <button
                onClick={() => setViewMode('consultants')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'consultants'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Consulenti ({consulenti.length})
              </button>
            </div>

            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                {viewMode === 'conversations' ? 'Le Mie Conversazioni' : 'Consulenti Disponibili'}
              </h3>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder={viewMode === 'conversations' ? "Cerca conversazioni..." : "Cerca consulenti..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs sm:text-sm transition-all duration-200"
              />
            </div>
            {viewMode === 'conversations' && (
              <>
                <div className="flex mb-3 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setChatTab('active')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                      chatTab === 'active'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Attive
                  </button>
                  <button
                    onClick={() => setChatTab('archived')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                      chatTab === 'archived'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Archiviate
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">Tutti</option>
                    <option value="active">Online</option>
                    <option value="pending">In attesa</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Lista Conversazioni o Consulenti */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === 'conversations' ? (
              // Lista conversazioni
              <>
                {/* AI Assistant - Always first */}
                {aiConversationId && (
                  <button
                    onClick={() => setActiveChat(aiConversationId)}
                    className={`w-full p-3 sm:p-4 text-left hover:bg-gray-50 transition-all duration-200 border-b-2 border-gray-200 ${
                      activeChat === aiConversationId ? 'bg-gradient-to-r from-primary-50 to-green-50 border-r-2 border-r-primary-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-400 to-green-500 rounded-full flex items-center justify-center text-base sm:text-lg flex-shrink-0">
                        🤖
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">Assistente AI</p>
                          <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium flex-shrink-0 ml-2">
                            Disponibile
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">Consulente Fiscale AI</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Chiedi informazioni sul regime forfettario</p>
                      </div>
                    </div>
                  </button>
                )}

                {/* Regular conversations */}
                {filteredConversazioni.length > 0 ? (
                  filteredConversazioni.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveChat(conv.id)}
                className={`w-full p-3 sm:p-4 text-left hover:bg-gray-50 transition-all duration-200 border-b border-gray-100 ${
                  activeChat === conv.id ? 'bg-primary-50 border-r-2 border-r-primary-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center text-base sm:text-lg flex-shrink-0">
                    {conv.consulente.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm sm:text-base text-gray-900 truncate">{conv.consulente.nome}</p>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{conv.orarioUltimoMessaggio}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1 truncate">{conv.consulente.specializzazione}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate mb-1">{conv.ultimoMessaggio}</p>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(conv.status)}`}>
                        {getStatusIcon(conv.status)}
                        <span className="ml-1">{getStatusText(conv.status)}</span>
                      </span>
                      {conv.messaggiNonLetti > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-red-500 text-white rounded-full flex-shrink-0">
                          {conv.messaggiNonLetti}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
                ))
              ) : !aiConversationId ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <MessageSquare className="h-12 w-12 mb-2 text-gray-300" />
                  <p className="text-sm">Nessuna conversazione</p>
                  <button
                    onClick={() => setViewMode('consultants')}
                    className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Inizia una nuova chat
                  </button>
                </div>
              ) : null}
              </>
            ) : (
              // Lista consulenti
              filteredConsulenti.length > 0 ? (
                filteredConsulenti.map((consultant) => (
                  <button
                    key={consultant._id}
                    onClick={() => handleStartChat(consultant)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-all duration-200 border-b border-gray-100"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-full flex items-center justify-center text-base sm:text-lg flex-shrink-0">
                        <span className="text-primary-600 font-semibold">
                          {consultant.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base text-gray-900 truncate">{consultant.name}</p>
                        <p className="text-xs text-gray-600 mb-1 truncate">
                          {consultant.professionalRole || 'Consulente Fiscale'}
                        </p>
                        {consultant.bio && (
                          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{consultant.bio}</p>
                        )}
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1 flex-shrink-0"></span>
                            Disponibile
                          </span>
                        </div>
                      </div>
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 flex-shrink-0" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Search className="h-12 w-12 mb-2 text-gray-300" />
                  <p className="text-sm">Nessun consulente trovato</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Area Chat Principale */}
        <div className="flex-1 flex flex-col">
          {conversazioneAttiva ? (
            <>
              {/* Header Chat */}
              <div className="p-4 sm:p-6 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center text-base sm:text-lg flex-shrink-0">
                      {conversazioneAttiva.consulente.avatar}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{conversazioneAttiva.consulente.nome}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{conversazioneAttiva.argomento}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messaggi */}
              {conversazioneAttiva?.status === 'pending' ? (
                <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
                  <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-md text-center border border-gray-200">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Richiesta in Attesa</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-2">
                      La tua richiesta di consulenza deve essere accettata dal consulente
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      <span className="font-medium">{conversazioneAttiva.consulente.nome}</span> riceverà una notifica e potrà accettare la tua richiesta. Riceverai una notifica quando la consulenza sarà attiva.
                    </p>
                  </div>
                </div>
              ) : (
                <MessageList
                  messages={chatMessages}
                  userRole="business"
                  aiLoading={aiLoading && activeChat === aiConversationId}
                  onPreviewFile={handlePreviewFile}
                  onDownloadFile={handleDownloadFile}
                />
              )}

              {/* Input Messaggio */}
              <MessageInput
                message={message}
                onMessageChange={setMessage}
                onSendMessage={handleSendMessage}
                disabled={conversazioneAttiva?.status === 'pending'}
                sending={sending}
                placeholder={conversazioneAttiva?.status === 'pending' ? 'In attesa di accettazione...' : 'Scrivi un messaggio al consulente...'}
                showAttachments={activeChat !== aiConversationId}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Seleziona un consulente</h3>
                <p className="text-gray-600">Scegli un consulente dalla barra laterale per iniziare una conversazione</p>
              </div>
            </div>
          )}
        </div>

        {/* Info Panel Consulente - Hide for AI chat and pending conversations */}
        {conversazioneAttiva && activeChat !== aiConversationId && conversazioneAttiva.status !== 'pending' && (
          <div className="w-full lg:w-64 border-t lg:border-t-0 lg:border-l border-gray-200 p-4 sm:p-6 bg-white shadow-sm flex flex-col h-full hover:shadow-md transition-shadow duration-300">
            <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-4">Dettagli Consulenza</h4>

            <div className="flex-1 space-y-3 sm:space-y-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Consulente</p>
                <p className="font-medium text-sm sm:text-base text-gray-900 truncate">{conversazioneAttiva.consulente.nome}</p>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{conversazioneAttiva.consulente.specializzazione}</p>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-gray-600">Argomento</p>
                <p className="font-medium text-sm sm:text-base text-gray-900">{conversazioneAttiva.argomento}</p>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-gray-600">Tipo consulenza</p>
                <p className="font-medium text-sm sm:text-base text-gray-900 capitalize">{conversazioneAttiva.tipo.replace('_', ' ')}</p>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-gray-600">Priorità</p>
                <span className={`font-medium text-sm sm:text-base ${getPriorityColor(conversazioneAttiva.priority)}`}>
                  {conversazioneAttiva.priority}
                </span>
              </div>

              {conversazioneAttiva.durataConsulenza && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Durata</p>
                  <p className="font-medium text-sm sm:text-base text-gray-900">{conversazioneAttiva.durataConsulenza}</p>
                </div>
              )}

              {(conversazioneAttiva.importo ?? 0) > 0 && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Costo consulenza</p>
                  <p className="font-medium text-sm sm:text-base text-gray-900">€ {conversazioneAttiva.importo ?? 0}</p>
                </div>
              )}

              {conversazioneAttiva.rating && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Valutazione data</p>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ${i < conversazioneAttiva.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-xs sm:text-sm font-medium text-gray-700 ml-2">{conversazioneAttiva.rating}/5</span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Section */}
            {(conversazioneAttiva.importo ?? 0) > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stato pagamento</span>
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                      conversazioneAttiva.fatturata ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {conversazioneAttiva.fatturata ? 'Pagata' : 'Da pagare'}
                    </span>
                  </div>

                  {!conversazioneAttiva.fatturata && (
                    <>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Pagamento richiesto</p>
                            <p className="text-xs text-yellow-700 mt-1">
                              Per completare la consulenza è necessario effettuare il pagamento
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          setShowPaymentModal(true)
                          await handleInitiatePayment()
                        }}
                        disabled={isLoadingPayment}
                        className="w-full bg-primary-600 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span className="truncate">{isLoadingPayment ? 'Caricamento...' : `Paga € ${((conversazioneAttiva.importo ?? 0) * 1.22).toFixed(2)}`}</span>
                      </button>
                    </>
                  )}

                  {conversazioneAttiva.fatturata && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <p className="text-sm font-medium text-green-800">Pagamento completato</p>
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        Consulenza pagata il 20/01/2024
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {conversazioneAttiva && (
        <Modal
          isOpen={showPaymentModal}
          onClose={handleCancelPayment}
          title="Pagamento Consulenza"
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Dettagli Consulenza */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Dettagli consulenza</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Consulente:</span>
                  <span className="font-medium text-gray-900">{conversazioneAttiva.consulente.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Argomento:</span>
                  <span className="font-medium text-gray-900">{conversazioneAttiva.argomento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium text-gray-900 capitalize">{conversazioneAttiva.tipo.replace('_', ' ')}</span>
                </div>
                {conversazioneAttiva.durataConsulenza && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Durata:</span>
                    <span className="font-medium text-gray-900">{conversazioneAttiva.durataConsulenza}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Riepilogo Costi */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Riepilogo costi</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Consulenza:</span>
                  <span className="font-medium text-gray-900">€ {conversazioneAttiva.importo ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IVA (22%):</span>
                  <span className="font-medium text-gray-900">€ {((conversazioneAttiva.importo ?? 0) * 0.22).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Totale:</span>
                    <span className="font-bold text-primary-600 text-lg">€ {((conversazioneAttiva.importo ?? 0) * 1.22).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Sicurezza */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Pagamento sicuro con Stripe</p>
                  <p className="text-xs text-blue-800 mt-1">
                    I tuoi dati sono protetti con crittografia SSL. Stripe non condivide mai le informazioni della tua carta.
                  </p>
                </div>
              </div>
            </div>

            {/* Stripe Payment Form */}
            {paymentClientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret: paymentClientSecret }}>
                <StripePaymentForm
                  amount={conversazioneAttiva.importo ?? 0}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handleCancelPayment}
                />
              </Elements>
            )}

            {!paymentClientSecret && isLoadingPayment && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Inizializzazione pagamento...</p>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* New Chat Modal */}
      {selectedConsultant && (
        <Modal
          isOpen={showNewChatModal}
          onClose={() => {
            setShowNewChatModal(false)
            setSelectedConsultant(null)
          }}
          title={`Nuova Conversazione con ${selectedConsultant.name}`}
          maxWidth="lg"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const tipo = formData.get('tipo') as string
              const messaggio = formData.get('messaggio') as string
              handleCreateConversation(tipo, messaggio)
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo di consulenza
                </label>
                <select
                  name="tipo"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="consulenza_fiscale">Consulenza Fiscale</option>
                  <option value="business_plan">Business Plan</option>
                  <option value="analisi_finanziaria">Analisi Finanziaria</option>
                  <option value="consulenza_generale">Consulenza Generale</option>
                  <option value="adempimenti_fiscali">Adempimenti Fiscali</option>
                  <option value="consulenza_immobiliare">Consulenza Immobiliare</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Messaggio iniziale <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="messaggio"
                  required
                  rows={4}
                  placeholder="Descrivi in dettaglio la tua richiesta di consulenza..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Il consulente leggerà questo messaggio per decidere se accettare la richiesta
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Stai per iniziare una conversazione con {selectedConsultant.name}
                    </p>
                    <p className="text-xs text-blue-800 mt-1">
                      {selectedConsultant.professionalRole || 'Consulente Fiscale'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewChatModal(false)
                    setSelectedConsultant(null)
                  }}
                  className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  Inizia Conversazione
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false)
          setPreviewFile(null)
        }}
        file={previewFile}
        onDownload={handleDownloadFile}
      />
    </div>
  )
}
