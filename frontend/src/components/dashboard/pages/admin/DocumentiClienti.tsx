import { FileText, Download, Eye, Search, Filter, Upload, Calendar, User, CheckCircle, Clock, AlertTriangle, MoreVertical, Trash2, Edit, ChevronLeft, ChevronRight, Send, FolderOpen, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import Modal from '../../../common/Modal'

export default function DocumentiClienti() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('documenti')
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)

  const closeDocumentModal = () => {
    setSelectedDocument(null)
  }

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [uploadForm, setUploadForm] = useState({
    nome: '',
    tipo: 'contratto',
    cliente: '',
    descrizione: '',
    file: null as File | null
  })

  const [requestForm, setRequestForm] = useState({
    cliente: '',
    tipo: 'documenti_fiscali',
    descrizione: '',
    scadenza: '',
    priorita: 'media',
    documenti: [] as string[]
  })

  const documenti = [
    {
      id: 'doc-001',
      nome: 'Contratto consulenza - Mario Rossi',
      tipo: 'contratto',
      formato: 'PDF',
      dimensione: '2.4 MB',
      cliente: {
        nome: 'Mario Rossi',
        azienda: 'Rossi Consulting'
      },
      dataCaricamento: '26/01/2024',
      dataModifica: '26/01/2024',
      status: 'approvato',
      caricatoDa: 'Dr. Marco Bianchi',
      descrizione: 'Contratto di consulenza fiscale per apertura P.IVA forfettaria',
      versione: '1.0',
      tags: ['Consulenza', 'P.IVA', 'Forfettario'],
      percorso: '/documenti/clienti/mario-rossi/contratti/',
      hash: 'abc123def456',
      scadenza: '26/01/2025',
      note: 'Contratto standard per apertura P.IVA. Clausole particolari: regime forfettario, consulenza trimestrale inclusa.',
      cronologia: [
        { data: '26/01/2024', azione: 'Documento caricato', utente: 'Dr. Marco Bianchi' },
        { data: '26/01/2024', azione: 'Documento approvato', utente: 'Mario Rossi' }
      ]
    },
    {
      id: 'doc-002',
      nome: 'Business Plan - Bianchi Design',
      tipo: 'business_plan',
      formato: 'PDF',
      dimensione: '5.8 MB',
      cliente: {
        nome: 'Laura Bianchi',
        azienda: 'Bianchi Design'
      },
      dataCaricamento: '25/01/2024',
      dataModifica: '25/01/2024',
      status: 'in_revisione',
      caricatoDa: 'Dr. Laura Verdi',
      descrizione: 'Business plan per richiesta finanziamento bancario',
      versione: '2.1',
      tags: ['Business Plan', 'Finanziamento', 'Banca'],
      percorso: '/documenti/clienti/laura-bianchi/business-plan/',
      hash: 'def456ghi789',
      scadenza: '15/03/2024',
      note: 'Business plan per richiesta prestito. Necessaria revisione sezione finanziaria per conformità bancaria.',
      cronologia: [
        { data: '25/01/2024', azione: 'Documento caricato', utente: 'Dr. Laura Verdi' },
        { data: '26/01/2024', azione: 'Richiesta revisione', utente: 'Laura Bianchi' },
        { data: '27/01/2024', azione: 'In fase di revisione', utente: 'Dr. Laura Verdi' }
      ]
    },
    {
      id: 'doc-003',
      nome: 'Analisi bilancio 2023 - Verdi Solutions',
      tipo: 'bilancio',
      formato: 'XLSX',
      dimensione: '1.2 MB',
      cliente: {
        nome: 'Giuseppe Verdi',
        azienda: 'Verdi Solutions'
      },
      dataCaricamento: '24/01/2024',
      dataModifica: '24/01/2024',
      status: 'bozza',
      caricatoDa: 'Dr. Marco Bianchi',
      descrizione: 'Analisi dettagliata bilancio per presentazione investitori'
    },
    {
      id: 'doc-004',
      nome: 'Fattura 001/2024 - Neri Marketing',
      tipo: 'fattura',
      formato: 'PDF',
      dimensione: '0.8 MB',
      cliente: {
        nome: 'Anna Neri',
        azienda: 'Neri Marketing'
      },
      dataCaricamento: '23/01/2024',
      dataModifica: '23/01/2024',
      status: 'approvato',
      caricatoDa: 'Dr. Laura Verdi',
      descrizione: 'Fattura per consulenza regime forfettario'
    },
    {
      id: 'doc-005',
      nome: 'Documentazione cedolare secca - Greco Immobiliare',
      tipo: 'fiscale',
      formato: 'PDF',
      dimensione: '3.1 MB',
      cliente: {
        nome: 'Francesco Greco',
        azienda: 'Greco Immobiliare'
      },
      dataCaricamento: '22/01/2024',
      dataModifica: '22/01/2024',
      status: 'in_revisione',
      caricatoDa: 'Dr. Marco Bianchi',
      descrizione: 'Documentazione per opzione cedolare secca'
    },
    {
      id: 'doc-006',
      nome: 'F24 gennaio - Conti & Partners',
      tipo: 'f24',
      formato: 'PDF',
      dimensione: '0.5 MB',
      cliente: {
        nome: 'Silvia Conti',
        azienda: 'Conti & Partners'
      },
      dataCaricamento: '21/01/2024',
      dataModifica: '21/01/2024',
      status: 'urgente',
      caricatoDa: 'Dr. Laura Verdi',
      descrizione: 'Modello F24 per pagamento ritenute e contributi'
    },
    {
      id: 'doc-007',
      nome: 'Atto costitutivo SPA - Martinelli SRL',
      tipo: 'societario',
      formato: 'PDF',
      dimensione: '4.2 MB',
      cliente: {
        nome: 'Roberto Martinelli',
        azienda: 'Martinelli SRL'
      },
      dataCaricamento: '20/01/2024',
      dataModifica: '20/01/2024',
      status: 'bozza',
      caricatoDa: 'Dr. Marco Bianchi',
      descrizione: 'Documentazione per trasformazione SRL in SPA'
    },
    {
      id: 'doc-008',
      nome: 'Registrazione marchio - Ferretti Beauty',
      tipo: 'marchio',
      formato: 'PDF',
      dimensione: '2.7 MB',
      cliente: {
        nome: 'Elena Ferretti',
        azienda: 'Ferretti Beauty'
      },
      dataCaricamento: '19/01/2024',
      dataModifica: '19/01/2024',
      status: 'approvato',
      caricatoDa: 'Dr. Laura Verdi',
      descrizione: 'Documentazione registrazione marchio comunitario'
    }
  ]

  const richiesteDocumenti = [
    {
      id: 'req-001',
      cliente: {
        nome: 'Mario Rossi',
        azienda: 'Rossi Consulting'
      },
      tipo: 'documenti_fiscali',
      descrizione: 'Documenti necessari per dichiarazione IVA trimestrale',
      dataRichiesta: '23/01/2024',
      scadenza: '30/01/2024',
      priorita: 'alta',
      status: 'in_attesa',
      consulente: 'Dr. Marco Bianchi',
      documenti: [
        'Fatture Q4 2023',
        'Corrispettivi dicembre 2023',
        'Ricevute fiscali'
      ]
    },
    {
      id: 'req-002',
      cliente: {
        nome: 'Laura Bianchi',
        azienda: 'Bianchi Design'
      },
      tipo: 'business_plan',
      descrizione: 'Documenti per aggiornamento business plan',
      dataRichiesta: '20/01/2024',
      scadenza: '05/02/2024',
      priorita: 'media',
      status: 'completata',
      consulente: 'Dr. Laura Verdi',
      documenti: [
        'Proiezioni finanziarie 2024',
        'Analisi competitor',
        'Piano marketing'
      ]
    },
    {
      id: 'req-003',
      cliente: {
        nome: 'Giuseppe Verdi',
        azienda: 'Verdi Solutions'
      },
      tipo: 'contabilita',
      descrizione: 'Documentazione contabile per bilancio annuale',
      dataRichiesta: '18/01/2024',
      scadenza: '15/02/2024',
      priorita: 'alta',
      status: 'in_attesa',
      consulente: 'Dr. Marco Bianchi',
      documenti: [
        'Estratti conto bancari 2023',
        'Registrazioni contabili',
        'Inventario magazzino'
      ]
    }
  ]

  const clienti = [
    { nome: 'Mario Rossi', azienda: 'Rossi Consulting' },
    { nome: 'Laura Bianchi', azienda: 'Bianchi Design' },
    { nome: 'Giuseppe Verdi', azienda: 'Verdi Solutions' },
    { nome: 'Franco Neri', azienda: 'Neri Marketing' },
    { nome: 'Anna Romano', azienda: 'Romano Tech' },
    { nome: 'Roberto Martinelli', azienda: 'Martinelli SRL' },
    { nome: 'Elena Ferretti', azienda: 'Ferretti Beauty' }
  ]

  const filteredDocumenti = documenti.filter(doc => {
    const matchesSearch = doc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.cliente.azienda.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.descrizione.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'all' || doc.tipo === filterType
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  // Pagination calculations
  const totalItems = filteredDocumenti.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentDocumenti = filteredDocumenti.slice(startIndex, endIndex)

  // Reset to first page when filters change
  const resetPagination = () => {
    setCurrentPage(1)
  }

  // Update pagination when filters change
  useEffect(() => {
    resetPagination()
  }, [searchTerm, filterType, filterStatus])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approvato': return 'bg-green-100 text-green-600'
      case 'in_revisione': return 'bg-yellow-100 text-yellow-600'
      case 'bozza': return 'bg-gray-100 text-gray-600'
      case 'urgente': return 'bg-red-100 text-red-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approvato': return 'Approvato'
      case 'in_revisione': return 'In revisione'
      case 'bozza': return 'Bozza'
      case 'urgente': return 'Urgente'
      default: return 'Sconosciuto'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approvato': return <CheckCircle className="h-4 w-4" />
      case 'in_revisione': return <Clock className="h-4 w-4" />
      case 'bozza': return <FileText className="h-4 w-4" />
      case 'urgente': return <AlertTriangle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getTypeText = (tipo: string) => {
    switch (tipo) {
      case 'contratto': return 'Contratto'
      case 'business_plan': return 'Business Plan'
      case 'bilancio': return 'Bilancio'
      case 'fattura': return 'Fattura'
      case 'fiscale': return 'Documento Fiscale'
      case 'f24': return 'F24'
      case 'societario': return 'Documento Societario'
      case 'marchio': return 'Marchio'
      default: return 'Documento'
    }
  }

  const closeUploadModal = () => {
    setIsUploadModalOpen(false)
    setUploadForm({
      nome: '',
      tipo: 'contratto',
      cliente: '',
      descrizione: '',
      file: null
    })
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Qui sarebbe implementata la logica per caricare il documento
    console.log('Caricamento documento:', uploadForm)
    closeUploadModal()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setUploadForm(prev => ({ ...prev, file }))
  }

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulazione invio richiesta
    alert('Richiesta documenti inviata con successo!')
    setIsRequestModalOpen(false)
    setRequestForm({
      cliente: '',
      tipo: 'documenti_fiscali',
      descrizione: '',
      scadenza: '',
      priorita: 'media',
      documenti: []
    })
  }

  const addDocumentToRequest = () => {
    const input = prompt('Inserisci il nome del documento:')
    if (input && input.trim()) {
      setRequestForm(prev => ({
        ...prev,
        documenti: [...prev.documenti, input.trim()]
      }))
    }
  }

  const removeDocumentFromRequest = (index: number) => {
    setRequestForm(prev => ({
      ...prev,
      documenti: prev.documenti.filter((_, i) => i !== index)
    }))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'text-red-600 bg-red-50'
      case 'media': return 'text-yellow-600 bg-yellow-50'
      case 'bassa': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const stats = [
    { title: 'Documenti Totali', value: documenti.length.toString(), icon: FileText, color: 'text-blue-600' },
    { title: 'Approvati', value: documenti.filter(d => d.status === 'approvato').length.toString(), icon: CheckCircle, color: 'text-green-600' },
    { title: 'In Revisione', value: documenti.filter(d => d.status === 'in_revisione').length.toString(), icon: Clock, color: 'text-yellow-600' },
    { title: 'Urgenti', value: documenti.filter(d => d.status === 'urgente').length.toString(), icon: AlertTriangle, color: 'text-red-600' }
  ]

  const renderDocumentiTab = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-gray-50 group-hover:scale-110 transition-transform mr-3">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca documenti per nome, cliente o descrizione..."
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
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Tutti i tipi</option>
                <option value="contratto">Contratti</option>
                <option value="business_plan">Business Plan</option>
                <option value="bilancio">Bilanci</option>
                <option value="fattura">Fatture</option>
                <option value="fiscale">Documenti Fiscali</option>
                <option value="f24">F24</option>
                <option value="societario">Documenti Societari</option>
                <option value="marchio">Marchi</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Tutti gli stati</option>
                <option value="approvato">Approvati</option>
                <option value="in_revisione">In revisione</option>
                <option value="bozza">Bozze</option>
                <option value="urgente">Urgenti</option>
              </select>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 hover:scale-105 hover:shadow-lg transition-all duration-200 flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Carica Documento
            </button>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Documento</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Cliente</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Tipo</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Data</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Caricato da</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentDocumenti.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-xs">{doc.nome}</p>
                        <p className="text-sm text-gray-500">{doc.formato} • {doc.dimensione}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.cliente.nome}</p>
                        <p className="text-sm text-gray-500">{doc.cliente.azienda}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                      {getTypeText(doc.tipo)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(doc.status)}`}>
                      {getStatusIcon(doc.status)}
                      <span className="ml-1">{getStatusText(doc.status)}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {doc.dataCaricamento}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-600">{doc.caricatoDa}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedDocument(doc)}
                        className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 hover:scale-110 transition-all duration-200"
                        title="Visualizza dettagli"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50 hover:scale-110 transition-all duration-200" title="Download">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-700 p-1 rounded hover:bg-gray-50 hover:scale-110 transition-all duration-200" title="Modifica">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 hover:scale-110 transition-all duration-200" title="Elimina">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-700 p-1 rounded hover:bg-gray-50 hover:scale-110 transition-all duration-200">
                        <MoreVertical className="h-4 w-4" />
                      </button>
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
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
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

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={closeUploadModal}
        title="Carica Nuovo Documento"
        maxWidth="lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Documento *
              </label>
              <input
                type="text"
                required
                value={uploadForm.nome}
                onChange={(e) => setUploadForm(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Es: Contratto consulenza - Mario Rossi"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo Documento *
              </label>
              <select
                required
                value={uploadForm.tipo}
                onChange={(e) => setUploadForm(prev => ({ ...prev, tipo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="contratto">Contratto</option>
                <option value="business_plan">Business Plan</option>
                <option value="bilancio">Bilancio</option>
                <option value="fattura">Fattura</option>
                <option value="fiscale">Documento Fiscale</option>
                <option value="f24">F24</option>
                <option value="societario">Documento Societario</option>
                <option value="marchio">Marchio</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente *
            </label>
            <input
              type="text"
              required
              value={uploadForm.cliente}
              onChange={(e) => setUploadForm(prev => ({ ...prev, cliente: e.target.value }))}
              placeholder="Nome e cognome del cliente"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrizione
            </label>
            <textarea
              value={uploadForm.descrizione}
              onChange={(e) => setUploadForm(prev => ({ ...prev, descrizione: e.target.value }))}
              placeholder="Descrizione breve del documento..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
              <input
                type="file"
                required
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {uploadForm.file ? uploadForm.file.name : 'Clicca per selezionare un file'}
                </p>
                <p className="text-sm text-gray-500">
                  PDF, DOC, XLS, JPG, PNG (max 10MB)
                </p>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={closeUploadModal}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:scale-105 hover:shadow-sm transition-all duration-200"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:scale-105 hover:shadow-lg transition-all duration-200"
            >
              Carica Documento
            </button>
          </div>
        </form>
      </Modal>

      {/* Document Detail Modal */}
      <Modal
        isOpen={!!selectedDocument}
        onClose={closeDocumentModal}
        title={selectedDocument ? `Dettagli Documento - ${selectedDocument.nome}` : ''}
        maxWidth="4xl"
      >
        {selectedDocument && (
          <div className="space-y-6">

            {/* Header con info principali */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedDocument.nome}</h3>
                    <p className="text-blue-600 font-medium">{selectedDocument.cliente.nome} - {selectedDocument.cliente.azienda}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedDocument.descrizione}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedDocument.status === 'approvato' ? 'bg-green-100 text-green-700' :
                    selectedDocument.status === 'in_revisione' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedDocument.status === 'approvato' && <CheckCircle className="h-4 w-4 inline mr-1" />}
                    {selectedDocument.status === 'in_revisione' && <Clock className="h-4 w-4 inline mr-1" />}
                    {selectedDocument.status === 'bozza' && <Edit className="h-4 w-4 inline mr-1" />}
                    {selectedDocument.status === 'approvato' ? 'Approvato' :
                     selectedDocument.status === 'in_revisione' ? 'In Revisione' : 'Bozza'}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">v{selectedDocument.versione || '1.0'}</p>
                </div>
              </div>
            </div>

            {/* Informazioni tecniche */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Dettagli File */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Informazioni File
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Formato:</span>
                    <span className="text-sm font-medium">{selectedDocument.formato}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Dimensione:</span>
                    <span className="text-sm font-medium">{selectedDocument.dimensione}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tipo:</span>
                    <span className="text-sm font-medium capitalize">{selectedDocument.tipo.replace('_', ' ')}</span>
                  </div>
                  {selectedDocument.hash && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Hash:</span>
                      <span className="text-xs font-mono text-gray-500">{selectedDocument.hash}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Date e Versioni */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Date e Timeline
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Caricato il:</span>
                    <span className="text-sm font-medium">{selectedDocument.dataCaricamento}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ultima modifica:</span>
                    <span className="text-sm font-medium">{selectedDocument.dataModifica}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Caricato da:</span>
                    <span className="text-sm font-medium">{selectedDocument.caricatoDa}</span>
                  </div>
                  {selectedDocument.scadenza && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Scadenza:</span>
                      <span className="text-sm font-medium text-orange-600">{selectedDocument.scadenza}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tags e Classificazione */}
            {selectedDocument.tags && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Tags e Classificazione</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDocument.tags.map((tag: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Note */}
            {selectedDocument.note && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                  Note
                </h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">{selectedDocument.note}</p>
                </div>
              </div>
            )}

            {/* Cronologia attività */}
            {selectedDocument.cronologia && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-600" />
                  Cronologia Attività
                </h4>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {selectedDocument.cronologia.map((evento: any, index: number) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-4 pb-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{evento.azione}</p>
                        <span className="text-xs text-gray-500">{evento.data}</span>
                      </div>
                      <p className="text-sm text-gray-600">da {evento.utente}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Azioni */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Scarica
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105 hover:shadow-sm flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Modifica
                </button>
                <button className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:scale-105 hover:shadow-sm flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Condividi con Cliente
                </button>
              </div>

              {selectedDocument.status === 'in_revisione' && (
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 hover:scale-105 hover:shadow-lg">
                    Respingi
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 hover:scale-105 hover:shadow-lg">
                    Approva
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )

  const renderRichiesteTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Richieste Documenti</h3>
          <p className="text-gray-600">Gestisci le richieste di documenti inviate ai clienti</p>
        </div>
        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 hover:scale-105 hover:shadow-lg transition-all duration-200 flex items-center"
        >
          <Send className="h-4 w-4 mr-2" />
          Nuova Richiesta
        </button>
      </div>

      {/* Richieste Grid */}
      <div className="space-y-4">
        {richiesteDocumenti.map((richiesta) => (
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
                      <span>Cliente: <span className="font-medium text-gray-900">{richiesta.cliente.nome} - {richiesta.cliente.azienda}</span></span>
                      <span>•</span>
                      <span>Consulente: {richiesta.consulente}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Richiesta: {richiesta.dataRichiesta}</span>
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
                  <button className="text-primary-600 hover:text-primary-700 p-1 rounded hover:bg-primary-50 hover:scale-110 transition-transform duration-200" title="Sollecita">
                    <Send className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const tabs = [
    { id: 'documenti', name: 'Documenti Clienti', icon: FileText },
    { id: 'richieste', name: 'Richieste Documenti', icon: Send }
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
      {activeTab === 'documenti' ? renderDocumentiTab() : renderRichiesteTab()}

      {/* Request Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Nuova Richiesta Documenti"
        maxWidth="xl"
      >
        <form onSubmit={handleRequestSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
              <select
                value={requestForm.cliente}
                onChange={(e) => setRequestForm({...requestForm, cliente: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Seleziona cliente</option>
                {clienti.map((cliente, index) => (
                  <option key={index} value={`${cliente.nome} - ${cliente.azienda}`}>
                    {cliente.nome} - {cliente.azienda}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo richiesta *</label>
              <select
                value={requestForm.tipo}
                onChange={(e) => setRequestForm({...requestForm, tipo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="documenti_fiscali">Documenti Fiscali</option>
                <option value="business_plan">Business Plan</option>
                <option value="contabilita">Contabilità</option>
                <option value="bilanci">Bilanci</option>
                <option value="societario">Documenti Societari</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione richiesta *</label>
            <textarea
              value={requestForm.descrizione}
              onChange={(e) => setRequestForm({...requestForm, descrizione: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Descrivi i documenti necessari e il motivo della richiesta..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scadenza *</label>
              <input
                type="date"
                value={requestForm.scadenza}
                onChange={(e) => setRequestForm({...requestForm, scadenza: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priorità *</label>
              <select
                value={requestForm.priorita}
                onChange={(e) => setRequestForm({...requestForm, priorita: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="bassa">Bassa</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Documenti specifici</label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-gray-300 rounded-lg">
                {requestForm.documenti.map((doc, index) => (
                  <span key={index} className="inline-flex items-center bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm">
                    {doc}
                    <button
                      type="button"
                      onClick={() => removeDocumentFromRequest(index)}
                      className="ml-1 text-blue-400 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={addDocumentToRequest}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Aggiungi documento
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Specifica i documenti esatti che il cliente deve fornire
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Notifica automatica</p>
                <p className="text-xs text-blue-800 mt-1">
                  Il cliente riceverà una notifica email con i dettagli della richiesta e potrà caricare i documenti direttamente dalla sua dashboard.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(false)}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              Invia Richiesta
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}