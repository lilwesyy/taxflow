import { Server, Gauge, Users, Database, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../../../context/AuthContext'
import WebMasterDashboard from './webmaster/WebMasterDashboard'
import WebMasterUsers from './webmaster/WebMasterUsers'
import WebMasterDatabase from './webmaster/WebMasterDatabase'
import WebMasterSystem from './webmaster/WebMasterSystem'
import { logger } from '../../../../utils/logger'

interface UserBreakdown {
  businessPendingRegistration: number
  businessApprovedRegistration: number
  businessRejectedRegistration: number
  businessPendingPiva: number
  businessApprovedPiva: number
  businessRejectedPiva: number
  businessFullyApproved: number
}

interface ServerStats {
  totalUsers: number
  adminUsers: number
  businessUsers: number
  webmasterUsers: number
  recentRegistrations: number
  activeSubscriptions: number
  pendingRegistrations: number
  pendingPivaRequests: number
  breakdown: UserBreakdown
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

type TabType = 'dashboard' | 'users' | 'database' | 'system'

export default function WebMaster() {
  const { user } = useAuth()
  const [stats, setStats] = useState<ServerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')

  useEffect(() => {
    loadServerStats()

    // Refresh stats every 30 seconds
    const interval = setInterval(() => {
      loadServerStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const loadServerStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/webmaster/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Errore nel caricamento delle statistiche')
      }

      const data = await response.json()

      if (data.success && data.stats) {
        setStats(data.stats)
      } else {
        throw new Error('Risposta API non valida')
      }
    } catch (err) {
      logger.error('Error loading server stats:', err)
      setError('Errore nel caricamento delle statistiche del server')
    } finally {
      setLoading(false)
    }
  }

  // Check if user has webmaster permission
  if (!user?.webmaster) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Accesso Negato</h2>
          <p className="text-red-700">
            Non hai i permessi necessari per accedere a questa sezione.
            Solo gli utenti con permessi WebMaster possono visualizzare le statistiche del server.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Errore</h2>
          <p className="text-red-700">{error}</p>
          <button
            onClick={loadServerStats}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Riprova
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'dashboard' as TabType, name: 'Dashboard', icon: Gauge, description: 'Panoramica generale' },
    { id: 'users' as TabType, name: 'Utenti', icon: Users, description: 'Gestione utenti e breakdown' },
    { id: 'database' as TabType, name: 'Database', icon: Database, description: 'Statistiche database' },
    { id: 'system' as TabType, name: 'Sistema', icon: Server, description: 'Informazioni server' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Server className="h-8 w-8" />
              <h1 className="text-2xl font-bold">WebMaster Dashboard</h1>
            </div>
            <p className="text-blue-100">
              Gestione completa del sistema senza scrivere codice
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Ultimo aggiornamento</div>
            <div className="text-lg font-semibold">{new Date().toLocaleTimeString('it-IT')}</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="grid grid-cols-4 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-3 rounded-lg text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{tab.name}</span>
                </div>
                <p className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                  {tab.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'dashboard' && <WebMasterDashboard stats={stats} loading={loading} />}
        {activeTab === 'users' && <WebMasterUsers stats={stats} onRefreshStats={loadServerStats} />}
        {activeTab === 'database' && <WebMasterDatabase stats={stats} loading={loading} />}
        {activeTab === 'system' && <WebMasterSystem stats={stats} loading={loading} />}
      </div>

      {/* Refresh Info */}
      <div className="text-center text-sm text-gray-500">
        <p>Le statistiche vengono aggiornate automaticamente ogni 30 secondi</p>
      </div>
    </div>
  )
}
