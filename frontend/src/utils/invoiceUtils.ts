import { CheckCircle, Clock, AlertTriangle, Send, Edit, FileText } from 'lucide-react'
import type { InvoiceStatus } from '../types/dashboard'
import type { Invoice } from '../types'

export const getStatusInfo = (status: InvoiceStatus | string) => {
  switch (status) {
    case 'paid':
      return { label: 'Pagata', color: 'bg-green-100 text-green-700', icon: CheckCircle }
    case 'pending':
      return { label: 'In Attesa', color: 'bg-yellow-100 text-yellow-700', icon: Clock }
    case 'failed':
      return { label: 'Fallita', color: 'bg-red-100 text-red-700', icon: AlertTriangle }
    case 'canceled':
      return { label: 'Annullata', color: 'bg-gray-100 text-gray-700', icon: AlertTriangle }
    case 'sent':
      return { label: 'Inviata', color: 'bg-blue-100 text-blue-700', icon: Send }
    case 'overdue':
      return { label: 'Scaduta', color: 'bg-red-100 text-red-700', icon: AlertTriangle }
    case 'draft':
      return { label: 'Bozza', color: 'bg-gray-100 text-gray-700', icon: Edit }
    default:
      return { label: status, color: 'bg-gray-100 text-gray-700', icon: FileText }
  }
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

export const formatDate = (dateString: string | undefined) => {
  if (!dateString) return ''

  // Handle different date formats
  let date: Date

  // If it's already in DD/MM/YYYY format, return as is
  if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    return dateString
  }

  // Parse ISO format (YYYY-MM-DD) or other formats
  date = new Date(dateString)

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return dateString
  }

  // Format to DD/MM/YYYY
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

export const calculateInvoiceStats = (invoices: Invoice[]) => {
  return {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.totale, 0),
    pending: invoices.filter(i => i.status === 'pending' || i.status === 'sent').reduce((sum, i) => sum + i.totale, 0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.totale, 0),
    totalRevenue: invoices.reduce((sum, i) => sum + i.totale, 0)
  }
}

export const calculateIvaAmount = (importo: number, ivaPercentage: number) => {
  return (importo * ivaPercentage) / 100
}

export const calculateTotal = (importo: number, ivaPercentage: number) => {
  return importo + calculateIvaAmount(importo, ivaPercentage)
}