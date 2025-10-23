import { StatsGrid } from '../../../shared/StatsCard'
import type { StatItem } from '../../../shared/StatsCard'
import { Activity, Database, HardDrive } from 'lucide-react'

interface ServerStats {
  totalInvoices: number
  totalInvoicesClassic: number
  totalFattureElettroniche: number
  totalDocuments: number
  totalConversations: number
  databaseSize: string
  databaseSizeBytes: number
  activeConnections: number
}

interface WebMasterDatabaseProps {
  stats: ServerStats | null
  loading: boolean
}

export default function WebMasterDatabase({ stats, loading }: WebMasterDatabaseProps) {
  const databaseStats: StatItem[] = [
    {
      title: 'Fatture Totali',
      value: loading ? '...' : stats?.totalInvoices.toString() || '0',
      change: stats?.totalFattureElettroniche ? `${stats.totalFattureElettroniche} elettr.` : '0 elettr.',
      icon: Activity,
      color: 'text-blue-600',
      trend: 'up'
    },
    {
      title: 'Documenti Totali',
      value: loading ? '...' : stats?.totalDocuments.toString() || '0',
      change: stats?.totalConversations ? `${stats.totalConversations} chat` : '0 chat',
      icon: Database,
      color: 'text-green-600',
      trend: 'up'
    },
    {
      title: 'Dimensione DB',
      value: loading ? '...' : stats?.databaseSize || '0 MB',
      change: stats?.databaseSizeBytes ? `${(stats.databaseSizeBytes / 1024 / 1024).toFixed(0)} MB` : '0 MB',
      icon: HardDrive,
      color: 'text-purple-600',
      trend: 'up'
    },
    {
      title: 'Connessioni MongoDB',
      value: loading ? '...' : stats?.activeConnections.toString() || '0',
      change: stats?.activeConnections === 1 ? 'Connesso' : 'Disconnesso',
      icon: Activity,
      color: stats?.activeConnections === 1 ? 'text-green-600' : 'text-red-600',
      trend: stats?.activeConnections === 1 ? 'up' : 'down'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiche Database</h2>
        <StatsGrid stats={databaseStats} />
      </div>
    </div>
  )
}
