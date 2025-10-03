import { Brain, TrendingUp, AlertTriangle, FileText, BarChart3, DollarSign, Eye, Upload, Download } from 'lucide-react'
import { useState } from 'react'
import Modal from '../../../common/Modal'
import { useToast } from '../../../../context/ToastContext'

export default function AnalisiAI() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [showReportModal, setShowReportModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [uploadType, setUploadType] = useState('')

  const analisiDisponibili = [
    {
      id: 'bilancio',
      title: 'Analisi di Bilancio',
      description: 'Esamina stato patrimoniale, conto economico e flussi di cassa',
      icon: BarChart3,
      status: 'completed',
      lastUpdate: '15/01/2024',
      insights: 'Liquidità ottima, crescita costante',
      score: 85
    },
    {
      id: 'processi',
      title: 'Analisi Processi Aziendali',
      description: 'Valuta efficienza dei processi interni',
      icon: TrendingUp,
      status: 'in_progress',
      lastUpdate: '10/01/2024',
      insights: 'Miglioramenti identificati',
      score: 72
    },
    {
      id: 'rischio',
      title: 'Valutazione Rischio d\'Impresa',
      description: 'Identifica rischi finanziari, operativi e di mercato',
      icon: AlertTriangle,
      status: 'pending',
      lastUpdate: '-',
      insights: 'In attesa di documenti',
      score: null
    },
    {
      id: 'strategica',
      title: 'Analisi Strategica',
      description: 'Supporto per pianificazione strategica e crescita',
      icon: Brain,
      status: 'completed',
      lastUpdate: '20/12/2023',
      insights: 'Opportunità di espansione',
      score: 78
    }
  ]

  const metriche = [
    { title: 'Redditività', value: '85%', trend: '+12%', color: 'text-green-600', bgColor: 'bg-green-50' },
    { title: 'Liquidità', value: '92%', trend: '+5%', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Solidità', value: '78%', trend: '+8%', color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { title: 'Cash Flow', value: '€ 15.2k', trend: '+15%', color: 'text-accent-600', bgColor: 'bg-accent-50' }
  ]

  const reportRecenti = [
    {
      title: 'Report Analisi Q4 2023',
      type: 'Analisi Completa',
      date: '15/01/2024',
      size: '2.4 MB',
      status: 'completed'
    },
    {
      title: 'Valutazione Rischi Operativi',
      type: 'Risk Assessment',
      date: '10/01/2024',
      size: '1.8 MB',
      status: 'completed'
    },
    {
      title: 'Piano Ottimizzazione Processi',
      type: 'Process Analysis',
      date: '05/01/2024',
      size: '3.1 MB',
      status: 'completed'
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Metriche principali */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metriche.map((metrica, index) => (
                <div key={index} className={`${metrica.bgColor} rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{metrica.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{metrica.value}</p>
                      <p className={`text-sm ${metrica.color} flex items-center mt-1`}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {metrica.trend}
                      </p>
                    </div>
                    <DollarSign className={`h-8 w-8 ${metrica.color}`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Analisi disponibili */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analisiDisponibili.map((analisi) => (
                <div key={analisi.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-lg ${
                        analisi.status === 'completed' ? 'bg-green-50' :
                        analisi.status === 'in_progress' ? 'bg-yellow-50' : 'bg-gray-50'
                      }`}>
                        <analisi.icon className={`h-6 w-6 ${
                          analisi.status === 'completed' ? 'text-green-600' :
                          analisi.status === 'in_progress' ? 'text-yellow-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{analisi.title}</h3>
                        <p className="text-sm text-gray-600">{analisi.description}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      analisi.status === 'completed' ? 'bg-green-100 text-green-600' :
                      analisi.status === 'in_progress' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {analisi.status === 'completed' ? 'Completata' :
                       analisi.status === 'in_progress' ? 'In corso' : 'In attesa'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ultimo aggiornamento:</span>
                      <span className="text-gray-900">{analisi.lastUpdate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Insights:</span>
                      <span className="text-gray-900">{analisi.insights}</span>
                    </div>
                    {analisi.score && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Score:</span>
                        <span className={`font-semibold ${
                          analisi.score >= 80 ? 'text-green-600' :
                          analisi.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {analisi.score}/100
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                    <button
                      disabled={analisi.status === 'pending'}
                      onClick={() => setSelectedAnalysis(analisi)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed hover:scale-110 transition-transform duration-200"
                    >
                      <Eye className="h-4 w-4 inline mr-1" />
                      Visualizza
                    </button>
                    {analisi.status === 'completed' && (
                      <button
                        onClick={() => {
                          // Simulate download
                          const link = document.createElement('a')
                          link.href = '#'
                          link.download = `${analisi.title.replace(/\s+/g, '_')}_Report.pdf`
                          link.click()
                        }}
                        className="text-accent-600 hover:text-accent-700 text-sm font-medium hover:scale-110 transition-transform duration-200"
                      >
                        <Download className="h-4 w-4 inline mr-1" />
                        Scarica
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'reports':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Report Disponibili</h3>
              <button
                onClick={() => setShowReportModal(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Genera Nuovo Report
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="divide-y divide-gray-200">
                {reportRecenti.map((report, index) => (
                  <div key={index} className="p-6 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary-50 rounded-lg">
                          <FileText className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{report.title}</h4>
                          <p className="text-sm text-gray-600">{report.type}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">{report.date}</span>
                            <span className="text-xs text-gray-500">{report.size}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="text-primary-600 hover:text-primary-700 p-2 rounded-lg hover:bg-primary-50 hover:scale-110 transition-transform duration-200"
                          title="Visualizza report"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            // Simulate download
                            const link = document.createElement('a')
                            link.href = '#'
                            link.download = `${report.title.replace(/\s+/g, '_')}.pdf`
                            link.click()
                          }}
                          className="text-accent-600 hover:text-accent-700 p-2 rounded-lg hover:bg-accent-50 hover:scale-110 transition-transform duration-200"
                          title="Scarica report"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'upload':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Carica Documenti per Analisi</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Bilanci</h4>
                <p className="text-sm text-gray-600 mb-4">Carica i tuoi bilanci per l'analisi finanziaria</p>
                <button
                  onClick={() => {
                    setUploadType('bilanci')
                    setShowUploadModal(true)
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  Carica Bilanci
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                <Upload className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Fatture</h4>
                <p className="text-sm text-gray-600 mb-4">Carica fatture per analisi dei ricavi</p>
                <button
                  onClick={() => {
                    setUploadType('fatture')
                    setShowUploadModal(true)
                  }}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  Carica Fatture
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                <Upload className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Altri Documenti</h4>
                <p className="text-sm text-gray-600 mb-4">Contratti, estratti conto, etc.</p>
                <button
                  onClick={() => {
                    setUploadType('documenti')
                    setShowUploadModal(true)
                  }}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  Carica Documenti
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <Brain className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Come funziona l'Analisi AI</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• I tuoi documenti vengono analizzati con algoritmi avanzati</li>
                    <li>• Vengono identificati pattern, trend e anomalie</li>
                    <li>• Ricevi insights personalizzati e raccomandazioni</li>
                    <li>• Tutti i dati sono protetti e crittografati</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const tabs = [
    { id: 'overview', name: 'Panoramica', icon: BarChart3 },
    { id: 'reports', name: 'Report', icon: FileText },
    { id: 'upload', name: 'Carica Documenti', icon: Upload }
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
      {renderTabContent()}

      {/* Analysis Details Modal */}
      <Modal
        isOpen={!!selectedAnalysis}
        onClose={() => setSelectedAnalysis(null)}
        title={selectedAnalysis?.title || 'Dettagli Analisi'}
        maxWidth="4xl"
      >
        {selectedAnalysis && (
          <div className="space-y-6">
            {/* Analysis Header */}
            <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg">
              <div className={`p-3 rounded-lg ${
                selectedAnalysis.status === 'completed' ? 'bg-green-50' :
                selectedAnalysis.status === 'in_progress' ? 'bg-yellow-50' : 'bg-gray-50'
              }`}>
                <selectedAnalysis.icon className={`h-8 w-8 ${
                  selectedAnalysis.status === 'completed' ? 'text-green-600' :
                  selectedAnalysis.status === 'in_progress' ? 'text-yellow-600' : 'text-gray-400'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedAnalysis.title}</h3>
                <p className="text-gray-600 mb-4">{selectedAnalysis.description}</p>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    selectedAnalysis.status === 'completed' ? 'bg-green-100 text-green-600' :
                    selectedAnalysis.status === 'in_progress' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedAnalysis.status === 'completed' ? 'Completata' :
                     selectedAnalysis.status === 'in_progress' ? 'In corso' : 'In attesa'}
                  </span>
                  {selectedAnalysis.score && (
                    <span className={`font-semibold ${
                      selectedAnalysis.score >= 80 ? 'text-green-600' :
                      selectedAnalysis.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      Score: {selectedAnalysis.score}/100
                    </span>
                  )}
                </div>
              </div>
            </div>

            {selectedAnalysis.status === 'completed' && (
              <>
                {/* Key Metrics */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Metriche Chiave</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedAnalysis.id === 'bilancio' && (
                      <>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-green-600 font-medium">Liquidità</p>
                          <p className="text-2xl font-bold text-green-700">92%</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-blue-600 font-medium">ROI</p>
                          <p className="text-2xl font-bold text-blue-700">15.3%</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm text-purple-600 font-medium">Debt Ratio</p>
                          <p className="text-2xl font-bold text-purple-700">0.35</p>
                        </div>
                      </>
                    )}
                    {selectedAnalysis.id === 'strategica' && (
                      <>
                        <div className="bg-accent-50 p-4 rounded-lg">
                          <p className="text-sm text-accent-600 font-medium">Market Share</p>
                          <p className="text-2xl font-bold text-accent-700">12%</p>
                        </div>
                        <div className="bg-primary-50 p-4 rounded-lg">
                          <p className="text-sm text-primary-600 font-medium">Growth Rate</p>
                          <p className="text-2xl font-bold text-primary-700">25%</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <p className="text-sm text-yellow-600 font-medium">SWOT Score</p>
                          <p className="text-2xl font-bold text-yellow-700">78/100</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Insights and Recommendations */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Insights e Raccomandazioni</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h5 className="font-semibold text-blue-900 mb-3">Punti di Forza</h5>
                    <ul className="text-sm text-blue-800 space-y-1 mb-4">
                      <li>• Eccellente posizione di liquidità</li>
                      <li>• Crescita costante dei ricavi</li>
                      <li>• Basso livello di indebitamento</li>
                    </ul>
                    <h5 className="font-semibold text-blue-900 mb-3">Aree di Miglioramento</h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Ottimizzare i tempi di incasso</li>
                      <li>• Diversificare i canali di vendita</li>
                      <li>• Investire in automazione</li>
                    </ul>
                  </div>
                </div>

                {/* Action Items */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Piano d'Azione</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">Priorità Alta</p>
                        <p className="text-sm text-gray-600">Implementare sistema di fatturazione automatica</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">Priorità Media</p>
                        <p className="text-sm text-gray-600">Sviluppare strategia di marketing digitale</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">Priorità Bassa</p>
                        <p className="text-sm text-gray-600">Valutare espansione geografica</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Chiudi
              </button>
              {selectedAnalysis.status === 'completed' && (
                <button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = '#'
                    link.download = `${selectedAnalysis.title.replace(/\s+/g, '_')}_Report.pdf`
                    link.click()
                  }}
                  className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  <Download className="h-4 w-4 inline mr-2" />
                  Scarica Report
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Report Generation Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Genera Nuovo Report"
        maxWidth="2xl"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo di Report</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="">Seleziona tipo di report</option>
              <option value="financial">Analisi Finanziaria Completa</option>
              <option value="risk">Valutazione Rischi</option>
              <option value="performance">Performance Aziendale</option>
              <option value="strategic">Analisi Strategica</option>
              <option value="custom">Report Personalizzato</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Periodo di Analisi</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Data Inizio</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Data Fine</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sezioni da Includere</label>
            <div className="space-y-2">
              {[
                'Analisi Finanziaria',
                'Indicatori di Performance',
                'Valutazione Rischi',
                'Benchmarking Settoriale',
                'Raccomandazioni Strategiche',
                'Piano d\'Azione'
              ].map((section, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{section}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Note Aggiuntive</label>
            <textarea
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Aggiungi note specifiche per il report..."
            ></textarea>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Generazione AI</h4>
                <p className="text-sm text-blue-800">
                  Il report sarà generato automaticamente dall'AI utilizzando i tuoi dati aziendali.
                  Tempo stimato: 5-10 minuti.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowReportModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={() => {
                setShowReportModal(false)
                // Simulate report generation
                showToast('Report in generazione! Riceverai una notifica quando sarà pronto.', 'info')
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Genera Report
            </button>
          </div>
        </div>
      </Modal>

      {/* Report Details Modal */}
      <Modal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title={selectedReport?.title || 'Dettagli Report'}
        maxWidth="4xl"
      >
        {selectedReport && (
          <div className="space-y-6">
            {/* Report Preview */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start space-x-4 mb-6">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <FileText className="h-8 w-8 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedReport.title}</h3>
                  <p className="text-gray-600 mb-2">{selectedReport.type}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Generato il: {selectedReport.date}</span>
                    <span>Dimensione: {selectedReport.size}</span>
                  </div>
                </div>
              </div>

              {/* Report Content Preview */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Anteprima Contenuto</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Executive Summary</h5>
                    <p className="text-sm text-gray-600">
                      Il periodo analizzato mostra una crescita costante dell'azienda con indicatori
                      finanziari positivi. La liquidità è ottima e il livello di indebitamento è contenuto...
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Indicatori Chiave</h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-3 bg-green-50 rounded">
                        <p className="font-medium text-green-600">ROI</p>
                        <p className="text-lg font-bold text-green-700">15.3%</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <p className="font-medium text-blue-600">Liquidità</p>
                        <p className="text-lg font-bold text-blue-700">92%</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded">
                        <p className="font-medium text-purple-600">Crescita</p>
                        <p className="text-lg font-bold text-purple-700">+12%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Chiudi
              </button>
              <button
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = '#'
                  link.download = `${selectedReport.title.replace(/\s+/g, '_')}.pdf`
                  link.click()
                }}
                className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <Download className="h-4 w-4 inline mr-2" />
                Scarica PDF
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title={`Carica ${uploadType.charAt(0).toUpperCase() + uploadType.slice(1)}`}
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {/* Drag and Drop Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Trascina i file qui o clicca per selezionare
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Formati supportati: PDF, DOC, DOCX, XLS, XLSX (Max 10MB per file)
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors cursor-pointer inline-block"
            >
              Seleziona File
            </label>
          </div>

          {/* File Type Specific Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              Suggerimenti per {uploadType}
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {uploadType === 'bilanci' && (
                <>
                  <li>• Includi Stato Patrimoniale e Conto Economico</li>
                  <li>• Carica bilanci degli ultimi 3 anni per un'analisi completa</li>
                  <li>• Assicurati che i documenti siano leggibili</li>
                </>
              )}
              {uploadType === 'fatture' && (
                <>
                  <li>• Carica fatture degli ultimi 12 mesi</li>
                  <li>• Includi sia fatture attive che passive</li>
                  <li>• I file devono essere in formato elettronico</li>
                </>
              )}
              {uploadType === 'documenti' && (
                <>
                  <li>• Contratti di vendita, fornitura, lavoro</li>
                  <li>• Estratti conto bancari</li>
                  <li>• Documenti di certificazione qualità</li>
                </>
              )}
            </ul>
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Brain className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Privacy e Sicurezza</h4>
                <p className="text-sm text-gray-600">
                  I tuoi documenti sono protetti con crittografia end-to-end e vengono utilizzati
                  esclusivamente per l'analisi AI. Non vengono condivisi con terze parti.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowUploadModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={() => {
                setShowUploadModal(false)
                showToast('File caricati con successo! L\'analisi inizierà automaticamente.', 'success')
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              <Upload className="h-4 w-4 inline mr-2" />
              Carica e Analizza
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}