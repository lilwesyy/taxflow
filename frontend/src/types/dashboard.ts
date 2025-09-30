export type UserRole = 'business' | 'admin'

export type InvoiceStatus = 'draft' | 'sent' | 'pending' | 'paid' | 'overdue'

export interface Invoice {
  id: string
  numero: string
  cliente: string
  email: string
  dataEmissione: string
  dataScadenza: string
  importo: number
  iva: number
  totale: number
  status: InvoiceStatus
  servizio: string
  metodoPagamento: 'bonifico' | 'carta' | 'contanti' | 'assegno'
  descrizione?: string
  note?: string
}

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