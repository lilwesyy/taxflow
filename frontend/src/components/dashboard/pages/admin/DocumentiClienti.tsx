import {
  FileText, Search, Filter, CheckCircle, Clock, AlertTriangle, Download,
  Trash2, FolderOpen, Building, Receipt, DollarSign, FileCheck, BookOpen,
  Eye, Upload, Users, TrendingUp, Maximize2
} from 'lucide-react'
import { useState } from 'react'
import Modal from '../../../common/Modal'
import dummyPdf from '../../../../assets/dummy-pdf_2.pdf'

export default function DocumentiClienti() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterAnno, setFilterAnno] = useState('all')
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dichiarazioni')
  const [selectedCliente, setSelectedCliente] = useState('all')
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false)
  const [pdfUrl, setPdfUrl] = useState('')
  const [isPdfFullscreen, setIsPdfFullscreen] = useState(false)

  const [uploadForm, setUploadForm] = useState({
    nome: '',
    tipo: 'modello_redditi',
    descrizione: '',
    categoria: 'dichiarazioni',
    cliente: '',
    file: null as File | null
  })

  // Lista clienti
  const clienti = [
    { id: '1', nome: 'Mario Rossi', azienda: 'Rossi Consulting', piva: '12345678901' },
    { id: '2', nome: 'Laura Bianchi', azienda: 'Bianchi Design', piva: '23456789012' },
    { id: '3', nome: 'Giuseppe Verdi', azienda: 'Verdi Solutions', piva: '34567890123' },
    { id: '4', nome: 'Anna Neri', azienda: 'Neri Marketing', piva: '45678901234' }
  ]

  // Documenti organizzati per categoria (Cassetto Fiscale AdE) - per tutti i clienti
  const documentiTotali = {
    dichiarazioni: [
      {
        id: 'dich-001',
        nome: 'Modello Redditi PF 2025',
        tipo: 'modello_redditi',
        formato: 'PDF',
        dimensione: '2.4 MB',
        anno: '2025',
        clienteId: '1',
        cliente: { nome: 'Mario Rossi', azienda: 'Rossi Consulting' },
        dataCaricamento: '15/03/2025',
        status: 'elaborato',
        descrizione: 'Dichiarazione dei redditi persone fisiche anno 2025',
        protocollo: 'DR202500123456',
        fileUrl: dummyPdf,
        note: 'Presentata telematicamente all\'Agenzia delle Entrate',
        cronologia: [
          { data: '15/03/2025', azione: 'Dichiarazione presentata', utente: 'Sistema AdE' },
          { data: '16/03/2025', azione: 'Ricevuta protocollata', utente: 'Agenzia Entrate' }
        ]
      },
      {
        id: 'dich-002',
        nome: 'Modello Redditi PF 2025',
        tipo: 'modello_redditi',
        formato: 'PDF',
        dimensione: '2.1 MB',
        anno: '2025',
        clienteId: '2',
        cliente: { nome: 'Laura Bianchi', azienda: 'Bianchi Design' },
        dataCaricamento: '18/03/2025',
        status: 'in_elaborazione',
        descrizione: 'Dichiarazione dei redditi persone fisiche anno 2025',
        protocollo: null,
        note: 'In fase di compilazione',
        cronologia: [
          { data: '18/03/2025', azione: 'Bozza creata', utente: 'Dr. Marco Bianchi' }
        ]
      },
      {
        id: 'dich-003',
        nome: 'Dichiarazione IVA Annuale 2024',
        tipo: 'dichiarazione_iva',
        formato: 'PDF',
        dimensione: '1.5 MB',
        anno: '2024',
        clienteId: '3',
        cliente: { nome: 'Giuseppe Verdi', azienda: 'Verdi Solutions' },
        dataCaricamento: '25/02/2025',
        status: 'elaborato',
        descrizione: 'Dichiarazione IVA annuale anno 2024',
        protocollo: 'IVA202400567890',
        note: 'Regime forfettario - esente IVA',
        cronologia: [
          { data: '25/02/2025', azione: 'Dichiarazione presentata', utente: 'Sistema AdE' }
        ]
      }
    ],
    fatturazione: [
      {
        id: 'fatt-001',
        nome: 'Fattura Elettronica FE0012025',
        tipo: 'fattura_elettronica',
        formato: 'XML',
        dimensione: '24 KB',
        anno: '2025',
        clienteId: '1',
        cliente: { nome: 'Mario Rossi', azienda: 'Rossi Consulting' },
        dataCaricamento: '10/01/2025',
        status: 'elaborato',
        descrizione: 'Fattura n. 001/2025 - Cliente XYZ SRL',
        protocollo: 'SDI2025001234567',
        importo: '€ 1.500,00',
        note: 'Inviata tramite Sistema di Interscambio',
        cronologia: [
          { data: '10/01/2025', azione: 'Fattura emessa', utente: 'Mario Rossi' },
          { data: '10/01/2025', azione: 'Inviata a SDI', utente: 'Sistema' }
        ]
      },
      {
        id: 'fatt-002',
        nome: 'Fattura Elettronica FE0052025',
        tipo: 'fattura_elettronica',
        formato: 'XML',
        dimensione: '22 KB',
        anno: '2025',
        clienteId: '2',
        cliente: { nome: 'Laura Bianchi', azienda: 'Bianchi Design' },
        dataCaricamento: '15/01/2025',
        status: 'elaborato',
        descrizione: 'Fattura n. 005/2025 - Cliente ABC SRL',
        protocollo: 'SDI2025005678901',
        importo: '€ 2.300,00',
        note: 'Inviata tramite SDI',
        cronologia: [
          { data: '15/01/2025', azione: 'Fattura emessa', utente: 'Laura Bianchi' }
        ]
      },
      {
        id: 'fatt-003',
        nome: 'Corrispettivi Gennaio 2025',
        tipo: 'corrispettivi',
        formato: 'XML',
        dimensione: '45 KB',
        anno: '2025',
        clienteId: '4',
        cliente: { nome: 'Anna Neri', azienda: 'Neri Marketing' },
        dataCaricamento: '31/01/2025',
        status: 'elaborato',
        descrizione: 'Documento commerciale riepilogativo gennaio',
        protocollo: 'CORR202501',
        importo: '€ 5.400,00',
        note: 'Trasmesso telematicamente',
        cronologia: [
          { data: '31/01/2025', azione: 'Corrispettivi trasmessi', utente: 'Sistema' }
        ]
      }
    ],
    comunicazioni: [
      {
        id: 'com-001',
        nome: 'Comunicazione Liquidazioni IVA Q1 2025',
        tipo: 'lipe',
        formato: 'PDF',
        dimensione: '0.8 MB',
        anno: '2025',
        clienteId: '3',
        cliente: { nome: 'Giuseppe Verdi', azienda: 'Verdi Solutions' },
        dataCaricamento: '05/02/2025',
        status: 'elaborato',
        descrizione: 'LIPE - Liquidazione periodica IVA 1° trimestre',
        protocollo: 'LIPE202501Q1',
        note: 'Regime forfettario - esente',
        cronologia: [
          { data: '05/02/2025', azione: 'Comunicazione inviata', utente: 'Sistema' }
        ]
      }
    ],
    versamenti: [
      {
        id: 'vers-001',
        nome: 'F24 Acconto IRPEF 2025',
        tipo: 'f24',
        formato: 'PDF',
        dimensione: '0.3 MB',
        anno: '2025',
        clienteId: '1',
        cliente: { nome: 'Mario Rossi', azienda: 'Rossi Consulting' },
        dataCaricamento: '30/06/2025',
        status: 'elaborato',
        descrizione: 'Primo acconto IRPEF anno 2025',
        protocollo: 'F24202506001',
        importo: '€ 2.400,00',
        note: 'Pagato tramite home banking',
        cronologia: [
          { data: '30/06/2025', azione: 'F24 generato', utente: 'Sistema' },
          { data: '30/06/2025', azione: 'Pagamento eseguito', utente: 'Mario Rossi' }
        ]
      },
      {
        id: 'vers-002',
        nome: 'F24 Contributi INPS Gennaio 2025',
        tipo: 'f24_inps',
        formato: 'PDF',
        dimensione: '0.2 MB',
        anno: '2025',
        clienteId: '2',
        cliente: { nome: 'Laura Bianchi', azienda: 'Bianchi Design' },
        dataCaricamento: '16/02/2025',
        status: 'elaborato',
        descrizione: 'Contributi INPS gestione separata',
        protocollo: 'F24202502INPS',
        importo: '€ 780,00',
        note: 'Pagamento regolare',
        cronologia: [
          { data: '16/02/2025', azione: 'Versamento effettuato', utente: 'Laura Bianchi' }
        ]
      }
    ],
    consultazione: [
      {
        id: 'cons-001',
        nome: 'Estratto Conto Fiscale 2024',
        tipo: 'estratto_conto',
        formato: 'PDF',
        dimensione: '1.1 MB',
        anno: '2024',
        clienteId: '1',
        cliente: { nome: 'Mario Rossi', azienda: 'Rossi Consulting' },
        dataCaricamento: '10/01/2025',
        status: 'elaborato',
        descrizione: 'Situazione debitoria/creditoria con Fisco',
        protocollo: 'ECF202401',
        note: 'Nessun debito pendente',
        cronologia: [
          { data: '10/01/2025', azione: 'Estratto scaricato', utente: 'Dr. Marco Bianchi' }
        ]
      }
    ],
    registri: [
      {
        id: 'reg-001',
        nome: 'Registro Incassi 2025',
        tipo: 'registro_incassi',
        formato: 'XLSX',
        dimensione: '0.8 MB',
        anno: '2025',
        clienteId: '1',
        cliente: { nome: 'Mario Rossi', azienda: 'Rossi Consulting' },
        dataCaricamento: '31/01/2025',
        status: 'elaborato',
        descrizione: 'Registro cronologico incassi regime forfettario',
        protocollo: 'REG-INC-2025',
        note: 'Aggiornato mensilmente',
        cronologia: [
          { data: '31/01/2025', azione: 'Registro creato', utente: 'Mario Rossi' }
        ]
      }
    ],
    altri_documenti: [
      {
        id: 'alt-001',
        nome: 'Contratto Locazione Ufficio',
        tipo: 'contratto',
        formato: 'PDF',
        dimensione: '1.2 MB',
        anno: '2025',
        clienteId: '1',
        cliente: { nome: 'Mario Rossi', azienda: 'Rossi Consulting' },
        dataCaricamento: '10/01/2025',
        status: 'elaborato',
        descrizione: 'Contratto affitto sede operativa',
        protocollo: null,
        note: 'Registrato all\'Agenzia Entrate',
        cronologia: [
          { data: '10/01/2025', azione: 'Contratto caricato', utente: 'Dr. Marco Bianchi' }
        ]
      }
    ]
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Documento caricato con successo!')
    setIsUploadModalOpen(false)
    setUploadForm({
      nome: '',
      tipo: 'modello_redditi',
      descrizione: '',
      categoria: 'dichiarazioni',
      cliente: '',
      file: null
    })
  }

  const getFilteredDocuments = () => {
    const docs = documentiTotali[activeTab as keyof typeof documentiTotali] || []
    return docs.filter(doc => {
      const matchesSearch = doc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.descrizione.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.cliente.azienda.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || doc.status === filterStatus
      const matchesCliente = selectedCliente === 'all' || doc.clienteId === selectedCliente
      const matchesAnno = filterAnno === 'all' || doc.anno === filterAnno
      return matchesSearch && matchesStatus && matchesCliente && matchesAnno
    })
  }

  // Estrai tutti gli anni disponibili dai documenti
  const getAvailableYears = () => {
    const years = new Set(allDocuments.map(doc => doc.anno))
    return Array.from(years).sort((a, b) => b.localeCompare(a)) // Ordine decrescente
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'elaborato': return 'bg-green-100 text-green-600'
      case 'in_elaborazione': return 'bg-blue-100 text-blue-600'
      case 'in_attesa': return 'bg-yellow-100 text-yellow-600'
      case 'rifiutato': return 'bg-red-100 text-red-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'elaborato': return 'Elaborato'
      case 'in_elaborazione': return 'In elaborazione'
      case 'in_attesa': return 'In attesa'
      case 'rifiutato': return 'Rifiutato'
      default: return 'Sconosciuto'
    }
  }

  const handleOpenPdfViewer = (documento: any) => {
    if (documento.formato === 'PDF' && documento.fileUrl) {
      setPdfUrl(documento.fileUrl)
      setIsPdfViewerOpen(true)
      setIsPdfFullscreen(false)
    } else {
      setSelectedDocument(documento)
    }
  }

  const togglePdfFullscreen = () => {
    if (!isPdfFullscreen) {
      // Quando apro fullscreen, chiudo il modale normale
      setIsPdfViewerOpen(false)
      setIsPdfFullscreen(true)
    } else {
      // Quando chiudo fullscreen, riapro il modale normale
      setIsPdfFullscreen(false)
      setIsPdfViewerOpen(true)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'elaborato': return <CheckCircle className="h-4 w-4" />
      case 'in_elaborazione': return <Clock className="h-4 w-4" />
      case 'in_attesa': return <Clock className="h-4 w-4" />
      case 'rifiutato': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const tabs = [
    { id: 'dichiarazioni', name: 'Dichiarazioni', icon: FileCheck, description: 'Modelli redditi, IVA, 730' },
    { id: 'fatturazione', name: 'Fatturazione', icon: Receipt, description: 'Fatture elettroniche, corrispettivi' },
    { id: 'comunicazioni', name: 'Comunicazioni', icon: BookOpen, description: 'LIPE, Esterometro, Spesometro' },
    { id: 'versamenti', name: 'Versamenti', icon: DollarSign, description: 'F24, tributi, ravvedimenti' },
    { id: 'consultazione', name: 'Consultazione', icon: Eye, description: 'Estratti conto, CU, visure' },
    { id: 'registri', name: 'Registri', icon: BookOpen, description: 'Registri IVA, incassi, cespiti' },
    { id: 'altri_documenti', name: 'Altri Documenti', icon: FolderOpen, description: 'Contratti, visure, assicurazioni' }
  ]

  const allDocuments = Object.values(documentiTotali).flat()
  const currentTabData = tabs.find(t => t.id === activeTab)
  const filteredDocuments = getFilteredDocuments()
  const availableYears = getAvailableYears()

  // Statistiche basate sul cliente selezionato
  const getStatsForCliente = () => {
    const docs = selectedCliente === 'all'
      ? allDocuments
      : allDocuments.filter(d => d.clienteId === selectedCliente)

    return {
      totale: docs.length,
      elaborati: docs.filter(d => d.status === 'elaborato').length,
      inElaborazione: docs.filter(d => d.status === 'in_elaborazione').length
    }
  }

  const stats = getStatsForCliente()
  const clienteSelezionato = clienti.find(c => c.id === selectedCliente)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
        {selectedCliente === 'all' ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">Vista Consolidata</h2>
                <p className="text-blue-100 text-sm">Tutti i cassetti fiscali dei tuoi clienti</p>
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <p className="text-3xl font-bold">{clienti.length}</p>
                <p className="text-blue-100 text-sm">Clienti attivi</p>
              </div>
              <div className="h-12 w-px bg-blue-400"></div>
              <div className="text-center">
                <p className="text-3xl font-bold">{allDocuments.length}</p>
                <p className="text-blue-100 text-sm">Documenti totali</p>
              </div>
              <div className="h-12 w-px bg-blue-400"></div>
              <div className="text-center">
                <p className="text-3xl font-bold">{allDocuments.filter(d => d.status === 'elaborato').length}</p>
                <p className="text-blue-100 text-sm">Elaborati</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{clienteSelezionato?.nome}</h2>
                <p className="text-blue-100">{clienteSelezionato?.azienda} • P.IVA {clienteSelezionato?.piva}</p>
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.totale}</p>
                <p className="text-blue-100 text-sm">Documenti</p>
              </div>
              <div className="h-12 w-px bg-blue-400"></div>
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.elaborati}</p>
                <p className="text-blue-100 text-sm">Elaborati</p>
              </div>
              <div className="h-12 w-px bg-blue-400"></div>
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.inElaborazione}</p>
                <p className="text-blue-100 text-sm">In lavorazione</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Totale Documenti</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totale}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Elaborati</p>
              <p className="text-2xl font-bold text-green-600">{stats.elaborati}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Elaborazione</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inElaborazione}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Anno Corrente</p>
              <p className="text-2xl font-bold text-gray-900">2025</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
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

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca documenti o clienti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-400" />
            <select
              value={selectedCliente}
              onChange={(e) => setSelectedCliente(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tutti i clienti</option>
              {clienti.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome} - {cliente.azienda}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tutti gli stati</option>
              <option value="elaborato">Elaborato</option>
              <option value="in_elaborazione">In elaborazione</option>
              <option value="in_attesa">In attesa</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <select
              value={filterAnno}
              onChange={(e) => setFilterAnno(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tutti gli anni</option>
              {availableYears.map((anno) => (
                <option key={anno} value={anno}>
                  Anno {anno}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-lg flex items-center whitespace-nowrap"
          >
            <Upload className="h-4 w-4 mr-2" />
            Carica Documento
          </button>
        </div>
      </div>

      {/* Current Tab Info */}
      {currentTabData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <currentTabData.icon className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">{currentTabData.name}</h3>
              <p className="text-sm text-blue-700">{currentTabData.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((documento) => (
          <div key={documento.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3 flex-1">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{documento.nome}</h3>
                  <p className="text-sm text-gray-600 mb-2">{documento.descrizione}</p>
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-3 w-3 text-gray-500" />
                    <p className="text-xs text-gray-600">{documento.cliente.nome}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{documento.formato}</span>
                    <span>•</span>
                    <span>{documento.dimensione}</span>
                    <span>•</span>
                    <span>Anno {documento.anno}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(documento.status)}`}>
                {getStatusIcon(documento.status)}
                <span className="ml-1">{getStatusText(documento.status)}</span>
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {documento.protocollo && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Protocollo:</span>
                  <span className="text-gray-900 font-mono text-xs">{documento.protocollo}</span>
                </div>
              )}
              {(documento as any).importo && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Importo:</span>
                  <span className="text-gray-900 font-semibold">{(documento as any).importo}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Data:</span>
                <span className="text-gray-900">{documento.dataCaricamento}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button
                onClick={() => handleOpenPdfViewer(documento)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
              >
                <Eye className="h-4 w-4 mr-1" />
                Visualizza
              </button>
              <div className="flex items-center space-x-2">
                <button className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50" title="Download">
                  <Download className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50" title="Elimina">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun documento trovato</h3>
          <p className="text-gray-600 mb-6">
            Non ci sono documenti in questa categoria o che corrispondono ai filtri selezionati.
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 inline-flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Carica documento per cliente
          </button>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Carica Documento per Cliente"
        maxWidth="xl"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
            <select
              value={uploadForm.cliente}
              onChange={(e) => setUploadForm({...uploadForm, cliente: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Seleziona cliente</option>
              {clienti.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome} - {cliente.azienda}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
            <select
              value={uploadForm.categoria}
              onChange={(e) => setUploadForm({...uploadForm, categoria: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="dichiarazioni">Dichiarazioni</option>
              <option value="fatturazione">Fatturazione</option>
              <option value="comunicazioni">Comunicazioni</option>
              <option value="versamenti">Versamenti</option>
              <option value="consultazione">Consultazione</option>
              <option value="registri">Registri</option>
              <option value="altri_documenti">Altri Documenti</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome documento *</label>
              <input
                type="text"
                value={uploadForm.nome}
                onChange={(e) => setUploadForm({...uploadForm, nome: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Es. Modello Redditi 2025"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo documento *</label>
              <select
                value={uploadForm.tipo}
                onChange={(e) => setUploadForm({...uploadForm, tipo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="modello_redditi">Modello Redditi</option>
                <option value="dichiarazione_iva">Dichiarazione IVA</option>
                <option value="modello_730">Modello 730</option>
                <option value="fattura_elettronica">Fattura Elettronica</option>
                <option value="f24">F24</option>
                <option value="cu">Certificazione Unica</option>
                <option value="altro">Altro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
            <textarea
              value={uploadForm.descrizione}
              onChange={(e) => setUploadForm({...uploadForm, descrizione: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descrizione opzionale del documento..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">File *</label>
            <input
              type="file"
              onChange={(e) => setUploadForm({...uploadForm, file: e.target.files?.[0] || null})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              accept=".pdf,.xml,.doc,.docx,.xls,.xlsx"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Formati supportati: PDF, XML, DOC, DOCX, XLS, XLSX (max 10MB)
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Conformità Agenzia delle Entrate</p>
                <p className="text-xs text-blue-800 mt-1">
                  I documenti vengono organizzati secondo la struttura del Cassetto Fiscale AdE per massima conformità.
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
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
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
            {/* Client Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">{selectedDocument.cliente.nome}</p>
                  <p className="text-sm text-blue-700">{selectedDocument.cliente.azienda}</p>
                </div>
              </div>
            </div>

            {/* Document Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Informazioni Documento</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tipo:</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedDocument.tipo.replace(/_/g, ' ')}</p>
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
                  <p className="text-sm text-gray-600">Anno:</p>
                  <p className="font-medium text-gray-900">{selectedDocument.anno}</p>
                </div>
                {selectedDocument.protocollo && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Protocollo:</p>
                    <p className="font-medium text-gray-900 font-mono">{selectedDocument.protocollo}</p>
                  </div>
                )}
                {selectedDocument.importo && (
                  <div>
                    <p className="text-sm text-gray-600">Importo:</p>
                    <p className="font-medium text-gray-900 text-lg">{selectedDocument.importo}</p>
                  </div>
                )}
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
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
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
              <button className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center">
                <Download className="h-4 w-4 mr-2" />
                Scarica
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* PDF Viewer Modal */}
      {isPdfViewerOpen && !isPdfFullscreen && (
        <Modal
          isOpen={isPdfViewerOpen}
          onClose={() => setIsPdfViewerOpen(false)}
          title="Visualizzatore PDF"
          maxWidth="4xl"
        >
          <div className="space-y-4">
            {/* PDF Container */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <iframe
                src={pdfUrl}
                className="w-full h-[600px] border-0"
                title="PDF Viewer"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <button
                onClick={togglePdfFullscreen}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Schermo intero
              </button>
              <a
                href={pdfUrl}
                download
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Scarica
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* PDF Fullscreen Mode */}
      {isPdfFullscreen && (
        <div className="fixed inset-0 !m-0 !mt-0 bg-gray-900 z-[9999] flex flex-col animate-fade-in">
          {/* Header */}
          <div className="bg-gray-900 text-white px-6 py-6 flex items-center justify-between flex-shrink-0 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5" />
              <h2 className="text-base font-semibold">Visualizzatore PDF - Schermo Intero</h2>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href={pdfUrl}
                download
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Scarica
              </a>
              <button
                onClick={togglePdfFullscreen}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Chiudi schermo intero
              </button>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 bg-gray-900">
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="PDF Viewer Fullscreen"
            />
          </div>
        </div>
      )}
    </div>
  )
}
