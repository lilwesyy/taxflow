import { MessageSquare, Users, Search, Filter, Phone, Video, Clock, CheckCircle, AlertTriangle, Send, Paperclip, Eye, Star, TrendingUp } from 'lucide-react'
import { useState } from 'react'

export default function Consulenze() {
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [message, setMessage] = useState('')

  const conversazioni = [
    {
      id: 'conv-001',
      cliente: {
        nome: 'Mario Rossi',
        azienda: 'Rossi Consulting',
        avatar: '👨‍💼',
        email: 'mario.rossi@email.com'
      },
      status: 'active',
      priority: 'high',
      ultimoMessaggio: 'Grazie per la consulenza, molto utile!',
      orarioUltimoMessaggio: '14:30',
      dataUltimaAttivita: '26/01/2024',
      messaggiNonLetti: 0,
      tipo: 'consulenza_fiscale',
      argomento: 'Apertura P.IVA forfettaria',
      consulente: 'Dr. Marco Bianchi',
      durataConsulenza: '45 min',
      rating: 5,
      fatturata: true,
      importo: 150
    },
    {
      id: 'conv-002',
      cliente: {
        nome: 'Laura Bianchi',
        azienda: 'Bianchi Design',
        avatar: '👩‍🎨',
        email: 'laura.bianchi@email.com'
      },
      status: 'pending',
      priority: 'medium',
      ultimoMessaggio: 'Quando possiamo fare la call di follow-up?',
      orarioUltimoMessaggio: '11:20',
      dataUltimaAttivita: '25/01/2024',
      messaggiNonLetti: 3,
      tipo: 'business_plan',
      argomento: 'Revisione business plan',
      consulente: 'Dr. Laura Verdi',
      durataConsulenza: null,
      rating: null,
      fatturata: false,
      importo: 0
    },
    {
      id: 'conv-003',
      cliente: {
        nome: 'Giuseppe Verdi',
        azienda: 'Verdi Solutions',
        avatar: '👨‍💻',
        email: 'giuseppe.verdi@email.com'
      },
      status: 'scheduled',
      priority: 'high',
      ultimoMessaggio: 'Confermo appuntamento per domani ore 15:00',
      orarioUltimoMessaggio: '16:45',
      dataUltimaAttivita: '24/01/2024',
      messaggiNonLetti: 1,
      tipo: 'analisi_finanziaria',
      argomento: 'Analisi di bilancio',
      consulente: 'Dr. Marco Bianchi',
      durataConsulenza: null,
      rating: null,
      fatturata: false,
      importo: 200
    },
    {
      id: 'conv-004',
      cliente: {
        nome: 'Anna Neri',
        azienda: 'Neri Marketing',
        avatar: '👩‍💼',
        email: 'anna.neri@email.com'
      },
      status: 'completed',
      priority: 'low',
      ultimoMessaggio: 'Perfetto, grazie per tutto il supporto',
      orarioUltimoMessaggio: '09:30',
      dataUltimaAttivita: '23/01/2024',
      messaggiNonLetti: 0,
      tipo: 'consulenza_generale',
      argomento: 'Domande varie regime forfettario',
      consulente: 'Dr. Laura Verdi',
      durataConsulenza: '30 min',
      rating: 4,
      fatturata: true,
      importo: 100
    },
    {
      id: 'conv-005',
      cliente: {
        nome: 'Francesco Greco',
        azienda: 'Greco Immobiliare',
        avatar: '🏢',
        email: 'francesco.greco@email.com'
      },
      status: 'active',
      priority: 'medium',
      ultimoMessaggio: 'Posso avere chiarimenti sulla cedolare secca?',
      orarioUltimoMessaggio: '16:15',
      dataUltimaAttivita: '26/01/2024',
      messaggiNonLetti: 2,
      tipo: 'consulenza_immobiliare',
      argomento: 'Cedolare secca affitti',
      consulente: 'Dr. Marco Bianchi',
      durataConsulenza: null,
      rating: null,
      fatturata: false,
      importo: 120
    },
    {
      id: 'conv-006',
      cliente: {
        nome: 'Silvia Conti',
        azienda: 'Conti & Partners',
        avatar: '👩‍⚖️',
        email: 'silvia.conti@email.com'
      },
      status: 'pending',
      priority: 'high',
      ultimoMessaggio: 'Urgente: scadenza F24 domani!',
      orarioUltimoMessaggio: '18:30',
      dataUltimaAttivita: '25/01/2024',
      messaggiNonLetti: 5,
      tipo: 'adempimenti_fiscali',
      argomento: 'Scadenze fiscali gennaio',
      consulente: 'Dr. Laura Verdi',
      durataConsulenza: null,
      rating: null,
      fatturata: false,
      importo: 180
    },
    {
      id: 'conv-007',
      cliente: {
        nome: 'Roberto Martinelli',
        azienda: 'Martinelli SRL',
        avatar: '🚛',
        email: 'roberto.martinelli@email.com'
      },
      status: 'scheduled',
      priority: 'medium',
      ultimoMessaggio: 'Ok per lunedì mattina alle 09:00',
      orarioUltimoMessaggio: '20:45',
      dataUltimaAttivita: '24/01/2024',
      messaggiNonLetti: 0,
      tipo: 'consulenza_societaria',
      argomento: 'Trasformazione in SPA',
      consulente: 'Dr. Marco Bianchi',
      durataConsulenza: null,
      rating: null,
      fatturata: false,
      importo: 350
    },
    {
      id: 'conv-008',
      cliente: {
        nome: 'Elena Ferretti',
        azienda: 'Ferretti Beauty',
        avatar: '💄',
        email: 'elena.ferretti@email.com'
      },
      status: 'completed',
      priority: 'low',
      ultimoMessaggio: 'Documentazione ricevuta, tutto perfetto!',
      orarioUltimoMessaggio: '12:00',
      dataUltimaAttivita: '22/01/2024',
      messaggiNonLetti: 0,
      tipo: 'consulenza_commerciale',
      argomento: 'Registrazione marchio',
      consulente: 'Dr. Laura Verdi',
      durataConsulenza: '60 min',
      rating: 5,
      fatturata: true,
      importo: 250
    },
    {
      id: 'conv-009',
      cliente: {
        nome: 'Davide Romano',
        azienda: 'Romano Tech',
        avatar: '💻',
        email: 'davide.romano@email.com'
      },
      status: 'active',
      priority: 'high',
      ultimoMessaggio: 'Serve aiuto con la dichiarazione IVA',
      orarioUltimoMessaggio: '08:45',
      dataUltimaAttivita: '26/01/2024',
      messaggiNonLetti: 1,
      tipo: 'adempimenti_iva',
      argomento: 'Dichiarazione IVA trimestrale',
      consulente: 'Dr. Marco Bianchi',
      durataConsulenza: null,
      rating: null,
      fatturata: false,
      importo: 90
    },
    {
      id: 'conv-010',
      cliente: {
        nome: 'Paola Marchetti',
        azienda: 'Marchetti Wellness',
        avatar: '🧘‍♀️',
        email: 'paola.marchetti@email.com'
      },
      status: 'pending',
      priority: 'low',
      ultimoMessaggio: 'Grazie, attendo il preventivo per la consulenza',
      orarioUltimoMessaggio: '15:20',
      dataUltimaAttivita: '25/01/2024',
      messaggiNonLetti: 0,
      tipo: 'consulenza_startup',
      argomento: 'Avvio attività benessere',
      consulente: 'Dr. Laura Verdi',
      durataConsulenza: null,
      rating: null,
      fatturata: false,
      importo: 0
    }
  ]

  const messaggi = {
    'conv-001': [
      {
        id: 1,
        mittente: 'cliente',
        nome: 'Mario Rossi',
        testo: 'Buongiorno Dottore, ho bisogno di aprire la partita IVA forfettaria per la mia consulenza informatica.',
        timestamp: '09:30',
        stato: 'read'
      },
      {
        id: 2,
        mittente: 'consulente',
        nome: 'Dr. Marco Bianchi',
        testo: 'Buongiorno Mario! Sarò felice di aiutarla. Per il codice ATECO 62.02.00 il coefficiente di redditività è 0.78. Qual è il suo fatturato previsto?',
        timestamp: '09:45',
        stato: 'delivered'
      },
      {
        id: 3,
        mittente: 'cliente',
        nome: 'Mario Rossi',
        testo: 'Penso circa 35.000€ annui. È compatibile con il forfettario?',
        timestamp: '10:00',
        stato: 'read'
      },
      {
        id: 4,
        mittente: 'consulente',
        nome: 'Dr. Marco Bianchi',
        testo: 'Perfetto! È ben sotto il limite di 65.000€. Con il forfettario avrà una tassazione del 15% (5% per i primi 5 anni se è neo-attività). Procediamo con la documentazione?',
        timestamp: '10:15',
        stato: 'delivered'
      },
      {
        id: 5,
        mittente: 'cliente',
        nome: 'Mario Rossi',
        testo: 'Grazie per la consulenza, molto utile!',
        timestamp: '14:30',
        stato: 'read'
      }
    ],
    'conv-002': [
      {
        id: 1,
        mittente: 'cliente',
        nome: 'Laura Bianchi',
        testo: 'Salve, ho bisogno di una revisione del mio business plan per un finanziamento bancario.',
        timestamp: '10:30',
        stato: 'read'
      },
      {
        id: 2,
        mittente: 'consulente',
        nome: 'Dr. Laura Verdi',
        testo: 'Buongiorno Laura! Posso aiutarla. Che tipo di attività svolge e di che importo è il finanziamento richiesto?',
        timestamp: '10:45',
        stato: 'delivered'
      },
      {
        id: 3,
        mittente: 'cliente',
        nome: 'Laura Bianchi',
        testo: 'Design grafico e comunicazione. Chiedo 50.000€ per attrezzature e marketing.',
        timestamp: '11:00',
        stato: 'read'
      },
      {
        id: 4,
        mittente: 'consulente',
        nome: 'Dr. Laura Verdi',
        testo: 'Perfetto. Dovremmo aggiornare le proiezioni finanziarie e il piano di ammortamento. Può inviarmi il business plan attuale?',
        timestamp: '11:10',
        stato: 'delivered'
      },
      {
        id: 5,
        mittente: 'cliente',
        nome: 'Laura Bianchi',
        testo: 'Quando possiamo fare la call di follow-up?',
        timestamp: '11:20',
        stato: 'unread'
      }
    ],
    'conv-003': [
      {
        id: 1,
        mittente: 'cliente',
        nome: 'Giuseppe Verdi',
        testo: 'Buongiorno, avrei bisogno di un\'analisi di bilancio approfondita.',
        timestamp: '15:30',
        stato: 'read'
      },
      {
        id: 2,
        mittente: 'consulente',
        nome: 'Dr. Marco Bianchi',
        testo: 'Salve Giuseppe! Certamente. Si tratta dell\'analisi per l\'anno fiscale 2023?',
        timestamp: '15:45',
        stato: 'delivered'
      },
      {
        id: 3,
        mittente: 'cliente',
        nome: 'Giuseppe Verdi',
        testo: 'Esatto, ho bisogno di capire gli indici di liquidità e redditività per presentazione agli investitori.',
        timestamp: '16:00',
        stato: 'read'
      },
      {
        id: 4,
        mittente: 'consulente',
        nome: 'Dr. Marco Bianchi',
        testo: 'Perfetto. Programmiamo una videochiamata per domani alle 15:00 così possiamo vedere tutto insieme?',
        timestamp: '16:30',
        stato: 'delivered'
      },
      {
        id: 5,
        mittente: 'cliente',
        nome: 'Giuseppe Verdi',
        testo: 'Confermo appuntamento per domani ore 15:00',
        timestamp: '16:45',
        stato: 'unread'
      }
    ],
    'conv-004': [
      {
        id: 1,
        mittente: 'cliente',
        nome: 'Anna Neri',
        testo: 'Ho alcune domande sul regime forfettario, posso disturbarla?',
        timestamp: '09:00',
        stato: 'read'
      },
      {
        id: 2,
        mittente: 'consulente',
        nome: 'Dr. Laura Verdi',
        testo: 'Certamente Anna! Mi dica pure, sono qui per aiutarla.',
        timestamp: '09:10',
        stato: 'delivered'
      },
      {
        id: 3,
        mittente: 'cliente',
        nome: 'Anna Neri',
        testo: 'Devo emettere fattura per un cliente estero UE. Come funziona l\'IVA?',
        timestamp: '09:15',
        stato: 'read'
      },
      {
        id: 4,
        mittente: 'consulente',
        nome: 'Dr. Laura Verdi',
        testo: 'Per i clienti UE con partita IVA valida, la fattura va emessa senza IVA con la dicitura "Operazione non soggetta ex art. 7-ter DPR 633/72". Il cliente applicherà il reverse charge.',
        timestamp: '09:20',
        stato: 'delivered'
      },
      {
        id: 5,
        mittente: 'cliente',
        nome: 'Anna Neri',
        testo: 'Perfetto, grazie per tutto il supporto',
        timestamp: '09:30',
        stato: 'read'
      }
    ],
    'conv-005': [
      {
        id: 1,
        mittente: 'cliente',
        nome: 'Francesco Greco',
        testo: 'Buongiorno Dottore, sto valutando la cedolare secca per i miei immobili.',
        timestamp: '15:45',
        stato: 'read'
      },
      {
        id: 2,
        mittente: 'consulente',
        nome: 'Dr. Marco Bianchi',
        testo: 'Salve Francesco! La cedolare secca può essere molto conveniente. Quanti immobili ha in locazione?',
        timestamp: '16:00',
        stato: 'delivered'
      },
      {
        id: 3,
        mittente: 'cliente',
        nome: 'Francesco Greco',
        testo: 'Posso avere chiarimenti sulla cedolare secca?',
        timestamp: '16:15',
        stato: 'unread'
      }
    ],
    'conv-006': [
      {
        id: 1,
        mittente: 'cliente',
        nome: 'Silvia Conti',
        testo: 'URGENTE: Ho dimenticato di pagare l\'F24 di dicembre!',
        timestamp: '18:00',
        stato: 'read'
      },
      {
        id: 2,
        mittente: 'consulente',
        nome: 'Dr. Laura Verdi',
        testo: 'Silvia, non si preoccupi. Possiamo ancora sistemare. Mi può dire che tipo di F24 era?',
        timestamp: '18:10',
        stato: 'delivered'
      },
      {
        id: 3,
        mittente: 'cliente',
        nome: 'Silvia Conti',
        testo: 'Ritenute d\'acconto e contributi INPS. La scadenza era il 16 gennaio!',
        timestamp: '18:15',
        stato: 'read'
      },
      {
        id: 4,
        mittente: 'consulente',
        nome: 'Dr. Laura Verdi',
        testo: 'Calcoleremo le sanzioni per ritardato pagamento. Sono del 0.15% per ogni giorno di ritardo più interessi.',
        timestamp: '18:25',
        stato: 'delivered'
      },
      {
        id: 5,
        mittente: 'cliente',
        nome: 'Silvia Conti',
        testo: 'Urgente: scadenza F24 domani!',
        timestamp: '18:30',
        stato: 'unread'
      }
    ],
    'conv-007': [
      {
        id: 1,
        mittente: 'cliente',
        nome: 'Roberto Martinelli',
        testo: 'Stiamo pensando di trasformare la SRL in SPA. È conveniente?',
        timestamp: '20:00',
        stato: 'read'
      },
      {
        id: 2,
        mittente: 'consulente',
        nome: 'Dr. Marco Bianchi',
        testo: 'Roberto, dipende da diversi fattori. Fatturato, numero di soci, obiettivi futuri. Possiamo fare una call per valutare?',
        timestamp: '20:30',
        stato: 'delivered'
      },
      {
        id: 3,
        mittente: 'cliente',
        nome: 'Roberto Martinelli',
        testo: 'Ok per lunedì mattina alle 09:00',
        timestamp: '20:45',
        stato: 'read'
      }
    ],
    'conv-008': [
      {
        id: 1,
        mittente: 'cliente',
        nome: 'Elena Ferretti',
        testo: 'Ho bisogno di registrare il marchio della mia linea di cosmetici.',
        timestamp: '11:30',
        stato: 'read'
      },
      {
        id: 2,
        mittente: 'consulente',
        nome: 'Dr. Laura Verdi',
        testo: 'Elena, perfetto! Registrazione nazionale o comunitaria? E in che classi merceologiche?',
        timestamp: '11:45',
        stato: 'delivered'
      },
      {
        id: 3,
        mittente: 'cliente',
        nome: 'Elena Ferretti',
        testo: 'Comunitaria, classe 3 per cosmetici e prodotti per la cura della persona.',
        timestamp: '12:00',
        stato: 'read'
      },
      {
        id: 4,
        mittente: 'consulente',
        nome: 'Dr. Laura Verdi',
        testo: 'Perfetto. Ho preparato tutta la documentazione. La invio via email.',
        timestamp: '12:15',
        stato: 'delivered'
      },
      {
        id: 5,
        mittente: 'cliente',
        nome: 'Elena Ferretti',
        testo: 'Documentazione ricevuta, tutto perfetto!',
        timestamp: '12:00',
        stato: 'read'
      }
    ],
    'conv-009': [
      {
        id: 1,
        mittente: 'cliente',
        nome: 'Davide Romano',
        testo: 'Buongiorno, ho problemi con la dichiarazione IVA trimestrale.',
        timestamp: '08:30',
        stato: 'read'
      },
      {
        id: 2,
        mittente: 'consulente',
        nome: 'Dr. Marco Bianchi',
        testo: 'Buongiorno Davide! Mi dica, che tipo di difficoltà ha incontrato?',
        timestamp: '08:40',
        stato: 'delivered'
      },
      {
        id: 3,
        mittente: 'cliente',
        nome: 'Davide Romano',
        testo: 'Serve aiuto con la dichiarazione IVA',
        timestamp: '08:45',
        stato: 'unread'
      }
    ],
    'conv-010': [
      {
        id: 1,
        mittente: 'cliente',
        nome: 'Paola Marchetti',
        testo: 'Vorrei aprire un centro benessere. Che forma societaria mi consiglia?',
        timestamp: '15:00',
        stato: 'read'
      },
      {
        id: 2,
        mittente: 'consulente',
        nome: 'Dr. Laura Verdi',
        testo: 'Ciao Paola! Dipende da investimento iniziale e numero di soci. Puoi darmi più dettagli?',
        timestamp: '15:10',
        stato: 'delivered'
      },
      {
        id: 3,
        mittente: 'cliente',
        nome: 'Paola Marchetti',
        testo: 'Grazie, attendo il preventivo per la consulenza',
        timestamp: '15:20',
        stato: 'read'
      }
    ]
  }

  const filteredConversazioni = conversazioni.filter(conv => {
    const matchesSearch = conv.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.cliente.azienda.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.argomento.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || conv.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-600'
      case 'pending': return 'bg-yellow-100 text-yellow-600'
      case 'scheduled': return 'bg-blue-100 text-blue-600'
      case 'completed': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Attiva'
      case 'pending': return 'In attesa'
      case 'scheduled': return 'Programmata'
      case 'completed': return 'Completata'
      default: return 'Sconosciuto'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <MessageSquare className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'scheduled': return <AlertTriangle className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
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
    { title: 'Consulenze Totali', value: conversazioni.length.toString(), icon: MessageSquare, color: 'text-blue-600' },
    { title: 'Attive', value: conversazioni.filter(c => c.status === 'active').length.toString(), icon: Users, color: 'text-green-600' },
    { title: 'In Attesa', value: conversazioni.filter(c => c.status === 'pending').length.toString(), icon: Clock, color: 'text-yellow-600' },
    { title: 'Fatturato Mensile', value: `€ ${conversazioni.filter(c => c.fatturata).reduce((sum, c) => sum + c.importo, 0)}`, icon: TrendingUp, color: 'text-purple-600' }
  ]

  const conversazioneAttiva = conversazioni.find(c => c.id === activeChat)
  const messaggiAttivi = activeChat ? messaggi[activeChat as keyof typeof messaggi] || [] : []

  const handleSendMessage = () => {
    if (message.trim()) {
      // Qui sarebbe implementata la logica per inviare il messaggio
      console.log('Invio messaggio:', message)
      setMessage('')
    }
  }

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-gray-50 group-hover:scale-110 transition-transform mr-4">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chat Interface */}
      <div className="h-[calc(100vh-250px)] flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative z-10">
        {/* Sidebar Conversazioni */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          {/* Header Sidebar */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Conversazioni</h3>
              <span className="text-sm text-gray-500">{conversazioni.length} totali</span>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca conversazioni..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all duration-200"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Tutti</option>
                <option value="active">Attive</option>
                <option value="pending">In attesa</option>
                <option value="scheduled">Programmate</option>
                <option value="completed">Completate</option>
              </select>
            </div>
          </div>

          {/* Lista Conversazioni */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversazioni.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveChat(conv.id)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-all duration-200 border-b border-gray-100 ${
                  activeChat === conv.id ? 'bg-primary-50 border-r-2 border-r-primary-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                    {conv.cliente.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">{conv.cliente.nome}</p>
                      <span className="text-xs text-gray-500">{conv.orarioUltimoMessaggio}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{conv.cliente.azienda}</p>
                    <p className="text-sm text-gray-600 truncate mb-1">{conv.ultimoMessaggio}</p>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(conv.status)}`}>
                        {getStatusIcon(conv.status)}
                        <span className="ml-1">{getStatusText(conv.status)}</span>
                      </span>
                      {conv.messaggiNonLetti > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-red-500 text-white rounded-full">
                          {conv.messaggiNonLetti}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Area Chat Principale */}
        <div className="flex-1 flex flex-col">
          {conversazioneAttiva ? (
            <>
              {/* Header Chat */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                      {conversazioneAttiva.cliente.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{conversazioneAttiva.cliente.nome}</h3>
                      <p className="text-sm text-gray-600">{conversazioneAttiva.argomento}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 hover:scale-110">
                      <Phone className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 hover:scale-110">
                      <Video className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 hover:scale-110">
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messaggi */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messaggiAttivi.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.mittente === 'consulente' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.mittente === 'consulente'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      {msg.mittente === 'cliente' && (
                        <p className="text-xs font-medium mb-1 text-gray-600">{msg.nome}</p>
                      )}
                      <p className="text-sm">{msg.testo}</p>
                      <div className={`flex items-center justify-between mt-1 ${
                        msg.mittente === 'consulente' ? 'text-white' : 'text-gray-500'
                      }`}>
                        <span className="text-xs opacity-75">{msg.timestamp}</span>
                        {msg.mittente === 'consulente' && (
                          <CheckCircle className="h-3 w-3 ml-2" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Messaggio */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                  <button className="flex-shrink-0 p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 hover:scale-110">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Scrivi una risposta al cliente..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="flex-shrink-0 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Seleziona una conversazione</h3>
                <p className="text-gray-600">Scegli una conversazione dalla barra laterale per iniziare</p>
              </div>
            </div>
          )}
        </div>

        {/* Info Panel Cliente */}
        {conversazioneAttiva && (
          <div className="w-64 border-l border-gray-200 p-4 bg-white shadow-sm flex flex-col h-full hover:shadow-md transition-shadow relative z-10">
            <h4 className="font-semibold text-gray-900 mb-4">Dettagli Consulenza</h4>

            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="font-medium text-gray-900">{conversazioneAttiva.cliente.nome}</p>
                <p className="text-sm text-gray-600">{conversazioneAttiva.cliente.azienda}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Argomento</p>
                <p className="font-medium text-gray-900">{conversazioneAttiva.argomento}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Tipo consulenza</p>
                <p className="font-medium text-gray-900 capitalize">{conversazioneAttiva.tipo.replace('_', ' ')}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Priorità</p>
                <span className={`font-medium ${getPriorityColor(conversazioneAttiva.priority)}`}>
                  {conversazioneAttiva.priority}
                </span>
              </div>

              {conversazioneAttiva.durataConsulenza && (
                <div>
                  <p className="text-sm text-gray-600">Durata</p>
                  <p className="font-medium text-gray-900">{conversazioneAttiva.durataConsulenza}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Importo</p>
                <p className="font-medium text-gray-900">€ {conversazioneAttiva.importo}</p>
                <p className={`text-xs ${conversazioneAttiva.fatturata ? 'text-green-600' : 'text-orange-600'}`}>
                  {conversazioneAttiva.fatturata ? 'Fatturata' : 'Da fatturare'}
                </p>
              </div>

              {conversazioneAttiva.rating && (
                <div>
                  <p className="text-sm text-gray-600">Valutazione</p>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < conversazioneAttiva.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">({conversazioneAttiva.rating}/5)</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-200">
              <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-all duration-200 text-sm hover:scale-105 hover:shadow-lg">
                Crea Fattura
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}