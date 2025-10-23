import { StatsGrid } from '../../../shared/StatsCard'
import type { StatItem } from '../../../shared/StatsCard'
import { Users, Activity, Database, HardDrive, Clock, Gauge, Cpu, MemoryStick } from 'lucide-react'

interface ServerStats {
  totalUsers: number
  adminUsers: number
  businessUsers: number
  webmasterUsers: number
  recentRegistrations: number
  activeSubscriptions: number
  pendingRegistrations: number
  pendingPivaRequests: number
  totalInvoices: number
  totalInvoicesClassic: number
  totalFattureElettroniche: number
  totalDocuments: number
  totalConversations: number
  databaseSize: string
  databaseSizeBytes: number
  uptime: string
  uptimeSeconds: number
  activeConnections: number
  requestsToday: number
  cpuUsage: string
  memoryUsage: string
  memoryUsedMB: string
  memoryTotalMB: string
  nodeVersion: string
  platform: string
  environment: string
}

interface WebMasterDashboardProps {
  stats: ServerStats | null
  loading: boolean
}

export default function WebMasterDashboard({ stats, loading }: WebMasterDashboardProps) {
  const systemStats: StatItem[] = [
    {
      title: 'Totale Utenti',
      value: loading ? '...' : stats?.totalUsers.toString() || '0',
      change: stats?.recentRegistrations ? `+${stats.recentRegistrations} (30gg)` : '+0',
      icon: Users,
      color: 'text-blue-600',
      trend: 'up'
    },
    {
      title: 'Utenti Admin',
      value: loading ? '...' : stats?.adminUsers.toString() || '0',
      change: stats?.webmasterUsers ? `${stats.webmasterUsers} webmaster` : '0 webmaster',
      icon: Users,
      color: 'text-purple-600',
      trend: 'neutral'
    },
    {
      title: 'Utenti Business',
      value: loading ? '...' : stats?.businessUsers.toString() || '0',
      change: stats?.activeSubscriptions ? `${stats.activeSubscriptions} attivi` : '0 attivi',
      icon: Users,
      color: 'text-green-600',
      trend: 'up'
    },
    {
      title: 'Richieste Pending',
      value: loading ? '...' : ((stats?.pendingRegistrations || 0) + (stats?.pendingPivaRequests || 0)).toString(),
      change: stats?.pendingPivaRequests ? `${stats.pendingPivaRequests} P.IVA` : '0 P.IVA',
      icon: Clock,
      color: 'text-orange-600',
      trend: 'neutral'
    }
  ]

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

  const performanceStats: StatItem[] = [
    {
      title: 'Uptime Server',
      value: loading ? '...' : stats?.uptime || '0d 0h 0m',
      change: stats?.uptimeSeconds ? `${Math.floor(stats.uptimeSeconds / 3600)}h` : '0h',
      icon: Clock,
      color: 'text-green-600',
      trend: 'up'
    },
    {
      title: 'Attività Utenti',
      value: loading ? '...' : stats?.requestsToday.toLocaleString() || '0',
      change: 'Oggi',
      icon: Gauge,
      color: 'text-blue-600',
      trend: 'up'
    },
    {
      title: 'Utilizzo CPU',
      value: loading ? '...' : stats?.cpuUsage || '0%',
      change: stats?.platform || 'linux',
      icon: Cpu,
      color: 'text-purple-600',
      trend: 'neutral'
    },
    {
      title: 'Memoria Heap',
      value: loading ? '...' : stats?.memoryUsage || '0%',
      change: stats?.memoryUsedMB ? `${stats.memoryUsedMB} MB` : '0 MB',
      icon: MemoryStick,
      color: 'text-orange-600',
      trend: 'neutral'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiche Utenti</h2>
        <StatsGrid stats={systemStats} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiche Database</h2>
        <StatsGrid stats={databaseStats} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Server</h2>
        <StatsGrid stats={performanceStats} />
      </div>
    </div>
  )
}
