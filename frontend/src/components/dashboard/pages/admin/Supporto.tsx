import { HelpCircle, MessageSquare, Book, Video, Phone, Mail, Search, Send, ExternalLink, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { logger } from '../../../../utils/logger'

export default function Supporto() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [ticketSearchTerm, setTicketSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    description: ''
  })

  const tabs = [
    { id: 'overview', name: 'Panoramica', icon: HelpCircle },
    { id: 'tickets', name: 'I Miei Ticket', icon: MessageSquare },
    { id: 'knowledge', name: 'Base Conoscenza', icon: Book },
    { id: 'contact', name: 'Contattaci', icon: Phone }
  ]

  const faqCategories = [
    {
      title: 'Gestione Clienti',
      icon: '👥',
      items: [
        { question: 'Come aggiungere un nuovo cliente?', answer: 'Vai su Gestione Clienti e clicca il pulsante "Nuovo Cliente" in alto a destra.' },
        { question: 'Come modificare i dati di un cliente?', answer: 'Clicca sull\'icona "occhio" nella tabella clienti per aprire i dettagli e poi "Modifica".' },
        { question: 'Come eliminare un cliente?', answer: 'Apri i dettagli del cliente e clicca sul menu "..." per trovare l\'opzione elimina.' }
      ]
    },
    {
      title: 'Richieste P.IVA',
      icon: '🏢',
      items: [
        { question: 'Come gestire una nuova richiesta P.IVA?', answer: 'Le nuove richieste appaiono in "Richieste P.IVA". Clicca per aprire i dettagli e seguire il workflow.' },
        { question: 'Quali documenti servono per aprire P.IVA?', answer: 'Documento identità, codice fiscale, visura camerale e modulo di richiesta compilato.' },
        { question: 'Quanto tempo ci vuole per l\'approvazione?', answer: 'In media 3-5 giorni lavorativi dall\'invio della documentazione completa.' }
      ]
    },
    {
      title: 'Fatturazione',
      icon: '💰',
      items: [
        { question: 'Come creare una fattura?', answer: 'Vai nella sezione Fatturazione e clicca "Nuova Fattura", compila i dati cliente e servizi.' },
        { question: 'Come inviare una fattura al cliente?', answer: 'Dalla lista fatture, clicca sull\'icona email per inviare automaticamente al cliente.' },
        { question: 'Come gestire i pagamenti?', answer: 'I pagamenti vengono tracciati automaticamente. Puoi vedere lo stato nella dashboard fatture.' }
      ]
    }
  ]

  const quickActions = [
    { title: 'Guida Rapida', description: 'Introduzione alle funzionalità principali', icon: Book, color: 'bg-blue-500', time: '5 min' },
    { title: 'Video Tutorial', description: 'Tutorial passo-passo per iniziare', icon: Video, color: 'bg-purple-500', time: '15 min' },
    { title: 'Chat dal Vivo', description: 'Parla direttamente con il supporto', icon: MessageSquare, color: 'bg-green-500', time: 'Live' },
    { title: 'Chiamaci', description: 'Assistenza telefonica immediata', icon: Phone, color: 'bg-orange-500', time: 'Live' }
  ]

  const myTickets = [
    {
      id: 'TK-001',
      subject: 'Problema sincronizzazione dati clienti',
      category: 'technical',
      priority: 'high',
      status: 'open',
      created: '15/01/2024',
      updated: '16/01/2024',
      messages: 3
    },
    {
      id: 'TK-002',
      subject: 'Richiesta nuova funzionalità export',
      category: 'feature',
      priority: 'medium',
      status: 'in_progress',
      created: '10/01/2024',
      updated: '14/01/2024',
      messages: 7
    },
    {
      id: 'TK-003',
      subject: 'Domanda su configurazione notifiche',
      category: 'general',
      priority: 'low',
      status: 'resolved',
      created: '05/01/2024',
      updated: '08/01/2024',
      messages: 2
    },
    {
      id: 'TK-004',
      subject: 'Errore calcolo imposte forfettarie',
      category: 'technical',
      priority: 'high',
      status: 'open',
      created: '20/01/2024',
      updated: '22/01/2024',
      messages: 5
    },
    {
      id: 'TK-005',
      subject: 'Integrazione sistema contabile',
      category: 'feature',
      priority: 'medium',
      status: 'in_progress',
      created: '18/01/2024',
      updated: '21/01/2024',
      messages: 12
    },
    {
      id: 'TK-006',
      subject: 'Backup automatico documenti',
      category: 'feature',
      priority: 'low',
      status: 'resolved',
      created: '12/01/2024',
      updated: '15/01/2024',
      messages: 4
    },
    {
      id: 'TK-007',
      subject: 'Performance dashboard lenta',
      category: 'technical',
      priority: 'medium',
      status: 'closed',
      created: '08/01/2024',
      updated: '11/01/2024',
      messages: 8
    },
    {
      id: 'TK-008',
      subject: 'Modifica template fatture',
      category: 'general',
      priority: 'low',
      status: 'open',
      created: '25/01/2024',
      updated: '26/01/2024',
      messages: 2
    },
    {
      id: 'TK-009',
      subject: 'Errore invio email automatiche',
      category: 'technical',
      priority: 'high',
      status: 'in_progress',
      created: '23/01/2024',
      updated: '24/01/2024',
      messages: 6
    },
    {
      id: 'TK-010',
      subject: 'Aggiunta campo personalizzato clienti',
      category: 'feature',
      priority: 'medium',
      status: 'resolved',
      created: '17/01/2024',
      updated: '19/01/2024',
      messages: 9
    },
    {
      id: 'TK-011',
      subject: 'Problema accesso mobile app',
      category: 'technical',
      priority: 'medium',
      status: 'open',
      created: '28/01/2024',
      updated: '29/01/2024',
      messages: 3
    },
    {
      id: 'TK-012',
      subject: 'Report personalizzati analytics',
      category: 'feature',
      priority: 'low',
      status: 'closed',
      created: '14/01/2024',
      updated: '16/01/2024',
      messages: 7
    }
  ]

  const knowledgeBase = [
    {
      category: 'Primi Passi',
      articles: [
        { title: 'Configurazione iniziale account', views: 1250, helpful: 45 },
        { title: 'Come aggiungere il primo cliente', views: 980, helpful: 38 },
        { title: 'Personalizzazione dashboard', views: 756, helpful: 29 }
      ]
    },
    {
      category: 'Funzionalità Avanzate',
      articles: [
        { title: 'Integrazione con sistemi esterni', views: 432, helpful: 22 },
        { title: 'Automazione workflow P.IVA', views: 389, helpful: 18 },
        { title: 'Report personalizzati', views: 298, helpful: 15 }
      ]
    },
    {
      category: 'Risoluzione Problemi',
      articles: [
        { title: 'Problemi di sincronizzazione', views: 654, helpful: 31 },
        { title: 'Errori comuni import dati', views: 543, helpful: 25 },
        { title: 'Recupero password account', views: 432, helpful: 20 }
      ]
    }
  ]

  const handleTicketSubmit = () => {
    // Qui sarebbe implementata la logica per inviare il ticket
    logger.debug('Invio ticket:', ticketForm)
    setTicketForm({ subject: '', category: 'general', priority: 'medium', description: '' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-600'
      case 'in_progress': return 'bg-yellow-100 text-yellow-600'
      case 'resolved': return 'bg-green-100 text-green-600'
      case 'closed': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Aperto'
      case 'in_progress': return 'In Lavorazione'
      case 'resolved': return 'Risolto'
      case 'closed': return 'Chiuso'
      default: return status
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

  const renderOverviewTab = () => (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="text-center flex-shrink-0">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Centro Assistenza</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Trova risposte alle tue domande, consulta guide dettagliate o contatta il nostro team di supporto
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        {quickActions.map((action, index) => (
          <div key={index} className="group bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow relative z-10 cursor-pointer">
            <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">{action.title}</h3>
            <p className="text-xs text-gray-600 mb-2">{action.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{action.time}</span>
              <ExternalLink className="h-3 w-3 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Support Stats */}
      <div className="group bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white flex-shrink-0 hover:shadow-md transition-shadow relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center group-hover:scale-110 transition-transform">
            <div className="text-2xl font-bold mb-1">2 min</div>
            <div className="text-primary-100 text-sm">Tempo medio risposta</div>
          </div>
          <div className="text-center group-hover:scale-110 transition-transform">
            <div className="text-2xl font-bold mb-1">98%</div>
            <div className="text-primary-100 text-sm">Soddisfazione clienti</div>
          </div>
          <div className="text-center group-hover:scale-110 transition-transform">
            <div className="text-2xl font-bold mb-1">24/7</div>
            <div className="text-primary-100 text-sm">Supporto disponibile</div>
          </div>
        </div>
      </div>

      {/* FAQ Popular */}
      <div className="flex-1 overflow-hidden">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Domande Frequenti</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          {faqCategories.slice(0, 2).map((category, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-full overflow-y-auto hover:shadow-md transition-shadow relative z-10">
              <div className="flex items-center mb-4">
                <span className="text-xl mr-3">{category.icon}</span>
                <h4 className="font-semibold text-gray-900">{category.title}</h4>
              </div>
              <div className="space-y-3">
                {category.items.map((item, i) => (
                  <div key={i} className="border-l-2 border-primary-100 pl-4">
                    <p className="font-medium text-gray-800 text-sm">{item.question}</p>
                    <p className="text-gray-600 text-xs mt-1">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTicketsTab = () => {
    // Filtro i ticket in base al termine di ricerca
    const filteredTickets = myTickets.filter(ticket =>
      ticket.id.toLowerCase().includes(ticketSearchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(ticketSearchTerm.toLowerCase()) ||
      ticket.category.toLowerCase().includes(ticketSearchTerm.toLowerCase()) ||
      ticket.status.toLowerCase().includes(ticketSearchTerm.toLowerCase())
    )

    // Calcolo paginazione
    const totalItems = filteredTickets.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentTickets = filteredTickets.slice(startIndex, endIndex)

    return (
      <div className="h-full overflow-y-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">I Miei Ticket di Supporto</h3>
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca ticket..."
                value={ticketSearchTerm}
                onChange={(e) => {
                  setTicketSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            <button
              onClick={() => setActiveTab('contact')}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Nuovo Ticket
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-sm font-medium text-gray-600">Ticket ID</th>
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-sm font-medium text-gray-600">Oggetto</th>
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-sm font-medium text-gray-600">Categoria</th>
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-sm font-medium text-gray-600">Priorità</th>
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-sm font-medium text-gray-600">Ultimo Aggiornamento</th>
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-sm font-medium text-gray-600">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-medium text-primary-600">{ticket.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-900">{ticket.subject}</p>
                      <p className="text-sm text-gray-500">{ticket.messages} messaggi</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="capitalize text-gray-700">{ticket.category}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                        {getStatusText(ticket.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-600">{ticket.updated}</p>
                    </td>
                    <td className="py-4 px-6">
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium hover:scale-110 transition-all duration-200">
                        Visualizza
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-gray-200 bg-gray-50">
                <tr>
                  <td colSpan={7} className="px-6 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span>Mostra</span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value))
                            setCurrentPage(1)
                          }}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                        <span>
                          di {totalItems} ticket
                          {ticketSearchTerm && ` (filtrati)`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-200"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum
                            if (totalPages <= 5) {
                              pageNum = i + 1
                            } else if (currentPage <= 3) {
                              pageNum = i + 1
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i
                            } else {
                              pageNum = currentPage - 2 + i
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-3 py-1 text-sm rounded ${
                                  currentPage === pageNum
                                    ? 'bg-primary-600 text-white'
                                    : 'hover:bg-gray-200 text-gray-700 hover:scale-105 transition-all duration-200'
                                }`}
                              >
                                {pageNum}
                              </button>
                            )
                          })}
                        </div>

                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-200"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const renderKnowledgeTab = () => (
    <div className="h-full overflow-y-auto space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Base di Conoscenza</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca articoli, guide, tutorial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {knowledgeBase.map((section, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10">
            <h4 className="font-semibold text-gray-900 mb-4">{section.category}</h4>
            <div className="space-y-3">
              {section.articles.map((article, i) => (
                <div key={i} className="border-b border-gray-100 pb-3 last:border-b-0">
                  <p className="font-medium text-gray-800 text-sm hover:text-primary-600 cursor-pointer">
                    {article.title}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{article.views} visualizzazioni</span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 mr-1" />
                      <span className="text-xs text-gray-500">{article.helpful}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Complete FAQ */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-6">Tutte le FAQ</h4>
        <div className="space-y-6">
          {faqCategories.map((category, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{category.icon}</span>
                <h5 className="font-semibold text-gray-900">{category.title}</h5>
              </div>
              <div className="space-y-4">
                {category.items.map((item, i) => (
                  <details key={i} className="group">
                    <summary className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                      <span className="font-medium text-gray-800">{item.question}</span>
                      <HelpCircle className="h-4 w-4 text-gray-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-2 px-3 pb-3">
                      <p className="text-gray-600">{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderContactTab = () => (
    <div className="h-full overflow-y-auto space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contatta il Supporto</h3>
        <p className="text-gray-600">
          Non hai trovato quello che cercavi? Invia un ticket di supporto e ti risponderemo il prima possibile.
        </p>
      </div>

      {/* Contact Methods */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow relative z-10">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Email</h4>
          <p className="text-sm text-gray-600 mb-3">Risposta entro 2 ore</p>
          <p className="text-primary-600 font-medium">support@taxflow.it</p>
        </div>

        <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow relative z-10">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Phone className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Telefono</h4>
          <p className="text-sm text-gray-600 mb-3">Lun-Ven 9:00-18:00</p>
          <p className="text-primary-600 font-medium">+39 02 1234 5678</p>
        </div>

        <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow relative z-10">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <MessageSquare className="h-6 w-6 text-purple-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Chat</h4>
          <p className="text-sm text-gray-600 mb-3">Disponibile ora</p>
          <button className="text-primary-600 font-medium hover:text-primary-700 hover:scale-110 transition-all duration-200">
            Avvia Chat
          </button>
        </div>
      </div>

      {/* Ticket Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10">
        <h4 className="font-semibold text-gray-900 mb-6">Crea Nuovo Ticket</h4>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Oggetto *
              </label>
              <input
                type="text"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Descrivi brevemente il problema..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                value={ticketForm.category}
                onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="general">Domanda Generale</option>
                <option value="technical">Problema Tecnico</option>
                <option value="billing">Fatturazione</option>
                <option value="feature">Richiesta Funzionalità</option>
                <option value="bug">Segnalazione Bug</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priorità
            </label>
            <select
              value={ticketForm.priority}
              onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="low">Bassa</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrizione *
            </label>
            <textarea
              value={ticketForm.description}
              onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
              rows={6}
              placeholder="Descrivi il problema nel dettaglio. Include tutti i passaggi per riprodurlo e qualsiasi messaggio di errore..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleTicketSubmit}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center"
            >
              <Send className="h-4 w-4 mr-2" />
              Invia Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab()
      case 'tickets':
        return renderTicketsTab()
      case 'knowledge':
        return renderKnowledgeTab()
      case 'contact':
        return renderContactTab()
      default:
        return renderOverviewTab()
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 flex-shrink-0">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden py-6">
        {renderTabContent()}
      </div>
    </div>
  )
}