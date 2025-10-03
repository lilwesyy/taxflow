import { MessageSquare, Clock, CheckCircle, Search, Filter, Star, CreditCard, DollarSign, AlertCircle, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import Modal from '../../../common/Modal'
import chatService, { type Message, type Consultant } from '../../../../services/chat'
import { useAuth } from '../../../../context/AuthContext'
import { useToast } from '../../../../context/ToastContext'
import MessageList from '../../../chat/shared/MessageList'
import MessageInput from '../../../chat/shared/MessageInput'
import FilePreviewModal from '../../../chat/shared/FilePreviewModal'
import type { ChatMessage } from '../../../chat/shared/types'

export default function Consulenza() {
  useAuth()
  const { showToast } = useToast()
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [message, setMessage] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null)
  const [conversazioni, setConversazioni] = useState<any[]>([])
  const [consulenti, setConsulenti] = useState<Consultant[]>([])
  const [messaggi, setMessaggi] = useState<{ [key: string]: Message[] }>({})
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [viewMode, setViewMode] = useState<'conversations' | 'consultants'>('conversations')
  const [aiConversationId, setAiConversationId] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewFile, setPreviewFile] = useState<{ url: string; filename: string; mimeType: string } | null>(null)

  // Load conversations, consultants, and AI assistant on mount
  useEffect(() => {
    loadAIAssistant()
    loadConversations()
    loadConsultants()
  }, [])

  const loadAIAssistant = async () => {
    try {
      const aiConv = await chatService.getAIConversation()
      setAiConversationId(aiConv.id)

      // Set AI as default active chat
      setActiveChat(aiConv.id)
    } catch (error) {
      console.error('Error loading AI assistant:', error)
    }
  }

  const loadConsultants = async () => {
    try {
      console.log('📞 Loading consultants...')
      const data = await chatService.getConsultants()
      console.log('✅ Consultants loaded:', data)
      setConsulenti(data)
    } catch (error) {
      console.error('❌ Error loading consultants:', error)
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
      const transformed = data.map((conv: any) => ({
        id: conv._id,
        consulente: {
          nome: conv.adminUserId?.name || 'Consulente non assegnato',
          specializzazione: conv.adminUserId?.professionalRole || 'In attesa di assegnazione',
          avatar: '👨‍💼',
          email: conv.adminUserId?.email || ''
        },
        status: conv.status,
        priority: conv.priority,
        ultimoMessaggio: conv.ultimoMessaggio,
        orarioUltimoMessaggio: conv.orarioUltimoMessaggio,
        dataUltimaAttivita: new Date(conv.lastMessageAt).toLocaleDateString('it-IT'),
        messaggiNonLetti: conv.messaggiNonLetti,
        tipo: conv.tipo,
        argomento: conv.argomento,
        durataConsulenza: conv.durataConsulenza,
        rating: conv.rating,
        fatturata: conv.fatturata,
        importo: conv.importo
      }))

      setConversazioni(transformed)

      // Auto-select first conversation if none selected
      if (!activeChat && transformed.length > 0) {
        setActiveChat(transformed[0].id)
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
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
    } catch (error) {
      console.error('Error loading messages:', error)
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
      console.error('Error loading AI messages:', error)
    }
  }

  const handleSendMessage = async (files: File[]) => {
    if ((!message.trim() && files.length === 0) || !activeChat || sending) return

    const messageText = message.trim()
    const filesToSend = [...files]

    setMessage('') // Clear input immediately

    try {
      setSending(true)

      let attachments: any[] = []

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
      console.error('Error sending message:', error)
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
    return matchesSearch && matchesStatus
  })

  const filteredConsulenti = consulenti.filter(cons =>
    cons.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cons.professionalRole && cons.professionalRole.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleStartChat = async (consultant: Consultant) => {
    setSelectedConsultant(consultant)
    setShowNewChatModal(true)
  }

  const handleCreateConversation = async (argomento: string, tipo: string) => {
    if (!selectedConsultant) return

    try {
      await chatService.createConversation({
        argomento,
        tipo,
        adminUserId: selectedConsultant._id,
        importo: 0
      })

      // Reload conversations to show the new pending conversation
      await loadConversations()

      // Close modal
      setShowNewChatModal(false)
      setSelectedConsultant(null)

      // Switch to conversations view
      setViewMode('conversations')
    } catch (error) {
      console.error('Error creating conversation:', error)
      showToast('Errore nella creazione della conversazione', 'error')
    }
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
        dataUltimaAttivita: new Date().toLocaleDateString('it-IT')
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
      <div className="w-full h-full flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
        {/* Sidebar Conversazioni */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          {/* Header Sidebar */}
          <div className="p-4 border-b border-gray-200">
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
              <h3 className="text-lg font-semibold text-gray-900">
                {viewMode === 'conversations' ? 'Le Mie Conversazioni' : 'Consulenti Disponibili'}
              </h3>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={viewMode === 'conversations' ? "Cerca conversazioni..." : "Cerca consulenti..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all duration-200"
              />
            </div>
            {viewMode === 'conversations' && (
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
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-all duration-200 border-b-2 border-gray-200 ${
                      activeChat === aiConversationId ? 'bg-gradient-to-r from-primary-50 to-green-50 border-r-2 border-r-primary-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-green-500 rounded-full flex items-center justify-center text-lg">
                        🤖
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900">Assistente AI</p>
                          <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                            Sempre disponibile
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">Consulente Fiscale AI</p>
                        <p className="text-sm text-gray-600">Chiedi informazioni sul regime forfettario</p>
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
                className={`w-full p-4 text-left hover:bg-gray-50 transition-all duration-200 border-b border-gray-100 ${
                  activeChat === conv.id ? 'bg-primary-50 border-r-2 border-r-primary-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                    {conv.consulente.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">{conv.consulente.nome}</p>
                      <span className="text-xs text-gray-500">{conv.orarioUltimoMessaggio}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{conv.consulente.specializzazione}</p>
                    <p className="text-sm text-gray-600 truncate mb-1">{conv.ultimoMessaggio}</p>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(conv.status)}`}>
                        {getStatusIcon(conv.status)}
                        <span className="ml-1">{getStatusText(conv.status)}</span>
                      </span>
                      {conv.messaggiNonLetti > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-red-500 text-white rounded-full">
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
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-lg">
                        <span className="text-primary-600 font-semibold">
                          {consultant.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{consultant.name}</p>
                        <p className="text-xs text-gray-600 mb-1">
                          {consultant.professionalRole || 'Consulente Fiscale'}
                        </p>
                        {consultant.bio && (
                          <p className="text-sm text-gray-500 line-clamp-2">{consultant.bio}</p>
                        )}
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                            Disponibile
                          </span>
                        </div>
                      </div>
                      <Plus className="h-5 w-5 text-primary-600 flex-shrink-0" />
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
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                      {conversazioneAttiva.consulente.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{conversazioneAttiva.consulente.nome}</h3>
                      <p className="text-sm text-gray-600">{conversazioneAttiva.argomento}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messaggi */}
              {conversazioneAttiva?.status === 'pending' ? (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center border border-gray-200">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Richiesta in Attesa</h3>
                    <p className="text-gray-600 mb-2">
                      La tua richiesta di consulenza deve essere accettata dal consulente
                    </p>
                    <p className="text-sm text-gray-500">
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
          <div className="w-64 border-l border-gray-200 p-4 bg-white shadow-sm flex flex-col h-full hover:shadow-md transition-shadow duration-300">
            <h4 className="font-semibold text-gray-900 mb-4">Dettagli Consulenza</h4>

            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Consulente</p>
                <p className="font-medium text-gray-900">{conversazioneAttiva.consulente.nome}</p>
                <p className="text-sm text-gray-600">{conversazioneAttiva.consulente.specializzazione}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Argomento</p>
                <p className="font-medium text-gray-900">{conversazioneAttiva.argomento}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Tipo consulenza</p>
                <p className="font-medium text-gray-900 capitalize">{conversazioneAttiva.tipo.replace('_', ' ')}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Priorità</p>
                <span className={`font-medium ${getPriorityColor(conversazioneAttiva.priority)}`}>
                  {conversazioneAttiva.priority}
                </span>
              </div>

              {conversazioneAttiva.durataConsulenza && (
                <div>
                  <p className="text-sm text-gray-600">Durata</p>
                  <p className="font-medium text-gray-900">{conversazioneAttiva.durataConsulenza}</p>
                </div>
              )}

              {conversazioneAttiva.importo > 0 && (
                <div>
                  <p className="text-sm text-gray-600">Costo consulenza</p>
                  <p className="font-medium text-gray-900">€ {conversazioneAttiva.importo}</p>
                </div>
              )}

              {conversazioneAttiva.rating && (
                <div>
                  <p className="text-sm text-gray-600">Valutazione data</p>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < conversazioneAttiva.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-sm font-medium text-gray-700 ml-2">{conversazioneAttiva.rating}/5</span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Section */}
            {conversazioneAttiva.importo > 0 && (
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
                        onClick={() => setShowPaymentModal(true)}
                        className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Paga € {conversazioneAttiva.importo}</span>
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
          onClose={() => setShowPaymentModal(false)}
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
                    <span className="font-medium text-gray-900">€ {conversazioneAttiva.importo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IVA (22%):</span>
                    <span className="font-medium text-gray-900">€ {(conversazioneAttiva.importo * 0.22).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Totale:</span>
                      <span className="font-bold text-primary-600 text-lg">€ {(conversazioneAttiva.importo * 1.22).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metodi di Pagamento */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Metodo di pagamento</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input type="radio" name="payment" value="card" defaultChecked className="text-primary-600" />
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Carta di credito/debito</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input type="radio" name="payment" value="paypal" className="text-primary-600" />
                    <DollarSign className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">PayPal</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input type="radio" name="payment" value="bank" className="text-primary-600" />
                    <DollarSign className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Bonifico bancario</span>
                  </label>
                </div>
              </div>

              {/* Dati Carta (mockup) */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Dati carta</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Numero carta</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Scadenza</label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome sulla carta</label>
                    <input
                      type="text"
                      placeholder="Mario Rossi"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Info Sicurezza */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Pagamento sicuro</p>
                    <p className="text-xs text-blue-800 mt-1">
                      I tuoi dati sono protetti con crittografia SSL a 256 bit. Non memorizziamo le informazioni della carta.
                    </p>
                  </div>
                </div>
              </div>

            {/* Payment Actions */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  // Simulate payment processing
                  showToast('Pagamento completato con successo!', 'success')
                  setShowPaymentModal(false)
                }}
                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                Paga € {(conversazioneAttiva.importo * 1.22).toFixed(2)}
              </button>
            </div>
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
              const argomento = formData.get('argomento') as string
              const tipo = formData.get('tipo') as string
              handleCreateConversation(argomento, tipo)
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Argomento della consulenza
                </label>
                <input
                  type="text"
                  name="argomento"
                  required
                  placeholder="Es: Apertura P.IVA forfettaria"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

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

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewChatModal(false)
                    setSelectedConsultant(null)
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
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
