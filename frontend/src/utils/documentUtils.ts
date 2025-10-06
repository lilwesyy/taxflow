import { CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { ReactNode, createElement } from 'react'

export interface Document {
  id: string
  nome: string
  tipo: string
  descrizione?: string
  categoria: string
  anno: string
  status: 'elaborato' | 'in_elaborazione' | 'in_attesa' | 'rifiutato'
  dataCaricamento: string
  dataUltimaModifica?: string
  dimensione: string
  formato: string
  protocollo?: string
  importo?: string
  note?: string
  fileUrl: string
  cliente?: {
    id: string
    nome: string
    azienda?: string
  }
}

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'elaborato':
      return 'bg-green-100 text-green-600'
    case 'in_elaborazione':
      return 'bg-blue-100 text-blue-600'
    case 'in_attesa':
      return 'bg-yellow-100 text-yellow-600'
    case 'rifiutato':
      return 'bg-red-100 text-red-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

export const getStatusText = (status: string): string => {
  switch (status) {
    case 'elaborato':
      return 'Elaborato'
    case 'in_elaborazione':
      return 'In elaborazione'
    case 'in_attesa':
      return 'In attesa'
    case 'rifiutato':
      return 'Rifiutato'
    default:
      return 'Sconosciuto'
  }
}

export const getStatusIcon = (status: string): ReactNode => {
  switch (status) {
    case 'elaborato':
      return createElement(CheckCircle, { className: 'h-4 w-4' })
    case 'in_elaborazione':
      return createElement(Clock, { className: 'h-4 w-4' })
    case 'in_attesa':
      return createElement(Clock, { className: 'h-4 w-4' })
    case 'rifiutato':
      return createElement(AlertTriangle, { className: 'h-4 w-4' })
    default:
      return createElement(Clock, { className: 'h-4 w-4' })
  }
}

export const getAvailableYears = (documents: Document[]): string[] => {
  const years = documents.map(doc => doc.anno)
  return ['all', ...Array.from(new Set(years)).sort((a, b) => b.localeCompare(a))]
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

export const DOCUMENT_CATEGORIES = [
  {
    id: 'dichiarazioni',
    name: 'Dichiarazioni',
    description: 'Dichiarazioni dei redditi e IVA'
  },
  {
    id: 'fatturazione',
    name: 'Fatturazione',
    description: 'Fatture emesse e ricevute'
  },
  {
    id: 'comunicazioni',
    name: 'Comunicazioni',
    description: 'Comunicazioni ufficiali'
  },
  {
    id: 'versamenti',
    name: 'Versamenti',
    description: 'F24 e pagamenti'
  },
  {
    id: 'consultazione',
    name: 'Consultazione',
    description: 'Documenti consultivi'
  },
  {
    id: 'registri',
    name: 'Registri',
    description: 'Registri contabili'
  },
  {
    id: 'altri_documenti',
    name: 'Altri Documenti',
    description: 'Documentazione varia'
  }
] as const

export type DocumentCategory = typeof DOCUMENT_CATEGORIES[number]['id']
