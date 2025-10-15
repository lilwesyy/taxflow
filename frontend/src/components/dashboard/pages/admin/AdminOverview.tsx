import { TrendingUp, DollarSign, Users, Brain, Building2, Eye, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { StatsGrid } from '../../shared/StatsCard'
import QuickActions from '../../shared/QuickActions'
import { mockAdminRequests } from '../../../../data/mockData'
import type { StatItem } from '../../shared/StatsCard'
import type { QuickAction } from '../../shared/QuickActions'
import apiService from '../../../../services/api'
import ClientDetailModal from '../../shared/ClientDetailModal'
import type { User, Invoice } from '../../../../types'

interface AdminOverviewProps {
  onSectionChange: (section: string) => void
}

export default function AdminOverview({ onSectionChange }: AdminOverviewProps) {
  const [selectedClient, setSelectedClient] = useState<User | null>(null)
  const [clientsCount, setClientsCount] = useState(0)
  const [pivaRequestsCount, setPivaRequestsCount] = useState(0)
  const [recentClients, setRecentClients] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [monthlyRevenue, setMonthlyRevenue] = useState(0)
  const [completedConsultations, setCompletedConsultations] = useState(0)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const [clientsResponse, pivaResponse, invoicesResponse] = await Promise.all([
        apiService.getClients(),
        apiService.getPivaRequests(),
        fetch(`${import.meta.env.VITE_API_URL}/chat/conversations/paid/list`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }).then(res => res.json())
      ])

      if (clientsResponse.success) {
        setClientsCount(clientsResponse.clients.length)
        // Get the 4 most recent clients
        setRecentClients(clientsResponse.clients.slice(0, 4))
      }

      if (pivaResponse.success) {
        setPivaRequestsCount(pivaResponse.requests.length)
      }

      // Calculate monthly revenue from paid invoices and completed consultations
      if (invoicesResponse) {
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()

        const monthlyInvoices = (invoicesResponse as Invoice[])
          .filter((invoice) => {
            if (invoice.status !== 'paid' || !invoice.dataPagamento) return false

            // Parse Italian date format (dd/mm/yyyy)
            const [day, month, year] = invoice.dataPagamento.split('/')
            const paymentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))

            return paymentDate.getMonth() === currentMonth &&
                   paymentDate.getFullYear() === currentYear
          })

        const monthlyTotal = monthlyInvoices.reduce((sum, invoice) => sum + (invoice.totale || 0), 0)
        setMonthlyRevenue(monthlyTotal)

        // Count completed (paid) consultations
        const completedCount = (invoicesResponse as Invoice[]).filter((invoice) => invoice.status === 'paid').length
        setCompletedConsultations(completedCount)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    setSelectedClient(null)
  }

  const handleChatClick = () => {
    onSectionChange('consulenze')
  }

  const formatRevenue = (amount: number) => {
    return amount % 1 === 0 ? `€ ${amount.toFixed(0)}` : `€ ${amount.toFixed(2)}`
  }

  const stats: StatItem[] = [
    { title: 'Clienti Attivi', value: loading ? '...' : clientsCount.toString(), change: '+8%', icon: Users, color: 'text-blue-600', trend: 'up' },
    { title: 'Fatturato Mensile', value: loading ? '...' : formatRevenue(monthlyRevenue), change: '+15%', icon: DollarSign, color: 'text-green-600', trend: 'up' },
    { title: 'Richieste P.IVA', value: loading ? '...' : pivaRequestsCount.toString(), change: '+25%', icon: Building2, color: 'text-purple-600', trend: 'up' },
    { title: 'Consulenze Completate', value: loading ? '...' : completedConsultations.toString(), change: '+12%', icon: CheckCircle, color: 'text-accent-600', trend: 'up' }
  ]

  const pendingRequests = mockAdminRequests

  const formatDate = (date: string | Date) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }


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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Recent Clients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Clienti Recenti</h3>
              <button
                onClick={() => onSectionChange('clienti')}
                className="text-primary-600 hover:text-primary-700 text-xs sm:text-sm font-medium"
              >
                Vedi tutti
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-8 sm:p-12 text-center">
                <p className="text-sm sm:text-base text-gray-500">Caricamento clienti...</p>
              </div>
            ) : recentClients.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm sm:text-base text-gray-500">Nessun cliente trovato</p>
              </div>
            ) : (
              recentClients.map((client, index) => (
                <div key={client.id || index} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                          <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base text-gray-900 truncate">{client.nome || client.name}</p>
                          {client.company && <p className="text-xs sm:text-sm text-gray-500 truncate">{client.company}</p>}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center mt-2 gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          client.status === 'active' ? 'bg-green-100 text-green-600' :
                          client.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {client.status === 'active' ? 'Attivo' : client.status === 'pending' ? 'In attesa' : 'Nuovo'}
                        </span>
                        <span className="text-xs text-gray-500 truncate">P.IVA: {client.piva}</span>
                        <span className="text-xs text-gray-500">{client.ultimaAttivita ? formatDate(client.ultimaAttivita) : 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:text-right sm:ml-4">
                      <p className="font-semibold text-sm sm:text-base text-gray-900">€ {client.fatturato?.toLocaleString() || '0'}</p>
                      <button
                        onClick={() => setSelectedClient(client)}
                        className="text-primary-600 hover:text-primary-700 text-sm mt-0 sm:mt-1 hover:scale-110 transition-all duration-200"
                        title="Visualizza dettagli"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Richieste in Sospeso</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingRequests.map((request, index) => (
              <div key={index} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-md ${
                        request.priority === 'high' ? 'text-red-600 bg-red-50' :
                        request.priority === 'medium' ? 'text-yellow-600 bg-yellow-50' :
                        'text-green-600 bg-green-50'
                      }`}>
                        {request.type}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">{request.time}</span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-900 mt-1 font-medium truncate">{request.client}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{request.description}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-2">
                    {request.priority === 'high' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {request.priority === 'medium' && <Clock className="h-4 w-4 text-yellow-500" />}
                    {request.priority === 'low' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    <button className="text-primary-600 hover:text-primary-700 text-xs sm:text-sm font-medium px-2 py-1">
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
      <ClientDetailModal
        client={selectedClient}
        isOpen={!!selectedClient}
        onClose={closeModal}
        onClientUpdated={loadStats}
        onChatClick={handleChatClick}
        onStartConsultation={() => {
          // Navigate to consulenze section
          onSectionChange('consulenze')
        }}
        showEditButton={false}
      />
    </div>
  )
}
