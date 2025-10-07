import { Building2, CheckCircle, Clock, XCircle, Eye, MessageSquare, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import Modal from '../../../common/Modal'
import NoteModal from '../../../common/NoteModal'
import apiService from '../../../../services/api'
import { useToast } from '../../../../context/ToastContext'

interface PivaRequest {
  _id: string
  name: string
  email: string
  phone?: string
  pivaFormSubmitted?: boolean
  pivaApprovalStatus?: 'pending' | 'approved' | 'rejected'
  pivaRequestData?: {
    hasExistingPiva?: boolean
    existingPivaNumber?: string
    firstName: string
    lastName: string
    dateOfBirth: string
    placeOfBirth: string
    fiscalCode: string
    residenceAddress: string
    residenceCity: string
    residenceCAP: string
    residenceProvince: string
    businessActivity: string
    codiceAteco: string
    businessName?: string
    businessAddress?: string
    businessCity?: string
    businessCAP?: string
    businessProvince?: string
    expectedRevenue: number
    hasOtherIncome: boolean
    otherIncomeDetails?: string
    hasIdentityDocument: boolean
    hasFiscalCode: boolean
    additionalNotes?: string
    submittedAt: Date
  }
  createdAt: string
  updatedAt: string
  note?: string
}

export default function RichiestePivaReal() {
  const { showToast } = useToast()
  const [requests, setRequests] = useState<PivaRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<PivaRequest | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [actionLoading, setActionLoading] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ userId: string; approved: boolean } | null>(null)
  const [totalClients, setTotalClients] = useState(0)

  useEffect(() => {
    fetchRequests()
    fetchTotalClients()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await apiService.getPivaRequests()

      if (response.success) {
        setRequests(response.requests)
      }
    } catch (error) {
      console.error('Error fetching P.IVA requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTotalClients = async () => {
    try {
      const response = await apiService.getClients()
      if (response.success) {
        setTotalClients(response.clients.length)
      }
    } catch (error) {
      console.error('Error fetching clients count:', error)
    }
  }

  const handleApproveClick = (userId: string, approved: boolean) => {
    if (approved) {
      // Se approva, esegue direttamente l'approvazione
      handleApprovePending(userId)
    } else {
      // Se respinge, mostra il modale delle note
      setPendingAction({ userId, approved })
      setShowNoteModal(true)
    }
  }

  const handleApprovePending = async (userId: string) => {
    try {
      setActionLoading(true)
      const response = await apiService.approvePivaRequest(userId, true)

      if (response.success) {
        await fetchRequests()
        setSelectedRequest(null)
        showToast('Utente approvato! Il cliente può ora scegliere il piano e completare il pagamento.', 'success')
      }
    } catch (error) {
      console.error('Error approving request:', error)
      showToast(error instanceof Error ? error.message : 'Errore durante l\'approvazione', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmReject = async (note: string) => {
    if (!pendingAction) return

    try {
      setActionLoading(true)
      const response = await apiService.approvePivaRequest(
        pendingAction.userId,
        false,
        note || undefined
      )

      if (response.success) {
        await fetchRequests()
        setSelectedRequest(null)
        showToast('Utente respinto', 'success')
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      showToast(error instanceof Error ? error.message : 'Errore durante il rifiuto', 'error')
    } finally {
      setActionLoading(false)
      setPendingAction(null)
    }
  }

  const closeModal = () => {
    setSelectedRequest(null)
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch =
      request.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.pivaRequestData?.fiscalCode?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || request.pivaApprovalStatus === filterStatus

    return matchesSearch && matchesStatus
  })

  // Pagination calculations
  const totalItems = filteredRequests.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRequests = filteredRequests.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterStatus])

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-600'
      case 'pending': return 'bg-yellow-100 text-yellow-600'
      case 'rejected': return 'bg-red-100 text-red-600'
      default: return 'bg-yellow-100 text-yellow-600' // Default to pending
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'approved': return 'Approvata'
      case 'pending': return 'In attesa'
      case 'rejected': return 'Respinta'
      default: return 'In attesa'
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT')
  }

  const stats = [
    { title: 'Richieste Totali', value: requests.length.toString(), icon: Building2, color: 'text-blue-600' },
    { title: 'In Attesa', value: requests.filter(r => r.pivaApprovalStatus === 'pending' || !r.pivaApprovalStatus).length.toString(), icon: Clock, color: 'text-yellow-600' },
    { title: 'Approvate', value: totalClients.toString(), icon: CheckCircle, color: 'text-green-600' },
    { title: 'Respinte', value: requests.filter(r => r.pivaApprovalStatus === 'rejected').length.toString(), icon: XCircle, color: 'text-red-600' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color === 'text-blue-600' ? 'bg-blue-50' : stat.color === 'text-yellow-600' ? 'bg-yellow-50' : stat.color === 'text-green-600' ? 'bg-green-50' : 'bg-red-50'} group-hover:scale-110 transition-transform`}>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca per nome, email o codice fiscale..."
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
                <option value="approved">Approvata</option>
                <option value="rejected">Respinta</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Cliente</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Codice Fiscale</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Attività</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Fatturato Previsto</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Data Richiesta</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Nessuna richiesta trovata
                  </td>
                </tr>
              ) : (
                currentRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{request.name}</p>
                        <p className="text-sm text-gray-500">{request.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-900">{request.pivaRequestData?.fiscalCode || '-'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm text-gray-900">{request.pivaRequestData?.businessActivity || '-'}</p>
                        <p className="text-xs text-gray-500">{request.pivaRequestData?.codiceAteco || '-'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-900">
                        {request.pivaRequestData?.expectedRevenue
                          ? `€ ${request.pivaRequestData.expectedRevenue.toLocaleString()}`
                          : '-'}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(request.pivaApprovalStatus)}`}>
                        {getStatusIcon(request.pivaApprovalStatus)}
                        <span className="ml-1">{getStatusText(request.pivaApprovalStatus)}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-900">{formatDate(request.createdAt)}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="text-primary-600 hover:text-primary-700 p-1 rounded hover:bg-primary-50 transition-all"
                          title="Visualizza dettagli"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalItems > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Mostra</span>
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
              <span className="text-sm text-gray-700">elementi per pagina</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                {startIndex + 1}-{Math.min(endIndex, totalItems)} di {totalItems} elementi
              </span>

              <div className="flex items-center space-x-1 ml-4">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

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
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Request Detail Modal */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={closeModal}
        title={selectedRequest ? `Richiesta apertura P.IVA - ${selectedRequest.name}` : ""}
        maxWidth="6xl"
      >
        {selectedRequest && selectedRequest.pivaRequestData && (
          <div className="space-y-6">
            {/* Header with Client Info */}
            <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedRequest.name}</h2>
                      <p className="text-blue-100 mt-1">{selectedRequest.email}</p>
                      {selectedRequest.phone && (
                        <p className="text-blue-100 text-sm mt-0.5">+39 {selectedRequest.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl ${
                      selectedRequest.pivaApprovalStatus === 'approved'
                        ? 'bg-green-500/20 text-green-100 border border-green-400/30'
                        : selectedRequest.pivaApprovalStatus === 'rejected'
                        ? 'bg-red-500/20 text-red-100 border border-red-400/30'
                        : 'bg-yellow-500/20 text-yellow-100 border border-yellow-400/30'
                    }`}>
                      {getStatusIcon(selectedRequest.pivaApprovalStatus)}
                      <span className="ml-2">{getStatusText(selectedRequest.pivaApprovalStatus)}</span>
                    </span>
                    <div className="text-sm text-blue-100">
                      <span>Richiesta: {formatDate(selectedRequest.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-blue-200 text-sm">Codice Fiscale</p>
                    <p className="text-white font-semibold mt-1">{selectedRequest.pivaRequestData.fiscalCode}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-blue-200 text-sm">Fatturato Previsto</p>
                    <p className="text-white font-semibold mt-1">€ {selectedRequest.pivaRequestData.expectedRevenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-blue-200 text-sm">Codice ATECO</p>
                    <p className="text-white font-semibold mt-1">{selectedRequest.pivaRequestData.codiceAteco}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs or Sections */}
            <div className="grid grid-cols-2 gap-6">
              {/* Dati Anagrafici Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Dati Anagrafici</h4>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</label>
                      <p className="mt-1 text-sm font-medium text-gray-900">{selectedRequest.pivaRequestData.firstName}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cognome</label>
                      <p className="mt-1 text-sm font-medium text-gray-900">{selectedRequest.pivaRequestData.lastName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Data di Nascita</label>
                      <p className="mt-1 text-sm font-medium text-gray-900">{selectedRequest.pivaRequestData.dateOfBirth}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Luogo di Nascita</label>
                      <p className="mt-1 text-sm font-medium text-gray-900">{selectedRequest.pivaRequestData.placeOfBirth}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Residenza Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Residenza</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Indirizzo</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">{selectedRequest.pivaRequestData.residenceAddress}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Città</label>
                      <p className="mt-1 text-sm font-medium text-gray-900">{selectedRequest.pivaRequestData.residenceCity}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">CAP</label>
                      <p className="mt-1 text-sm font-medium text-gray-900">{selectedRequest.pivaRequestData.residenceCAP}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Provincia</label>
                      <p className="mt-1 text-sm font-medium text-gray-900">{selectedRequest.pivaRequestData.residenceProvince}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attività Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Dati Attività</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Descrizione Attività</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">{selectedRequest.pivaRequestData.businessActivity}</p>
                  </div>
                  {selectedRequest.pivaRequestData.businessName && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nome Attività</label>
                      <p className="mt-1 text-sm font-medium text-gray-900">{selectedRequest.pivaRequestData.businessName}</p>
                    </div>
                  )}
                  {selectedRequest.pivaRequestData.businessAddress && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sede Attività</label>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {selectedRequest.pivaRequestData.businessAddress}, {selectedRequest.pivaRequestData.businessCity} {selectedRequest.pivaRequestData.businessCAP}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informazioni Fiscali Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-orange-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Informazioni Fiscali</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Altri Redditi</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {selectedRequest.pivaRequestData.hasOtherIncome ? 'Sì' : 'No'}
                    </p>
                  </div>
                  {selectedRequest.pivaRequestData.hasOtherIncome && selectedRequest.pivaRequestData.otherIncomeDetails && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dettagli Altri Redditi</label>
                      <p className="mt-1 text-sm font-medium text-gray-900">{selectedRequest.pivaRequestData.otherIncomeDetails}</p>
                    </div>
                  )}
                  {selectedRequest.pivaRequestData.hasExistingPiva && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">P.IVA Esistente</label>
                      <p className="mt-1 text-sm font-medium text-gray-900">{selectedRequest.pivaRequestData.existingPivaNumber || 'Sì'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Note Section */}
            {(selectedRequest.pivaRequestData.additionalNotes || selectedRequest.note) && (
              <div className="space-y-4">
                {selectedRequest.pivaRequestData.additionalNotes && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <div className="flex items-center space-x-2 mb-3">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Note del Cliente</h4>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{selectedRequest.pivaRequestData.additionalNotes}</p>
                  </div>
                )}

                {selectedRequest.note && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                    <div className="flex items-center space-x-2 mb-3">
                      <MessageSquare className="h-5 w-5 text-amber-600" />
                      <h4 className="font-semibold text-gray-900">Note Amministratore</h4>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{selectedRequest.note}</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            {(selectedRequest.pivaApprovalStatus === 'pending' || !selectedRequest.pivaApprovalStatus) && (
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleApproveClick(selectedRequest._id, false)}
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
                >
                  {actionLoading ? 'Elaborazione...' : 'Respingi Richiesta'}
                </button>
                <button
                  onClick={() => handleApproveClick(selectedRequest._id, true)}
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
                >
                  {actionLoading ? 'Elaborazione...' : 'Approva Richiesta'}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Note Modal */}
      <NoteModal
        isOpen={showNoteModal}
        onClose={() => {
          setShowNoteModal(false)
          setPendingAction(null)
        }}
        onConfirm={handleConfirmReject}
        title="Motivo del rifiuto"
        placeholder="Motivo del rifiuto (opzionale)..."
        confirmButtonText="Respingi"
        confirmButtonColor="red"
      />

    </div>
  )
}
