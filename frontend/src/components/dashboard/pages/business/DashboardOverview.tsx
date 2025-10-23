import { TrendingUp, DollarSign, FileText, Calculator, Plus, Brain, MessageSquare } from 'lucide-react'
import { useState, useEffect } from 'react'
import { StatsGrid } from '../../shared/StatsCard'
import QuickActions from '../../shared/QuickActions'
import type { StatItem } from '../../shared/StatsCard'
import type { QuickAction } from '../../shared/QuickActions'
import { mockBusinessActivities } from '../../../../data/mockData'
import api from '../../../../services/api'
import type { Invoice } from '../../../../types/dashboard'
import { logger } from '../../../../utils/logger'

interface DashboardOverviewProps {
  onSectionChange: (section: string) => void
}

export default function DashboardOverview({ onSectionChange }: DashboardOverviewProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const response = await api.getInvoices({ page: 1, per_page: 100 })

      if (response.success) {
        // Combine sent and received invoices
        const allInvoices = [...(response.sent || []), ...(response.received || [])]

        // Convert to Invoice format
        const convertedInvoices: Invoice[] = allInvoices.map((inv: any) => {
          // Map database status to UI status
          let uiStatus: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' = 'pending'
          switch (inv.status) {
            case 'inviata':
            case 'presa_in_carico':
              uiStatus = 'sent'
              break
            case 'consegnata':
            case 'accettata':
              uiStatus = 'paid'
              break
            case 'non_consegnata':
            case 'errore':
            case 'rifiutata':
              uiStatus = 'overdue'
              break
            case 'in_attesa':
            default:
              uiStatus = 'pending'
              break
          }

          return {
            id: inv.id?.toString() || inv._id?.toString() || '',
            conversationId: '',
            businessUserId: '',
            adminUserId: '',
            numero: inv.numero || '',
            cliente: inv.cliente || 'Cliente',
            clienteEmail: '',
            azienda: '',
            consulente: '',
            servizio: inv.righe && inv.righe.length > 0 ? inv.righe[0].descrizione : 'Servizio',
            tipo: 'Fattura Elettronica',
            importo: inv.importo || 0,
            iva: inv.iva || 0,
            totale: inv.totale || 0,
            status: uiStatus,
            dataEmissione: inv.data || new Date().toISOString().split('T')[0],
            dataScadenza: inv.pagamento?.dataScadenza,
            dataPagamento: inv.status === 'accettata' || inv.status === 'consegnata' ? inv.data : undefined,
            stripePaymentIntentId: '',
            createdAt: new Date(inv.dataInvio || Date.now()),
            updatedAt: new Date(inv.dataInvio || Date.now())
          } as Invoice
        })

        setInvoices(convertedInvoices)
      }
    } catch (error: any) {
      logger.error('Error loading invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Filter invoices for current month
  const currentMonthInvoices = invoices.filter(inv => {
    const invoiceDate = new Date(inv.dataEmissione)
    return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear
  })

  // Calculate monthly revenue
  const monthlyRevenue = currentMonthInvoices.reduce((sum, inv) => sum + inv.totale, 0)

  // Calculate total invoices count
  const totalInvoicesCount = invoices.length

  // Calculate estimated taxes (15% for regime forfettario - simplified)
  const estimatedTaxes = monthlyRevenue * 0.15

  // Calculate tax savings compared to ordinary regime (placeholder - 40% vs 15%)
  const ordinaryRegimeTaxes = monthlyRevenue * 0.40
  const taxSavings = ordinaryRegimeTaxes - estimatedTaxes

  const stats: StatItem[] = [
    {
      title: 'Fatturato Mensile',
      value: `€ ${monthlyRevenue.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Fatture Emesse',
      value: totalInvoicesCount.toString(),
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Imposte Stimate',
      value: `€ ${estimatedTaxes.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Calculator,
      color: 'text-orange-600'
    },
    {
      title: 'Risparmio Fiscale',
      value: `€ ${taxSavings.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-accent-600'
    }
  ]

  const quickActions: QuickAction[] = [
    { title: 'Nuova Fattura', description: 'Crea fattura elettronica', icon: Plus, color: 'bg-primary-600', section: 'fatture' },
    { title: 'Analisi SWOT', description: 'Analizza i tuoi dati', icon: Brain, color: 'bg-accent-600', section: 'analisi-ai' },
    { title: 'Simulazione Imposte', description: 'Calcola imposte ATECO', icon: Calculator, color: 'bg-purple-600', section: 'simulazione-imposte' },
    { title: 'Chat Consulente', description: 'Parla con il tuo CFO', icon: MessageSquare, color: 'bg-orange-600', section: 'consulenza' }
  ]

  const recentActivities = mockBusinessActivities

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento statistiche...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Quick Actions */}
      <QuickActions actions={quickActions} onSectionChange={onSectionChange} />

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Attività Recenti</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivities.map((activity, index) => (
            <div key={index} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-md ${
                      activity.status === 'success' ? 'text-green-600 bg-green-50' :
                      activity.status === 'warning' ? 'text-orange-600 bg-orange-50' :
                      'text-blue-600 bg-blue-50'
                    }`}>
                      {activity.type}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">{activity.time}</span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-900 mt-1">{activity.description}</p>
                </div>
                {activity.amount && (
                  <div className="text-left sm:text-right">
                    <p className={`text-sm sm:text-base font-semibold ${
                      activity.amount.includes('€') ? 'text-green-600' :
                      activity.status === 'warning' ? 'text-orange-600' : 'text-blue-600'
                    }`}>
                      {activity.amount}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}