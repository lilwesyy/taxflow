import { Shield, Clock, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'

export interface Session {
  id: string
  browser: string
  os: string
  device: string
  location: string
  ip: string
  lastActivity: string
  createdAt: string
  isCurrent: boolean
}

interface SettingsSecurityProps {
  sessions: Session[]
  sessionTimeout: number
  onTerminateSession: (sessionId: string) => Promise<void>
  onTerminateAllSessions: () => Promise<void>
  onCleanupSessions: () => Promise<void>
  onUpdateTimeout: (minutes: number) => Promise<void>
  onLoadSessions: () => Promise<void>
  loading?: boolean
  loadingSessions?: boolean
}

export default function SettingsSecurity({
  sessions,
  sessionTimeout,
  onTerminateSession,
  onTerminateAllSessions,
  onCleanupSessions,
  onUpdateTimeout,
  onLoadSessions,
  loading = false,
  loadingSessions = false
}: SettingsSecurityProps) {
  const [localTimeout, setLocalTimeout] = useState(sessionTimeout)

  useEffect(() => {
    setLocalTimeout(sessionTimeout)
  }, [sessionTimeout])

  useEffect(() => {
    onLoadSessions()
  }, [])

  const formatLastActivity = (lastActivity: string) => {
    const date = new Date(lastActivity)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Adesso'
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minuto' : 'minuti'} fa`
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'ora' : 'ore'} fa`
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'giorno' : 'giorni'} fa`
    return date.toLocaleDateString('it-IT')
  }

  const timeoutOptions = [
    { value: 1440, label: '1 giorno' },
    { value: 10080, label: '1 settimana' },
    { value: 20160, label: '2 settimane' },
    { value: 43200, label: '30 giorni (raccomandato)' },
    { value: 129600, label: '90 giorni' },
    { value: 0, label: 'Mai (sconsigliato)' }
  ]

  return (
    <div className="space-y-6">
      {/* Security Status Banner */}
      <div className="bg-green-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mr-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Account Sicuro</h3>
            <p className="text-green-100 text-sm">Il tuo account è protetto con le migliori misure di sicurezza</p>
          </div>
        </div>
      </div>

      {/* Session Timeout */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center mr-3">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900">Timeout Sessione</h4>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Le sessioni inattive verranno eliminate automaticamente dopo il periodo impostato
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durata Sessione
            </label>
            <select
              value={localTimeout}
              onChange={(e) => setLocalTimeout(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {timeoutOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {localTimeout !== sessionTimeout && (
            <div className="flex justify-end">
              <button
                onClick={() => onUpdateTimeout(localTimeout)}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Aggiornamento...' : 'Salva Timeout'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center mr-3">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">Sessioni Attive</h4>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onCleanupSessions}
              disabled={loading}
              className="text-orange-600 hover:text-orange-700 transition-colors text-sm font-medium flex items-center disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Pulisci Inattive
            </button>
            {sessions.filter(s => !s.isCurrent).length > 0 && (
              <button
                onClick={onTerminateAllSessions}
                disabled={loading}
                className="text-red-600 hover:text-red-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Termina Tutte
              </button>
            )}
          </div>
        </div>

        {loadingSessions ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Caricamento sessioni...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Nessuna sessione attiva</p>
            <p className="text-sm text-gray-500 mt-2">Le tue sessioni appariranno qui</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow duration-200 ${
                  session.isCurrent ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {session.browser} su {session.os}
                    {session.isCurrent && (
                      <span className="ml-2 text-xs text-green-600 font-medium">Corrente</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    {session.device} • {session.ip}
                  </p>
                  <p className="text-xs text-gray-500">
                    Ultima attività: {formatLastActivity(session.lastActivity)}
                  </p>
                </div>
                {!session.isCurrent && (
                  <button
                    onClick={() => onTerminateSession(session.id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    Termina
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="group flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-200 bg-white">
          <div>
            <p className="font-medium text-gray-900">Scarica i tuoi dati</p>
            <p className="text-sm text-gray-600">Esporta tutti i tuoi dati personali</p>
          </div>
          <button className="text-primary-600 hover:text-primary-700 transition-colors text-sm font-medium">
            Scarica
          </button>
        </div>

        <div className="group flex items-center justify-between p-4 border border-red-200 rounded-xl hover:shadow-md transition-shadow duration-200 bg-white">
          <div>
            <p className="font-medium text-red-900">Elimina Account</p>
            <p className="text-sm text-red-600">Elimina permanentemente il tuo account e tutti i dati</p>
          </div>
          <button className="text-red-600 hover:text-red-700 transition-colors text-sm font-medium">
            Elimina
          </button>
        </div>
      </div>
    </div>
  )
}
