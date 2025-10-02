import { Users, Search, Filter, Eye, MessageSquare, Phone, MoreVertical, Building2, Calendar, DollarSign, ChevronLeft, ChevronRight, FileText, Euro, Clock, AlertTriangle, Building, Mail, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import Modal from '../../../common/Modal'
import apiService from '../../../../services/api'

interface GestioneClientiProps {
  onSectionChange?: (section: string) => void
}

export default function GestioneClienti({ onSectionChange }: GestioneClientiProps = {}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterRegime, setFilterRegime] = useState('all')
  const [filterActivity, setFilterActivity] = useState('all')
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [clienti, setClienti] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const closeModal = () => {
    setSelectedClient(null)
  }

  const handleChatClick = () => {
    if (onSectionChange) {
      onSectionChange('consulenze')
    }
  }

  // Load clients from API
  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiService.getClients()
        if (response.success) {
          setClienti(response.clients)
        }
      } catch (err: any) {
        console.error('Error loading clients:', err)
        setError(err.message || 'Errore nel caricamento dei clienti')
      } finally {
        setLoading(false)
      }
    }

    loadClients()
  }, [])

  // Helper function to format date
  const formatDate = (date: Date | string) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  // Helper function to format time ago
  const formatTimeAgo = (date: Date | string) => {
    if (!date) return 'Mai'
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)

    if (diffMins < 60) return `${diffMins} minuti fa`
    if (diffHours < 24) return `${diffHours} ore fa`
    if (diffDays < 7) return `${diffDays} giorni fa`
    return `${diffWeeks} settimane fa`
  }

  const clientiWithFormattedDates = clienti.map(cliente => ({
    ...cliente,
    dataRegistrazione: formatDate(cliente.dataRegistrazione),
    ultimaAttivita: formatTimeAgo(cliente.ultimaAttivita)
  }))

  const filteredClienti = clientiWithFormattedDates.filter(cliente => {
    const matchesSearch = cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || cliente.status === filterStatus
    const matchesRegime = filterRegime === 'all' || (cliente.regimeContabile || 'Forfettario') === filterRegime
    const matchesActivity = filterActivity === 'all' ||
                           (filterActivity === 'recent' && cliente.ultimaAttivita.includes('ore fa')) ||
                           (filterActivity === 'week' && (cliente.ultimaAttivita.includes('giorni fa') || cliente.ultimaAttivita.includes('ore fa'))) ||
                           (filterActivity === 'old' && cliente.ultimaAttivita.includes('settimane fa'))

    return matchesSearch && matchesStatus && matchesRegime && matchesActivity
  })

  // Pagination calculations
  const totalItems = filteredClienti.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentClienti = filteredClienti.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterStatus, filterRegime, filterActivity])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-600'
      case 'pending': return 'bg-yellow-100 text-yellow-600'
      case 'new': return 'bg-blue-100 text-blue-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Attivo'
      case 'pending': return 'In attesa'
      case 'new': return 'Nuovo'
      default: return 'Sconosciuto'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Caricamento clienti...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Ricarica
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 group-hover:scale-110 transition-transform">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Totale Clienti</p>
              <p className="text-2xl font-bold text-gray-900">{clientiWithFormattedDates.length}</p>
            </div>
          </div>
        </div>
        <div className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50 group-hover:scale-110 transition-transform">
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Attivi</p>
              <p className="text-2xl font-bold text-gray-900">{clientiWithFormattedDates.filter(c => c.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-50 group-hover:scale-110 transition-transform">
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">In Attesa</p>
              <p className="text-2xl font-bold text-gray-900">{clientiWithFormattedDates.filter(c => c.status === 'pending').length}</p>
            </div>
          </div>
        </div>
        <div className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50 group-hover:scale-110 transition-transform">
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Fatturato Tot.</p>
              <p className="text-2xl font-bold text-gray-900">€ {clientiWithFormattedDates.reduce((sum, c) => sum + (c.fatturato || 0), 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca clienti per nome, azienda o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm min-w-[120px]"
              >
                <option value="all">Tutti gli stati</option>
                <option value="active">Attivo</option>
                <option value="pending">In attesa</option>
                <option value="new">Nuovo</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              <select
                value={filterRegime}
                onChange={(e) => setFilterRegime(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm min-w-[130px]"
              >
                <option value="all">Tutti i regimi</option>
                <option value="Forfettario">Forfettario</option>
                <option value="Ordinario">Ordinario</option>
                <option value="Semplificato">Semplificato</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <select
                value={filterActivity}
                onChange={(e) => setFilterActivity(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm min-w-[140px]"
              >
                <option value="all">Tutta l'attività</option>
                <option value="recent">Recente (ore)</option>
                <option value="week">Questa settimana</option>
                <option value="old">Più vecchia</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span>
                {filteredClienti.length} clienti
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Cliente</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Azienda</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">P.IVA</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Fatturato</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Ultima Attività</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentClienti.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <Users className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{cliente.nome}</p>
                        <p className="text-sm text-gray-500">{cliente.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-gray-900">{cliente.company}</p>
                    <p className="text-sm text-gray-500">{cliente.codiceAteco}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(cliente.status)}`}>
                      {getStatusText(cliente.status)}
                    </span>
                    {cliente.pendingRequests > 0 && (
                      <p className="text-xs text-orange-600 mt-1">{cliente.pendingRequests} richieste</p>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-gray-900">{cliente.piva}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-gray-900">€ {cliente.fatturato.toLocaleString()}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-600">{cliente.ultimaAttivita}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedClient(cliente)}
                        className="text-primary-600 hover:text-primary-700 p-1 rounded hover:bg-primary-50 hover:scale-110 transition-all duration-200"
                        title="Visualizza dettagli"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleChatClick}
                        className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50 hover:scale-110 transition-all duration-200" title="Chat"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 hover:scale-110 transition-all duration-200" title="Chiama">
                        <Phone className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-700 p-1 rounded hover:bg-gray-50 hover:scale-110 transition-all duration-200">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Mostra
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-700">
              elementi per pagina
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              {startIndex + 1}-{Math.min(endIndex, totalItems)} di {totalItems} elementi
            </span>

            <div className="flex items-center space-x-1 ml-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  return page === 1 ||
                         page === totalPages ||
                         (page >= currentPage - 1 && page <= currentPage + 1)
                })
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
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
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Client Detail Modal */}
      <Modal
        isOpen={!!selectedClient}
        onClose={closeModal}
        title={`Dettagli Cliente - ${selectedClient?.nome}`}
        maxWidth="6xl"
      >
        {selectedClient && (
          <div className="space-y-6">
            {/* Header con avatar e info principali */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedClient.nome}</h3>
                    <p className="text-primary-600 font-medium">{selectedClient.company}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {selectedClient.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {selectedClient.telefono}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedClient.status === 'active' ? 'bg-green-100 text-green-700' :
                    selectedClient.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedClient.status === 'active' ? 'Attivo' :
                     selectedClient.status === 'pending' ? 'In Attesa' : 'Inattivo'}
                  </span>
                  <p className="text-sm text-gray-500 mt-2">Cliente dal {selectedClient.dataRegistrazione}</p>
                </div>
              </div>
            </div>

            {/* Statistiche principali */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{selectedClient.consulenze}</p>
                <p className="text-sm text-gray-600">Consulenze</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <Euro className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">€{selectedClient.fatturato.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Fatturato Anno</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{selectedClient.documentiForniti || 15}</p>
                <p className="text-sm text-gray-600">Documenti</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="w-8 h-8 bg-orange-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{selectedClient.pendingRequests}</p>
                <p className="text-sm text-gray-600">Richieste Aperte</p>
              </div>
            </div>

            {/* Contenuto principale */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Colonna sinistra - Informazioni */}
              <div className="space-y-6">

                {/* Dati Personali */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary-600" />
                    Dati Personali
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Codice Fiscale:</span>
                      <span className="text-sm font-medium">{selectedClient.codiceFiscale}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Indirizzo:</span>
                      <span className="text-sm font-medium text-right">{selectedClient.indirizzo}</span>
                    </div>
                  </div>
                </div>

                {/* Dati Aziendali */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-primary-600" />
                    Dati Aziendali
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">P.IVA:</span>
                      <span className="text-sm font-medium">{selectedClient.piva}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Codice ATECO:</span>
                      <span className="text-sm font-medium">{selectedClient.codiceAteco}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Regime Contabile:</span>
                      <span className="text-sm font-medium">{selectedClient.regimeContabile || 'Forfettario'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Aliquota IVA:</span>
                      <span className="text-sm font-medium">{selectedClient.aliquotaIva || '5%'}</span>
                    </div>
                  </div>
                </div>

                {/* Stato Fiscale */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary-600" />
                    Stato Fiscale
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-lg font-bold text-green-600">{selectedClient.fatturePagate || 8}</p>
                      <p className="text-xs text-green-700">Fatture Pagate</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-lg font-bold text-yellow-600">{selectedClient.fattureInAttesa || 2}</p>
                      <p className="text-xs text-yellow-700">In Attesa</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-700">Prossima Scadenza Tasse:</span>
                      <span className="text-sm font-bold text-red-800">{selectedClient.prossimaTasse ? formatDate(selectedClient.prossimaTasse) : 'Non impostata'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonna destra - Attività */}
              <div className="space-y-6">

                {/* Attività Recenti */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary-600" />
                    Attività Recenti
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {(selectedClient.attivitaRecenti && selectedClient.attivitaRecenti.length > 0) ? (
                      selectedClient.attivitaRecenti.map((attivita: any, index: number) => (
                        <div key={index} className="border-l-2 border-primary-200 pl-4 pb-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">{attivita.action}</p>
                            <span className="text-xs text-gray-500">{formatDate(attivita.date)}</span>
                          </div>
                          <p className="text-sm text-gray-600">{attivita.detail}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">Nessuna attività recente</p>
                    )}
                  </div>
                </div>

                {/* Note del Consulente */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary-600" />
                    Note del Consulente
                  </h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      {selectedClient.note || 'Cliente affidabile, sempre puntuale nei pagamenti. Richiede assistenza principalmente per gestione IVA trimestrale.'}
                    </p>
                  </div>
                  <div className="mt-3">
                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      + Aggiungi nota
                    </button>
                  </div>
                </div>

                {/* Azioni Rapide */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Azioni Rapide</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="p-3 border border-primary-200 text-primary-600 rounded-lg hover:bg-primary-50 transition-all duration-200 text-sm font-medium flex items-center justify-center hover:scale-105 hover:shadow-sm">
                      <Phone className="h-4 w-4 mr-2" />
                      Chiama Cliente
                    </button>
                    <button
                      onClick={handleChatClick}
                      className="p-3 border border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-all duration-200 text-sm font-medium flex items-center justify-center hover:scale-105 hover:shadow-sm"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Invia Messaggio
                    </button>
                    <button className="p-3 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 text-sm font-medium flex items-center justify-center hover:scale-105 hover:shadow-sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Crea Fattura
                    </button>
                    <button className="p-3 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-all duration-200 text-sm font-medium flex items-center justify-center hover:scale-105 hover:shadow-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Prenota Call
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer con azioni principali */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button className="px-6 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-all duration-200 hover:scale-105 hover:shadow-sm">
                Modifica Cliente
              </button>
              <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg">
                Avvia Consulenza
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}