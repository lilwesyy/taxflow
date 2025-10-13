export type UserRole = 'business' | 'admin'

export type InvoiceStatus = 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'failed' | 'canceled'

// Re-export Invoice from main types file to ensure consistency
export type { Invoice } from './index'

export interface Client {
  id: number | string
  nome?: string
  ragioneSociale?: string
  email: string
  telefono: string
  company?: string
  status: 'active' | 'pending' | 'new'
  piva: string
  codiceFiscale?: string
  codiceAteco?: string
  fatturato?: number
  dataRegistrazione?: string
  ultimaAttivita?: string
  consulenze?: number
  pendingRequests?: number
  indirizzo?: string
  regimeContabile?: string
  aliquotaIva?: string
  fatturePagate?: number
  fattureInAttesa?: number
  documentiForniti?: number
  prossimaTasse?: string
  note?: string
  attivitaRecenti?: Array<{
    data: string
    azione: string
    dettaglio: string
  }>
  // Compatibility fields
  name?: string
  lastActivity?: string
  revenue?: string
  partitaIva?: string

  // Campi aggiuntivi per Fatturazione Elettronica Aruba
  cap?: string
  comune?: string
  provincia?: string
  pec?: string
  codiceDestinatario?: string
}

export interface RecentActivity {
  type: string
  description: string
  time: string
  amount?: string
  status: 'success' | 'warning' | 'info' | 'error'
}

export interface PendingRequest {
  type: string
  client: string
  description: string
  priority: 'high' | 'medium' | 'low'
  time: string
}