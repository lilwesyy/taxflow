/**
 * Shared TypeScript types for the frontend application
 */

// ============================================
// User & Authentication Types
// ============================================

export type SubscriptionPlanType = 'annual' | 'monthly'

export interface SubscriptionPlan {
  id: string // Internal ID
  stripePriceId: string // Stripe Price ID
  name: string
  price: number // Price in euros
  originalPrice?: number
  discount?: string
  type: SubscriptionPlanType
  interval: 'year' | 'month'
  features: string[]
  description?: string
}

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

  // P.IVA esistente
  hasExistingPiva?: boolean
  existingPivaNumber?: string

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
  role: 'business' | 'admin' | 'synetich_admin'
  webmaster?: boolean
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
  numeroCivico?: string  // house number
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

  // Subscription & Stripe
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  selectedPlan?: SubscriptionPlan
  subscriptionStatus?: 'pending_payment' | 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid'
  subscriptionCurrentPeriodStart?: Date
  subscriptionCurrentPeriodEnd?: Date
  subscriptionCancelAtPeriodEnd?: boolean

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
  _id?: string
  id: string
  conversationId: string
  businessUserId: string
  adminUserId: string
  numero: string
  cliente: string
  clienteEmail: string
  email?: string  // Legacy/alternative field

  // Dettagli completi del cliente
  clientePartitaIva?: string
  clienteCodiceFiscale?: string
  clienteIndirizzo?: string
  clienteCap?: string
  clienteComune?: string
  clienteProvincia?: string
  clienteNazione?: string
  clienteTelefono?: string
  clientePec?: string
  clienteCodiceDestinatario?: string

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

// ============================================
// Expense Types
// ============================================

export interface Expense {
  id: string
  userId: string
  descrizione: string
  importo: number
  data: string // YYYY-MM-DD
  categoria: 'inps' | 'imposte' | 'affitto' | 'utilities' | 'fornitori' | 'attrezzature' | 'marketing' | 'formazione' | 'trasporti' | 'consulenze' | 'altro'
  stato: 'pagato' | 'da_pagare' | 'ricorrente'
  metodoPagamento?: 'bonifico' | 'carta' | 'contanti' | 'rid' | 'altro'
  ricorrente?: {
    frequenza: 'mensile' | 'trimestrale' | 'annuale'
    prossimaScadenza?: string
    importoFisso: boolean
  }
  note?: string
  documentoId?: string
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    nome: string
    email: string
    azienda?: string
  }
  documento?: {
    id: string
    nome: string
    tipo: string
    fileUrl: string
  }
}

export interface ExpenseStats {
  totale: number
  totaleSpese: number
  spesePagate: number
  speseDaPagare: number
  speseRicorrenti: number
  perCategoria: Record<string, number>
  perStato: {
    pagato: number
    da_pagare: number
    ricorrente: number
  }
}

// ============================================
// Synetich Course Types
// ============================================

export type CourseCategory = 'equipment' | 'safety' | 'management' | 'specialized'
export type CourseStatus = 'active' | 'draft' | 'archived' | 'completed'
export type EnrollmentStatus = 'pending' | 'confirmed' | 'completed' | 'canceled' | 'absent'

export interface Course {
  id: string
  title: string
  category: CourseCategory
  type: string
  description: string
  duration: string // e.g., "1 giorno", "2 giorni", "8 ore"
  startDate: string // ISO date
  endDate?: string // ISO date
  maxParticipants: number
  currentParticipants: number
  location: string
  instructor?: string
  price: number
  icon?: string
  certification: boolean
  certificationName?: string
  requirements?: string[]
  topics?: string[]
  status: CourseStatus
  createdAt: Date
  updatedAt: Date
}

export interface Enrollment {
  id: string
  courseId: string
  userId: string
  status: EnrollmentStatus
  enrollmentDate: Date
  completionDate?: Date
  certificateIssued: boolean
  certificateUrl?: string
  paymentStatus: 'pending' | 'paid' | 'refunded'
  paymentAmount: number
  paymentDate?: Date
  notes?: string
  attendance?: {
    present: boolean
    hours: number
  }
  createdAt: Date
  updatedAt: Date

  // Populated fields
  course?: Course
  user?: {
    id: string
    name: string
    email: string
    company?: string
    phone?: string
  }
}

export interface CourseStats {
  totalCourses: number
  activeCourses: number
  completedCourses: number
  totalEnrollments: number
  totalRevenue: number
  averageParticipants: number
  byCategory: Record<CourseCategory, number>
  byStatus: Record<EnrollmentStatus, number>
  upcomingCourses: Course[]
  recentEnrollments: Enrollment[]
}
