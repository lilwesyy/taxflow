import { StatsGrid } from '../../../shared/StatsCard'
import type { StatItem } from '../../../shared/StatsCard'
import { Clock, Gauge, Cpu, MemoryStick, CheckCircle2 } from 'lucide-react'

interface ServerStats {
  uptime: string
  uptimeSeconds: number
  requestsToday: number
  cpuUsage: string
  memoryUsage: string
  memoryUsedMB: string
  memoryTotalMB: string
  nodeVersion: string
  platform: string
  environment: string
  activeConnections: number
}

interface WebMasterSystemProps {
  stats: ServerStats | null
  loading: boolean
}

export default function WebMasterSystem({ stats, loading }: WebMasterSystemProps) {
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Server</h2>
        <StatsGrid stats={performanceStats} />
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informazioni di Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Ambiente:</span>
              <span className="font-medium text-gray-900 capitalize">{stats?.environment || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Node Version:</span>
              <span className="font-medium text-gray-900">{stats?.nodeVersion || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Platform:</span>
              <span className="font-medium text-gray-900 capitalize">{stats?.platform || 'N/A'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Heap Totale:</span>
              <span className="font-medium text-gray-900">{stats?.memoryTotalMB ? `${stats.memoryTotalMB} MB` : 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Heap Usato:</span>
              <span className="font-medium text-gray-900">{stats?.memoryUsedMB ? `${stats.memoryUsedMB} MB` : 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Status Database:</span>
              <span className="font-medium text-green-600 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                {stats?.activeConnections === 1 ? 'Connesso' : 'Disconnesso'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
