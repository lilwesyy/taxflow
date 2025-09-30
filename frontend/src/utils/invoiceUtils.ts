import { CheckCircle, Clock, AlertTriangle, Send, Edit, FileText } from 'lucide-react'
import type { InvoiceStatus } from '../types/dashboard'

export const getStatusInfo = (status: InvoiceStatus) => {
  switch (status) {
    case 'paid':
      return { label: 'Pagata', color: 'bg-green-100 text-green-700', icon: CheckCircle }
    case 'pending':
      return { label: 'In Attesa', color: 'bg-yellow-100 text-yellow-700', icon: Clock }
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

export const calculateInvoiceStats = (invoices: any[]) => {
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