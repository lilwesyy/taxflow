import { Brain, TrendingUp, BarChart3, Eye, Download, Search, Filter, FileText, Target, AlertTriangle, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import Modal from '../../../common/Modal'

export default function AnalisiAI() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const closeModal = () => {
    setSelectedAnalysis(null)
  }

  const analisiClienti = [
    {
      id: 'ANA-2024-001',
      cliente: 'Mario Rossi',
      azienda: 'Rossi Consulting',
      tipo: 'Analisi di Bilancio',
      status: 'completed',
      dataCreazione: '15/01/2024',
      dataCompletamento: '18/01/2024',
      score: 85,
      insights: 'Liquidità ottima, crescita costante',
      rischi: 'Basso',
      raccomandazioni: 3,
      documentiAnalizzati: ['Bilancio 2023', 'Estratto conto', 'Fatture Q4']
    },
    {
      id: 'ANA-2024-002',
      cliente: 'Laura Bianchi',
      azienda: 'Bianchi Design',
      tipo: 'Valutazione Rischi',
      status: 'in_progress',
      dataCreazione: '20/01/2024',
      dataCompletamento: null,
      score: null,
      insights: 'Analisi in corso...',
      rischi: 'In valutazione',
      raccomandazioni: 0,
      documentiAnalizzati: ['Bilancio 2023', 'Piano aziendale']
    },
    {
      id: 'ANA-2024-003',
      cliente: 'Giuseppe Verdi',
      azienda: 'Verdi Solutions',
      tipo: 'Analisi Processi',
      status: 'completed',
      dataCreazione: '12/01/2024',
      dataCompletamento: '16/01/2024',
      score: 72,
      insights: 'Processi migliorabili identificati',
      rischi: 'Medio',
      raccomandazioni: 5,
      documentiAnalizzati: ['Workflow documentazione', 'Report operativo', 'KPI dashboard']
    },
    {
      id: 'ANA-2024-004',
      cliente: 'Anna Neri',
      azienda: 'Neri Marketing',
      tipo: 'Analisi Strategica',
      status: 'pending',
      dataCreazione: '25/01/2024',
      dataCompletamento: null,
      score: null,
      insights: 'In attesa di documenti',
      rischi: 'Da valutare',
      raccomandazioni: 0,
      documentiAnalizzati: []
    }
  ]

  const tipiAnalisi = [
    {
      id: 'bilancio',
      nome: 'Analisi di Bilancio',
      descrizione: 'Analisi completa della situazione finanziaria',
      icona: BarChart3,
      colore: 'bg-blue-600',
      durata: '2-3 giorni',
      complessità: 'Media'
    },
    {
      id: 'rischi',
      nome: 'Valutazione Rischi',
      descrizione: 'Identificazione rischi operativi e finanziari',
      icona: AlertTriangle,
      colore: 'bg-orange-600',
      durata: '1-2 giorni',
      complessità: 'Alta'
    },
    {
      id: 'processi',
      nome: 'Analisi Processi',
      descrizione: 'Ottimizzazione processi aziendali',
      icona: TrendingUp,
      colore: 'bg-green-600',
      durata: '3-5 giorni',
      complessità: 'Media'
    },
    {
      id: 'strategica',
      nome: 'Analisi Strategica',
      descrizione: 'Supporto pianificazione strategica',
      icona: Target,
      colore: 'bg-purple-600',
      durata: '5-7 giorni',
      complessità: 'Alta'
    }
  ]

  const filteredAnalisi = analisiClienti.filter(analisi => {
    const matchesSearch = analisi.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         analisi.azienda.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         analisi.tipo.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || analisi.status === filterStatus

    return matchesSearch && matchesStatus
  })

  // Pagination calculations
  const totalItems = filteredAnalisi.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAnalisi = filteredAnalisi.slice(startIndex, endIndex)

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
      case 'completed': return 'Completata'
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

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'basso': return 'text-green-600'
      case 'medio': return 'text-yellow-600'
      case 'alto': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const stats = [
    { title: 'Analisi Totali', value: analisiClienti.length.toString(), icon: Brain, color: 'text-purple-600' },
    { title: 'Completate', value: analisiClienti.filter(a => a.status === 'completed').length.toString(), icon: CheckCircle, color: 'text-green-600' },
    { title: 'In Corso', value: analisiClienti.filter(a => a.status === 'in_progress').length.toString(), icon: Clock, color: 'text-yellow-600' },
    { title: 'Score Medio', value: Math.round(analisiClienti.filter(a => a.score).reduce((sum, a) => sum + (a.score || 0), 0) / analisiClienti.filter(a => a.score).length).toString(), icon: TrendingUp, color: 'text-blue-600' }
  ]

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color === 'text-purple-600' ? 'bg-purple-50' : stat.color === 'text-green-600' ? 'bg-green-50' : stat.color === 'text-yellow-600' ? 'bg-yellow-50' : 'bg-blue-50'} group-hover:scale-110 transition-transform`}>
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
                placeholder="Cerca per cliente, azienda o tipo analisi..."
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
                <option value="in_progress">In corso</option>
                <option value="completed">Completata</option>
              </select>
            </div>
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg">
              Nuova Analisi
            </button>
          </div>
        </div>
      </div>

      {/* Analyses Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Analisi</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Cliente</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Tipo</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Score</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Rischi</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentAnalisi.map((analisi) => (
                <tr key={analisi.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <Brain className="h-4 w-4 text-purple-600 mr-2" />
                      <div>
                        <p className="font-medium text-gray-900">{analisi.id}</p>
                        <p className="text-sm text-gray-500">{analisi.dataCreazione}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{analisi.cliente}</p>
                      <p className="text-sm text-gray-500">{analisi.azienda}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-gray-900">{analisi.tipo}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(analisi.status)}`}>
                      {getStatusIcon(analisi.status)}
                      <span className="ml-1">{getStatusText(analisi.status)}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {analisi.score ? (
                      <div className="flex items-center">
                        <span className={`font-semibold ${
                          analisi.score >= 80 ? 'text-green-600' :
                          analisi.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {analisi.score}/100
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`font-medium ${getRiskColor(analisi.rischi)}`}>
                      {analisi.rischi}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedAnalysis(analisi)}
                        className="text-primary-600 hover:text-primary-700 p-1 rounded hover:bg-primary-50 hover:scale-110 transition-all duration-200"
                        title="Visualizza dettagli"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {analisi.status === 'completed' && (
                        <button className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50 hover:scale-110 transition-all duration-200" title="Scarica report">
                          <Download className="h-4 w-4" />
                        </button>
                      )}
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
    </div>
  )

  const renderTypesTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Tipi di Analisi AI</h3>
        <p className="text-gray-600">Scegli il tipo di analisi più adatto per il tuo cliente</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tipiAnalisi.map((tipo) => (
          <div key={tipo.id} className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10">
            <div className="flex items-start space-x-4">
              <div className={`p-4 rounded-lg ${tipo.colore} text-white group-hover:scale-110 transition-transform`}>
                <tipo.icona className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">{tipo.nome}</h4>
                <p className="text-sm text-gray-600 mb-4">{tipo.descrizione}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                  <span>Durata: {tipo.durata}</span>
                  <span>Complessità: {tipo.complessità}</span>
                </div>
                <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg">
                  Avvia Analisi
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
            <h4 className="font-semibold text-purple-900 mb-2">AI Analysis Engine</h4>
            <p className="text-sm text-purple-800 mb-4">
              Il nostro motore di intelligenza artificiale analizza automaticamente i documenti dei clienti
              per fornire insights approfonditi e raccomandazioni personalizzate.
            </p>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Elaborazione automatica di documenti finanziari</li>
              <li>• Identificazione pattern e anomalie</li>
              <li>• Benchmarking con settore di riferimento</li>
              <li>• Raccomandazioni strategiche personalizzate</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview', name: 'Panoramica', icon: BarChart3 },
    { id: 'types', name: 'Tipi Analisi', icon: Brain }
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
      {activeTab === 'overview' ? renderOverviewTab() : renderTypesTab()}

      {/* Analysis Detail Modal */}
      <Modal
        isOpen={!!selectedAnalysis}
        onClose={closeModal}
        title={selectedAnalysis ? `${selectedAnalysis.id} - ${selectedAnalysis.tipo} - ${selectedAnalysis.cliente}` : ""}
        maxWidth="4xl"
      >
        {selectedAnalysis && (
          <div className="space-y-6">
              {/* Status e Score */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 text-sm rounded-full ${getStatusColor(selectedAnalysis.status)}`}>
                    {getStatusIcon(selectedAnalysis.status)}
                    <span className="ml-2">{getStatusText(selectedAnalysis.status)}</span>
                  </span>
                </div>
                {selectedAnalysis.score && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Score</p>
                    <p className={`text-2xl font-bold ${
                      selectedAnalysis.score >= 80 ? 'text-green-600' :
                      selectedAnalysis.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {selectedAnalysis.score}/100
                    </p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Livello Rischio</p>
                  <p className={`text-lg font-semibold ${getRiskColor(selectedAnalysis.rischi)}`}>
                    {selectedAnalysis.rischi}
                  </p>
                </div>
              </div>

              {/* Insights */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Insights Principali</h4>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-900">{selectedAnalysis.insights}</p>
                </div>
              </div>

              {/* Documenti Analizzati */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Documenti Analizzati</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedAnalysis.documentiAnalizzati.map((doc: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-900">{doc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raccomandazioni */}
              {selectedAnalysis.raccomandazioni > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Raccomandazioni ({selectedAnalysis.raccomandazioni})</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-900">Ottimizzare la gestione del cash flow</p>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-900">Diversificare le fonti di ricavo</p>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-900">Implementare controlli di gestione</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105 hover:shadow-sm">
                  Condividi con Cliente
                </button>
                {selectedAnalysis.status === 'completed' && (
                  <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Scarica Report
                  </button>
                )}
              </div>
            </div>
          )}
      </Modal>
    </div>
  )
}