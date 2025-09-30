import { TrendingUp, DollarSign, Users, Brain, Building2, Eye, AlertTriangle, CheckCircle, Clock, User, Mail, Phone, Building, Calendar, FileText, Euro, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { StatsGrid } from '../../shared/StatsCard'
import QuickActions from '../../shared/QuickActions'
import { mockClients, mockAdminRequests } from '../../../../data/mockData'
import type { StatItem } from '../../shared/StatsCard'
import type { QuickAction } from '../../shared/QuickActions'
import type { Client } from '../../../../types/dashboard'
import Modal from '../../../common/Modal'

interface AdminOverviewProps {
  onSectionChange: (section: string) => void
}

export default function AdminOverview({ onSectionChange }: AdminOverviewProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const closeModal = () => {
    setSelectedClient(null)
  }

  const handleChatClick = () => {
    onSectionChange('consulenze')
  }

  const stats: StatItem[] = [
    { title: 'Clienti Attivi', value: '127', change: '+8%', icon: Users, color: 'text-blue-600', trend: 'up' },
    { title: 'Fatturato Mensile', value: '€ 45.200', change: '+15%', icon: DollarSign, color: 'text-green-600', trend: 'up' },
    { title: 'Richieste P.IVA', value: '12', change: '+25%', icon: Building2, color: 'text-purple-600', trend: 'up' },
    { title: 'Analisi Completate', value: '89', change: '+12%', icon: Brain, color: 'text-accent-600', trend: 'up' }
  ]

  const recentClients = mockClients.slice(0, 4) // Show first 4 clients

  const pendingRequests = mockAdminRequests


  const quickActions: QuickAction[] = [
    { title: 'Gestisci Clienti', description: 'Visualizza e gestisci clienti', icon: Users, color: 'bg-primary-600', section: 'clienti' },
    { title: 'Richieste P.IVA', description: 'Gestisci aperture P.IVA', icon: Building2, color: 'bg-purple-600', section: 'richieste-piva' },
    { title: 'Analisi AI', description: 'Avvia nuova analisi', icon: Brain, color: 'bg-accent-600', section: 'analisi-ai' },
    { title: 'Report Mensile', description: 'Genera report clienti', icon: TrendingUp, color: 'bg-orange-600', section: 'reports' }
  ]

  return (
    <div>

      {/* Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Quick Actions */}
      <QuickActions actions={quickActions} onSectionChange={onSectionChange} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Clients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Clienti Recenti</h3>
              <button
                onClick={() => onSectionChange('clienti')}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Vedi tutti
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentClients.map((client, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <Users className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{client.name || client.nome}</p>
                        <p className="text-sm text-gray-500">{client.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        client.status === 'active' ? 'bg-green-100 text-green-600' :
                        client.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {client.status === 'active' ? 'Attivo' : client.status === 'pending' ? 'In attesa' : 'Nuovo'}
                      </span>
                      <span className="text-xs text-gray-500">P.IVA: {client.piva || client.partitaIva}</span>
                      <span className="text-xs text-gray-500">{client.lastActivity || client.ultimaAttivita}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{client.revenue || `€ ${client.fatturato?.toLocaleString() || '0'}`}</p>
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="text-primary-600 hover:text-primary-700 text-sm mt-1 hover:scale-110 transition-all duration-200"
                      title="Visualizza dettagli"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Richieste in Sospeso</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingRequests.map((request, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium px-2 py-1 rounded-md mr-3 ${
                        request.priority === 'high' ? 'text-red-600 bg-red-50' :
                        request.priority === 'medium' ? 'text-yellow-600 bg-yellow-50' :
                        'text-green-600 bg-green-50'
                      }`}>
                        {request.type}
                      </span>
                      <span className="text-sm text-gray-500">{request.time}</span>
                    </div>
                    <p className="text-gray-900 mt-1 font-medium">{request.client}</p>
                    <p className="text-sm text-gray-600">{request.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {request.priority === 'high' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {request.priority === 'medium' && <Clock className="h-4 w-4 text-yellow-500" />}
                    {request.priority === 'low' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Gestisci
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Client Detail Modal */}
      <Modal
        isOpen={!!selectedClient}
        onClose={closeModal}
        title={`Dettagli Cliente - ${selectedClient?.nome}`}
        maxWidth="6xl"
      >
        {selectedClient && (
          <div className="space-y-6">
            {/* Header con avatar e info principali */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedClient.nome}</h3>
                    <p className="text-primary-600 font-medium">{selectedClient.company}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {selectedClient.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {selectedClient.telefono}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedClient.status === 'active' ? 'bg-green-100 text-green-700' :
                    selectedClient.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedClient.status === 'active' ? 'Attivo' :
                     selectedClient.status === 'pending' ? 'In Attesa' : 'Nuovo'}
                  </span>
                  <p className="text-sm text-gray-500 mt-2">Cliente dal {selectedClient.dataRegistrazione}</p>
                </div>
              </div>
            </div>

            {/* Statistiche principali */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{selectedClient.consulenze}</p>
                <p className="text-sm text-gray-600">Consulenze</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <Euro className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">€{(selectedClient.fatturato || 0).toLocaleString()}</p>
                <p className="text-sm text-gray-600">Fatturato Anno</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{selectedClient.documentiForniti || 15}</p>
                <p className="text-sm text-gray-600">Documenti</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="w-8 h-8 bg-orange-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{selectedClient.pendingRequests}</p>
                <p className="text-sm text-gray-600">Richieste Aperte</p>
              </div>
            </div>

            {/* Contenuto principale */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Colonna sinistra - Informazioni */}
              <div className="space-y-6">

                {/* Dati Personali */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary-600" />
                    Dati Personali
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Codice Fiscale:</span>
                      <span className="text-sm font-medium">{selectedClient.codiceFiscale}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Indirizzo:</span>
                      <span className="text-sm font-medium text-right">{selectedClient.indirizzo}</span>
                    </div>
                  </div>
                </div>

                {/* Dati Aziendali */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-primary-600" />
                    Dati Aziendali
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">P.IVA:</span>
                      <span className="text-sm font-medium">{selectedClient.piva}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Codice ATECO:</span>
                      <span className="text-sm font-medium">{selectedClient.codiceAteco}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Regime Contabile:</span>
                      <span className="text-sm font-medium">{selectedClient.regimeContabile || 'Forfettario'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Aliquota IVA:</span>
                      <span className="text-sm font-medium">{selectedClient.aliquotaIva || '5%'}</span>
                    </div>
                  </div>
                </div>

                {/* Stato Fiscale */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary-600" />
                    Stato Fiscale
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-lg font-bold text-green-600">{selectedClient.fatturePagate || 8}</p>
                      <p className="text-xs text-green-700">Fatture Pagate</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-lg font-bold text-yellow-600">{selectedClient.fattureInAttesa || 2}</p>
                      <p className="text-xs text-yellow-700">In Attesa</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-700">Prossima Scadenza Tasse:</span>
                      <span className="text-sm font-bold text-red-800">{selectedClient.prossimaTasse || '30/06/2024'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonna destra - Attività */}
              <div className="space-y-6">

                {/* Attività Recenti */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary-600" />
                    Attività Recenti
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {(selectedClient.attivitaRecenti || [
                      { data: '15/03/2024', azione: 'Documento caricato', dettaglio: 'Fattura elettronica Q1 2024' },
                      { data: '10/03/2024', azione: 'Consulenza completata', dettaglio: 'Revisione dichiarazione IVA' },
                      { data: '05/03/2024', azione: 'Pagamento ricevuto', dettaglio: 'Fattura FAT-001 - €650' }
                    ]).map((attivita: any, index: number) => (
                      <div key={index} className="border-l-2 border-primary-200 pl-4 pb-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{attivita.azione}</p>
                          <span className="text-xs text-gray-500">{attivita.data}</span>
                        </div>
                        <p className="text-sm text-gray-600">{attivita.dettaglio}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Note del Consulente */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary-600" />
                    Note del Consulente
                  </h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      {selectedClient.note || 'Cliente affidabile, sempre puntuale nei pagamenti. Richiede assistenza principalmente per gestione IVA trimestrale.'}
                    </p>
                  </div>
                  <div className="mt-3">
                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium hover:scale-105 transition-all duration-200">
                      + Aggiungi nota
                    </button>
                  </div>
                </div>

                {/* Azioni Rapide */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Azioni Rapide</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="p-3 border border-primary-200 text-primary-600 rounded-lg hover:bg-primary-50 transition-all duration-200 text-sm font-medium flex items-center justify-center hover:scale-105 hover:shadow-sm">
                      <Phone className="h-4 w-4 mr-2" />
                      Chiama Cliente
                    </button>
                    <button
                      onClick={handleChatClick}
                      className="p-3 border border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-all duration-200 text-sm font-medium flex items-center justify-center hover:scale-105 hover:shadow-sm"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Invia Messaggio
                    </button>
                    <button className="p-3 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 text-sm font-medium flex items-center justify-center hover:scale-105 hover:shadow-sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Crea Fattura
                    </button>
                    <button className="p-3 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-all duration-200 text-sm font-medium flex items-center justify-center hover:scale-105 hover:shadow-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Prenota Call
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer con azioni principali */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button className="px-6 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-all duration-200 hover:scale-105 hover:shadow-sm">
                Modifica Cliente
              </button>
              <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg">
                Avvia Consulenza
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}