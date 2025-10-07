import { Briefcase, Eye, Search, Filter, AlertTriangle, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import Modal from '../../../common/Modal'
import { useToast } from '../../../../context/ToastContext'

interface PurchasedService {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
  }
  serviceType: string
  status: 'pending' | 'in_progress' | 'completed'
  amountPaid: number
  purchasedAt: string
  completedAt?: string
  completedBy?: {
    name: string
  }
  businessPlanContent?: {
    executiveSummary: string
    objective: string
    marketAnalysis: string
    timeSeriesForecasting?: string
    budgetSimulation?: string
    alertsAndWarnings?: string
    pdfUrl?: string
  }
}

export default function BusinessPlans() {
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedService, setSelectedService] = useState<PurchasedService | null>(null)
  const [services, setServices] = useState<PurchasedService[]>([])
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [formData, setFormData] = useState({
    executiveSummary: '',
    objective: '',
    marketAnalysis: '',
    timeSeriesForecasting: '',
    budgetSimulation: '',
    alertsAndWarnings: '',
    pdfUrl: ''
  })

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/services/get-services?serviceType=business_plan`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }

      const data = await response.json()
      setServices(data.services || [])
    } catch (error) {
      console.error('Error loading services:', error)
      showToast('Errore nel caricamento dei business plan', 'error')
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    setSelectedService(null)
    setFormData({
      executiveSummary: '',
      objective: '',
      marketAnalysis: '',
      timeSeriesForecasting: '',
      budgetSimulation: '',
      alertsAndWarnings: '',
      pdfUrl: ''
    })
  }

  const handleViewService = (service: PurchasedService) => {
    setSelectedService(service)

    // Load existing content if available
    if (service.businessPlanContent) {
      setFormData({
        executiveSummary: service.businessPlanContent.executiveSummary || '',
        objective: service.businessPlanContent.objective || '',
        marketAnalysis: service.businessPlanContent.marketAnalysis || '',
        timeSeriesForecasting: service.businessPlanContent.timeSeriesForecasting || '',
        budgetSimulation: service.businessPlanContent.budgetSimulation || '',
        alertsAndWarnings: service.businessPlanContent.alertsAndWarnings || '',
        pdfUrl: service.businessPlanContent.pdfUrl || ''
      })
    } else {
      setFormData({
        executiveSummary: '',
        objective: '',
        marketAnalysis: '',
        timeSeriesForecasting: '',
        budgetSimulation: '',
        alertsAndWarnings: '',
        pdfUrl: ''
      })
    }
  }

  const handleUpdateStatus = async (status: 'pending' | 'in_progress' | 'completed') => {
    if (!selectedService) return

    try {
      setIsUpdating(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/services/update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId: selectedService._id,
          status
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Errore nell\'aggiornamento dello stato')
      }

      showToast('Stato aggiornato con successo!', 'success')
      await loadServices()

      // Update selectedService
      const updatedService = { ...selectedService, status }
      setSelectedService(updatedService)
    } catch (error) {
      console.error('Error updating status:', error)
      showToast(error instanceof Error ? error.message : 'Errore nell\'aggiornamento dello stato', 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCompleteService = async () => {
    if (!selectedService) return

    // Validate required fields
    if (!formData.executiveSummary || !formData.objective || !formData.marketAnalysis) {
      showToast('Compila almeno Executive Summary, Obiettivo e Analisi di Mercato', 'error')
      return
    }

    try {
      setIsUpdating(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/services/complete-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId: selectedService._id,
          content: formData,
          pdfUrl: formData.pdfUrl
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Errore nel completamento del servizio')
      }

      showToast('Business Plan completato con successo!', 'success')
      await loadServices()
      closeModal()
    } catch (error) {
      console.error('Error completing service:', error)
      showToast(error instanceof Error ? error.message : 'Errore nel completamento del servizio', 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.userId.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || service.status === filterStatus

    return matchesSearch && matchesStatus
  })

  // Pagination calculations
  const totalItems = filteredServices.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentServices = filteredServices.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterStatus])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-600'
      case 'in_progress': return 'bg-yellow-100 text-yellow-600'
      case 'pending': return 'bg-blue-100 text-blue-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completato'
      case 'in_progress': return 'In corso'
      case 'pending': return 'In attesa'
      default: return 'Sconosciuto'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4" />
      case 'pending': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const stats = [
    { title: 'Business Plan Totali', value: services.length.toString(), icon: Briefcase, color: 'text-blue-600' },
    { title: 'Completati', value: services.filter(s => s.status === 'completed').length.toString(), icon: CheckCircle, color: 'text-green-600' },
    { title: 'In Corso', value: services.filter(s => s.status === 'in_progress').length.toString(), icon: Clock, color: 'text-yellow-600' },
    { title: 'In Attesa', value: services.filter(s => s.status === 'pending').length.toString(), icon: AlertTriangle, color: 'text-blue-600' }
  ]

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color === 'text-blue-600' ? 'bg-blue-50' : stat.color === 'text-green-600' ? 'bg-green-50' : 'bg-yellow-50'} group-hover:scale-110 transition-transform`}>
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
                placeholder="Cerca per cliente o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Tutti gli stati</option>
              <option value="pending">In attesa</option>
              <option value="in_progress">In corso</option>
              <option value="completed">Completato</option>
            </select>
          </div>
        </div>
      </div>

      {/* Services Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento business plan...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun business plan trovato</h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'all'
              ? 'Prova a modificare i filtri di ricerca'
              : 'I business plan acquistati appariranno qui'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Cliente</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Email</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Importo</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Data Acquisto</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentServices.map((service) => (
                  <tr key={service._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 text-blue-600 mr-2" />
                        <p className="font-medium text-gray-900">{service.userId.name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-600">{service.userId.email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-semibold text-blue-600">€{(service.amountPaid / 100).toFixed(2)}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-600">
                        {new Date(service.purchasedAt).toLocaleDateString('it-IT')}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(service.status)}`}>
                        {getStatusIcon(service.status)}
                        <span className="ml-1">{getStatusText(service.status)}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleViewService(service)}
                        className="text-primary-600 hover:text-primary-700 p-1 rounded hover:bg-primary-50 hover:scale-110 transition-all duration-200"
                        title="Visualizza dettagli"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
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
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
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
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {renderOverviewTab()}

      {/* Service Detail Modal */}
      <Modal
        isOpen={!!selectedService}
        onClose={closeModal}
        title={selectedService ? `Business Plan - ${selectedService.userId.name}` : ""}
        maxWidth="4xl"
      >
        {selectedService && (
          <div className="space-y-6">
            {/* Client Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-xl">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Cliente</p>
                <p className="font-medium text-gray-900">{selectedService.userId.name}</p>
                <p className="text-xs text-gray-500">{selectedService.userId.email}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span className={`inline-flex items-center px-3 py-1 text-sm rounded-full ${getStatusColor(selectedService.status)}`}>
                  {getStatusIcon(selectedService.status)}
                  <span className="ml-2">{getStatusText(selectedService.status)}</span>
                </span>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Importo Pagato</p>
                <p className="font-semibold text-blue-600">€{(selectedService.amountPaid / 100).toFixed(2)}</p>
              </div>
            </div>

            {/* Status Actions */}
            {selectedService.status !== 'completed' && (
              <div className="flex space-x-3">
                {selectedService.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus('in_progress')}
                    disabled={isUpdating}
                    className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50"
                  >
                    <Clock className="h-4 w-4 inline mr-2" />
                    Inizia Lavorazione
                  </button>
                )}
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Contenuto Business Plan</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Executive Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.executiveSummary}
                  onChange={(e) => setFormData({ ...formData, executiveSummary: e.target.value })}
                  rows={4}
                  disabled={selectedService.status === 'completed'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Sintesi esecutiva del business plan..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Obiettivi <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  rows={3}
                  disabled={selectedService.status === 'completed'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Obiettivi principali del business..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Analisi di Mercato <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.marketAnalysis}
                  onChange={(e) => setFormData({ ...formData, marketAnalysis: e.target.value })}
                  rows={4}
                  disabled={selectedService.status === 'completed'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Analisi del mercato di riferimento..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Series Forecasting
                </label>
                <textarea
                  value={formData.timeSeriesForecasting}
                  onChange={(e) => setFormData({ ...formData, timeSeriesForecasting: e.target.value })}
                  rows={3}
                  disabled={selectedService.status === 'completed'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Previsioni temporali e trend..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Simulazione Budget
                </label>
                <textarea
                  value={formData.budgetSimulation}
                  onChange={(e) => setFormData({ ...formData, budgetSimulation: e.target.value })}
                  rows={3}
                  disabled={selectedService.status === 'completed'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Simulazione finanziaria e budget..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert e Avvisi
                </label>
                <textarea
                  value={formData.alertsAndWarnings}
                  onChange={(e) => setFormData({ ...formData, alertsAndWarnings: e.target.value })}
                  rows={2}
                  disabled={selectedService.status === 'completed'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Avvisi importanti e note..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL PDF (opzionale)
                </label>
                <input
                  type="url"
                  value={formData.pdfUrl}
                  onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                  disabled={selectedService.status === 'completed'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="https://example.com/business-plan.pdf"
                />
              </div>
            </div>

            {/* Actions */}
            {selectedService.status !== 'completed' && (
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  disabled={isUpdating}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Annulla
                </button>
                <button
                  onClick={handleCompleteService}
                  disabled={isUpdating || !formData.executiveSummary || !formData.objective || !formData.marketAnalysis}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Pubblicazione...' : 'Completa e Pubblica'}
                </button>
              </div>
            )}

            {selectedService.status === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="font-semibold text-green-900">Business Plan Completato</p>
                    <p className="text-sm text-green-700">
                      Completato il {selectedService.completedAt && new Date(selectedService.completedAt).toLocaleDateString('it-IT')}
                      {selectedService.completedBy && ` da ${selectedService.completedBy.name}`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
