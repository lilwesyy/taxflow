import { Building2, CheckCircle, Clock, AlertTriangle, Eye, MessageSquare, Download, Filter, Search, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react'
import { useState, useEffect } from 'react'
import Modal from '../../../common/Modal'
import type { SubscriptionPlan } from '../../../../types'

// Available subscription plans
const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'piva-forfettari-annual',
    stripePriceId: 'price_annual_placeholder',
    name: 'Piano Annuale',
    price: 368.90,
    originalPrice: 420.00,
    discount: 'Risparmia €51 rispetto al piano mensile',
    type: 'annual',
    interval: 'year',
    features: [
      'Setup creditizio',
      'Regime forfettario',
      'Rating optimization',
      'Adempimenti fiscali',
      'Dashboard integrata cassetto fiscale e previdenziale (INPS-INAIL)',
      'Supporto prioritario'
    ],
    description: 'Pagamento unico annuale'
  },
  {
    id: 'piva-forfettari-monthly',
    stripePriceId: 'price_monthly_placeholder',
    name: 'Piano Mensile',
    price: 35.00,
    type: 'monthly',
    interval: 'month',
    features: [
      'Setup creditizio',
      'Regime forfettario',
      'Rating optimization',
      'Adempimenti fiscali',
      'Dashboard integrata cassetto fiscale e previdenziale (INPS-INAIL)',
      'Supporto standard'
    ],
    description: 'Pagamento mensile automatico'
  }
]

export default function RichiestePiva() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [approvingRequest, setApprovingRequest] = useState<any>(null)
  const [richieste, setRichieste] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Load real P.IVA requests from backend
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:3000/api/clients/piva-requests', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setRichieste(data.requests || [])
        } else {
          console.error('Failed to fetch P.IVA requests')
        }
      } catch (error) {
        console.error('Error fetching P.IVA requests:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [])

  const closeModal = () => {
    setSelectedRequest(null)
  }

  const openApprovalModal = (request: any) => {
    setApprovingRequest(request)
    setSelectedPlan(SUBSCRIPTION_PLANS[0]) // Default to annual plan
    setShowApprovalModal(true)
  }

  const closeApprovalModal = () => {
    setShowApprovalModal(false)
    setApprovingRequest(null)
    setSelectedPlan(null)
  }

  const handleApproveWithPlan = async () => {
    if (!approvingRequest || !selectedPlan) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3000/stripe/approve-with-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: approvingRequest.id,
          planId: selectedPlan.id
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        alert(`✅ Richiesta approvata con ${selectedPlan.name}!\n\nIl cliente riceverà una notifica e dovrà completare il pagamento per attivare il servizio.`)
        closeApprovalModal()
        // Refresh page to update list
        window.location.reload()
      } else {
        alert(`❌ Errore: ${data.error || 'Impossibile approvare la richiesta'}`)
      }
    } catch (error) {
      console.error('Error approving request:', error)
      alert('❌ Errore di connessione durante l\'approvazione')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento richieste P.IVA...</p>
        </div>
      </div>
    )
  }

  // Removed mock data - now using real data from backend loaded via useEffect

  const filteredRichieste = richieste.filter(richiesta => {
    const matchesSearch = richiesta.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         richiesta.azienda.ragioneSociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         richiesta.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || richiesta.status === filterStatus
    const matchesPriority = filterPriority === 'all' || richiesta.priority === filterPriority

    return matchesSearch && matchesStatus && matchesPriority
  })

  // Pagination calculations
  const totalItems = filteredRichieste.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRichieste = filteredRichieste.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterStatus, filterPriority])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-600'
      case 'in_review': return 'bg-yellow-100 text-yellow-600'
      case 'pending': return 'bg-blue-100 text-blue-600'
      case 'rejected': return 'bg-red-100 text-red-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approvata'
      case 'in_review': return 'In revisione'
      case 'pending': return 'In attesa'
      case 'rejected': return 'Respinta'
      default: return 'Sconosciuto'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'in_review': return <Clock className="h-4 w-4" />
      case 'pending': return <AlertTriangle className="h-4 w-4" />
      case 'rejected': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const stats = [
    { title: 'Richieste Totali', value: richieste.length.toString(), icon: Building2, color: 'text-blue-600' },
    { title: 'In Revisione', value: richieste.filter(r => r.status === 'in_review').length.toString(), icon: Clock, color: 'text-yellow-600' },
    { title: 'Approvate', value: richieste.filter(r => r.status === 'approved').length.toString(), icon: CheckCircle, color: 'text-green-600' },
    { title: 'In Attesa', value: richieste.filter(r => r.status === 'pending').length.toString(), icon: AlertTriangle, color: 'text-blue-600' }
  ]

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color === 'text-blue-600' ? 'bg-blue-50' : stat.color === 'text-yellow-600' ? 'bg-yellow-50' : stat.color === 'text-green-600' ? 'bg-green-50' : 'bg-blue-50'} group-hover:scale-110 transition-transform`}>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca per nome, azienda o ID richiesta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Tutti gli stati</option>
                <option value="pending">In attesa</option>
                <option value="in_review">In revisione</option>
                <option value="approved">Approvata</option>
                <option value="rejected">Respinta</option>
              </select>
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Tutte le priorità</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Bassa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Richiesta</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Cliente</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Azienda</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Progresso</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Consulente</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentRichieste.map((richiesta) => (
                <tr key={richiesta.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="font-medium text-gray-900">{richiesta.id}</p>
                        <p className="text-sm text-gray-500">{richiesta.dataRichiesta}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{richiesta.cliente.nome}</p>
                      <p className="text-sm text-gray-500">{richiesta.cliente.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{richiesta.azienda.ragioneSociale}</p>
                      <p className="text-sm text-gray-500">{richiesta.azienda.codiceAteco}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(richiesta.status)}`}>
                        {getStatusIcon(richiesta.status)}
                        <span className="ml-1">{getStatusText(richiesta.status)}</span>
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(richiesta.priority)}`}>
                        Priorità {richiesta.priority}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${(richiesta.step / richiesta.totalSteps) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{richiesta.step}/{richiesta.totalSteps}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-900">{richiesta.consulente}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedRequest(richiesta)}
                        className="text-primary-600 hover:text-primary-700 p-1 rounded hover:bg-primary-50 hover:scale-110 transition-all duration-200"
                        title="Visualizza dettagli"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50 hover:scale-110 transition-all duration-200" title="Chat cliente">
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 hover:scale-110 transition-all duration-200" title="Scarica documenti">
                        <Download className="h-4 w-4" />
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

      {/* Request Detail Modal */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={closeModal}
        title={selectedRequest ? `${selectedRequest.id} - Richiesta apertura P.IVA forfettaria` : ""}
        maxWidth="4xl"
      >
        {selectedRequest && (
          <div className="space-y-6">
              {/* Status e Progress */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Stato Richiesta</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-3 py-1 text-sm rounded-full ${getStatusColor(selectedRequest.status)}`}>
                        {getStatusIcon(selectedRequest.status)}
                        <span className="ml-2">{getStatusText(selectedRequest.status)}</span>
                      </span>
                      <span className={`text-sm font-medium ${getPriorityColor(selectedRequest.priority)}`}>
                        Priorità {selectedRequest.priority}
                      </span>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progresso</span>
                        <span>{selectedRequest.step}/{selectedRequest.totalSteps}</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${(selectedRequest.step / selectedRequest.totalSteps) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Informazioni Generali</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data richiesta:</span>
                      <span className="text-gray-900">{selectedRequest.dataRichiesta}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ultima modifica:</span>
                      <span className="text-gray-900">{selectedRequest.dataUltimaModifica}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consulente assegnato:</span>
                      <span className="text-gray-900">{selectedRequest.consulente}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dati Cliente e Azienda */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Dati Cliente</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Nome completo</label>
                      <p className="font-medium">{selectedRequest.cliente.nome}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <p className="font-medium">{selectedRequest.cliente.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Telefono</label>
                      <p className="font-medium">{selectedRequest.cliente.telefono}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Codice fiscale</label>
                      <p className="font-medium">{selectedRequest.cliente.codiceFiscale}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Dati Azienda</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Ragione sociale</label>
                      <p className="font-medium">{selectedRequest.azienda.ragioneSociale}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Attività</label>
                      <p className="font-medium">{selectedRequest.azienda.attivita}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Codice ATECO</label>
                      <p className="font-medium">{selectedRequest.azienda.codiceAteco}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Fatturato previsto</label>
                      <p className="font-medium">€ {selectedRequest.azienda.fatturatoPrevisto.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documentazione */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Documentazione</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedRequest.documentazione.map((doc: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-900">{doc}</span>
                      </div>
                      <button className="text-green-600 hover:text-green-700 hover:scale-110 transition-all duration-200">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Note</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{selectedRequest.note}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      closeModal()
                      openApprovalModal(selectedRequest)
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approva con Piano
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 hover:scale-105 hover:shadow-lg">
                    Respingi
                  </button>
                  <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all duration-200 hover:scale-105 hover:shadow-lg">
                    Richiedi Documenti
                  </button>
                </div>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105 hover:shadow-sm">
                    Chat Cliente
                  </button>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg">
                    Salva Note
                  </button>
                </div>
              </div>
            </div>
          )}
      </Modal>

      {/* Approval with Plan Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={closeApprovalModal}
        title="Approva richiesta P.IVA con Piano Abbonamento"
        maxWidth="3xl"
      >
        {approvingRequest && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Cliente: {approvingRequest.cliente.nome}</h4>
              <p className="text-blue-700 text-sm">
                Seleziona il piano di abbonamento da assegnare al cliente. Il cliente riceverà una notifica
                e dovrà completare il pagamento per attivare il servizio.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Seleziona Piano Abbonamento</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`cursor-pointer border-2 rounded-xl p-6 transition-all duration-200 hover:shadow-lg ${
                      selectedPlan?.id === plan.id
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-bold text-lg text-gray-900">{plan.name}</h5>
                        <p className="text-sm text-gray-600">{plan.description}</p>
                      </div>
                      {selectedPlan?.id === plan.id && (
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-primary-600">€{plan.price}</span>
                        <span className="text-gray-600 ml-2">/{plan.interval === 'year' ? 'anno' : 'mese'}</span>
                      </div>
                      {plan.originalPrice && (
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-400 line-through mr-2">€{plan.originalPrice}</span>
                          <span className="text-xs text-green-600 font-medium">{plan.discount}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {plan.features.slice(0, 4).map((feature, idx) => (
                        <div key={idx} className="flex items-start text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                      {plan.features.length > 4 && (
                        <div className="text-sm text-gray-500 italic">
                          +{plan.features.length - 4} altre funzionalità
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Setup Fee Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <CreditCard className="h-5 w-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-amber-900 mb-1">Costo di Setup</h5>
                  <p className="text-sm text-amber-800">
                    Oltre all'abbonamento, verrà addebitato un costo unico di apertura P.IVA di <strong>€129,90</strong> (invece di €169,90).
                    <br />
                    <span className="text-xs">Offerta lancio valida fino al 31/12/2025</span>
                  </p>
                </div>
              </div>
            </div>

            {selectedPlan && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">Riepilogo</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Piano selezionato:</span>
                    <span className="font-medium text-gray-900">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Costo abbonamento:</span>
                    <span className="font-medium text-gray-900">€{selectedPlan.price}/{selectedPlan.interval === 'year' ? 'anno' : 'mese'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Costo setup (una tantum):</span>
                    <span className="font-medium text-gray-900">€129,90</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
                    <span className="text-gray-900 font-semibold">Primo pagamento:</span>
                    <span className="text-lg font-bold text-primary-600">€{(selectedPlan.price + 129.90).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={closeApprovalModal}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                Annulla
              </button>
              <button
                onClick={handleApproveWithPlan}
                disabled={!selectedPlan}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approva con {selectedPlan?.name || 'Piano'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}