/**
 * Shared TypeScript types for the frontend application
 */

// ============================================
// User & Authentication Types
// ============================================

export interface PivaRequestData {
  // Dati Anagrafici
  firstName: string
  lastName: string
  dateOfBirth: string
  placeOfBirth: string
  fiscalCode: string
  residenceAddress: string
  residenceCity: string
  residenceCAP: string
  residenceProvince: string

  // Dati Attività
  businessActivity: string
  codiceAteco: string
  businessName?: string
  businessAddress?: string
  businessCity?: string
  businessCAP?: string
  businessProvince?: string

  // Regime Fiscale
  expectedRevenue: number
  hasOtherIncome: boolean
  otherIncomeDetails?: string

  // Documenti
  hasIdentityDocument: boolean
  hasFiscalCode: boolean

  // Note aggiuntive
  additionalNotes?: string
  submittedAt: Date | string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'business' | 'admin'
  company?: string
  phone?: string
  professionalRole?: string
  bio?: string
  address?: string
  city?: string
  cap?: string
  fiscalCode?: string
  registrationNumber?: string

  // Italian aliases for legacy API compatibility
  nome?: string  // alias for name
  telefono?: string  // alias for phone
  codiceFiscale?: string  // alias for fiscalCode
  indirizzo?: string  // alias for address
  azienda?: string  // alias for company
  dataRegistrazione?: Date

  // Business/Tax related fields
  piva?: string
  codiceAteco?: string
  settoreAttivita?: string
  regimeContabile?: 'Forfettario' | 'Ordinario' | 'Semplificato'
  aliquotaIva?: string
  fatturato?: number
  status?: 'active' | 'pending' | 'new' | 'inactive' | 'rejected'

  // Two-step approval process
  registrationApprovalStatus?: 'pending' | 'approved' | 'rejected'
  pivaFormSubmitted?: boolean
  pivaApprovalStatus?: 'pending' | 'approved' | 'rejected'
  pivaRequestData?: PivaRequestData

  // Stats
  pendingRequests?: number
  consulenze?: number
  fatturePagate?: number
  fattureInAttesa?: number
  documentiForniti?: number
  prossimaTasse?: Date
  note?: string
  attivitaRecenti?: ActivityLog[]
  ultimaAttivita?: Date

  // Settings
  notificationSettings?: NotificationSettings
  securitySettings?: SecuritySettings
  twoFactorEnabled?: boolean
  twoFactorSecret?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface ActivityLog {
  date: Date
  action: string
  detail: string
}

export interface NotificationSettings {
  emailNewClient: boolean
  emailNewRequest: boolean
  emailPayment: boolean
  pushNotifications: boolean
  weeklyReport: boolean
}

export interface SecuritySettings {
  sessionTimeout: number // in minutes
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  error: string
  details?: Array<{ field: string; message: string }>
}

// ============================================
// Document Types
// ============================================

export interface Document {
  id: string
  userId: string
  clientId?: string
  nome: string
  tipo: string
  categoria: 'dichiarazioni' | 'fatturazione' | 'comunicazioni' | 'versamenti' | 'consultazione' | 'registri' | 'altri_documenti'
  descrizione?: string
  fileName: string
  fileUrl: string
  formato: string
  dimensione: number
  mimeType: string
  status: 'elaborato' | 'in_elaborazione' | 'in_attesa' | 'rifiutato'
  protocollo?: string
  importo?: string
  anno: string
  dataCaricamento: Date
  dataModifica: Date
  note?: string
  cronologia: DocumentEvent[]
  deleted: boolean
  deletedAt?: Date
  cliente?: {
    id: string
    nome: string
    azienda?: string
  }
}

export interface DocumentEvent {
  data: Date
  azione: string
  utente: string
}

// ============================================
// Invoice Types
// ============================================

export interface Invoice {
  id: string
  conversationId: string
  businessUserId: string
  adminUserId: string
  numero: string
  cliente: string
  clienteEmail: string
  email?: string  // Legacy/alternative field
  azienda: string
  consulente: string
  servizio: string
  tipo: string
  importo: number
  iva: number
  totale: number
  status: 'paid' | 'pending' | 'failed' | 'canceled' | 'draft' | 'sent' | 'overdue'
  dataEmissione: string
  dataPagamento?: string
  dataScadenza?: string
  metodoPagamento?: string
  descrizione?: string
  note?: string
  stripePaymentIntentId: string
  stripePaymentStatus?: string
  createdAt: Date
  updatedAt: Date
}

// ============================================
// Chat/Conversation Types
// ============================================

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderRole: 'business' | 'admin'
  testo?: string
  stato: 'sent' | 'delivered' | 'read'
  attachments?: MessageAttachment[]
  createdAt: Date
  updatedAt: Date
}

export interface MessageAttachment {
  filename: string
  url: string
  mimeType: string
  size: number
}

export interface Conversation {
  id: string
  businessUserId: string | { name?: string; company?: string; email?: string }
  adminUserId?: string | { name?: string; professionalRole?: string; email?: string }
  status: 'active' | 'pending' | 'scheduled' | 'completed'
  priority: 'low' | 'medium' | 'high'
  tipo: string
  argomento: string
  durataConsulenza?: string
  rating?: number
  fatturata: boolean
  importo?: number
  stripePaymentIntentId?: string
  stripePaymentStatus?: 'pending' | 'succeeded' | 'failed' | 'canceled'
  paidAt?: Date | string
  lastMessageAt: Date
  createdAt: Date
  updatedAt: Date

  // Additional fields used in frontend transformations
  ultimoMessaggio?: string
  orarioUltimoMessaggio?: string
  messaggiNonLetti?: number
}

// ============================================
// Feedback Types
// ============================================

export interface Feedback {
  id: string
  clientId: string
  clientName: string
  clientCompany?: string
  consultantId?: string
  consultantName: string
  service: string
  rating: number
  title: string
  message: string
  category: string
  recommend: boolean
  positiveAspects?: string
  suggestions?: string
  status: 'pending' | 'responded' | 'archived'
  response?: string
  responseDate?: Date
  respondedBy?: string
  createdAt: Date
  updatedAt: Date
}

// ============================================
// Component Props Types
// ============================================

export interface ClientModalProps {
  client: User | null
  onClose: () => void
  onUpdate: () => void
}

export interface SidebarItem {
  name: string
  icon: React.ComponentType<{ className?: string }>
  section: string
  badge?: number
}

// ============================================
// Form Types
// ============================================

export interface UpdateProfileData {
  name?: string
  phone?: string
  professionalRole?: string
  bio?: string
  address?: string
  city?: string
  cap?: string
  fiscalCode?: string
  company?: string
  piva?: string
  codiceAteco?: string
  settoreAttivita?: string
  regimeContabile?: 'Forfettario' | 'Ordinario' | 'Semplificato'
  aliquotaIva?: string
  currentPassword?: string
  newPassword?: string
  notificationSettings?: NotificationSettings
  pivaFormSubmitted?: boolean
  pivaApprovalStatus?: 'pending' | 'approved' | 'rejected'
  pivaRequestData?: PivaRequestData
  approvalStatus?: string  // Legacy field for compatibility
  registrationApprovalStatus?: 'pending' | 'approved' | 'rejected'
}
