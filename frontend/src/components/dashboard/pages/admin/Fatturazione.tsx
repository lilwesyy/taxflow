import { FileText, Plus, Search, Filter, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { StatsGrid } from '../../shared/StatsCard'
import InvoiceTable from '../../shared/InvoiceTable'
import InvoiceDetailModal from '../../shared/InvoiceDetailModal'
import InvoiceCreateModal from '../../shared/InvoiceCreateModal'
import Modal from '../../../common/Modal'
import type { StatItem } from '../../shared/StatsCard'
import type { Invoice } from '../../../../types/dashboard'
import { calculateInvoiceStats, formatCurrency } from '../../../../utils/invoiceUtils'
import { useToast } from '../../../../context/ToastContext'

export default function Fatturazione() {
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Load paid consultations
  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/conversations/paid/list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }

      const data = await response.json()
      setInvoices(data)
    } catch (error) {
      console.error('Error loading transactions:', error)
      showToast('Errore nel caricamento delle transazioni', 'error')
    } finally {
      setLoading(false)
    }
  }

  const adminInvoices = invoices

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

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/invoices/${invoice.id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Errore nel download del PDF')
      }

      // Create blob from response
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fattura-${invoice.numero}.pdf`
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      showToast('PDF scaricato con successo!', 'success')
    } catch (error) {
      console.error('Error downloading invoice:', error)
      showToast('Errore nel download del PDF', 'error')
    }
  }

  const handleSendInvoice = (invoice: Invoice) => {
    console.log('Sending invoice:', invoice.id)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setEditAmount(invoice.importo.toString())
  }

  const handleUpdateInvoice = async () => {
    if (!editingInvoice || !editAmount) return

    const amount = parseFloat(editAmount)
    if (isNaN(amount) || amount <= 0) {
      showToast('Inserisci un importo valido', 'error')
      return
    }

    try {
      setIsUpdating(true)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/invoices/${editingInvoice.id}/amount`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ importo: amount })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Errore nella modifica')
      }

      showToast('Importo aggiornato con successo!', 'success')
      setEditingInvoice(null)
      setEditAmount('')

      // Reload invoices
      await loadTransactions()
    } catch (error: any) {
      console.error('Error updating invoice:', error)
      showToast(error.message || 'Errore nell\'aggiornamento dell\'importo', 'error')
    } finally {
      setIsUpdating(false)
    }
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
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento transazioni...</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessuna transazione trovata</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all'
              ? 'Prova a modificare i filtri di ricerca'
              : 'Le consulenze pagate appariranno qui'}
          </p>
        </div>
      ) : (
        <InvoiceTable
          invoices={filteredInvoices}
          onViewInvoice={handleViewInvoice}
          onEditInvoice={handleEditInvoice}
          onDownloadInvoice={handleDownloadInvoice}
          onSendInvoice={handleSendInvoice}
          showClientEmail={true}
          showService={true}
          showConsulente={true}
        />
      )}

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

      {/* Edit Invoice Amount Modal */}
      {editingInvoice && (
        <Modal
          isOpen={!!editingInvoice}
          onClose={() => {
            setEditingInvoice(null)
            setEditAmount('')
          }}
          title="Modifica Importo Fattura"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Modifica l'importo della fattura per{' '}
              <span className="font-semibold">{editingInvoice.cliente}</span>
            </p>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Dettagli fattura</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Numero:</span>
                  <span className="font-medium text-gray-900">{editingInvoice.numero}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cliente:</span>
                  <span className="font-medium text-gray-900">{editingInvoice.cliente}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Servizio:</span>
                  <span className="font-medium text-gray-900">{editingInvoice.servizio}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Importo attuale:</span>
                  <span className="font-bold text-gray-900">€ {editingInvoice.importo}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nuovo importo (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="Es: 150.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Il totale includerà IVA (22%)
              </p>
            </div>

            {editAmount && parseFloat(editAmount) > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Importo base:</span>
                    <span className="font-medium text-gray-900">€ {parseFloat(editAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">IVA (22%):</span>
                    <span className="font-medium text-gray-900">€ {(parseFloat(editAmount) * 0.22).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-300">
                    <span className="font-semibold text-gray-900">Totale:</span>
                    <span className="font-bold text-primary-600 text-lg">€ {(parseFloat(editAmount) * 1.22).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setEditingInvoice(null)
                  setEditAmount('')
                }}
                disabled={isUpdating}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Annulla
              </button>
              <button
                onClick={handleUpdateInvoice}
                disabled={isUpdating || !editAmount || parseFloat(editAmount) <= 0}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Aggiornamento...' : 'Aggiorna Importo'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}