import { Target, Brain, Eye, Download, MessageSquare, Edit, Search, Filter, Plus, TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import Modal from '../../../common/Modal'

export default function BusinessPlans() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedPlan, setSelectedPlan] = useState<any>(null)


  const closeModal = () => {
    setSelectedPlan(null)
  }

  const businessPlans = [
    {
      id: 'BP-2024-001',
      cliente: 'Mario Rossi',
      azienda: 'Rossi Consulting',
      titolo: 'Espansione Servizi Digital Marketing',
      descrizione: 'Piano per ampliare i servizi di marketing digitale',
      status: 'completed',
      priority: 'high',
      dataCreazione: '10/01/2024',
      dataUltimaModifica: '20/01/2024',
      validita: '2024-2026',
      investimento: 15000,
      ricaviPrevisti: 85000,
      roi: 467,
      aiGenerated: true,
      consulente: 'Dr. Marco Bianchi',
      progresso: 100,
      sezioni: ['Executive Summary', 'Analisi Mercato', 'Strategia', 'Finanze', 'Timeline'],
      feedback: 'Piano ben strutturato, proiezioni realistiche'
    },
    {
      id: 'BP-2024-002',
      cliente: 'Laura Bianchi',
      azienda: 'Bianchi Design',
      titolo: 'Lancio Linea Prodotti Eco-Sostenibili',
      descrizione: 'Sviluppo nuova linea di prodotti sostenibili',
      status: 'in_review',
      priority: 'medium',
      dataCreazione: '15/01/2024',
      dataUltimaModifica: '25/01/2024',
      validita: '2024-2025',
      investimento: 22000,
      ricaviPrevisti: 95000,
      roi: 332,
      aiGenerated: false,
      consulente: 'Dr. Laura Verdi',
      progresso: 75,
      sezioni: ['Executive Summary', 'Analisi Mercato', 'Strategia', 'Finanze'],
      feedback: 'Rivedere sezione finanziaria, aggiungere analisi competitors'
    },
    {
      id: 'BP-2024-003',
      cliente: 'Giuseppe Verdi',
      azienda: 'Verdi Solutions',
      titolo: 'Automazione Processi Aziendali',
      descrizione: 'Implementazione soluzioni di automazione',
      status: 'draft',
      priority: 'high',
      dataCreazione: '20/01/2024',
      dataUltimaModifica: '26/01/2024',
      validita: '2024-2027',
      investimento: 35000,
      ricaviPrevisti: 150000,
      roi: 329,
      aiGenerated: true,
      consulente: 'Dr. Marco Bianchi',
      progresso: 45,
      sezioni: ['Executive Summary', 'Analisi Mercato'],
      feedback: 'In fase di sviluppo, buone premesse'
    },
    {
      id: 'BP-2024-004',
      cliente: 'Anna Neri',
      azienda: 'Neri Marketing',
      titolo: 'Piattaforma E-learning',
      descrizione: 'Creazione piattaforma corsi online',
      status: 'rejected',
      priority: 'low',
      dataCreazione: '12/01/2024',
      dataUltimaModifica: '18/01/2024',
      validita: '2024-2025',
      investimento: 18000,
      ricaviPrevisti: 45000,
      roi: 150,
      aiGenerated: false,
      consulente: 'Dr. Laura Verdi',
      progresso: 30,
      sezioni: ['Executive Summary'],
      feedback: 'Piano non sostenibile, mercato troppo saturo'
    }
  ]

  const filteredPlans = businessPlans.filter(plan => {
    const matchesSearch = plan.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.azienda.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.titolo.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || plan.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-600'
      case 'in_review': return 'bg-yellow-100 text-yellow-600'
      case 'draft': return 'bg-blue-100 text-blue-600'
      case 'rejected': return 'bg-red-100 text-red-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completato'
      case 'in_review': return 'In revisione'
      case 'draft': return 'Bozza'
      case 'rejected': return 'Respinto'
      default: return 'Sconosciuto'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'in_review': return <Clock className="h-4 w-4" />
      case 'draft': return <Edit className="h-4 w-4" />
      case 'rejected': return <AlertTriangle className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
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
    { title: 'Business Plans', value: businessPlans.length.toString(), icon: Target, color: 'text-purple-600' },
    { title: 'In Revisione', value: businessPlans.filter(p => p.status === 'in_review').length.toString(), icon: Clock, color: 'text-yellow-600' },
    { title: 'Completati', value: businessPlans.filter(p => p.status === 'completed').length.toString(), icon: CheckCircle, color: 'text-green-600' },
    { title: 'ROI Medio', value: `${Math.round(businessPlans.reduce((sum, p) => sum + p.roi, 0) / businessPlans.length)}%`, icon: TrendingUp, color: 'text-blue-600' }
  ]

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${
                stat.color === 'text-purple-600' ? 'bg-purple-50' :
                stat.color === 'text-yellow-600' ? 'bg-yellow-50' :
                stat.color === 'text-green-600' ? 'bg-green-50' :
                'bg-blue-50'
              } group-hover:scale-110 transition-transform`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
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
                placeholder="Cerca per cliente, azienda o titolo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
              >
                <option value="all">Tutti gli stati</option>
                <option value="draft">Bozza</option>
                <option value="in_review">In revisione</option>
                <option value="completed">Completato</option>
                <option value="rejected">Respinto</option>
              </select>
            </div>
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Template
            </button>
          </div>
        </div>
      </div>

      {/* Business Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPlans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <Target className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{plan.titolo}</h3>
                  <p className="text-sm text-gray-600 mb-2">{plan.descrizione}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{plan.cliente} - {plan.azienda}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(plan.status)}`}>
                  {getStatusIcon(plan.status)}
                  <span className="ml-1">{getStatusText(plan.status)}</span>
                </span>
                {plan.aiGenerated && (
                  <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full">
                    <Brain className="h-3 w-3 mr-1" />
                    AI
                  </span>
                )}
                <span className={`text-xs font-medium ${getPriorityColor(plan.priority)}`}>
                  Priorità {plan.priority}
                </span>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progresso</span>
                <span>{plan.progresso}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${plan.progresso}%` }}
                ></div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-600">Investimento</p>
                <p className="font-semibold text-gray-900">€ {plan.investimento.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Ricavi Previsti</p>
                <p className="font-semibold text-green-600">€ {plan.ricaviPrevisti.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">ROI</p>
                <p className="font-semibold text-primary-600">{plan.roi}%</p>
              </div>
            </div>

            {/* Sections */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Sezioni ({plan.sezioni.length}):</p>
              <div className="flex flex-wrap gap-1">
                {plan.sezioni.map((sezione, index) => (
                  <span key={index} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {sezione}
                  </span>
                ))}
              </div>
            </div>

            {/* Feedback */}
            {plan.feedback && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-900">{plan.feedback}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                <p>Consulente: {plan.consulente}</p>
                <p>Aggiornato: {plan.dataUltimaModifica}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedPlan(plan)}
                  className="text-primary-600 hover:text-primary-700 p-1 rounded hover:bg-primary-50 hover:scale-110 transition-all duration-200"
                  title="Visualizza"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50 hover:scale-110 transition-all duration-200" title="Chat cliente">
                  <MessageSquare className="h-4 w-4" />
                </button>
                {plan.status === 'completed' && (
                  <button className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 hover:scale-110 transition-all duration-200" title="Scarica">
                    <Download className="h-4 w-4" />
                  </button>
                )}
                <button className="text-gray-600 hover:text-gray-700 p-1 rounded hover:bg-gray-50 hover:scale-110 transition-all duration-200" title="Modifica">
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Detail Modal */}
      <Modal
        isOpen={!!selectedPlan}
        onClose={closeModal}
        title={selectedPlan ? `${selectedPlan.titolo} - ${selectedPlan.cliente} - ${selectedPlan.azienda}` : ""}
        maxWidth="6xl"
      >
        {selectedPlan && (
          <div className="space-y-6">
              {/* Status e Metriche */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <span className={`inline-flex items-center px-3 py-1 text-sm rounded-full ${getStatusColor(selectedPlan.status)}`}>
                    {getStatusIcon(selectedPlan.status)}
                    <span className="ml-2">{getStatusText(selectedPlan.status)}</span>
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Investimento</p>
                  <p className="text-lg font-bold text-gray-900">€ {selectedPlan.investimento.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Ricavi Previsti</p>
                  <p className="text-lg font-bold text-green-600">€ {selectedPlan.ricaviPrevisti.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">ROI</p>
                  <p className="text-lg font-bold text-primary-600">{selectedPlan.roi}%</p>
                </div>
              </div>

              {/* Progresso */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Progresso Sviluppo</h4>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Completamento</span>
                  <span>{selectedPlan.progresso}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-600 h-3 rounded-full"
                    style={{ width: `${selectedPlan.progresso}%` }}
                  ></div>
                </div>
              </div>

              {/* Sezioni */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Sezioni del Business Plan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedPlan.sezioni.map((sezione: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-gray-900">{sezione}</span>
                      </div>
                      <button className="text-primary-600 hover:text-primary-700 text-sm hover:scale-105 transition-all duration-200">
                        Revisiona
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback e Note */}
              {selectedPlan.feedback && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Feedback Consulente</h4>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-900">{selectedPlan.feedback}</p>
                  </div>
                </div>
              )}

              {/* Informazioni Aggiuntive */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Dettagli Piano</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data creazione:</span>
                      <span className="text-gray-900">{selectedPlan.dataCreazione}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ultima modifica:</span>
                      <span className="text-gray-900">{selectedPlan.dataUltimaModifica}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Validità:</span>
                      <span className="text-gray-900">{selectedPlan.validita}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Generato con AI:</span>
                      <span className="text-gray-900">{selectedPlan.aiGenerated ? 'Sì' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Assegnazione</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consulente:</span>
                      <span className="text-gray-900">{selectedPlan.consulente}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priorità:</span>
                      <span className={`font-medium ${getPriorityColor(selectedPlan.priority)}`}>
                        {selectedPlan.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  {selectedPlan.status === 'in_review' && (
                    <>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 hover:scale-105 hover:shadow-lg">
                        Approva
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 hover:scale-105 hover:shadow-lg">
                        Richiedi Modifiche
                      </button>
                    </>
                  )}
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105 hover:shadow-lg">
                    Aggiungi Feedback
                  </button>
                </div>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105 hover:shadow-sm">
                    Chat Cliente
                  </button>
                  {selectedPlan.status === 'completed' && (
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Scarica PDF
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
      </Modal>
    </div>
  )
}