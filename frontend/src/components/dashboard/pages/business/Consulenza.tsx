import { MessageSquare, Send, Paperclip, Phone, Video, Clock, CheckCircle, Search, Filter, Star, Eye, CreditCard, DollarSign, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import Modal from '../../../common/Modal'

export default function Consulenza() {
  const [activeChat, setActiveChat] = useState<string | null>('conv-001')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [message, setMessage] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const conversazioni = [
    {
      id: 'conv-001',
      consulente: {
        nome: 'Dr. Marco Bianchi',
        specializzazione: 'Consulente Fiscale CFO',
        avatar: '👨‍💼',
        email: 'marco.bianchi@taxflow.com'
      },
      status: 'active',
      priority: 'high',
      ultimoMessaggio: 'Perfetto, ho preparato la documentazione per la sua P.IVA',
      orarioUltimoMessaggio: '14:30',
      dataUltimaAttivita: '26/01/2024',
      messaggiNonLetti: 0,
      tipo: 'consulenza_fiscale',
      argomento: 'Apertura P.IVA forfettaria',
      durataConsulenza: '45 min',
      rating: 5,
      fatturata: true,
      importo: 150
    },
    {
      id: 'conv-002',
      consulente: {
        nome: 'Dr. Laura Verdi',
        specializzazione: 'Business Strategy',
        avatar: '👩‍💼',
        email: 'laura.verdi@taxflow.com'
      },
      status: 'pending',
      priority: 'medium',
      ultimoMessaggio: 'Le invio il business plan rivisto entro domani',
      orarioUltimoMessaggio: '11:20',
      dataUltimaAttivita: '25/01/2024',
      messaggiNonLetti: 1,
      tipo: 'business_plan',
      argomento: 'Revisione business plan',
      durataConsulenza: null,
      rating: null,
      fatturata: false,
      importo: 200
    },
    {
      id: 'conv-003',
      consulente: {
        nome: 'Supporto TaxFlow',
        specializzazione: 'Assistenza Tecnica',
        avatar: '🛠️',
        email: 'support@taxflow.com'
      },
      status: 'active',
      priority: 'low',
      ultimoMessaggio: 'Come posso aiutarla oggi?',
      orarioUltimoMessaggio: '12:15',
      dataUltimaAttivita: '26/01/2024',
      messaggiNonLetti: 2,
      tipo: 'supporto_tecnico',
      argomento: 'Problemi piattaforma',
      durataConsulenza: null,
      rating: null,
      fatturata: false,
      importo: 0
    },
    {
      id: 'conv-004',
      consulente: {
        nome: 'AI Assistant',
        specializzazione: 'Assistente Virtuale',
        avatar: '🤖',
        email: 'ai@taxflow.com'
      },
      status: 'active',
      priority: 'low',
      ultimoMessaggio: 'Hai domande sui tuoi documenti fiscali?',
      orarioUltimoMessaggio: '11:45',
      dataUltimaAttivita: '26/01/2024',
      messaggiNonLetti: 0,
      tipo: 'ai_assistant',
      argomento: 'Assistenza automatica',
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
        mittente: 'user',
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
        mittente: 'user',
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
        mittente: 'user',
        nome: 'Mario Rossi',
        testo: 'Sì, perfetto. Quando possiamo programmare la call?',
        timestamp: '14:25',
        stato: 'read'
      },
      {
        id: 6,
        mittente: 'consulente',
        nome: 'Dr. Marco Bianchi',
        testo: 'Perfetto, ho preparato la documentazione per la sua P.IVA. Le invio tutto via email e possiamo fare la call domani alle 15:00.',
        timestamp: '14:30',
        stato: 'delivered'
      }
    ],
    'conv-002': [
      {
        id: 1,
        mittente: 'user',
        nome: 'Mario Rossi',
        testo: 'Salve, ho bisogno di una revisione del mio business plan per un finanziamento bancario.',
        timestamp: '10:30',
        stato: 'read'
      },
      {
        id: 2,
        mittente: 'consulente',
        nome: 'Dr. Laura Verdi',
        testo: 'Buongiorno! Posso aiutarla. Che tipo di attività svolge e di che importo è il finanziamento richiesto?',
        timestamp: '10:45',
        stato: 'delivered'
      },
      {
        id: 3,
        mittente: 'user',
        nome: 'Mario Rossi',
        testo: 'Consulenza informatica. Chiedo 30.000€ per attrezzature e marketing.',
        timestamp: '11:00',
        stato: 'read'
      },
      {
        id: 4,
        mittente: 'consulente',
        nome: 'Dr. Laura Verdi',
        testo: 'Le invio il business plan rivisto entro domani. Include proiezioni finanziarie dettagliate e analisi di mercato.',
        timestamp: '11:20',
        stato: 'unread'
      }
    ],
    'conv-003': [
      {
        id: 1,
        mittente: 'consulente',
        nome: 'Supporto TaxFlow',
        testo: 'Ciao! Ho notato che hai avuto problemi con il caricamento dei documenti. Posso aiutarti?',
        timestamp: '12:00',
        stato: 'delivered'
      },
      {
        id: 2,
        mittente: 'consulente',
        nome: 'Supporto TaxFlow',
        testo: 'Come posso aiutarla oggi?',
        timestamp: '12:15',
        stato: 'unread'
      }
    ],
    'conv-004': [
      {
        id: 1,
        mittente: 'consulente',
        nome: 'AI Assistant',
        testo: 'Ciao! Sono il tuo assistente virtuale. Posso aiutarti con domande su regime forfettario, fatturazione e adempimenti fiscali.',
        timestamp: '11:30',
        stato: 'delivered'
      },
      {
        id: 2,
        mittente: 'consulente',
        nome: 'AI Assistant',
        testo: 'Hai domande sui tuoi documenti fiscali?',
        timestamp: '11:45',
        stato: 'delivered'
      }
    ]
  }

  const filteredConversazioni = conversazioni.filter(conv => {
    const matchesSearch = conv.consulente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.argomento.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || conv.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const conversazioneAttiva = conversazioni.find(conv => conv.id === activeChat)
  const messaggiAttivi = conversazioneAttiva ? (messaggi as any)[conversazioneAttiva.id] || [] : []

  const handleSendMessage = () => {
    if (message.trim()) {
      // Logica per inviare messaggio
      setMessage('')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-600'
      case 'pending': return 'bg-yellow-100 text-yellow-600'
      case 'scheduled': return 'bg-blue-100 text-blue-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Attiva'
      case 'pending': return 'In attesa'
      case 'scheduled': return 'Programmata'
      default: return 'Completata'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />
      case 'pending': return <Clock className="h-3 w-3" />
      case 'scheduled': return <Clock className="h-3 w-3" />
      default: return <CheckCircle className="h-3 w-3" />
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

  return (
    <div className="h-[calc(100vh-120px)] flex items-center justify-center">
      {/* Main Chat Interface */}
      <div className="w-full h-full flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
        {/* Sidebar Conversazioni */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          {/* Header Sidebar */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900">I Tuoi Consulenti</h3>
              <span className="text-sm text-gray-500">{conversazioni.length} contatti</span>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca consulenti..."
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
                <option value="active">Online</option>
                <option value="pending">In attesa</option>
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
                    {conv.consulente.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">{conv.consulente.nome}</p>
                      <span className="text-xs text-gray-500">{conv.orarioUltimoMessaggio}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{conv.consulente.specializzazione}</p>
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
                      {conversazioneAttiva.consulente.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{conversazioneAttiva.consulente.nome}</h3>
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
                {messaggiAttivi.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.mittente === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.mittente === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      {msg.mittente === 'consulente' && (
                        <p className="text-xs font-medium mb-1 text-gray-600">{msg.nome}</p>
                      )}
                      <p className="text-sm">{msg.testo}</p>
                      <div className={`flex items-center justify-between mt-1 ${
                        msg.mittente === 'user' ? 'text-white' : 'text-gray-500'
                      }`}>
                        <span className="text-xs opacity-75">{msg.timestamp}</span>
                        {msg.mittente === 'user' && (
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
                    placeholder="Scrivi un messaggio al consulente..."
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Seleziona un consulente</h3>
                <p className="text-gray-600">Scegli un consulente dalla barra laterale per iniziare una conversazione</p>
              </div>
            </div>
          )}
        </div>

        {/* Info Panel Consulente */}
        {conversazioneAttiva && (
          <div className="w-64 border-l border-gray-200 p-4 bg-white shadow-sm flex flex-col h-full hover:shadow-md transition-shadow duration-300">
            <h4 className="font-semibold text-gray-900 mb-4">Dettagli Consulenza</h4>

            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Consulente</p>
                <p className="font-medium text-gray-900">{conversazioneAttiva.consulente.nome}</p>
                <p className="text-sm text-gray-600">{conversazioneAttiva.consulente.specializzazione}</p>
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

              {conversazioneAttiva.importo > 0 && (
                <div>
                  <p className="text-sm text-gray-600">Costo consulenza</p>
                  <p className="font-medium text-gray-900">€ {conversazioneAttiva.importo}</p>
                </div>
              )}

              {conversazioneAttiva.rating && (
                <div>
                  <p className="text-sm text-gray-600">Valutazione data</p>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < conversazioneAttiva.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-sm font-medium text-gray-700 ml-2">{conversazioneAttiva.rating}/5</span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Section */}
            {conversazioneAttiva.importo > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stato pagamento</span>
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                      conversazioneAttiva.fatturata ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {conversazioneAttiva.fatturata ? 'Pagata' : 'Da pagare'}
                    </span>
                  </div>

                  {!conversazioneAttiva.fatturata && (
                    <>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Pagamento richiesto</p>
                            <p className="text-xs text-yellow-700 mt-1">
                              Per completare la consulenza è necessario effettuare il pagamento
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Paga € {conversazioneAttiva.importo}</span>
                      </button>
                    </>
                  )}

                  {conversazioneAttiva.fatturata && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <p className="text-sm font-medium text-green-800">Pagamento completato</p>
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        Consulenza pagata il 20/01/2024
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {conversazioneAttiva && (
        <Modal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="Pagamento Consulenza"
          maxWidth="2xl"
        >
          <div className="space-y-6">
              {/* Dettagli Consulenza */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Dettagli consulenza</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consulente:</span>
                    <span className="font-medium text-gray-900">{conversazioneAttiva.consulente.nome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Argomento:</span>
                    <span className="font-medium text-gray-900">{conversazioneAttiva.argomento}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium text-gray-900 capitalize">{conversazioneAttiva.tipo.replace('_', ' ')}</span>
                  </div>
                  {conversazioneAttiva.durataConsulenza && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durata:</span>
                      <span className="font-medium text-gray-900">{conversazioneAttiva.durataConsulenza}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Riepilogo Costi */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Riepilogo costi</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consulenza:</span>
                    <span className="font-medium text-gray-900">€ {conversazioneAttiva.importo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IVA (22%):</span>
                    <span className="font-medium text-gray-900">€ {(conversazioneAttiva.importo * 0.22).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Totale:</span>
                      <span className="font-bold text-primary-600 text-lg">€ {(conversazioneAttiva.importo * 1.22).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metodi di Pagamento */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Metodo di pagamento</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input type="radio" name="payment" value="card" defaultChecked className="text-primary-600" />
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Carta di credito/debito</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input type="radio" name="payment" value="paypal" className="text-primary-600" />
                    <DollarSign className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">PayPal</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input type="radio" name="payment" value="bank" className="text-primary-600" />
                    <DollarSign className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Bonifico bancario</span>
                  </label>
                </div>
              </div>

              {/* Dati Carta (mockup) */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Dati carta</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Numero carta</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Scadenza</label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome sulla carta</label>
                    <input
                      type="text"
                      placeholder="Mario Rossi"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Info Sicurezza */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Pagamento sicuro</p>
                    <p className="text-xs text-blue-800 mt-1">
                      I tuoi dati sono protetti con crittografia SSL a 256 bit. Non memorizziamo le informazioni della carta.
                    </p>
                  </div>
                </div>
              </div>

            {/* Payment Actions */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  // Simulate payment processing
                  alert('Pagamento completato con successo!')
                  setShowPaymentModal(false)
                }}
                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                Paga € {(conversazioneAttiva.importo * 1.22).toFixed(2)}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}