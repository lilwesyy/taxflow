import { useState } from 'react'
import { Trash2, ChevronDown, ChevronUp, AlertTriangle, Bell, CheckCircle } from 'lucide-react'
import { AlertsData, PerformanceAlert } from '../../../../types/businessPlan'

interface AlertsEditorProps {
  data: AlertsData
  onChange: (data: AlertsData) => void
  isExpanded: boolean
  onToggle: () => void
}

export default function AlertsEditor({
  data,
  onChange,
  isExpanded,
  onToggle
}: AlertsEditorProps) {
  const [newAlert, setNewAlert] = useState<Partial<PerformanceAlert>>({})

  const addAlert = () => {
    if (!newAlert.name || !newAlert.metric || newAlert.threshold === undefined) return

    const alert: PerformanceAlert = {
      id: `alert-${Date.now()}`,
      name: newAlert.name,
      metric: newAlert.metric,
      condition: newAlert.condition || 'below',
      threshold: newAlert.threshold,
      currentValue: newAlert.currentValue,
      status: newAlert.status || 'active',
      severity: newAlert.severity || 'medium',
      actions: newAlert.actions || []
    }

    onChange({
      ...data,
      alerts: [...data.alerts, alert]
    })

    setNewAlert({})
  }

  const deleteAlert = (id: string) => {
    onChange({
      ...data,
      alerts: data.alerts.filter(a => a.id !== id)
    })
  }

  const updateAlertStatus = (id: string, status: PerformanceAlert['status']) => {
    onChange({
      ...data,
      alerts: data.alerts.map(a => a.id === id ? { ...a, status } : a)
    })
  }

  const getSeverityColor = (severity: PerformanceAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300'
    }
  }

  const getStatusIcon = (status: PerformanceAlert['status']) => {
    switch (status) {
      case 'triggered': return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'resolved': return <CheckCircle className="h-5 w-5 text-green-600" />
      default: return <Bell className="h-5 w-5 text-blue-600" />
    }
  }

  const checkAlert = (alert: PerformanceAlert): boolean => {
    if (alert.currentValue === undefined) return false

    switch (alert.condition) {
      case 'below': return alert.currentValue < alert.threshold
      case 'above': return alert.currentValue > alert.threshold
      case 'equals': return alert.currentValue === alert.threshold
      default: return false
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button className="text-gray-400 hover:text-gray-600 transition-colors" onClick={(e) => { e.stopPropagation(); onToggle() }}>
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Alert su Underperformance</h3>
              <p className="text-sm text-gray-600">Monitoraggio e notifiche automatiche</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {data.alerts.filter(a => a.status === 'triggered').length} attivi
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-6">
          {/* Add Alert Form */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Aggiungi Alert</h4>
            <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nome alert"
                  value={newAlert.name || ''}
                  onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Metrica da monitorare"
                  value={newAlert.metric || ''}
                  onChange={(e) => setNewAlert({ ...newAlert, metric: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                <select
                  value={newAlert.condition || 'below'}
                  onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value as any })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="below">Sotto</option>
                  <option value="above">Sopra</option>
                  <option value="equals">Uguale</option>
                </select>
                <input
                  type="number"
                  placeholder="Soglia"
                  value={newAlert.threshold || ''}
                  onChange={(e) => setNewAlert({ ...newAlert, threshold: parseFloat(e.target.value) || 0 })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Valore attuale (opt)"
                  value={newAlert.currentValue || ''}
                  onChange={(e) => setNewAlert({ ...newAlert, currentValue: parseFloat(e.target.value) })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <select
                  value={newAlert.severity || 'medium'}
                  onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value as any })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="low">Bassa</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Critica</option>
                </select>
              </div>
              <button
                onClick={addAlert}
                className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                Aggiungi Alert
              </button>
            </div>
          </div>

          {/* Alerts List */}
          {data.alerts.length > 0 && (
            <div className="space-y-3">
              {data.alerts.map(alert => {
                const isTriggered = checkAlert(alert)

                return (
                  <div key={alert.id} className={`bg-white p-4 rounded-lg border-2 ${isTriggered ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getStatusIcon(alert.status)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-gray-900">{alert.name}</span>
                            <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Metrica: <span className="font-medium">{alert.metric}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Condizione: {alert.condition === 'below' ? 'Sotto' : alert.condition === 'above' ? 'Sopra' : 'Uguale a'} {alert.threshold}
                          </div>
                          {alert.currentValue !== undefined && (
                            <div className="text-sm text-gray-600">
                              Valore attuale: <span className={`font-semibold ${isTriggered ? 'text-red-600' : 'text-green-600'}`}>
                                {alert.currentValue}
                              </span>
                            </div>
                          )}
                          {isTriggered && (
                            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-800">
                              ⚠️ Alert attivato! La soglia è stata superata.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <select
                          value={alert.status}
                          onChange={(e) => updateAlertStatus(alert.id, e.target.value as any)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="active">Attivo</option>
                          <option value="triggered">Scattato</option>
                          <option value="resolved">Risolto</option>
                        </select>
                        <button onClick={() => deleteAlert(alert.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {data.alerts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Nessun alert configurato</p>
              <p className="text-sm text-gray-400 mt-1">Crea alert per monitorare metriche critiche</p>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">💡 Come funzionano gli Alert</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Gli alert monitorano metriche chiave automaticamente</li>
              <li>• Quando una soglia viene superata, l'alert si attiva</li>
              <li>• Imposta azioni correttive per ciascun alert</li>
              <li>• Usa la severità per prioritizzare le notifiche</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
