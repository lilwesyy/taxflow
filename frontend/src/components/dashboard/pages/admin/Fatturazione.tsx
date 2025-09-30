import { FileText, Plus, Search, Filter, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { StatsGrid } from '../../shared/StatsCard'
import InvoiceTable from '../../shared/InvoiceTable'
import InvoiceDetailModal from '../../shared/InvoiceDetailModal'
import InvoiceCreateModal from '../../shared/InvoiceCreateModal'
import { mockInvoices } from '../../../../data/mockData'
import type { StatItem } from '../../shared/StatsCard'
import type { Invoice } from '../../../../types/dashboard'
import { calculateInvoiceStats, formatCurrency } from '../../../../utils/invoiceUtils'

export default function Fatturazione() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  // Filter admin invoices (with IVA)
  const adminInvoices = mockInvoices.filter(invoice => invoice.iva > 0)

  // Filter invoices based on search and status
  const filteredInvoices = adminInvoices.filter(invoice => {
    const matchesSearch =
      invoice.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.servizio.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const invoiceStats = calculateInvoiceStats(adminInvoices)
  const stats: StatItem[] = [
    {
      title: 'Fatture Emesse',
      value: invoiceStats.total.toString(),
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Incassato',
      value: formatCurrency(invoiceStats.paid),
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'In Sospeso',
      value: formatCurrency(invoiceStats.pending),
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      title: 'Scadute',
      value: formatCurrency(invoiceStats.overdue),
      icon: AlertTriangle,
      color: 'text-red-600'
    }
  ]

  const handleCreateInvoice = (formData: any) => {
    console.log('Creating admin invoice:', formData)
    setShowNewInvoiceModal(false)
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
  }

  const handleDownloadInvoice = (invoice: Invoice) => {
    console.log('Downloading invoice:', invoice.id)
  }

  const handleSendInvoice = (invoice: Invoice) => {
    console.log('Sending invoice:', invoice.id)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    console.log('Editing invoice:', invoice.id)
  }

  const handleMarkAsPaid = (invoice: Invoice) => {
    console.log('Marking invoice as paid:', invoice.id)
  }

  return (
    <div className="space-y-6">
      {/* Statistiche */}
      <StatsGrid stats={stats} />

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca per numero, cliente o servizio..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
              >
                <option value="all">Tutti gli stati</option>
                <option value="draft">Bozze</option>
                <option value="sent">Inviate</option>
                <option value="pending">In Attesa</option>
                <option value="paid">Pagate</option>
                <option value="overdue">Scadute</option>
              </select>
            </div>
            <button
              onClick={() => setShowNewInvoiceModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuova Fattura
            </button>
          </div>
        </div>
      </div>

      {/* Tabella Fatture */}
      <InvoiceTable
        invoices={filteredInvoices}
        onViewInvoice={handleViewInvoice}
        onEditInvoice={handleEditInvoice}
        onDownloadInvoice={handleDownloadInvoice}
        onSendInvoice={handleSendInvoice}
        showClientEmail={true}
        showService={true}
      />

      {/* Modal Nuova Fattura */}
      <InvoiceCreateModal
        isOpen={showNewInvoiceModal}
        onClose={() => setShowNewInvoiceModal(false)}
        onSubmit={handleCreateInvoice}
        title="Crea Nuova Fattura Consulenza"
        userRole="admin"
      />

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
        onMarkAsPaid={handleMarkAsPaid}
        onSendInvoice={handleSendInvoice}
        onEditInvoice={handleEditInvoice}
        onDownloadInvoice={handleDownloadInvoice}
      />
    </div>
  )
}