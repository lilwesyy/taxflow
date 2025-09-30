import { FileText, Upload, Eye, Search, Filter, CheckCircle, Clock, AlertTriangle, Download, Trash2, FolderOpen, Building } from 'lucide-react'
import { useState, useEffect } from 'react'
import Modal from '../../../common/Modal'

export default function Documenti() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('documenti')

  useEffect(() => {
    // Check if there's a hash in the URL to set the active tab
    const hash = window.location.hash.substring(1)
    if (hash && ['documenti', 'richieste', 'apertura-piva'].includes(hash)) {
      setActiveTab(hash)
      // Clear the hash after setting the tab
      window.location.hash = ''
    }
  }, [])

  const [uploadForm, setUploadForm] = useState({
    nome: '',
    tipo: 'bilancio',
    descrizione: '',
    categoria: 'fiscale',
    file: null as File | null
  })

  const documenti = [
    {
      id: 'doc-001',
      nome: 'Bilancio 2023',
      tipo: 'bilancio',
      formato: 'PDF',
      dimensione: '1.8 MB',
      categoria: 'fiscale',
      dataCaricamento: '15/01/2024',
      dataModifica: '15/01/2024',
      status: 'elaborato',
      inviataA: 'Dr. Marco Bianchi',
      descrizione: 'Bilancio completo anno fiscale 2023',
      versione: '1.0',
      note: 'Documento contabile principale per dichiarazione dei redditi',
      cronologia: [
        { data: '15/01/2024', azione: 'Documento caricato', utente: 'Mario Rossi' },
        { data: '16/01/2024', azione: 'Documento ricevuto', utente: 'Dr. Marco Bianchi' },
        { data: '18/01/2024', azione: 'Elaborazione completata', utente: 'Dr. Marco Bianchi' }
      ]
    },
    {
      id: 'doc-002',
      nome: 'Fatture Gennaio 2024',
      tipo: 'fatture',
      formato: 'ZIP',
      dimensione: '4.2 MB',
      categoria: 'fatturazione',
      dataCaricamento: '20/01/2024',
      dataModifica: '20/01/2024',
      status: 'in_elaborazione',
      inviataA: 'Dr. Laura Verdi',
      descrizione: 'Raccolta fatture emesse e ricevute gennaio 2024',
      versione: '1.0',
      note: 'Include 15 fatture attive e 8 passive',
      cronologia: [
        { data: '20/01/2024', azione: 'Documento caricato', utente: 'Mario Rossi' },
        { data: '20/01/2024', azione: 'Documento ricevuto', utente: 'Dr. Laura Verdi' }
      ]
    },
    {
      id: 'doc-003',
      nome: 'Contratto Locazione Ufficio',
      tipo: 'contratto',
      formato: 'PDF',
      dimensione: '0.8 MB',
      categoria: 'legale',
      dataCaricamento: '22/01/2024',
      dataModifica: '22/01/2024',
      status: 'in_attesa',
      inviataA: 'Dr. Marco Bianchi',
      descrizione: 'Contratto di locazione sede operativa',
      versione: '1.0',
      note: 'Necessario per deduzione costi ufficio',
      cronologia: [
        { data: '22/01/2024', azione: 'Documento caricato', utente: 'Mario Rossi' }
      ]
    },
    {
      id: 'doc-004',
      nome: 'Estratti Conto Q4 2023',
      tipo: 'estratto_conto',
      formato: 'PDF',
      dimensione: '2.1 MB',
      categoria: 'bancario',
      dataCaricamento: '25/01/2024',
      dataModifica: '25/01/2024',
      status: 'elaborato',
      inviataA: 'Dr. Marco Bianchi',
      descrizione: 'Estratti conto bancari ultimo trimestre 2023',
      versione: '1.0',
      note: 'Movimenti necessari per quadratura contabile',
      cronologia: [
        { data: '25/01/2024', azione: 'Documento caricato', utente: 'Mario Rossi' },
        { data: '25/01/2024', azione: 'Documento ricevuto', utente: 'Dr. Marco Bianchi' },
        { data: '26/01/2024', azione: 'Elaborazione completata', utente: 'Dr. Marco Bianchi' }
      ]
    }
  ]

  const documentiAperturaPiva = [
    {
      id: 'piva-001',
      nome: 'Documento Identità - Mario Rossi',
      tipo: 'documento_identita',
      formato: 'PDF',
      dimensione: '0.5 MB',
      categoria: 'identita',
      dataCaricamento: '10/01/2024',
      dataModifica: '10/01/2024',
      status: 'approvato',
      richiestaId: 'REQ-001',
      descrizione: 'Carta d\'identità fronte/retro per apertura P.IVA',
      versione: '1.0',
      note: 'Documento valido fino al 2029',
      cronologia: [
        { data: '10/01/2024', azione: 'Documento caricato', utente: 'Mario Rossi' },
        { data: '11/01/2024', azione: 'Documento verificato', utente: 'Sistema' },
        { data: '11/01/2024', azione: 'Documento approvato', utente: 'Dr. Marco Bianchi' }
      ]
    },
    {
      id: 'piva-002',
      nome: 'Codice Fiscale - Mario Rossi',
      tipo: 'codice_fiscale',
      formato: 'PDF',
      dimensione: '0.3 MB',
      categoria: 'identita',
      dataCaricamento: '10/01/2024',
      dataModifica: '10/01/2024',
      status: 'approvato',
      richiestaId: 'REQ-001',
      descrizione: 'Tessera sanitaria con codice fiscale',
      versione: '1.0',
      note: 'Documento valido',
      cronologia: [
        { data: '10/01/2024', azione: 'Documento caricato', utente: 'Mario Rossi' },
        { data: '11/01/2024', azione: 'Documento approvato', utente: 'Dr. Marco Bianchi' }
      ]
    },
    {
      id: 'piva-003',
      nome: 'Contratto Locazione Ufficio',
      tipo: 'contratto_locazione',
      formato: 'PDF',
      dimensione: '1.2 MB',
      categoria: 'sede',
      dataCaricamento: '12/01/2024',
      dataModifica: '12/01/2024',
      status: 'in_revisione',
      richiestaId: 'REQ-001',
      descrizione: 'Contratto di locazione per sede operativa',
      versione: '1.0',
      note: 'In attesa di verifica clausole',
      cronologia: [
        { data: '12/01/2024', azione: 'Documento caricato', utente: 'Mario Rossi' },
        { data: '12/01/2024', azione: 'Documento in revisione', utente: 'Dr. Marco Bianchi' }
      ]
    },
    {
      id: 'piva-004',
      nome: 'Visura Camerale',
      tipo: 'visura_camerale',
      formato: 'PDF',
      dimensione: '0.7 MB',
      categoria: 'camerale',
      dataCaricamento: '13/01/2024',
      dataModifica: '13/01/2024',
      status: 'richiesto',
      richiestaId: 'REQ-002',
      descrizione: 'Visura camerale storica',
      versione: '1.0',
      note: 'Documento richiesto per pratica in corso',
      cronologia: [
        { data: '13/01/2024', azione: 'Documento richiesto', utente: 'Dr. Laura Verdi' }
      ]
    },
    {
      id: 'piva-005',
      nome: 'Dichiarazione Inizio Attività',
      tipo: 'dichiarazione_attivita',
      formato: 'PDF',
      dimensione: '0.9 MB',
      categoria: 'attivita',
      dataCaricamento: '14/01/2024',
      dataModifica: '14/01/2024',
      status: 'bozza',
      richiestaId: 'REQ-002',
      descrizione: 'Dichiarazione di inizio attività compilata',
      versione: '2.0',
      note: 'Bozza in fase di completamento',
      cronologia: [
        { data: '14/01/2024', azione: 'Bozza creata', utente: 'Dr. Laura Verdi' },
        { data: '15/01/2024', azione: 'Bozza aggiornata', utente: 'Dr. Laura Verdi' }
      ]
    }
  ]

  const richiesteDaConsulente = [
    {
      id: 'req-001',
      consulente: 'Dr. Marco Bianchi',
      tipo: 'documenti_fiscali',
      descrizione: 'Documenti necessari per dichiarazione IVA trimestrale',
      dataRichiesta: '23/01/2024',
      scadenza: '30/01/2024',
      priorita: 'alta',
      status: 'in_attesa',
      documenti: [
        'Fatture Q4 2023',
        'Corrispettivi dicembre 2023',
        'Ricevute fiscali'
      ]
    },
    {
      id: 'req-002',
      consulente: 'Dr. Laura Verdi',
      tipo: 'business_plan',
      descrizione: 'Documenti per aggiornamento business plan',
      dataRichiesta: '20/01/2024',
      scadenza: '05/02/2024',
      priorita: 'media',
      status: 'completata',
      documenti: [
        'Proiezioni finanziarie 2024',
        'Analisi competitor',
        'Piano marketing'
      ]
    }
  ]



  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulazione upload
    alert('Documento caricato con successo!')
    setIsUploadModalOpen(false)
    setUploadForm({
      nome: '',
      tipo: 'bilancio',
      descrizione: '',
      categoria: 'fiscale',
      file: null
    })
  }

  const filteredDocumenti = documenti.filter(doc => {
    const matchesSearch = doc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.descrizione.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || doc.tipo === filterType
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'elaborato': return 'bg-green-100 text-green-600'
      case 'approvato': return 'bg-green-100 text-green-600'
      case 'in_elaborazione': return 'bg-blue-100 text-blue-600'
      case 'in_revisione': return 'bg-blue-100 text-blue-600'
      case 'in_attesa': return 'bg-yellow-100 text-yellow-600'
      case 'richiesto': return 'bg-yellow-100 text-yellow-600'
      case 'bozza': return 'bg-gray-100 text-gray-600'
      case 'rifiutato': return 'bg-red-100 text-red-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'elaborato': return 'Elaborato'
      case 'approvato': return 'Approvato'
      case 'in_elaborazione': return 'In elaborazione'
      case 'in_revisione': return 'In revisione'
      case 'in_attesa': return 'In attesa'
      case 'richiesto': return 'Richiesto'
      case 'bozza': return 'Bozza'
      case 'rifiutato': return 'Rifiutato'
      default: return 'Sconosciuto'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'elaborato': return <CheckCircle className="h-4 w-4" />
      case 'approvato': return <CheckCircle className="h-4 w-4" />
      case 'in_elaborazione': return <Clock className="h-4 w-4" />
      case 'in_revisione': return <Clock className="h-4 w-4" />
      case 'in_attesa': return <Clock className="h-4 w-4" />
      case 'richiesto': return <Clock className="h-4 w-4" />
      case 'bozza': return <FileText className="h-4 w-4" />
      case 'rifiutato': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'text-red-600 bg-red-50'
      case 'media': return 'text-yellow-600 bg-yellow-50'
      case 'bassa': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const renderDocumentiTab = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Documenti Totali</p>
              <p className="text-2xl font-bold text-gray-900">{documenti.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Elaborati</p>
              <p className="text-2xl font-bold text-gray-900">{documenti.filter(d => d.status === 'elaborato').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">In elaborazione</p>
              <p className="text-2xl font-bold text-gray-900">{documenti.filter(d => d.status === 'in_elaborazione').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <Upload className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Caricati Questo Mese</p>
              <p className="text-2xl font-bold text-gray-900">{documenti.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca documenti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Tutti i tipi</option>
                <option value="bilancio">Bilanci</option>
                <option value="fatture">Fatture</option>
                <option value="contratto">Contratti</option>
                <option value="estratto_conto">Estratti Conto</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Tutti gli stati</option>
                <option value="elaborato">Elaborato</option>
                <option value="in_elaborazione">In elaborazione</option>
                <option value="in_attesa">In attesa</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Carica Documento
          </button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocumenti.map((documento) => (
          <div key={documento.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <FileText className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{documento.nome}</h3>
                  <p className="text-sm text-gray-600 mb-2">{documento.descrizione}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{documento.formato}</span>
                    <span>•</span>
                    <span>{documento.dimensione}</span>
                  </div>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(documento.status)}`}>
                {getStatusIcon(documento.status)}
                <span className="ml-1">{getStatusText(documento.status)}</span>
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Inviato a:</span>
                <span className="text-gray-900">{documento.inviataA}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Data caricamento:</span>
                <span className="text-gray-900">{documento.dataCaricamento}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Categoria:</span>
                <span className="text-gray-900 capitalize">{documento.categoria}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button
                onClick={() => setSelectedDocument(documento)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center hover:scale-110 transition-transform duration-200"
              >
                <Eye className="h-4 w-4 mr-1" />
                Visualizza
              </button>
              <div className="flex items-center space-x-2">
                <button className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50 hover:scale-110 transition-transform duration-200" title="Download">
                  <Download className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 hover:scale-110 transition-transform duration-200" title="Elimina">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderRichiesteTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Richieste dai Consulenti</h3>
          <p className="text-gray-600">Documenti richiesti dai tuoi consulenti</p>
        </div>
      </div>

      <div className="space-y-4">
        {richiesteDaConsulente.map((richiesta) => (
          <div key={richiesta.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <FolderOpen className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{richiesta.descrizione}</h4>
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getPriorityColor(richiesta.priorita)}`}>
                      Priorità {richiesta.priorita}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Richiesto da: <span className="font-medium text-gray-900">{richiesta.consulente}</span></span>
                      <span>•</span>
                      <span>Data: {richiesta.dataRichiesta}</span>
                      <span>•</span>
                      <span>Scadenza: {richiesta.scadenza}</span>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Documenti richiesti:</p>
                      <div className="flex flex-wrap gap-2">
                        {richiesta.documenti.map((doc, index) => (
                          <span key={index} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                  richiesta.status === 'completata' ? 'bg-green-100 text-green-600' :
                  richiesta.status === 'in_attesa' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {richiesta.status === 'completata' ? 'Completata' : 'In attesa'}
                </span>
                {richiesta.status === 'in_attesa' && (
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-primary-600 text-white px-3 py-1 rounded text-xs hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  >
                    Carica Documenti
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderAperturaPivaTab = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Documenti P.IVA</p>
              <p className="text-2xl font-bold text-gray-900">{documentiAperturaPiva.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Approvati</p>
              <p className="text-2xl font-bold text-gray-900">{documentiAperturaPiva.filter(d => d.status === 'approvato').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">In revisione</p>
              <p className="text-2xl font-bold text-gray-900">{documentiAperturaPiva.filter(d => d.status === 'in_revisione' || d.status === 'richiesto').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Bozze</p>
              <p className="text-2xl font-bold text-gray-900">{documentiAperturaPiva.filter(d => d.status === 'bozza').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Documenti Apertura P.IVA</h3>
            <p className="text-gray-600">Gestisci i documenti necessari per l'apertura della partita IVA</p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Carica Documento
          </button>
        </div>
      </div>

      {/* Documents by Category */}
      <div className="space-y-6">
        {['identita', 'sede', 'camerale', 'attivita'].map((categoria) => {
          const documentiCategoria = documentiAperturaPiva.filter(doc => doc.categoria === categoria)
          const categoriaNome = {
            'identita': 'Documenti di Identità',
            'sede': 'Documenti Sede',
            'camerale': 'Documenti Camerali',
            'attivita': 'Documenti Attività'
          }[categoria]

          if (documentiCategoria.length === 0) return null

          return (
            <div key={categoria} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="h-5 w-5 text-primary-600 mr-2" />
                {categoriaNome}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documentiCategoria.map((documento) => (
                  <div key={documento.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="p-2 bg-primary-50 rounded-lg">
                          <FileText className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-900 mb-1 truncate">{documento.nome}</h5>
                          <p className="text-sm text-gray-600 mb-2">{documento.descrizione}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{documento.formato}</span>
                            <span>•</span>
                            <span>{documento.dimensione}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(documento.status)}`}>
                        {getStatusIcon(documento.status)}
                        <span className="ml-1">{getStatusText(documento.status)}</span>
                      </span>
                    </div>

                    <div className="space-y-1 mb-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Richiesta:</span>
                        <span className="text-gray-900">{documento.richiestaId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Data:</span>
                        <span className="text-gray-900">{documento.dataCaricamento}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <button
                        onClick={() => setSelectedDocument(documento)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center hover:scale-110 transition-transform duration-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Dettagli
                      </button>
                      <div className="flex items-center space-x-2">
                        <button className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50 hover:scale-110 transition-transform duration-200" title="Download">
                          <Download className="h-4 w-4" />
                        </button>
                        {documento.status === 'bozza' && (
                          <button className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 hover:scale-110 transition-transform duration-200" title="Elimina">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const tabs = [
    { id: 'documenti', name: 'I Miei Documenti', icon: FileText },
    { id: 'richieste', name: 'Richieste Consulenti', icon: FolderOpen },
    { id: 'apertura-piva', name: 'Apertura P.IVA', icon: Building }
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
      {activeTab === 'documenti' ? renderDocumentiTab() :
       activeTab === 'richieste' ? renderRichiesteTab() :
       renderAperturaPivaTab()}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Carica Nuovo Documento"
        maxWidth="xl"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome documento *</label>
              <input
                type="text"
                value={uploadForm.nome}
                onChange={(e) => setUploadForm({...uploadForm, nome: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Es. Bilancio 2023"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo documento *</label>
              <select
                value={uploadForm.tipo}
                onChange={(e) => setUploadForm({...uploadForm, tipo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="bilancio">Bilancio</option>
                <option value="fatture">Fatture</option>
                <option value="contratto">Contratto</option>
                <option value="estratto_conto">Estratto Conto</option>
                <option value="documento_identita">Documento Identità</option>
                <option value="altro">Altro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
            <select
              value={uploadForm.categoria}
              onChange={(e) => setUploadForm({...uploadForm, categoria: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="fiscale">Fiscale</option>
              <option value="fatturazione">Fatturazione</option>
              <option value="legale">Legale</option>
              <option value="bancario">Bancario</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
            <textarea
              value={uploadForm.descrizione}
              onChange={(e) => setUploadForm({...uploadForm, descrizione: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Descrizione opzionale del documento..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">File *</label>
            <input
              type="file"
              onChange={(e) => setUploadForm({...uploadForm, file: e.target.files?.[0] || null})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Formati supportati: PDF, DOC, DOCX, XLS, XLSX, ZIP (max 10MB)
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Sicurezza e Privacy</p>
                <p className="text-xs text-blue-800 mt-1">
                  I tuoi documenti sono protetti con crittografia end-to-end e saranno visibili solo ai consulenti autorizzati.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              Carica Documento
            </button>
          </div>
        </form>
      </Modal>

      {/* Document Detail Modal */}
      {selectedDocument && (
        <Modal
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          title={selectedDocument.nome}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Document Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Informazioni Documento</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tipo:</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedDocument.tipo.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Formato:</p>
                  <p className="font-medium text-gray-900">{selectedDocument.formato}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dimensione:</p>
                  <p className="font-medium text-gray-900">{selectedDocument.dimensione}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Categoria:</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedDocument.categoria}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Data caricamento:</p>
                  <p className="font-medium text-gray-900">{selectedDocument.dataCaricamento}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Inviato a:</p>
                  <p className="font-medium text-gray-900">{selectedDocument.inviataA}</p>
                </div>
              </div>

              {selectedDocument.note && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Note:</p>
                  <p className="text-gray-900">{selectedDocument.note}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Cronologia</h3>
              <div className="space-y-3">
                {selectedDocument.cronologia.map((evento: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{evento.azione}</p>
                      <p className="text-xs text-gray-500">{evento.data} - {evento.utente}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedDocument(null)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Chiudi
              </button>
              <button className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center">
                <Download className="h-4 w-4 mr-2" />
                Scarica
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}