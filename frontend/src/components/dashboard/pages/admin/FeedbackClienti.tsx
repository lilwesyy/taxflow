import { MessageCircle, Star, Reply, Send, User, Clock, CheckCircle, AlertCircle, Search, Filter, Eye, ArrowLeft, TrendingUp, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import Modal from '../../../common/Modal'
import apiService from '../../../../services/api'
import { useToast } from '../../../../context/ToastContext'

export default function FeedbackClienti() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('pending')
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRating, setFilterRating] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [feedbackList, setFeedbackList] = useState<any[]>([])
  const [consultantStats, setConsultantStats] = useState<any[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load all feedbacks, consultant stats, and statistics
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load all data in parallel
        const [feedbacksRes, statsRes, statisticsRes] = await Promise.all([
          apiService.getAllFeedbacks({ status: activeTab !== 'all' ? activeTab : undefined }),
          apiService.getConsultantStats(),
          apiService.getFeedbackStatistics()
        ])

        if (feedbacksRes.success) {
          setFeedbackList(feedbacksRes.feedbacks)
        }

        if (statsRes.success) {
          setConsultantStats(statsRes.stats)
        }

        if (statisticsRes.success) {
          setStatistics(statisticsRes.statistics)
        }
      } catch (err) {
        console.error('Error loading data:', err)
        setError(err instanceof Error ? err.message : 'Errore nel caricamento dei dati')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [activeTab])

  // Format date helper
  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  // Handle response submission
  const handleResponseSubmit = async () => {
    if (selectedFeedback && responseText.trim()) {
      try {
        setLoading(true)
        const response = await apiService.respondToFeedback(selectedFeedback._id, responseText)

        if (response.success) {
          // Reload feedbacks
          const feedbacksRes = await apiService.getAllFeedbacks({ status: activeTab !== 'all' ? activeTab : undefined })
          if (feedbacksRes.success) {
            setFeedbackList(feedbacksRes.feedbacks)
          }

          setShowResponseModal(false)
          setResponseText('')
          setSelectedFeedback(null)
          showToast('Risposta inviata con successo!', 'success')
        }
      } catch (err) {
        console.error('Error responding to feedback:', err)
        showToast(err instanceof Error ? err.message : 'Errore nell\'invio della risposta', 'error')
      } finally {
        setLoading(false)
      }
    }
  }

  // consultantStats e feedbackList vengono caricati via API nell'useEffect sopra

  const filteredFeedback = (feedbackList || []).filter(feedback => {
    const matchesSearch = feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.consultantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.service.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRating = filterRating === 'all' ||
                         (filterRating === '5' && feedback.rating === 5) ||
                         (filterRating === '4' && feedback.rating === 4) ||
                         (filterRating === '3' && feedback.rating <= 3)

    const matchesCategory = filterCategory === 'all' || feedback.category === filterCategory

    const matchesTab = activeTab === 'all' ||
                      (activeTab === 'pending' && feedback.status === 'pending') ||
                      (activeTab === 'responded' && feedback.status === 'responded') ||
                      (activeTab === 'low-rating' && feedback.rating <= 3)

    return matchesSearch && matchesRating && matchesCategory && matchesTab
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'responded': return 'bg-green-100 text-green-600'
      case 'pending': return 'bg-yellow-100 text-yellow-600'
      case 'archived': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'responded': return 'Risposto'
      case 'pending': return 'In attesa'
      case 'archived': return 'Archiviato'
      default: return 'Sconosciuto'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'responded': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'archived': return <AlertCircle className="h-4 w-4" />
      default: return <MessageCircle className="h-4 w-4" />
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600'
    if (rating >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }


  const tabs = [
    { id: 'pending', name: 'In Attesa', icon: Clock, description: 'Feedback da rispondere', count: statistics?.pending || 0 },
    { id: 'responded', name: 'Risposti', icon: CheckCircle, description: 'Feedback con risposta', count: statistics?.responded || 0 },
    { id: 'low-rating', name: 'Bassa Valutazione', icon: AlertCircle, description: 'Valutazione ≤ 3 stelle', count: feedbackList.filter(f => f.rating <= 3).length },
    { id: 'all', name: 'Tutti', icon: MessageCircle, description: 'Tutti i feedback', count: statistics?.total || 0 }
  ]

  // Loading state
  if (loading && !statistics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !statistics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <MessageCircle className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Feedback Totali</p>
              <p className="text-2xl font-bold text-gray-900">{statistics?.total || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Valutazione Media</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics?.avgRating || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">In Attesa di Risposta</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics?.pending || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Tasso di Risposta</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics?.responseRate || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3 rounded-lg text-left transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <tab.icon className="h-4 w-4" />
                <span className="font-medium text-sm">{tab.name}</span>
              </div>
              <p className={`text-xs ${activeTab === tab.id ? 'text-blue-100' : 'text-gray-500'}`}>
                {tab.description}
              </p>
              {tab.count > 0 && (
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === tab.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca feedback per cliente, consulente o servizio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Tutte le valutazioni</option>
                <option value="5">5 stelle</option>
                <option value="4">4 stelle</option>
                <option value="3">≤ 3 stelle</option>
              </select>
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Tutte le categorie</option>
              <option value="Qualità Servizio">Qualità Servizio</option>
              <option value="Professionalità">Professionalità</option>
              <option value="Tempestività">Tempestività</option>
              <option value="Contenuto">Contenuto</option>
              <option value="Innovazione">Innovazione</option>
              <option value="Comunicazione">Comunicazione</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun feedback disponibile</h3>
            <p className="text-gray-600">
              Non ci sono feedback che corrispondono ai filtri selezionati.
            </p>
          </div>
        ) : (
          filteredFeedback.map((feedback) => (
            <div key={feedback.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{feedback.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span>Cliente: {feedback.clientName}</span>
                    <span>Consulente: {feedback.consultantName}</span>
                    <span>Servizio: {feedback.service}</span>
                    <span>Data: {formatDate(feedback.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {renderStars(feedback.rating)}
                    <span className={`text-sm font-medium ${getRatingColor(feedback.rating)}`}>
                      ({feedback.rating}/5)
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(feedback.status)}`}>
                      {getStatusIcon(feedback.status)}
                      <span className="ml-1">{getStatusText(feedback.status)}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                  {feedback.category}
                </span>
                {feedback.recommend ? (
                  <div className="flex items-center text-green-600">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span className="text-xs">Raccomanda</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    <span className="text-xs">Non raccomanda</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 text-sm leading-relaxed">{feedback.message}</p>
            </div>

            {feedback.response && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Reply className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 mb-1">Risposta del consulente</p>
                    <p className="text-sm text-green-800">{feedback.response}</p>
                    <p className="text-xs text-green-600 mt-2">Risposta del {formatDate(feedback.responseDate)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button
                onClick={() => setSelectedFeedback(feedback)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center hover:scale-110 transition-transform duration-200"
              >
                <Eye className="h-4 w-4 mr-1" />
                Visualizza Dettagli
              </button>
              <div className="flex items-center space-x-2">
                {!feedback.response && (
                  <button
                    onClick={() => {
                      setSelectedFeedback(feedback)
                      setShowResponseModal(true)
                    }}
                    className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700 transition-colors flex items-center"
                  >
                    <Reply className="h-4 w-4 mr-1" />
                    Rispondi
                  </button>
                )}
                {feedback.rating <= 3 && (
                  <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                    Richiede attenzione
                  </span>
                )}
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Consultant Performance Summary */}
      {activeTab === 'all' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Consulenti</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {consultantStats.map((consultant, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">{consultant.name}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Feedback ricevuti:</span>
                    <span className="font-medium">{consultant.totalFeedbacks}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Valutazione media:</span>
                    <span className={`font-medium ${getRatingColor(consultant.avgRating)}`}>
                      {consultant.avgRating}/5
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tasso di risposta:</span>
                    <span className="font-medium">{consultant.responseRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Response Modal */}
      <Modal
        isOpen={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        title="Rispondi al Feedback"
        maxWidth="2xl"
      >
        {selectedFeedback && (
          <div className="space-y-6">
            {/* Feedback Summary */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{selectedFeedback.title}</h4>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <span>Cliente: {selectedFeedback.clientName}</span>
                <span>Servizio: {selectedFeedback.service}</span>
                <div className="flex items-center space-x-1">
                  {renderStars(selectedFeedback.rating)}
                  <span>({selectedFeedback.rating}/5)</span>
                </div>
              </div>
              <p className="text-sm text-gray-700">{selectedFeedback.message}</p>
            </div>

            {/* Response Form */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                La Tua Risposta *
              </label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Scrivi una risposta professionale e costruttiva al feedback del cliente..."
              />
            </div>

            {/* Response Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Suggerimenti per una buona risposta:</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ringrazia il cliente per il tempo dedicato al feedback</li>
                <li>• Riconosci i punti positivi e affronta quelli negativi</li>
                <li>• Spiega come intendi migliorare (se applicabile)</li>
                <li>• Mantieni un tono professionale e cordiale</li>
                <li>• Mostra che apprezzi il feedback costruttivo</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowResponseModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleResponseSubmit}
                disabled={!responseText.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4 mr-2" />
                Invia Risposta
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Feedback Detail Modal */}
      <Modal
        isOpen={!!selectedFeedback && !showResponseModal}
        onClose={() => setSelectedFeedback(null)}
        title="Dettagli Feedback Cliente"
        maxWidth="2xl"
      >
        {selectedFeedback && (
          <div className="space-y-6">
            {/* Feedback Header */}
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{selectedFeedback.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span>Cliente: {selectedFeedback.clientName} ({selectedFeedback.clientCompany})</span>
                      <span>Consulente: {selectedFeedback.consultantName}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span>Servizio: {selectedFeedback.service}</span>
                      <span>Data: {selectedFeedback.date}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      {renderStars(selectedFeedback.rating)}
                      <span className={`text-sm font-medium ${getRatingColor(selectedFeedback.rating)}`}>
                        ({selectedFeedback.rating}/5)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`inline-flex items-center px-3 py-1 text-sm rounded-full ${getStatusColor(selectedFeedback.status)}`}>
                    {getStatusIcon(selectedFeedback.status)}
                    <span className="ml-1">{getStatusText(selectedFeedback.status)}</span>
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {selectedFeedback.category}
                  </span>
                  {selectedFeedback.recommend ? (
                    <div className="flex items-center text-green-600">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      <span className="text-xs">Raccomanda</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      <span className="text-xs">Non raccomanda</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Feedback Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Feedback del Cliente</h4>
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 leading-relaxed">{selectedFeedback.message}</p>
                </div>

                {selectedFeedback.positiveAspects && (
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 mb-2">Aspetti Positivi</h5>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-800 text-sm">{selectedFeedback.positiveAspects}</p>
                    </div>
                  </div>
                )}

                {selectedFeedback.suggestions && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Suggerimenti per Migliorare</h5>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-yellow-800 text-sm">{selectedFeedback.suggestions}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                {/* Response */}
                {selectedFeedback.response ? (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Risposta del Consulente</h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Reply className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-green-800 leading-relaxed">{selectedFeedback.response}</p>
                          <p className="text-sm text-green-600 mt-3">Risposta del {selectedFeedback.responseDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Risposta</h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <p className="text-yellow-800">In attesa di risposta dal consulente.</p>
                      </div>
                      <button
                        onClick={() => setShowResponseModal(true)}
                        className="mt-3 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Rispondi Ora
                      </button>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Feedback ricevuto</p>
                        <p className="text-sm text-gray-600">{selectedFeedback.date}</p>
                      </div>
                    </div>
                    {selectedFeedback.response && (
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Risposta inviata</p>
                          <p className="text-sm text-gray-600">{selectedFeedback.responseDate}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Torna alla Lista
              </button>
              <div className="flex space-x-3">
                {!selectedFeedback.response && (
                  <button
                    onClick={() => setShowResponseModal(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    Rispondi al Feedback
                  </button>
                )}
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  Archivia
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}