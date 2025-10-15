import { TrendingUp, DollarSign, FileText, Calculator, Plus, Brain, MessageSquare } from 'lucide-react'
import { StatsGrid } from '../../shared/StatsCard'
import QuickActions from '../../shared/QuickActions'
import type { StatItem } from '../../shared/StatsCard'
import type { QuickAction } from '../../shared/QuickActions'
import { mockBusinessActivities } from '../../../../data/mockData'

interface DashboardOverviewProps {
  onSectionChange: (section: string) => void
}

export default function DashboardOverview({ onSectionChange }: DashboardOverviewProps) {
  const stats: StatItem[] = [
    { title: 'Fatturato Mensile', value: '€ 12.450', change: '+12%', icon: DollarSign, color: 'text-green-600', trend: 'up' },
    { title: 'Fatture Emesse', value: '24', change: '+8%', icon: FileText, color: 'text-blue-600', trend: 'up' },
    { title: 'Imposte Stimate', value: '€ 2.100', change: '-5%', icon: Calculator, color: 'text-orange-600', trend: 'down' },
    { title: 'Risparmio Fiscale', value: '€ 3.200', change: '+15%', icon: TrendingUp, color: 'text-accent-600', trend: 'up' }
  ]

  const quickActions: QuickAction[] = [
    { title: 'Nuova Fattura', description: 'Crea fattura elettronica', icon: Plus, color: 'bg-primary-600', section: 'fatture' },
    { title: 'Analisi AI', description: 'Analizza i tuoi dati', icon: Brain, color: 'bg-accent-600', section: 'analisi-ai' },
    { title: 'Simulazione Imposte', description: 'Calcola imposte ATECO', icon: Calculator, color: 'bg-purple-600', section: 'simulazione-imposte' },
    { title: 'Chat Consulente', description: 'Parla con il tuo CFO', icon: MessageSquare, color: 'bg-orange-600', section: 'consulenza' }
  ]

  const recentActivities = mockBusinessActivities

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