import { MessageSquare, Users, Search, Filter, Clock, CheckCircle, AlertTriangle, Star, TrendingUp, Trash2, Check, X, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import chatService, { type Message } from '../../../../services/chat'
import { useAuth } from '../../../../context/AuthContext'
import { useToast } from '../../../../context/ToastContext'
import Modal from '../../../common/Modal'
import MessageList from '../../../chat/shared/MessageList'
import MessageInput from '../../../chat/shared/MessageInput'
import FilePreviewModal from '../../../chat/shared/FilePreviewModal'
import type { ChatMessage } from '../../../chat/shared/types'

type TransformedMessage = Message & {
  mittente: 'consulente' | 'cliente'
  nome: string
}

export default function Consulenze() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [chatTab, setChatTab] = useState<'active' | 'archived'>('active')
  const [message, setMessage] = useState('')
  const [conversazioni, setConversazioni] = useState<any[]>([])
  const [messaggi, setMessaggi] = useState<{ [key: string]: TransformedMessage[] }>({})
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [aiConversationId, setAiConversationId] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingConversation, setDeletingConversation] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewFile, setPreviewFile] = useState<{ url: string; filename: string; mimeType: string } | null>(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [invoiceAmount, setInvoiceAmount] = useState('')
  const [creatingInvoice, setCreatingInvoice] = useState(false)

  // Load conversations and AI assistant on mount
  useEffect(() => {
    loadAIAssistant()
    loadConversations()
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
          // Transform new messages to match component structure
          const transformed: TransformedMessage[] = newMessages.map((msg) => ({
            ...msg,
            mittente: msg.mittente === 'consulente' || msg.mittente === 'user' ? 'consulente' : 'cliente',
            nome: msg.mittente === 'consulente' || msg.mittente === 'user' ? (user?.name || 'Consulente') : msg.nome
          }))

          setMessaggi((prev) => {
            const existingMessages = prev[activeChat] || []
            const existingIds = new Set(existingMessages.map(m => m.id))

            // Only add messages that don't already exist
            const newUniqueMessages = transformed.filter(msg => !existingIds.has(msg.id))

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
  }, [activeChat, aiConversationId, user])

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
        cliente: {
          nome: conv.businessUserId?.name || 'Cliente sconosciuto',
          azienda: conv.businessUserId?.company || 'Non specificata',
          avatar: '👨‍💼',
          email: conv.businessUserId?.email || ''
        },
        status: conv.status,
        priority: conv.priority,
        ultimoMessaggio: conv.ultimoMessaggio,
        orarioUltimoMessaggio: conv.orarioUltimoMessaggio,
        dataUltimaAttivita: new Date(conv.lastMessageAt).toLocaleDateString('it-IT'),
        messaggiNonLetti: conv.messaggiNonLetti,
        tipo: conv.tipo,
        argomento: conv.argomento,
        consulente: user?.name || 'Dr. Marco Bianchi',
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

      // Transform messages to match component structure
      const transformed: TransformedMessage[] = messages.map((msg) => ({
        ...msg,
        // For admin role: admin messages on RIGHT (consulente), client messages on LEFT (cliente)
        mittente: msg.mittente === 'consulente' || msg.mittente === 'user' ? 'consulente' : 'cliente',
        nome: msg.mittente === 'consulente' || msg.mittente === 'user' ? (user?.name || 'Consulente') : msg.nome
      }))

      setMessaggi((prev) => ({
        ...prev,
        [conversationId]: transformed
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
      console.error('Error loading messages:', error)
    }
  }

  const loadAIMessages = async () => {
    if (!aiConversationId) return
    try {
      const messages = await chatService.getAIMessages()

      // Transform AI messages to match component structure
      const transformed: TransformedMessage[] = messages.map((msg) => ({
        ...msg,
        mittente: msg.mittente === 'ai' ? 'cliente' : 'consulente', // AI shows on left, user on right
        nome: msg.mittente === 'ai' ? 'AI Assistant' : (user?.name || 'Tu')
      }))

      setMessaggi((prev) => ({
        ...prev,
        [aiConversationId]: transformed
      }))
    } catch (error) {
      console.error('Error loading AI messages:', error)
    }
  }

  const handleAcceptConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await chatService.acceptConversation(conversationId)

      // Reload conversations to get updated list
      await loadConversations()

      // Set as active chat
      setActiveChat(conversationId)

      showToast('Richiesta accettata con successo', 'success')
    } catch (error) {
      console.error('Error accepting conversation:', error)
      showToast('Errore nell\'accettare la richiesta', 'error')
    }
  }

  const handleRejectConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await chatService.rejectConversation(conversationId)

      // Remove from list
      setConversazioni((prev) => prev.filter(conv => conv.id !== conversationId))

      showToast('Richiesta rifiutata', 'info')
    } catch (error) {
      console.error('Error rejecting conversation:', error)
      showToast('Errore nel rifiutare la richiesta', 'error')
    }
  }

  const handleDeleteConversation = async () => {
    if (!activeChat || activeChat === aiConversationId || deletingConversation) return

    try {
      setDeletingConversation(true)
      await chatService.deleteConversation(activeChat)

      // Remove conversation from state
      setConversazioni((prev) => prev.filter(conv => conv.id !== activeChat))

      // Remove messages from state
      setMessaggi((prev) => {
        const newMessages = { ...prev }
        delete newMessages[activeChat]
        return newMessages
      })

      // Close modal and clear active chat
      setShowDeleteModal(false)
      setActiveChat(null)

      // Show success toast
      showToast('Conversazione eliminata con successo', 'success')
    } catch (error) {
      console.error('Error deleting conversation:', error)
      showToast('Errore nell\'eliminazione della conversazione', 'error')
    } finally {
      setDeletingConversation(false)
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

  const handleCreateInvoice = async () => {
    if (!activeChat || activeChat === aiConversationId || !invoiceAmount) return

    const amount = parseFloat(invoiceAmount)
    if (isNaN(amount) || amount <= 0) {
      showToast('Inserisci un importo valido', 'error')
      return
    }

    try {
      setCreatingInvoice(true)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/conversations/${activeChat}/invoice`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ importo: amount })
      })

      if (!response.ok) {
        throw new Error('Errore nella creazione della fattura')
      }

      showToast('Fattura creata con successo!', 'success')
      setShowInvoiceModal(false)
      setInvoiceAmount('')

      // Reload conversations to show updated amount
      await loadConversations()
    } catch (error) {
      console.error('Error creating invoice:', error)
      showToast('Errore nella creazione della fattura', 'error')
    } finally {
      setCreatingInvoice(false)
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
        const tempUserMessage: TransformedMessage = {
          id: `temp-user-${Date.now()}`,
          mittente: 'consulente',
          nome: user?.name || 'Tu',
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

        // Transform both messages
        const transformedUser: TransformedMessage = {
          ...userMessage,
          mittente: 'consulente',
          nome: user?.name || 'Tu'
        }
        const transformedAI: TransformedMessage = {
          ...aiMessage,
          mittente: 'cliente',
          nome: 'AI Assistant'
        }

        // Replace temp message with real messages
        setMessaggi((prev) => ({
          ...prev,
          [activeChat]: [
            ...(prev[activeChat] || []).filter(m => m.id !== tempUserMessage.id),
            transformedUser,
            transformedAI
          ]
        }))

        setAiLoading(false)
      } else {
        // Regular conversation
        const newMessage = await chatService.sendMessage(activeChat, messageText || '', attachments)

        // Transform message to match component structure
        const transformedMessage: TransformedMessage = {
          ...newMessage,
          mittente: 'consulente' as const,
          nome: user?.name || 'Consulente'
        }

        // Add message to local state
        setMessaggi((prev) => ({
          ...prev,
          [activeChat]: [...(prev[activeChat] || []), transformedMessage]
        }))
      }

      // Update conversation's last message (only for regular conversations, not AI)
      if (activeChat !== aiConversationId) {
        const now = new Date()
        const formattedTime = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })

        setConversazioni((prev) =>
          prev.map((conv) =>
            conv.id === activeChat
              ? {
                  ...conv,
                  ultimoMessaggio: messageText,
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

  const filteredConversazioni = conversazioni.filter(conv => {
    const matchesSearch = conv.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.cliente.azienda.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.argomento.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || conv.status === filterStatus
    const isArchived = conv.fatturata === true
    const matchesTab = chatTab === 'archived' ? isArchived : !isArchived

    return matchesSearch && matchesStatus && matchesTab
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-600'
      case 'pending': return 'bg-yellow-100 text-yellow-600'
      case 'scheduled': return 'bg-blue-100 text-blue-600'
      case 'completed': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Attiva'
      case 'pending': return 'In attesa'
      case 'scheduled': return 'Programmata'
      case 'completed': return 'Completata'
      default: return 'Sconosciuto'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <MessageSquare className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'scheduled': return <AlertTriangle className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
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

  const stats = [
    { title: 'Consulenze Totali', value: conversazioni.length.toString(), icon: MessageSquare, color: 'text-blue-600' },
    { title: 'Attive', value: conversazioni.filter(c => c.status === 'active').length.toString(), icon: Users, color: 'text-green-600' },
    { title: 'In Attesa', value: conversazioni.filter(c => c.status === 'pending').length.toString(), icon: Clock, color: 'text-yellow-600' },
    { title: 'Fatturato Mensile', value: `€ ${conversazioni.filter(c => c.fatturata).reduce((sum, c) => sum + c.importo, 0)}`, icon: TrendingUp, color: 'text-purple-600' }
  ]

  // Check if active chat is AI or regular conversation
  const conversazioneAttiva = activeChat === aiConversationId
    ? {
        id: aiConversationId,
        cliente: {
          nome: 'Assistente AI',
          azienda: 'TaxFlow AI',
          avatar: '🤖',
          email: 'ai@taxflow.it'
        },
        status: 'active',
        priority: 'medium',
        argomento: 'Assistente Personale AI',
        tipo: 'AI Assistant',
        consulente: user?.name || 'Consulente',
        importo: 0,
        fatturata: true,
        messaggiNonLetti: 0,
        ultimoMessaggio: '',
        orarioUltimoMessaggio: '',
        dataUltimaAttivita: new Date().toLocaleDateString('it-IT')
      }
    : conversazioni.find(c => c.id === activeChat)

  // Transform messages to ChatMessage format
  const chatMessages: ChatMessage[] = activeChat
    ? (messaggi[activeChat] || []).map((msg: TransformedMessage) => ({
        id: msg.id,
        mittente: msg.mittente,
        nome: msg.nome,
        testo: msg.testo,
        timestamp: msg.timestamp,
        stato: msg.stato || 'sent',
        attachments: msg.attachments
      }))
    : []

  if (loading) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento conversazioni...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-gray-50 group-hover:scale-110 transition-transform mr-4">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chat Interface */}
      <div className="h-[calc(100vh-250px)] flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative z-10">
        {/* Sidebar Conversazioni */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          {/* Header Sidebar */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Conversazioni</h3>
              <span className="text-sm text-gray-500">{conversazioni.length} totali</span>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca conversazioni..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all duration-200"
              />
            </div>
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
                <option value="active">Attive</option>
                <option value="pending">In attesa</option>
                <option value="scheduled">Programmate</option>
                <option value="completed">Completate</option>
              </select>
            </div>
          </div>

          {/* Lista Conversazioni */}
          <div className="flex-1 overflow-y-auto">
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
            {filteredConversazioni.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveChat(conv.id)}
                className={`w-full p-4 border-b border-gray-100 text-left hover:bg-gray-50 transition-colors ${
                  activeChat === conv.id ? 'bg-primary-50 border-r-2 border-r-primary-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                    {conv.cliente.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">{conv.cliente.nome}</p>
                      {conv.status !== 'pending' && (
                        <span className="text-xs text-gray-500">{conv.orarioUltimoMessaggio}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{conv.cliente.azienda}</p>
                    <p className="text-sm text-gray-600 truncate mb-1">{conv.argomento}</p>

                    <div className="flex items-center justify-between mt-2">
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
            ))}
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
                      {conversazioneAttiva.cliente.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{conversazioneAttiva.cliente.nome}</h3>
                      <p className="text-sm text-gray-600">{conversazioneAttiva.argomento}</p>
                    </div>
                  </div>
                  {/* Delete button - only show for non-AI conversations */}
                  {activeChat !== aiConversationId && (
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Elimina conversazione"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Messaggi */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {conversazioneAttiva?.status === 'pending' ? (
                  /* Pending conversation - show accept/reject buttons */
                  <div className="h-full flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center border border-gray-200">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-yellow-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Richiesta di Consulenza</h3>
                      <p className="text-gray-600 mb-2">
                        <span className="font-medium">{conversazioneAttiva.cliente.nome}</span> ha richiesto una consulenza
                      </p>
                      <p className="text-sm text-gray-500 mb-6">
                        Argomento: <span className="font-medium">{conversazioneAttiva.argomento}</span>
                      </p>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            handleAcceptConversation(activeChat!, e)
                          }}
                          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                        >
                          <Check className="h-5 w-5" />
                          <span>Accetta Richiesta</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            handleRejectConversation(activeChat!, e)
                          }}
                          className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
                        >
                          <X className="h-5 w-5" />
                          <span>Rifiuta Richiesta</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <MessageList
                    messages={chatMessages}
                    userRole="admin"
                    aiLoading={aiLoading && activeChat === aiConversationId}
                    onPreviewFile={handlePreviewFile}
                    onDownloadFile={handleDownloadFile}
                  />
                )}
              </div>

              {/* Input Messaggio */}
              <MessageInput
                message={message}
                onMessageChange={setMessage}
                onSendMessage={handleSendMessage}
                disabled={conversazioneAttiva?.status === 'pending'}
                sending={sending}
                placeholder={conversazioneAttiva?.status === 'pending' ? 'Accetta la richiesta per inviare messaggi' : 'Scrivi una risposta al cliente...'}
                showAttachments={activeChat !== aiConversationId}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Seleziona una conversazione</h3>
                <p className="text-gray-600">Scegli una conversazione dalla barra laterale per iniziare</p>
              </div>
            </div>
          )}
        </div>

        {/* Info Panel Cliente - Hide for AI chat and pending conversations */}
        {conversazioneAttiva && activeChat !== aiConversationId && conversazioneAttiva.status !== 'pending' && (
          <div className="w-64 border-l border-gray-200 p-4 bg-white shadow-sm flex flex-col h-full hover:shadow-md transition-shadow relative z-10">
            <h4 className="font-semibold text-gray-900 mb-4">Dettagli Consulenza</h4>

            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="font-medium text-gray-900">{conversazioneAttiva.cliente.nome}</p>
                <p className="text-sm text-gray-600">{conversazioneAttiva.cliente.azienda}</p>
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

              <div>
                <p className="text-sm text-gray-600">Importo</p>
                <p className="font-medium text-gray-900">€ {conversazioneAttiva.importo}</p>
                <p className={`text-xs ${conversazioneAttiva.fatturata ? 'text-green-600' : 'text-orange-600'}`}>
                  {conversazioneAttiva.fatturata ? 'Fatturata' : 'Da fatturare'}
                </p>
              </div>

              {conversazioneAttiva.rating && (
                <div>
                  <p className="text-sm text-gray-600">Valutazione</p>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < conversazioneAttiva.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">({conversazioneAttiva.rating}/5)</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-200">
              {conversazioneAttiva.fatturata ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-green-800">Fattura Pagata</p>
                  <p className="text-xs text-green-700 mt-1">Non modificabile</p>
                </div>
              ) : (
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-all duration-200 text-sm hover:scale-105 hover:shadow-lg"
                >
                  {conversazioneAttiva.importo > 0 ? 'Modifica Importo' : 'Crea Fattura'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Conferma Eliminazione Conversazione"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Sei sicuro di voler eliminare questa conversazione con{' '}
            <span className="font-semibold">{conversazioneAttiva?.cliente.nome}</span>?
            Tutti i messaggi verranno eliminati permanentemente.
          </p>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={deletingConversation}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annulla
            </button>
            <button
              onClick={handleDeleteConversation}
              disabled={deletingConversation}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              {deletingConversation ? 'Eliminazione...' : 'Elimina Conversazione'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Invoice Creation Modal */}
      {conversazioneAttiva && activeChat !== aiConversationId && (
        <Modal
          isOpen={showInvoiceModal}
          onClose={() => {
            setShowInvoiceModal(false)
            setInvoiceAmount('')
          }}
          title={conversazioneAttiva.importo > 0 ? 'Modifica Importo Consulenza' : 'Crea Fattura per Consulenza'}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Imposta l'importo per la consulenza con{' '}
              <span className="font-semibold">{conversazioneAttiva.cliente.nome}</span>
            </p>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Dettagli consulenza</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cliente:</span>
                  <span className="font-medium text-gray-900">{conversazioneAttiva.cliente.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Azienda:</span>
                  <span className="font-medium text-gray-900">{conversazioneAttiva.cliente.azienda}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Argomento:</span>
                  <span className="font-medium text-gray-900">{conversazioneAttiva.argomento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium text-gray-900 capitalize">{conversazioneAttiva.tipo.replace('_', ' ')}</span>
                </div>
                {conversazioneAttiva.importo > 0 && (
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Importo attuale:</span>
                    <span className="font-bold text-gray-900">€ {conversazioneAttiva.importo}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Importo consulenza (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
                placeholder="Es: 150.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Il cliente riceverà una richiesta di pagamento per questo importo + IVA (22%)
              </p>
            </div>

            {invoiceAmount && parseFloat(invoiceAmount) > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Importo base:</span>
                    <span className="font-medium text-gray-900">€ {parseFloat(invoiceAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">IVA (22%):</span>
                    <span className="font-medium text-gray-900">€ {(parseFloat(invoiceAmount) * 0.22).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-300">
                    <span className="font-semibold text-gray-900">Totale da pagare:</span>
                    <span className="font-bold text-primary-600 text-lg">€ {(parseFloat(invoiceAmount) * 1.22).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowInvoiceModal(false)
                  setInvoiceAmount('')
                }}
                disabled={creatingInvoice}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Annulla
              </button>
              <button
                onClick={handleCreateInvoice}
                disabled={creatingInvoice || !invoiceAmount || parseFloat(invoiceAmount) <= 0}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingInvoice ? 'Creazione...' : (conversazioneAttiva.importo > 0 ? 'Aggiorna Importo' : 'Crea Fattura')}
              </button>
            </div>
          </div>
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
