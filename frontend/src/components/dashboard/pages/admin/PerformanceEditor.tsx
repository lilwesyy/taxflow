import { useState } from 'react'
import { Trash2, ChevronDown, ChevronUp, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { PerformanceData, KPIMetric } from '../../../../types/businessPlan'
import BusinessPlanChart from './BusinessPlanChart'

interface PerformanceEditorProps {
  data: PerformanceData
  onChange: (data: PerformanceData) => void
  isExpanded: boolean
  onToggle: () => void
}

export default function PerformanceEditor({
  data,
  onChange,
  isExpanded,
  onToggle
}: PerformanceEditorProps) {
  const [newKPI, setNewKPI] = useState<Partial<KPIMetric>>({})

  const addKPI = () => {
    if (!newKPI.name || newKPI.currentValue === undefined || newKPI.targetValue === undefined) return

    const kpi: KPIMetric = {
      id: `kpi-${Date.now()}`,
      name: newKPI.name,
      description: newKPI.description || '',
      currentValue: newKPI.currentValue,
      targetValue: newKPI.targetValue,
      unit: newKPI.unit || '',
      category: newKPI.category || 'financial',
      trend: newKPI.trend || 'stable'
    }

    onChange({
      ...data,
      kpis: [...data.kpis, kpi]
    })

    setNewKPI({})
  }

  const deleteKPI = (id: string) => {
    onChange({
      ...data,
      kpis: data.kpis.filter(k => k.id !== id)
    })
  }

  const getCategoryColor = (category: KPIMetric['category']) => {
    switch (category) {
      case 'financial': return 'bg-green-100 text-green-800'
      case 'customer': return 'bg-blue-100 text-blue-800'
      case 'operational': return 'bg-purple-100 text-purple-800'
      case 'growth': return 'bg-orange-100 text-orange-800'
    }
  }

  const getTrendIcon = (trend: KPIMetric['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button className="text-gray-400 hover:text-gray-600 transition-colors" onClick={(e) => { e.stopPropagation(); onToggle() }}>
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            <Activity className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
              <p className="text-sm text-gray-600">KPI e metriche di performance</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">{data.kpis.length} KPI</div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-6">
          {/* Performance Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Periodo di Riferimento</label>
            <input
              type="text"
              value={data.performancePeriod || ''}
              onChange={(e) => onChange({ ...data, performancePeriod: e.target.value })}
              placeholder="es. Q1 2025, Gennaio 2025, Anno 2024"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Add KPI Form */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Aggiungi KPI</h4>
            <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nome KPI"
                  value={newKPI.name || ''}
                  onChange={(e) => setNewKPI({ ...newKPI, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <select
                  value={newKPI.category || 'financial'}
                  onChange={(e) => setNewKPI({ ...newKPI, category: e.target.value as any })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="financial">Finanziario</option>
                  <option value="customer">Cliente</option>
                  <option value="operational">Operativo</option>
                  <option value="growth">Crescita</option>
                </select>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="number"
                  placeholder="Valore attuale"
                  value={newKPI.currentValue || ''}
                  onChange={(e) => setNewKPI({ ...newKPI, currentValue: parseFloat(e.target.value) || 0 })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Target"
                  value={newKPI.targetValue || ''}
                  onChange={(e) => setNewKPI({ ...newKPI, targetValue: parseFloat(e.target.value) || 0 })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Unità (€, %, ecc)"
                  value={newKPI.unit || ''}
                  onChange={(e) => setNewKPI({ ...newKPI, unit: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <select
                  value={newKPI.trend || 'stable'}
                  onChange={(e) => setNewKPI({ ...newKPI, trend: e.target.value as any })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="up">↑ In crescita</option>
                  <option value="stable">→ Stabile</option>
                  <option value="down">↓ In calo</option>
                </select>
              </div>
              <button
                onClick={addKPI}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Aggiungi KPI
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          {data.kpis.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.kpis.map(kpi => {
                const progress = getProgress(kpi.currentValue, kpi.targetValue)
                const isOnTrack = progress >= 80

                return (
                  <div key={kpi.id} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-900">{kpi.name}</span>
                          {getTrendIcon(kpi.trend)}
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(kpi.category)}`}>
                          {kpi.category}
                        </span>
                      </div>
                      <button onClick={() => deleteKPI(kpi.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Attuale: {kpi.currentValue}{kpi.unit}</span>
                        <span className="text-gray-600">Target: {kpi.targetValue}{kpi.unit}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${isOnTrack ? 'bg-green-600' : 'bg-yellow-500'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{progress.toFixed(1)}% del target</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* KPI Charts */}
          {data.kpis.length > 0 && (
            <>
              <BusinessPlanChart config={{
                type: 'bar',
                title: 'KPI: Valore Attuale vs Target',
                data: data.kpis.map(kpi => ({
                  name: kpi.name,
                  Attuale: kpi.currentValue,
                  Target: kpi.targetValue
                })),
                xKey: 'name',
                yKey: ['Attuale', 'Target'],
                colors: ['#3b82f6', '#10b981'],
                height: 300
              }} />

              <BusinessPlanChart config={{
                type: 'bar',
                title: 'Performance per Categoria',
                data: ['financial', 'customer', 'operational', 'growth'].map(category => {
                  const categoryKPIs = data.kpis.filter(k => k.category === category)
                  const avgProgress = categoryKPIs.length > 0
                    ? categoryKPIs.reduce((sum, k) => sum + getProgress(k.currentValue, k.targetValue), 0) / categoryKPIs.length
                    : 0
                  return { category, progress: avgProgress }
                }),
                xKey: 'category',
                yKey: 'progress',
                colors: ['#8b5cf6'],
                height: 300
              }} />
            </>
          )}

          {data.kpis.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Nessun KPI aggiunto</p>
              <p className="text-sm text-gray-400 mt-1">Inizia aggiungendo le tue metriche chiave</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
