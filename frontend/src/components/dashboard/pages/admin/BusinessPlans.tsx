import { Briefcase, Eye, Search, Filter, AlertTriangle, CheckCircle, Clock, ChevronLeft, ChevronRight, X, User, Pause, Play } from 'lucide-react'
import { useState, useEffect } from 'react'
import Modal from '../../../common/Modal'
import { useToast } from '../../../../context/ToastContext'
import BusinessPlanEditor from './BusinessPlanEditor'

const MAX_OPEN_TABS = 4

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
  assignedToConsultant?: {
    _id: string
    name: string
    email: string
  }
  businessPlanContent?: {
    creationMode?: 'ai' | 'template' | 'scratch'
    executiveSummary?: string
    idea?: string
    businessModel?: string
    marketAnalysis?: string
    team?: string
    roadmap?: string
    financialPlan?: string
    revenueProjections?: string
    customSections?: Array<{
      id: string
      title: string
      content: string
    }>
    // Legacy fields (manteniamo per retrocompatibilità)
    objective?: string
    timeSeriesForecasting?: string
    budgetSimulation?: string
    alertsAndWarnings?: string
    pdfUrl?: string
  }
}

type ActiveTab = 'overview' | string // 'overview' or service._id

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

  // Tab management - basato su dati da server (assignedToConsultant)
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [currentUserId, setCurrentUserId] = useState<string>('')

  // Form data for each tab - now supports new structure
  const [tabFormData, setTabFormData] = useState<Record<string, any>>({})

  const [formData, setFormData] = useState<any>({
    creationMode: undefined,
    executiveSummary: '',
    idea: '',
    businessModel: '',
    marketAnalysis: '',
    team: '',
    roadmap: '',
    financialPlan: '',
    revenueProjections: '',
    customSections: []
  })

  useEffect(() => {
    // Get current user ID from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    // AuthContext stores it as 'id', not '_id'
    setCurrentUserId(user.id || user._id || '')

    loadServices()
  }, [])

  // Initialize form data for in_progress services assigned to current consultant
  useEffect(() => {
    if (loading || !currentUserId) return

    // Initialize form data for services assigned to this consultant
    services.filter(s =>
      s.status === 'in_progress' &&
      s.assignedToConsultant?._id?.toString() === currentUserId.toString()
    ).forEach(service => {
      if (!tabFormData[service._id]) {
        setTabFormData(prev => ({
          ...prev,
          [service._id]: {
            creationMode: service.businessPlanContent?.creationMode,
            executiveSummary: service.businessPlanContent?.executiveSummary || '',
            idea: service.businessPlanContent?.idea || '',
            businessModel: service.businessPlanContent?.businessModel || '',
            marketAnalysis: service.businessPlanContent?.marketAnalysis || '',
            team: service.businessPlanContent?.team || '',
            roadmap: service.businessPlanContent?.roadmap || '',
            financialPlan: service.businessPlanContent?.financialPlan || '',
            revenueProjections: service.businessPlanContent?.revenueProjections || '',
            customSections: service.businessPlanContent?.customSections || []
          }
        }))
      }
    })

    // Remove form data for services that are no longer assigned to this consultant
    Object.keys(tabFormData).forEach(serviceId => {
      const service = services.find(s => s._id === serviceId)
      if (!service || service.status === 'completed' || service.assignedToConsultant?._id?.toString() !== currentUserId.toString()) {
        setTabFormData(prev => {
          const newData = { ...prev }
          delete newData[serviceId]
          return newData
        })
      }
    })

    // Validate active tab - switch to overview if no longer valid
    if (activeTab !== 'overview' && services.length > 0) {
      const activeService = services.find(s => s._id === activeTab)
      if (!activeService || activeService.status === 'completed' || activeService.assignedToConsultant?._id?.toString() !== currentUserId.toString()) {
        setActiveTab('overview')
      }
    }
  }, [services, loading, currentUserId, activeTab, tabFormData])

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
      creationMode: undefined,
      executiveSummary: '',
      idea: '',
      businessModel: '',
      marketAnalysis: '',
      team: '',
      roadmap: '',
      financialPlan: '',
      revenueProjections: '',
      customSections: []
    })
  }

  const handleViewService = (service: PurchasedService) => {
    // If service is completed, open modal to view
    if (service.status === 'completed') {
      setSelectedService(service)
      if (service.businessPlanContent) {
        setFormData({
          creationMode: service.businessPlanContent.creationMode,
          executiveSummary: service.businessPlanContent.executiveSummary || '',
          idea: service.businessPlanContent.idea || '',
          businessModel: service.businessPlanContent.businessModel || '',
          marketAnalysis: service.businessPlanContent.marketAnalysis || '',
          team: service.businessPlanContent.team || '',
          roadmap: service.businessPlanContent.roadmap || '',
          financialPlan: service.businessPlanContent.financialPlan || '',
          revenueProjections: service.businessPlanContent.revenueProjections || '',
          customSections: service.businessPlanContent.customSections || []
        })
      }
      return
    }

    // If pending, open modal to start
    if (service.status === 'pending') {
      setSelectedService(service)
      return
    }

    // If in_progress, switch to that tab
    if (service.status === 'in_progress') {
      setActiveTab(service._id)
    }
  }

  const handleStartWork = async (service: PurchasedService) => {
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
          serviceId: service._id,
          status: 'in_progress'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 409) {
          // Another consultant is already working on this
          showToast(error.error || 'Un altro consulente sta già lavorando su questo business plan', 'error')
          return
        }
        throw new Error(error.error || 'Errore nell\'aggiornamento dello stato')
      }

      showToast('Lavorazione iniziata!', 'success')
      closeModal()
      await loadServices()

      // Check if we can open the tab
      const currentOpenTabs = getOpenTabs()
      if (currentOpenTabs.length < MAX_OPEN_TABS) {
        setActiveTab(service._id)
      } else {
        showToast('Tab non aperta automaticamente. Limite massimo raggiunto.', 'info')
      }
    } catch (error) {
      console.error('Error starting work:', error)
      showToast(error instanceof Error ? error.message : 'Errore nell\'iniziare la lavorazione', 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleResumeWork = async (serviceId: string) => {
    const currentOpenTabs = getOpenTabs()
    if (currentOpenTabs.length >= MAX_OPEN_TABS) {
      showToast(`Puoi avere massimo ${MAX_OPEN_TABS} tab aperte contemporaneamente`, 'error')
      return
    }

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
          serviceId,
          status: 'in_progress'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 409) {
          // Another consultant is already working on this
          showToast(error.error || 'Un altro consulente sta già lavorando su questo business plan', 'error')
          await loadServices()
          return
        }
        throw new Error(error.error || 'Errore nell\'aggiornamento dello stato')
      }

      showToast('Lavoro ripreso!', 'success')
      await loadServices()
      setActiveTab(serviceId)
    } catch (error) {
      console.error('Error resuming work:', error)
      showToast(error instanceof Error ? error.message : 'Errore nel riprendere la lavorazione', 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSuspendWork = async (serviceId: string) => {
    try {
      setIsUpdating(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/services/suspend-work`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Errore nella sospensione del lavoro')
      }

      showToast('Lavoro sospeso. Altri consulenti possono riprenderlo.', 'info')

      // If this was the active tab, switch to overview
      if (activeTab === serviceId) {
        setActiveTab('overview')
      }

      await loadServices()
    } catch (error) {
      console.error('Error suspending work:', error)
      showToast(error instanceof Error ? error.message : 'Errore nella sospensione del lavoro', 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCompleteService = async (serviceId?: string) => {
    // Use serviceId from parameter (for tabs) or selectedService (for modal)
    const targetServiceId = serviceId || selectedService?._id
    if (!targetServiceId) return

    // Get form data from tab or modal
    const data = serviceId ? tabFormData[serviceId] : formData

    // Validate required fields
    if (!data || !data.executiveSummary || !data.idea || !data.marketAnalysis) {
      showToast('Compila almeno Executive Summary, L\'Idea e Analisi di Mercato', 'error')
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
          serviceId: targetServiceId,
          content: data,
          pdfUrl: data.pdfUrl
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Errore nel completamento del servizio')
      }

      showToast('Business Plan completato con successo!', 'success')
      await loadServices()

      // Close modal if open, or switch to overview if in tab
      if (selectedService) {
        closeModal()
      } else if (serviceId) {
        setActiveTab('overview')
      }
    } catch (error) {
      console.error('Error completing service:', error)
      showToast(error instanceof Error ? error.message : 'Errore nel completamento del servizio', 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  // Get open tabs (services assigned to current consultant)
  const getOpenTabs = (): string[] => {
    if (!currentUserId) return []

    return services
      .filter(s => {
        const isInProgress = s.status === 'in_progress'
        const hasAssignment = !!s.assignedToConsultant
        const assignedId = s.assignedToConsultant?._id?.toString()
        const currentId = currentUserId.toString()
        const isMatch = assignedId === currentId

        return isInProgress && hasAssignment && isMatch
      })
      .map(s => s._id)
  }

  const openTabs = getOpenTabs()

  const closeTab = (serviceId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    handleSuspendWork(serviceId)
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

  const renderTabContent = () => {
    if (activeTab === 'overview') {
      return renderOverviewTab()
    }

    // Render business plan editor for specific service
    const service = services.find(s => s._id === activeTab)
    if (!service) {
      return (
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">Business plan non trovato</p>
        </div>
      )
    }

    const formData = tabFormData[activeTab as string] || {
      creationMode: service.businessPlanContent?.creationMode,
      executiveSummary: service.businessPlanContent?.executiveSummary || '',
      idea: service.businessPlanContent?.idea || '',
      businessModel: service.businessPlanContent?.businessModel || '',
      marketAnalysis: service.businessPlanContent?.marketAnalysis || '',
      team: service.businessPlanContent?.team || '',
      roadmap: service.businessPlanContent?.roadmap || '',
      financialPlan: service.businessPlanContent?.financialPlan || '',
      revenueProjections: service.businessPlanContent?.revenueProjections || '',
      customSections: service.businessPlanContent?.customSections || []
    }

    return renderBusinessPlanEditor(service, formData)
  }

  const renderBusinessPlanEditor = (service: PurchasedService, data: any) => {
    const handleSave = async (businessPlanData: any) => {
      // Update local state
      setTabFormData(prev => ({
        ...prev,
        [service._id]: businessPlanData
      }))

      // Save to database
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${import.meta.env.VITE_API_URL}/services/update-business-plan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            serviceId: service._id,
            content: businessPlanData
          })
        })

        if (!response.ok) {
          throw new Error('Errore nel salvataggio')
        }

        console.log('Business plan saved to database')

        // Reload services to get updated data including creationMode
        await loadServices()
      } catch (error) {
        console.error('Error saving business plan:', error)
        throw error // Re-throw to let the caller handle it
      }
    }

    const handleComplete = async (businessPlanData: any) => {
      setTabFormData(prev => ({
        ...prev,
        [service._id]: businessPlanData
      }))
      await handleCompleteService(service._id)
    }

    return (
      <BusinessPlanEditor
        key={`${service._id}-${service.businessPlanContent?.creationMode || 'none'}`}
        service={service}
        initialData={data}
        onSave={handleSave}
        onComplete={handleComplete}
        onSuspend={() => handleSuspendWork(service._id)}
        isUpdating={isUpdating}
      />
    )
  }

  const renderOverviewTab = () => {
    // Get suspended services (in_progress but no consultant assigned)
    const suspendedServices = services.filter(s =>
      s.status === 'in_progress' && !s.assignedToConsultant
    )

    // Get services assigned to other consultants
    const otherConsultantServices = services.filter(s => {
      if (s.status !== 'in_progress' || !s.assignedToConsultant) return false

      const assignedId = s.assignedToConsultant._id?.toString()
      const currentId = currentUserId?.toString()

      return assignedId !== currentId
    })

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="group bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
              <div className="flex items-center">
                <div className={`p-2 sm:p-3 rounded-lg ${stat.color === 'text-blue-600' ? 'bg-blue-50' : stat.color === 'text-green-600' ? 'bg-green-50' : 'bg-yellow-50'} group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color}`} />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm text-gray-600">{stat.title}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Suspended Work Section */}
        {suspendedServices.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Pause className="h-6 w-6 text-yellow-600" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-900">Business Plan in Sospeso</h3>
                  <p className="text-sm text-yellow-700">
                    {suspendedServices.length} business plan in lavorazione ma non aperti (max {MAX_OPEN_TABS} tab contemporanee)
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suspendedServices.map(service => (
                <div key={service._id} className="bg-white rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                      <span className="font-medium text-sm sm:text-base text-gray-900 truncate">{service.userId.name}</span>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 flex-shrink-0">
                      Sospeso
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 truncate">{service.userId.email}</p>
                  <button
                    onClick={() => handleResumeWork(service._id)}
                    disabled={openTabs.length >= MAX_OPEN_TABS}
                    className="w-full flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-yellow-600 text-white text-xs sm:text-sm rounded-lg hover:bg-yellow-700 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{openTabs.length >= MAX_OPEN_TABS ? 'Tab piene' : 'Riprendi Lavoro'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Consultants Section */}
        {otherConsultantServices.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <User className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">In Lavorazione da Altri Consulenti</h3>
                  <p className="text-sm text-blue-700">
                    {otherConsultantServices.length} business plan assegnati ad altri consulenti
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherConsultantServices.map(service => (
                <div key={service._id} className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base text-gray-900 truncate">{service.userId.name}</span>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 flex-shrink-0 ml-2">
                      In Lavoro
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">{service.userId.email}</p>
                  <div className="flex items-center space-x-2 mt-3 p-2 bg-blue-50 rounded">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-blue-700 truncate">
                      Assegnato a: <span className="font-medium">{service.assignedToConsultant?.name}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow relative z-10">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca per cliente o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            <table className="w-full min-w-max">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-600">Cliente</th>
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-600">Email</th>
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-600">Importo</th>
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-600">Data Acquisto</th>
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-600">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentServices.map((service) => (
                  <tr key={service._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 sm:py-4 px-4 sm:px-6">
                      <div className="flex items-center">
                        <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 mr-2 flex-shrink-0" />
                        <p className="font-medium text-xs sm:text-sm text-gray-900 truncate">{service.userId.name}</p>
                      </div>
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6">
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{service.userId.email}</p>
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6">
                      <p className="text-xs sm:text-sm font-semibold text-blue-600">€{(service.amountPaid / 100).toFixed(2)}</p>
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6">
                      <p className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                        {new Date(service.purchasedAt).toLocaleDateString('it-IT')}
                      </p>
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6">
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(service.status)}`}>
                        {getStatusIcon(service.status)}
                        <span className="ml-1">{getStatusText(service.status)}</span>
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6">
                      <button
                        onClick={() => handleViewService(service)}
                        className="text-primary-600 hover:text-primary-700 p-1 rounded hover:bg-primary-50 hover:scale-110 transition-all duration-200"
                        title="Visualizza dettagli"
                      >
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
  }

  return (
    <div className="space-y-6">
      {/* Tabs Navigation - Box Style */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 hover:shadow-md transition-shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
          {/* Overview Tab */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`p-3 sm:p-4 rounded-lg text-left transition-all duration-200 ${
              activeTab === 'overview'
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2 mb-1">
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-medium text-xs sm:text-sm">Panoramica</span>
            </div>
            <p className={`text-xs ${activeTab === 'overview' ? 'text-primary-100' : 'text-gray-500'} truncate`}>
              {services.length} business plan totali
            </p>
          </button>

          {/* Client Tabs */}
          {openTabs.map(serviceId => {
            const service = services.find(s => s._id === serviceId)
            if (!service) return null

            return (
              <div
                key={serviceId}
                className={`p-3 sm:p-4 rounded-lg text-left transition-all duration-200 relative group cursor-pointer ${
                  activeTab === serviceId
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab(serviceId)}
              >
                <button
                  onClick={(e) => closeTab(serviceId, e)}
                  className={`absolute top-1 sm:top-2 right-1 sm:right-2 p-1 rounded-full transition-colors ${
                    activeTab === serviceId
                      ? 'hover:bg-blue-700'
                      : 'hover:bg-gray-200'
                  }`}
                  title="Sospendi lavoro"
                >
                  <X className={`h-3 w-3 ${activeTab === serviceId ? 'text-white' : 'text-gray-400'}`} />
                </button>
                <div className="flex items-center space-x-2 mb-1 pr-6">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-medium text-xs sm:text-sm truncate">{service.userId.name}</span>
                </div>
                <p className={`text-xs truncate ${activeTab === serviceId ? 'text-blue-100' : 'text-gray-500'}`}>
                  In lavorazione
                </p>
              </div>
            )
          })}

          {/* Empty slots reminder */}
          {openTabs.length < MAX_OPEN_TABS && (
            <div className="p-4 rounded-lg border-2 border-dashed border-gray-300 text-center flex flex-col items-center justify-center">
              <p className="text-xs text-gray-400 font-medium">
                {MAX_OPEN_TABS - openTabs.length} slot disponibili
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Service Detail Modal - Only for pending and completed services */}
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

            {/* For pending services - show start button */}
            {selectedService.status === 'pending' && (
              <div className="flex flex-col items-center space-y-4 py-8">
                <p className="text-gray-600 text-center">
                  Questo business plan è in attesa di lavorazione.<br />
                  Clicca il pulsante per iniziare a lavorarci.
                </p>
                <button
                  onClick={() => handleStartWork(selectedService)}
                  disabled={isUpdating}
                  className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 flex items-center space-x-2"
                >
                  <Clock className="h-5 w-5" />
                  <span>{isUpdating ? 'Inizializzazione...' : 'Inizia Lavorazione'}</span>
                </button>
              </div>
            )}

            {/* For completed services - show read-only content */}
            {selectedService.status === 'completed' && selectedService.businessPlanContent && (
              <div className="space-y-4">
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

                <h3 className="text-lg font-semibold text-gray-900 pt-4">Contenuto Business Plan</h3>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Executive Summary</h4>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedService.businessPlanContent.executiveSummary}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Obiettivi</h4>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedService.businessPlanContent.objective}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Analisi di Mercato</h4>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedService.businessPlanContent.marketAnalysis}</p>
                </div>

                {selectedService.businessPlanContent.timeSeriesForecasting && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Time Series Forecasting</h4>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedService.businessPlanContent.timeSeriesForecasting}</p>
                  </div>
                )}

                {selectedService.businessPlanContent.budgetSimulation && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Simulazione Budget</h4>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedService.businessPlanContent.budgetSimulation}</p>
                  </div>
                )}

                {selectedService.businessPlanContent.alertsAndWarnings && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Alert e Avvisi</h4>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedService.businessPlanContent.alertsAndWarnings}</p>
                  </div>
                )}

                {selectedService.businessPlanContent.pdfUrl && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">PDF Business Plan</h4>
                    <a
                      href={selectedService.businessPlanContent.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 underline"
                    >
                      {selectedService.businessPlanContent.pdfUrl}
                    </a>
                  </div>
                )}

                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Chiudi
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
