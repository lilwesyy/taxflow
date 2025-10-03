import { Target, Brain, FileText, Download, Eye, Plus, TrendingUp, DollarSign, BarChart3, Lightbulb, CheckCircle, Clock, Edit, Search, Filter } from 'lucide-react'
import { useState } from 'react'
import Modal from '../../../common/Modal'
import { useToast } from '../../../../context/ToastContext'

export default function BusinessPlan() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('plans')
  const [showNewPlan, setShowNewPlan] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showTemplateConfig, setShowTemplateConfig] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [showSectionDetail, setShowSectionDetail] = useState(false)
  const [selectedSection, setSelectedSection] = useState<any>(null)

  const businessPlans = [
    {
      id: 'BP-2024-001',
      title: 'Espansione Servizi Digital Marketing',
      description: 'Piano per ampliare i servizi di marketing digitale',
      status: 'completed',
      dataCreazione: '10/01/2024',
      dataUltimaModifica: '15/01/2024',
      validita: '2024-2026',
      investimento: 15000,
      ricaviPrevisti: 85000,
      roi: 467,
      aiGenerated: true,
      sections: ['Executive Summary', 'Analisi Mercato', 'Strategia', 'Finanze', 'Timeline']
    },
    {
      id: 'BP-2024-002',
      title: 'Lancio Consulenza Automation',
      description: 'Nuovo servizio di automazione processi aziendali',
      status: 'draft',
      dataCreazione: '20/01/2024',
      dataUltimaModifica: '22/01/2024',
      validita: '2024-2025',
      investimento: 8000,
      ricaviPrevisti: 45000,
      roi: 463,
      aiGenerated: true,
      sections: ['Executive Summary', 'Analisi Mercato', 'Strategia']
    },
    {
      id: 'BP-2024-003',
      title: 'Partnership Tecnologiche',
      description: 'Sviluppo partnership con aziende tech',
      status: 'in_review',
      dataCreazione: '25/01/2024',
      dataUltimaModifica: '26/01/2024',
      validita: '2024-2027',
      investimento: 25000,
      ricaviPrevisti: 120000,
      roi: 380,
      aiGenerated: false,
      sections: ['Executive Summary', 'Analisi Mercato', 'Strategia', 'Finanze']
    }
  ]

  const templates = [
    {
      id: 'startup',
      name: 'Startup Innovativa',
      description: 'Template per startup tecnologiche e innovative',
      icon: Lightbulb,
      color: 'bg-purple-600',
      difficulty: 'Medio',
      duration: '2-3 ore'
    },
    {
      id: 'expansion',
      name: 'Espansione Business',
      description: 'Per ampliare servizi o mercati esistenti',
      icon: TrendingUp,
      color: 'bg-green-600',
      difficulty: 'Facile',
      duration: '1-2 ore'
    },
    {
      id: 'digital',
      name: 'Trasformazione Digitale',
      description: 'Digitalizzazione e automazione processi',
      icon: Brain,
      color: 'bg-blue-600',
      difficulty: 'Avanzato',
      duration: '3-4 ore'
    },
    {
      id: 'ecommerce',
      name: 'E-commerce',
      description: 'Lancio piattaforma vendita online',
      icon: DollarSign,
      color: 'bg-accent-600',
      difficulty: 'Medio',
      duration: '2-3 ore'
    }
  ]

  const filteredBusinessPlans = businessPlans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || plan.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-600'
      case 'in_review': return 'bg-yellow-100 text-yellow-600'
      case 'draft': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completato'
      case 'in_review': return 'In revisione'
      case 'draft': return 'Bozza'
      default: return 'Sconosciuto'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'in_review': return <Clock className="h-4 w-4" />
      case 'draft': return <Edit className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const renderPlansTab = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Business Plans</p>
              <p className="text-2xl font-bold text-gray-900">{businessPlans.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Investimenti Tot.</p>
              <p className="text-2xl font-bold text-gray-900">€ {businessPlans.reduce((sum, p) => sum + p.investimento, 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-accent-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Ricavi Previsti</p>
              <p className="text-2xl font-bold text-gray-900">€ {businessPlans.reduce((sum, p) => sum + p.ricaviPrevisti, 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">ROI Medio</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(businessPlans.reduce((sum, p) => sum + p.roi, 0) / businessPlans.length)}%</p>
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
                placeholder="Cerca business plan per titolo o descrizione..."
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
                <option value="draft">Bozza</option>
                <option value="in_review">In revisione</option>
                <option value="completed">Completato</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => setShowNewPlan(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Business Plan
          </button>
        </div>
      </div>

      {/* Business Plans Grid */}
      {filteredBusinessPlans.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun business plan trovato</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all'
              ? 'Prova a modificare i filtri di ricerca'
              : 'Inizia creando il tuo primo business plan'}
          </p>
          {(!searchTerm && filterStatus === 'all') && (
            <button
              onClick={() => setShowNewPlan(true)}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center mx-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              Crea Primo Business Plan
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBusinessPlans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <Target className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{plan.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Creato: {plan.dataCreazione}</span>
                    <span>Validità: {plan.validita}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
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
              </div>
            </div>

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

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Sezioni completate:</p>
              <div className="flex flex-wrap gap-1">
                {plan.sections.map((section, index) => (
                  <span key={index} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {section}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button
                onClick={() => setSelectedPlan(plan)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center hover:scale-110 transition-transform duration-200"
              >
                <Eye className="h-4 w-4 mr-1" />
                Visualizza
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = '#'
                    link.download = `${plan.title.replace(/\s+/g, '_')}_BusinessPlan.pdf`
                    link.click()
                  }}
                  className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50 hover:scale-110 transition-transform duration-200"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedTemplate(templates.find(t => t.id === 'expansion'))
                    setShowTemplateConfig(true)
                  }}
                  className="text-gray-600 hover:text-gray-700 p-1 rounded hover:bg-gray-50 hover:scale-110 transition-transform duration-200"
                  title="Modifica"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Scegli un Template</h3>
        <p className="text-gray-600">Inizia con un template pre-configurato e lascia che l'AI ti guidi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10">
            <div className="flex items-start space-x-4">
              <div className={`p-4 rounded-lg ${template.color} text-white`}>
                <template.icon className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                  <span>Difficoltà: {template.difficulty}</span>
                  <span>Durata: {template.duration}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedTemplate(template)
                    setShowTemplateConfig(true)
                  }}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  Usa Template
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Brain className="h-6 w-6 text-purple-600 mt-1" />
          <div>
            <h4 className="font-semibold text-purple-900 mb-2">AI Business Plan Generator</h4>
            <p className="text-sm text-purple-800 mb-4">
              L'intelligenza artificiale analizza il tuo settore, la concorrenza e le tendenze di mercato
              per creare un business plan personalizzato e professionale.
            </p>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Analisi di mercato automatica</li>
              <li>• Proiezioni finanziarie intelligenti</li>
              <li>• Strategia marketing personalizzata</li>
              <li>• Timeline implementazione ottimizzata</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: 'plans', name: 'I Miei Plans', icon: Target },
    { id: 'templates', name: 'Templates AI', icon: Brain }
  ]

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'plans' ? renderPlansTab() : renderTemplatesTab()}

      {/* New Plan Modal */}
      <Modal
        isOpen={showNewPlan}
        onClose={() => setShowNewPlan(false)}
        title="Nuovo Business Plan"
        maxWidth="4xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                setSelectedTemplate(template)
                setShowNewPlan(false)
                setShowTemplateConfig(true)
              }}
              className="text-left bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-500 hover:shadow-md transition-shadow relative z-10"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${template.color} text-white`}>
                  <template.icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span>{template.difficulty}</span>
                    <span>•</span>
                    <span>{template.duration}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Modal>

      {/* Plan Detail Modal */}
      <Modal
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        title={selectedPlan?.title || 'Business Plan'}
        maxWidth="4xl"
      >
        {selectedPlan && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6 p-6 bg-gray-50 rounded-xl">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Investimento</p>
                <p className="text-2xl font-bold text-gray-900">€ {selectedPlan.investimento.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Ricavi Previsti</p>
                <p className="text-2xl font-bold text-green-600">€ {selectedPlan.ricaviPrevisti.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">ROI</p>
                <p className="text-2xl font-bold text-primary-600">{selectedPlan.roi}%</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Sezioni del Business Plan</h4>
              <div className="space-y-3">
                {selectedPlan.sections.map((section: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium text-gray-900">{section}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSection({ name: section, plan: selectedPlan })
                        setShowSectionDetail(true)
                      }}
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      Visualizza
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedPlan(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Chiudi
              </button>
              <button
                onClick={() => {
                  setSelectedTemplate(templates.find(t => t.id === 'expansion'))
                  setShowTemplateConfig(true)
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Modifica
              </button>
              <button
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = '#'
                  link.download = `${selectedPlan.title.replace(/\s+/g, '_')}_BusinessPlan.pdf`
                  link.click()
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Scarica PDF
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Template Configuration Modal */}
      <Modal
        isOpen={showTemplateConfig}
        onClose={() => setShowTemplateConfig(false)}
        title={`Configura ${selectedTemplate?.name}`}
        maxWidth="2xl"
      >
        {selectedTemplate && (
          <div className="space-y-6">
            {/* Template Info */}
            <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg">
              <div className={`p-3 rounded-lg ${selectedTemplate.color} text-white`}>
                <selectedTemplate.icon className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedTemplate.name}</h3>
                <p className="text-gray-600 mb-4">{selectedTemplate.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Difficoltà: {selectedTemplate.difficulty}</span>
                  <span>Durata stimata: {selectedTemplate.duration}</span>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Informazioni di Base</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titolo del Business Plan *</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="es. Espansione Servizi 2024"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Settore di Riferimento</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option value="">Seleziona settore</option>
                    <option value="consulting">Consulenza</option>
                    <option value="tech">Tecnologia</option>
                    <option value="retail">Retail</option>
                    <option value="services">Servizi</option>
                    <option value="manufacturing">Manifatturiero</option>
                    <option value="other">Altro</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione del Progetto</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Descrivi brevemente il tuo progetto o idea di business..."
                ></textarea>
              </div>
            </div>

            {/* Financial Projections */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Proiezioni Finanziarie</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Investimento Iniziale</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                    <input
                      type="number"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="10000"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ricavi Previsti (Anno 1)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                    <input
                      type="number"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="50000"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Periodo di Riferimento</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option value="1">1 Anno</option>
                    <option value="2">2 Anni</option>
                    <option value="3">3 Anni</option>
                    <option value="5">5 Anni</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Market Analysis */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Analisi di Mercato</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target di Riferimento</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="es. PMI del settore manifatturiero"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area Geografica</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option value="local">Locale</option>
                    <option value="regional">Regionale</option>
                    <option value="national">Nazionale</option>
                    <option value="international">Internazionale</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Principali Competitor</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="es. Azienda A, Azienda B, Azienda C"
                />
              </div>
            </div>

            {/* AI Configuration */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <Brain className="h-6 w-6 text-purple-600 mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-900 mb-2">Configurazione AI</h4>
                  <p className="text-sm text-purple-800 mb-4">
                    L'AI analizzerà le tue informazioni per generare un business plan personalizzato
                  </p>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-purple-800">Includi analisi dei competitor</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-purple-800">Genera proiezioni finanziarie dettagliate</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-purple-800">Suggerisci strategie di marketing</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowTemplateConfig(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  setShowTemplateConfig(false)
                  showToast('Business Plan in generazione! Riceverai una notifica quando sarà pronto.', 'info')
                }}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center"
              >
                <Brain className="h-4 w-4 mr-2" />
                Genera con AI
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Section Detail Modal */}
      <Modal
        isOpen={showSectionDetail}
        onClose={() => setShowSectionDetail(false)}
        title={selectedSection?.name || 'Sezione Business Plan'}
        maxWidth="4xl"
      >
        {selectedSection && (
          <div className="space-y-6">
            {/* Section Header */}
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedSection.name}</h3>
              <p className="text-gray-600">
                Business Plan: {selectedSection.plan.title}
              </p>
            </div>

            {/* Section Content */}
            <div className="space-y-6">
              {selectedSection.name === 'Executive Summary' && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Riepilogo Esecutivo</h4>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 mb-4">
                      Il progetto di espansione dei servizi di digital marketing rappresenta un'opportunità
                      strategica per diversificare l'offerta aziendale e incrementare il fatturato del 467%
                      nei prossimi 24 mesi.
                    </p>
                    <h5 className="font-medium text-gray-900 mb-2">Obiettivi Principali:</h5>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>Ampliare la gamma di servizi digitali offerti</li>
                      <li>Acquisire 25 nuovi clienti nel primo anno</li>
                      <li>Raggiungere un ROI del 467% entro il secondo anno</li>
                      <li>Posizionarsi come leader nel mercato locale</li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedSection.name === 'Analisi Mercato' && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Analisi di Mercato</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Dimensione del Mercato</h5>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>• Mercato totale: €2.4 miliardi</p>
                        <p>• Crescita annua: +15.3%</p>
                        <p>• Segmento target: €450 milioni</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Competitor Analysis</h5>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>• Leader di mercato: 3 aziende principali</p>
                        <p>• Quota di mercato disponibile: 23%</p>
                        <p>• Differenziazione: servizi AI-driven</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedSection.name === 'Strategia' && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Strategia Aziendale</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">Go-to-Market Strategy</h5>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Fase 1: Sviluppo competenze interne (mesi 1-3)</li>
                        <li>• Fase 2: Lancio servizi pilota (mesi 4-6)</li>
                        <li>• Fase 3: Scale-up e acquisizione clienti (mesi 7-12)</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h5 className="font-medium text-green-900 mb-2">Vantaggio Competitivo</h5>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• Integrazione AI nei processi di marketing</li>
                        <li>• Approccio data-driven personalizzato</li>
                        <li>• Partnership strategiche con tech providers</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {selectedSection.name === 'Finanze' && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Analisi Finanziaria</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-1">Investimento Totale</p>
                      <p className="text-2xl font-bold text-gray-900">€15,000</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <p className="text-sm text-green-600 mb-1">Ricavi Anno 1</p>
                      <p className="text-2xl font-bold text-green-700">€85,000</p>
                    </div>
                    <div className="p-4 bg-primary-50 rounded-lg text-center">
                      <p className="text-sm text-primary-600 mb-1">ROI Previsto</p>
                      <p className="text-2xl font-bold text-primary-700">467%</p>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3">Break-even Analysis</h5>
                    <p className="text-sm text-gray-700">
                      Il punto di pareggio è previsto per il mese 8, con un fabbisogno di cassa
                      massimo di €12,000 nei primi 6 mesi di operatività.
                    </p>
                  </div>
                </div>
              )}

              {selectedSection.name === 'Timeline' && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Timeline di Implementazione</h4>
                  <div className="space-y-4">
                    {[
                      { quarter: 'Q1 2024', title: 'Setup e Formazione', status: 'completed' },
                      { quarter: 'Q2 2024', title: 'Lancio Servizi Pilota', status: 'in_progress' },
                      { quarter: 'Q3 2024', title: 'Scale-up Operazioni', status: 'pending' },
                      { quarter: 'Q4 2024', title: 'Espansione Mercato', status: 'pending' }
                    ].map((milestone, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${
                          milestone.status === 'completed' ? 'bg-green-500' :
                          milestone.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-300'
                        }`}></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{milestone.quarter}</p>
                          <p className="text-sm text-gray-600">{milestone.title}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          milestone.status === 'completed' ? 'bg-green-100 text-green-600' :
                          milestone.status === 'in_progress' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {milestone.status === 'completed' ? 'Completato' :
                           milestone.status === 'in_progress' ? 'In corso' : 'Pianificato'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowSectionDetail(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Chiudi
              </button>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Modifica Sezione
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}