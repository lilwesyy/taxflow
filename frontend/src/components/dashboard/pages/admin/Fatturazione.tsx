import { FileText, Plus, Search, Filter, CheckCircle, Clock, AlertTriangle, Users, Building2, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
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

type TabType = 'invoices' | 'clients'

interface ClientWithPiva {
  id: string
  nome: string
  email: string
  telefono: string
  company: string
  piva: string
  codiceAteco: string
  regimeContabile: string
  status: string
  dataRegistrazione: string
  ultimaAttivita: string
  indirizzo: string
  citta: string
  cap: string
  codiceFiscale: string
  provincia: string
  paese: string
  fatturaElettronica: any | null
}

export default function Fatturazione() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>('invoices')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clientsWithPiva, setClientsWithPiva] = useState<ClientWithPiva[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingClients, setLoadingClients] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<ClientWithPiva | null>(null)
  const [clientInvoices, setClientInvoices] = useState<any[]>([])
  const [clientClients, setClientClients] = useState<any[]>([])
  const [loadingClientDetails, setLoadingClientDetails] = useState(false)

  // Load paid consultations
  useEffect(() => {
    loadTransactions()
  }, [])

  // Load clients with P.IVA when switching to clients tab
  useEffect(() => {
    if (activeTab === 'clients') {
      loadClientsWithPiva()
    }
  }, [activeTab])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/clients/invoices`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch invoices')
      }

      const data = await response.json()
      setInvoices(data.invoices || [])
    } catch (error) {
      console.error('Error loading invoices:', error)
      showToast('Errore nel caricamento delle fatture', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadClientsWithPiva = async () => {
    try {
      setLoadingClients(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/clients/with-piva`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch clients')
      }

      const data = await response.json()
      setClientsWithPiva(data.clients || [])
    } catch (error) {
      console.error('Error loading clients with P.IVA:', error)
      showToast('Errore nel caricamento dei clienti', 'error')
    } finally {
      setLoadingClients(false)
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

  const handleCreateInvoice = (formData: unknown) => {
    console.log('Creating admin invoice:', formData)
    setShowNewInvoiceModal(false)
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
  }

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      const invoiceId = invoice._id || invoice.id || invoice.conversationId
      if (!invoiceId) {
        throw new Error('ID fattura non disponibile')
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/invoices/${invoiceId}/pdf`, {
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

      const invoiceId = editingInvoice._id || editingInvoice.id || editingInvoice.conversationId
      if (!invoiceId) {
        throw new Error('ID fattura non disponibile')
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/invoices/${invoiceId}/amount`, {
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
    } catch (error) {
      console.error('Error updating invoice:', error)
      showToast(error instanceof Error ? error.message : 'Errore nell\'aggiornamento dell\'importo', 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleMarkAsPaid = (invoice: Invoice) => {
    console.log('Marking invoice as paid:', invoice.id)
  }

  const handleViewClientDetails = async (client: ClientWithPiva) => {
    setSelectedClientForDetails(client)
    setLoadingClientDetails(true)

    try {
      // Carica fatture del cliente dalla Fattura Elettronica API
      const invoicesResponse = await fetch(`${import.meta.env.VITE_API_URL}/admin/client/${client.id}/invoices`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json()
        setClientInvoices(invoicesData.invoices || [])
      }

      // Carica clienti del cliente (destinatari fatture)
      const clientsResponse = await fetch(`${import.meta.env.VITE_API_URL}/admin/client/${client.id}/clients`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json()
        setClientClients(clientsData.clients || [])
      }
    } catch (error) {
      console.error('Error loading client details:', error)
      showToast('Errore nel caricamento dei dettagli', 'error')
    } finally {
      setLoadingClientDetails(false)
    }
  }

  // Filter clients based on search
  const filteredClients = clientsWithPiva.filter(client => {
    if (!searchTerm) return true

    const search = searchTerm.toLowerCase()
    return (
      client.nome.toLowerCase().includes(search) ||
      client.email.toLowerCase().includes(search) ||
      client.company.toLowerCase().includes(search) ||
      client.piva.toLowerCase().includes(search) ||
      client.codiceFiscale.toLowerCase().includes(search)
    )
  })

  // Pagination calculations for clients
  const totalClientsItems = filteredClients.length
  const totalClientsPages = Math.ceil(totalClientsItems / itemsPerPage)
  const clientsStartIndex = (currentPage - 1) * itemsPerPage
  const clientsEndIndex = clientsStartIndex + itemsPerPage
  const currentClients = filteredClients.slice(clientsStartIndex, clientsEndIndex)

  // Reset to first page when search changes or when switching tabs
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, activeTab])

  return (
    <div className="space-y-6">
      {/* Statistiche */}
      <StatsGrid stats={stats} />

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`p-3 rounded-lg text-left transition-all duration-200 ${
              activeTab === 'invoices'
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2 mb-1">
              <FileText className="h-4 w-4" />
              <span className="font-medium text-sm">Fatture</span>
            </div>
            <p className={`text-xs ${activeTab === 'invoices' ? 'text-blue-100' : 'text-gray-500'}`}>
              Consulenze e transazioni
            </p>
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`p-3 rounded-lg text-left transition-all duration-200 ${
              activeTab === 'clients'
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2 mb-1">
              <Building2 className="h-4 w-4" />
              <span className="font-medium text-sm">Aziende con Fatturazione</span>
              {clientsWithPiva.length > 0 && (
                <span className={`ml-auto px-2 py-0.5 text-xs font-semibold rounded-full ${
                  activeTab === 'clients'
                    ? 'bg-white/20 text-white'
                    : 'bg-primary-100 text-primary-600'
                }`}>
                  {clientsWithPiva.length}
                </span>
              )}
            </div>
            <p className={`text-xs ${activeTab === 'clients' ? 'text-blue-100' : 'text-gray-500'}`}>
              Clienti con Fatturazione Elettronica configurata
            </p>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={activeTab === 'invoices' ? 'Cerca per numero, cliente o servizio...' : 'Cerca per nome, email, azienda o P.IVA...'}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {activeTab === 'invoices' && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'invoices' ? (
        /* Tabella Fatture */
        loading ? (
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
        )
      ) : (
        /* Tabella Clienti con P.IVA */
        loadingClients ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Caricamento clienti...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun cliente con Fatturazione trovato</h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Prova a modificare i filtri di ricerca'
                : 'I clienti con Fatturazione Elettronica configurata appariranno qui'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Azienda
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      P.IVA
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Codice Fiscale
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Regime
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Indirizzo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contatti
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">{client.company || 'N/D'}</span>
                          <span className="text-xs text-gray-500">{client.nome}</span>
                          {client.codiceAteco && (
                            <span className="text-xs text-gray-400 mt-1">ATECO: {client.codiceAteco}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono font-medium text-gray-900">{client.piva}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-600">{client.codiceFiscale || 'N/D'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{client.regimeContabile}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-sm text-gray-600">
                          {client.indirizzo && <span>{client.indirizzo}</span>}
                          {(client.cap || client.citta) && (
                            <span className="text-xs text-gray-500">
                              {client.cap} {client.citta} {client.provincia && `(${client.provincia})`}
                            </span>
                          )}
                          {!client.indirizzo && !client.cap && !client.citta && (
                            <span className="text-gray-400">N/D</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-sm">
                          <span className="text-gray-900">{client.email}</span>
                          {client.telefono && (
                            <span className="text-xs text-gray-500">+39 {client.telefono}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            client.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : client.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {client.status === 'active' ? 'Attivo' : client.status === 'pending' ? 'In attesa' : client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewClientDetails(client)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors duration-150"
                          title="Visualizza fatture e clienti"
                        >
                          <Eye className="h-4 w-4 mr-1.5" />
                          Dettagli
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="text-xs sm:text-sm text-gray-700">
                  Mostra
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-xs sm:text-sm text-gray-700 hidden sm:inline">
                  elementi per pagina
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-0 sm:space-x-2">
                <span className="text-xs sm:text-sm text-gray-700">
                  {clientsStartIndex + 1}-{Math.min(clientsEndIndex, totalClientsItems)} di {totalClientsItems}
                </span>

                <div className="flex items-center space-x-1 sm:ml-4">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 sm:p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalClientsPages }, (_, i) => i + 1)
                    .filter(page => {
                      return page === 1 ||
                             page === totalClientsPages ||
                             (page >= currentPage - 1 && page <= currentPage + 1)
                    })
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-1 sm:px-2 text-gray-400 text-xs sm:text-sm">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    ))
                  }

                  <button
                    onClick={() => setCurrentPage(Math.min(totalClientsPages, currentPage + 1))}
                    disabled={currentPage === totalClientsPages}
                    className="p-1.5 sm:p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                  >
                    <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
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

      {/* Client Details Modal */}
      {selectedClientForDetails && (
        <Modal
          isOpen={!!selectedClientForDetails}
          onClose={() => {
            setSelectedClientForDetails(null)
            setClientInvoices([])
            setClientClients([])
          }}
          title={`Profilo Fatturazione - ${selectedClientForDetails.company || selectedClientForDetails.nome}`}
          maxWidth="6xl"
        >
          <div className="space-y-6">
            {/* Header Info */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">P.IVA</p>
                  <p className="text-lg font-mono font-semibold text-gray-900">{selectedClientForDetails.piva}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Codice Fiscale</p>
                  <p className="text-lg font-mono font-semibold text-gray-900">{selectedClientForDetails.codiceFiscale || 'N/D'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Regime Contabile</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedClientForDetails.regimeContabile}</p>
                </div>
              </div>
            </div>

            {loadingClientDetails ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Caricamento dati...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fatture */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary-600" />
                    Fatture Emesse ({clientInvoices.length})
                  </h3>
                  {clientInvoices.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Nessuna fattura emessa</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {clientInvoices.map((invoice, index) => {
                        // Format date as DD/MM/YYYY
                        const formatDate = (dateStr: string) => {
                          if (!dateStr) return 'N/D'
                          const date = new Date(dateStr)
                          const day = date.getDate().toString().padStart(2, '0')
                          const month = (date.getMonth() + 1).toString().padStart(2, '0')
                          const year = date.getFullYear()
                          return `${day}/${month}/${year}`
                        }

                        return (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-gray-900">{invoice.numero || `#${invoice.id}`}</p>
                                <p className="text-xs text-gray-500">{invoice.cliente || 'Cliente'}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                invoice.status === 'paid' || invoice.status === 'consegnata' || invoice.status === 'accettata'
                                  ? 'bg-green-100 text-green-700'
                                  : invoice.status === 'sent' || invoice.status === 'inviata'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {invoice.status || 'Pending'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">{formatDate(invoice.data || invoice.dataEmissione)}</span>
                              <span className="font-bold text-primary-600">€ {(invoice.totale || invoice.importoTotaleConIVA || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Clienti (Destinatari) */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary-600" />
                    Suoi Clienti ({clientClients.length})
                  </h3>
                  {clientClients.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Nessun cliente registrato</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {clientClients.map((cliente, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{cliente.ragioneSociale || cliente.denominazione || 'N/D'}</p>
                              <p className="text-xs text-gray-500 mt-1">{cliente.email || ''}</p>
                              {cliente.partitaIva && (
                                <p className="text-xs text-gray-600 mt-1 font-mono">P.IVA: {cliente.partitaIva}</p>
                              )}
                              {cliente.indirizzo && (
                                <p className="text-xs text-gray-500 mt-1">{cliente.indirizzo}</p>
                              )}
                              {(cliente.cap || cliente.comune) && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {cliente.cap} {cliente.comune} {cliente.provincia ? `(${cliente.provincia})` : ''}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

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