import { MessageCircle, Star, ThumbsUp, ThumbsDown, Send, User, Clock, CheckCircle, AlertCircle, Plus, Search, Filter, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'
import Modal from '../../../common/Modal'
import apiService from '../../../../services/api'
import { useToast } from '../../../../context/ToastContext'

export default function FeedbackConsulente() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('feedback')
  const [showNewFeedback, setShowNewFeedback] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [rating, setRating] = useState(0)
  const [feedbackList, setFeedbackList] = useState<any[]>([])
  const [consultants, setConsultants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state for new feedback
  const [formData, setFormData] = useState({
    consultantId: '',
    consultantName: '',
    service: '',
    title: '',
    message: '',
    category: '',
    recommend: true,
    positiveAspects: '',
    suggestions: ''
  })

  // Load feedbacks and consultants
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load user's feedbacks and consultants list in parallel
        const [feedbacksRes, consultantsRes] = await Promise.all([
          apiService.getMyFeedbacks(),
          apiService.getConsultants()
        ])

        if (feedbacksRes.success) {
          setFeedbackList(feedbacksRes.feedbacks)
        }

        if (consultantsRes.success) {
          setConsultants(consultantsRes.consultants)
        }
      } catch (err) {
        console.error('Error loading data:', err)
        setError(err instanceof Error ? err.message : 'Errore nel caricamento dei dati')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Format date helper
  const formatDate = (date: Date | string) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  // Handle form submission
  const handleSubmitFeedback = async () => {
    try {
      if (!formData.consultantName || !formData.service || !rating || !formData.title || !formData.message) {
        showToast('Compila tutti i campi obbligatori', 'error')
        return
      }

      setLoading(true)
      const response = await apiService.createFeedback({
        consultantId: formData.consultantId || undefined,
        consultantName: formData.consultantName,
        service: formData.service,
        rating,
        title: formData.title,
        message: formData.message,
        category: formData.category || undefined,
        recommend: formData.recommend,
        positiveAspects: formData.positiveAspects || undefined,
        suggestions: formData.suggestions || undefined
      })

      if (response.success) {
        // Reload feedbacks
        const feedbacksRes = await apiService.getMyFeedbacks()
        if (feedbacksRes.success) {
          setFeedbackList(feedbacksRes.feedbacks)
        }

        // Reset form
        setFormData({
          consultantId: '',
          consultantName: '',
          service: '',
          title: '',
          message: '',
          category: '',
          recommend: true,
          positiveAspects: '',
          suggestions: ''
        })
        setRating(0)
        setShowNewFeedback(false)
        showToast('Feedback inviato con successo!', 'success')
      }
    } catch (err) {
      console.error('Error submitting feedback:', err)
      showToast(err instanceof Error ? err.message : 'Errore nell\'invio del feedback', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filteredFeedback = feedbackList.filter(feedback => {
    const matchesSearch = feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.consultantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.service.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || feedback.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'responded': return 'bg-green-100 text-green-600'
      case 'pending': return 'bg-yellow-100 text-yellow-600'
      case 'draft': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'responded': return 'Risposto'
      case 'pending': return 'In attesa'
      case 'draft': return 'Bozza'
      default: return 'Sconosciuto'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'responded': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'draft': return <AlertCircle className="h-4 w-4" />
      default: return <MessageCircle className="h-4 w-4" />
    }
  }

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    )
  }

  const renderFeedbackTab = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <MessageCircle className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Feedback Totali</p>
              <p className="text-2xl font-bold text-gray-900">{feedbackList.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Valutazione Media</p>
              <p className="text-2xl font-bold text-gray-900">
                {feedbackList.length > 0
                  ? (feedbackList.reduce((sum, f) => sum + f.rating, 0) / feedbackList.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Risposte Ricevute</p>
              <p className="text-2xl font-bold text-gray-900">
                {feedbackList.filter(f => f.status === 'responded').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">In Attesa</p>
              <p className="text-2xl font-bold text-gray-900">
                {feedbackList.filter(f => f.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca feedback per titolo, consulente o servizio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
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
                <option value="responded">Risposto</option>
                <option value="draft">Bozza</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => setShowNewFeedback(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Feedback
          </button>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun feedback disponibile</h3>
            <p className="text-gray-600 mb-6">
              Non hai ancora inviato feedback o non ci sono risultati per i filtri selezionati.
            </p>
            <button
              onClick={() => setShowNewFeedback(true)}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-all duration-200 inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Invia il tuo primo feedback
            </button>
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
                      <span>Consulente: {feedback.consultantName}</span>
                      <span>Servizio: {feedback.service}</span>
                      <span>Data: {formatDate(feedback.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      {renderStars(feedback.rating)}
                      <span className="text-sm text-gray-500">({feedback.rating}/5)</span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(feedback.status)}`}>
                        {getStatusIcon(feedback.status)}
                        <span className="ml-1">{getStatusText(feedback.status)}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                  {feedback.category}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 text-sm leading-relaxed">{feedback.message}</p>
              </div>

              {feedback.response && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-green-600" />
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
                    <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                      In attesa di risposta
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderConsultantsTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">I Tuoi Consulenti</h3>
        <p className="text-gray-600">Visualizza e valuta i consulenti che ti hanno assistito</p>
      </div>

      {consultants.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun consulente disponibile</h3>
          <p className="text-gray-600">
            Non ci sono consulenti disponibili al momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {consultants.map((consultant) => (
            <div key={consultant.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-primary-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{consultant.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{consultant.specialization}</p>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {renderStars(Math.floor(consultant.rating))}
                  <span className="text-sm text-gray-600">({consultant.rating})</span>
                </div>
                <p className="text-xs text-gray-500">{consultant.totalFeedbacks} recensioni</p>
              </div>

              <button
                onClick={() => {
                  setShowNewFeedback(true)
                  // Pre-fill consultant data
                }}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center"
              >
                <Star className="h-4 w-4 mr-2" />
                Lascia Feedback
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const tabs = [
    { id: 'feedback', name: 'I Miei Feedback', icon: MessageCircle, description: 'Visualizza e gestisci i tuoi feedback' },
    { id: 'consultants', name: 'Consulenti', icon: User, description: 'Visualizza i consulenti disponibili' }
  ]

  // Loading state
  if (loading && feedbackList.length === 0) {
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
  if (error && feedbackList.length === 0) {
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
    <div className="space-y-8">
      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="grid grid-cols-2 gap-2">
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
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'feedback' ? renderFeedbackTab() : renderConsultantsTab()}

      {/* New Feedback Modal */}
      <Modal
        isOpen={showNewFeedback}
        onClose={() => setShowNewFeedback(false)}
        title="Nuovo Feedback"
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {/* Consultant Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Consulente *</label>
            <select
              value={formData.consultantId}
              onChange={(e) => {
                const consultant = consultants.find(c => c.id === e.target.value)
                setFormData({
                  ...formData,
                  consultantId: e.target.value,
                  consultantName: consultant ? consultant.name : ''
                })
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Seleziona un consulente</option>
              {consultants.map((consultant) => (
                <option key={consultant.id} value={consultant.id}>
                  {consultant.name} - {consultant.specialization}
                </option>
              ))}
            </select>
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Servizio Ricevuto *</label>
            <select
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Seleziona il servizio</option>
              <option value="Consulenza Fiscale">Consulenza Fiscale</option>
              <option value="Business Plan">Business Plan</option>
              <option value="Analisi AI">Analisi AI</option>
              <option value="Apertura Partita IVA">Apertura Partita IVA</option>
              <option value="Gestione Contabilità">Gestione Contabilità</option>
              <option value="Altro">Altro</option>
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valutazione *</label>
            <div className="flex items-center space-x-2">
              {renderStars(rating, true, setRating)}
              <span className="text-sm text-gray-600 ml-4">
                {rating === 0 ? 'Seleziona una valutazione' : `${rating}/5 stelle`}
              </span>
            </div>
          </div>

          {/* Feedback Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Titolo Feedback *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="es. Ottima consulenza sulla partita IVA"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Seleziona categoria</option>
              <option value="Qualità Servizio">Qualità Servizio</option>
              <option value="Professionalità">Professionalità</option>
              <option value="Tempestività">Tempestività</option>
              <option value="Contenuto">Contenuto</option>
              <option value="Innovazione">Innovazione</option>
              <option value="Comunicazione">Comunicazione</option>
            </select>
          </div>

          {/* Feedback Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Il Tuo Feedback *</label>
            <textarea
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Descrivi la tua esperienza con il consulente e il servizio ricevuto..."
            ></textarea>
          </div>

          {/* What Went Well */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cosa è andato bene</label>
            <textarea
              rows={2}
              value={formData.positiveAspects}
              onChange={(e) => setFormData({ ...formData, positiveAspects: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Cosa ti è piaciuto di più del servizio?"
            ></textarea>
          </div>

          {/* Suggestions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Suggerimenti per migliorare</label>
            <textarea
              rows={2}
              value={formData.suggestions}
              onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Hai suggerimenti per migliorare il servizio?"
            ></textarea>
          </div>

          {/* Recommend */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Raccomandazione</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="recommend"
                  checked={formData.recommend === true}
                  onChange={() => setFormData({ ...formData, recommend: true })}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <ThumbsUp className="h-4 w-4 ml-2 mr-1 text-green-600" />
                <span className="text-sm text-gray-700">Raccomando</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="recommend"
                  checked={formData.recommend === false}
                  onChange={() => setFormData({ ...formData, recommend: false })}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <ThumbsDown className="h-4 w-4 ml-2 mr-1 text-red-600" />
                <span className="text-sm text-gray-700">Non raccomando</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowNewFeedback(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Annulla
            </button>
            <button
              onClick={handleSubmitFeedback}
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Invio...' : 'Invia Feedback'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Feedback Detail Modal */}
      <Modal
        isOpen={!!selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        title="Dettagli Feedback"
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
                      <span>Consulente: {selectedFeedback.consultantName}</span>
                      <span>Servizio: {selectedFeedback.service}</span>
                      <span>Data: {formatDate(selectedFeedback.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      {renderStars(selectedFeedback.rating)}
                      <span className="text-sm text-gray-500">({selectedFeedback.rating}/5)</span>
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
                </div>
              </div>
            </div>

            {/* Feedback Content */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Il Tuo Feedback</h4>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{selectedFeedback.message}</p>
              </div>
            </div>

            {/* Response */}
            {selectedFeedback.response ? (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Risposta del Consulente</h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-green-800 leading-relaxed">{selectedFeedback.response}</p>
                      <p className="text-sm text-green-600 mt-3">Risposta del {formatDate(selectedFeedback.responseDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <p className="text-yellow-800">Il consulente non ha ancora risposto al tuo feedback.</p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Timeline</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Feedback inviato</p>
                    <p className="text-sm text-gray-600">{formatDate(selectedFeedback.createdAt)}</p>
                  </div>
                </div>
                {selectedFeedback.response && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Risposta ricevuta</p>
                      <p className="text-sm text-gray-600">{formatDate(selectedFeedback.responseDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Chiudi
              </button>
              {!selectedFeedback.response && (
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                  Sollecita Risposta
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <MessageCircle className="h-5 w-5 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Perché è importante il tuo feedback</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Aiuta i consulenti a migliorare i loro servizi</li>
              <li>• Permette ad altri clienti di fare scelte informate</li>
              <li>• Contribuisce al miglioramento continuo della qualità</li>
              <li>• I tuoi feedback vengono sempre letti e considerati</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}