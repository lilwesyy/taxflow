import { logger } from '../utils/logger'

const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api')

const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  const token = localStorage.getItem('token')
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export type Conversation = {
  _id: string
  businessUserId: string
  adminUserId?: string
  status: 'active' | 'pending' | 'scheduled' | 'completed'
  priority: 'low' | 'medium' | 'high'
  tipo: string
  argomento: string
  durataConsulenza?: string
  rating?: number
  fatturata: boolean
  importo: number
  lastMessageAt: string
  messaggiNonLetti: number
  ultimoMessaggio: string
  orarioUltimoMessaggio: string
}

export type Consultant = {
  _id: string
  name: string
  email: string
  professionalRole?: string
  bio?: string
}

export type Message = {
  id: string
  mittente: 'user' | 'consulente' | 'cliente' | 'ai'
  nome: string
  testo: string
  timestamp: string
  stato: 'sent' | 'delivered' | 'read'
  attachments?: {
    filename: string
    url: string
    mimeType: string
    size: number
  }[]
}

class ChatService {
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map()

  // Get all available consultants (for business users)
  async getConsultants(): Promise<Consultant[]> {
    const response = await fetch(`${API_BASE_URL}/chat/consultants`, {
      method: 'GET',
      headers: getHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to fetch consultants')
    }

    return response.json()
  }

  // Get all conversations for the logged-in user
  async getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
      method: 'GET',
      headers: getHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to fetch conversations')
    }

    return response.json()
  }

  // Get messages for a specific conversation
  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`, {
      method: 'GET',
      headers: getHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to fetch messages')
    }

    return response.json()
  }

  // Upload files
  async uploadFiles(files: File[]): Promise<{ filename: string; url: string; mimeType: string; size: number }[]> {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })

    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/chat/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to upload files')
    }

    const data = await response.json()
    return data.files
  }

  // Send a message
  async sendMessage(conversationId: string, testo: string, attachments?: { filename: string; url: string; mimeType: string; size: number }[]): Promise<Message> {
    const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ testo, attachments })
    })

    if (!response.ok) {
      throw new Error('Failed to send message')
    }

    return response.json()
  }

  // Get new messages since a specific timestamp
  async getNewMessages(conversationId: string, since?: string): Promise<Message[]> {
    const url = new URL(`${API_BASE_URL}/chat/conversations/${conversationId}/messages/new`)
    if (since) {
      url.searchParams.append('since', since)
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to fetch new messages')
    }

    return response.json()
  }

  // Create a new conversation (business users only)
  async createConversation(data: {
    argomento: string
    tipo: string
    importo?: number
    adminUserId?: string
  }): Promise<Conversation> {
    const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error('Failed to create conversation')
    }

    return response.json()
  }

  // Assign an admin to a conversation (admin only)
  async assignConversation(conversationId: string, adminUserId: string): Promise<Conversation> {
    const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/assign`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ adminUserId })
    })

    if (!response.ok) {
      throw new Error('Failed to assign conversation')
    }

    return response.json()
  }

  // Delete a conversation (admin only)
  async deleteConversation(conversationId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to delete conversation')
    }
  }

  // Accept a conversation request (admin only)
  async acceptConversation(conversationId: string): Promise<Conversation> {
    const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/accept`, {
      method: 'PATCH',
      headers: getHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to accept conversation')
    }

    return response.json()
  }

  // Reject a conversation request (admin only)
  async rejectConversation(conversationId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/reject`, {
      method: 'DELETE',
      headers: getHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to reject conversation')
    }
  }

  // Start polling for new messages
  startPolling(
    conversationId: string,
    onNewMessages: (messages: Message[]) => void,
    intervalMs: number = 3000
  ): void {
    // Stop existing polling for this conversation
    this.stopPolling(conversationId)

    let lastMessageTimestamp: string | undefined

    const poll = async () => {
      try {
        const newMessages = await this.getNewMessages(conversationId, lastMessageTimestamp)

        if (newMessages.length > 0) {
          onNewMessages(newMessages)
          // Update timestamp to the latest message
          lastMessageTimestamp = new Date().toISOString()
        }
      } catch (error) {
        logger.error('Error polling for new messages:', error)
      }
    }

    // Initial poll
    poll()

    // Set up interval
    const interval = setInterval(poll, intervalMs)
    this.pollingIntervals.set(conversationId, interval)
  }

  // Stop polling for a specific conversation
  stopPolling(conversationId: string): void {
    const interval = this.pollingIntervals.get(conversationId)
    if (interval) {
      clearInterval(interval)
      this.pollingIntervals.delete(conversationId)
    }
  }

  // Stop all polling
  stopAllPolling(): void {
    this.pollingIntervals.forEach((interval) => clearInterval(interval))
    this.pollingIntervals.clear()
  }

  // AI Assistant methods
  async getAIConversation(): Promise<{ id: string; tipo: string; argomento: string; status: string; lastMessageAt: string }> {
    const response = await fetch(`${API_BASE_URL}/ai/conversation`, {
      method: 'GET',
      headers: getHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to get AI conversation')
    }

    return response.json()
  }

  async getAIMessages(): Promise<Message[]> {
    const response = await fetch(`${API_BASE_URL}/ai/conversation/messages`, {
      method: 'GET',
      headers: getHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to fetch AI messages')
    }

    return response.json()
  }

  async sendAIMessage(testo: string): Promise<{ userMessage: Message; aiMessage: Message }> {
    const response = await fetch(`${API_BASE_URL}/ai/conversation/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ testo })
    })

    if (!response.ok) {
      throw new Error('Failed to send AI message')
    }

    return response.json()
  }
}

export default new ChatService()
