export interface ChatMessage {
  id: string
  mittente: 'user' | 'consulente' | 'cliente' | 'ai'
  nome: string
  testo: string
  timestamp: string
  stato: 'sent' | 'delivered' | 'read'
  attachments?: FileAttachment[]
}

export interface FileAttachment {
  filename: string
  url: string
  mimeType: string
  size: number
}

export interface Conversation {
  id: string
  _id?: string
  consulente: {
    nome: string
    avatar: string
  }
  businessUserId?: string
  adminUserId?: string
  argomento: string
  tipo: string
  ultimoMessaggio: string
  orarioUltimoMessaggio: string
  messaggiNonLetti: number
  status: 'active' | 'pending' | 'scheduled' | 'completed'
  priority?: 'low' | 'medium' | 'high'
  fatturata?: boolean
  importo?: number
  lastMessageAt?: string
}

export interface Consultant {
  _id: string
  name: string
  email: string
  professionalRole?: string
  bio?: string
}

export type UserRole = 'business' | 'admin'
