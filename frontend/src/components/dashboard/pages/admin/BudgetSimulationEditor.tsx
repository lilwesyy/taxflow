import { useState } from 'react'
import { Trash2, ChevronDown, ChevronUp, Calculator } from 'lucide-react'
import { BudgetSimulationData, BudgetScenario } from '../../../../types/businessPlan'
import BusinessPlanChart from './BusinessPlanChart'

interface BudgetSimulationEditorProps {
  data: BudgetSimulationData
  onChange: (data: BudgetSimulationData) => void
  isExpanded: boolean
  onToggle: () => void
}

export default function BudgetSimulationEditor({
  data,
  onChange,
  isExpanded,
  onToggle
}: BudgetSimulationEditorProps) {
  const [newScenario, setNewScenario] = useState<Partial<BudgetScenario>>({})

  const addScenario = () => {
    if (!newScenario.name) return

    const scenario: BudgetScenario = {
      id: `scen-${Date.now()}`,
      name: newScenario.name,
      description: newScenario.description || '',
      revenueGrowth: newScenario.revenueGrowth || 0,
      costIncrease: newScenario.costIncrease || 0,
      assumptions: newScenario.assumptions || [],
      projections: {}
    }

    // Calculate projections
    const baseRevenue = 100000 // Default base
    const baseCosts = 70000
    data.projectionYears.forEach((year, index) => {
      const yearMultiplier = Math.pow(1 + scenario.revenueGrowth / 100, index)
      const costMultiplier = Math.pow(1 + scenario.costIncrease / 100, index)
      const revenue = baseRevenue * yearMultiplier
      const costs = baseCosts * costMultiplier
      const profit = revenue - costs
      scenario.projections[year] = {
        revenue,
        costs,
        profit,
        margins: (profit / revenue) * 100
      }
    })

    onChange({
      ...data,
      scenarios: [...data.scenarios, scenario]
    })

    setNewScenario({})
  }

  const deleteScenario = (id: string) => {
    onChange({
      ...data,
      scenarios: data.scenarios.filter(s => s.id !== id)
    })
  }

  const getScenarioColor = (index: number) => {
    const colors = ['#ef4444', '#f59e0b', '#10b981']
    return colors[index % colors.length]
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button className="text-gray-400 hover:text-gray-600 transition-colors" onClick={(e) => { e.stopPropagation(); onToggle() }}>
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            <Calculator className="h-5 w-5 text-amber-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Simulazione Budget</h3>
              <p className="text-sm text-gray-600">Scenari what-if e proiezioni</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">{data.scenarios.length} scenari</div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-6">
          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Anni di Proiezione</label>
              <input
                type="text"
                value={data.projectionYears.join(', ')}
                onChange={(e) => onChange({ ...data, projectionYears: e.target.value.split(',').map(y => y.trim()) })}
                placeholder="es. 2025, 2026, 2027"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valuta</label>
              <input
                type="text"
                value={data.currency}
                onChange={(e) => onChange({ ...data, currency: e.target.value })}
                placeholder="EUR"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Add Scenario */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Aggiungi Scenario</h4>
            <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nome scenario (es. Pessimistico)"
                  value={newScenario.name || ''}
                  onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Descrizione"
                  value={newScenario.description || ''}
                  onChange={(e) => setNewScenario({ ...newScenario, description: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600">Crescita Ricavi (%)</label>
                  <input
                    type="number"
                    value={newScenario.revenueGrowth || ''}
                    onChange={(e) => setNewScenario({ ...newScenario, revenueGrowth: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Aumento Costi (%)</label>
                  <input
                    type="number"
                    value={newScenario.costIncrease || ''}
                    onChange={(e) => setNewScenario({ ...newScenario, costIncrease: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <button
                onClick={addScenario}
                className="w-full px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
              >
                Aggiungi Scenario
              </button>
            </div>
          </div>

          {/* Scenarios List */}
          {data.scenarios.length > 0 && (
            <div className="space-y-4">
              {data.scenarios.map((scenario) => (
                <div key={scenario.id} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-gray-900">{scenario.name}</div>
                      <div className="text-sm text-gray-600">{scenario.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Ricavi: +{scenario.revenueGrowth}%/anno • Costi: +{scenario.costIncrease}%/anno
                      </div>
                    </div>
                    <button onClick={() => deleteScenario(scenario.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Scenario Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-2 text-left">Anno</th>
                          <th className="px-2 py-2 text-right">Ricavi</th>
                          <th className="px-2 py-2 text-right">Costi</th>
                          <th className="px-2 py-2 text-right">Utile</th>
                          <th className="px-2 py-2 text-right">Margine %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(scenario.projections).map(([year, proj]) => (
                          <tr key={year} className="border-t">
                            <td className="px-2 py-2">{year}</td>
                            <td className="px-2 py-2 text-right">{data.currency} {proj.revenue.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</td>
                            <td className="px-2 py-2 text-right">{data.currency} {proj.costs.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</td>
                            <td className="px-2 py-2 text-right font-semibold">{data.currency} {proj.profit.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</td>
                            <td className="px-2 py-2 text-right">{proj.margins.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comparison Charts */}
          {data.scenarios.length > 0 && (
            <>
              <BusinessPlanChart config={{
                type: 'line',
                title: 'Confronto Ricavi per Scenario',
                data: data.projectionYears.map(year => {
                  const point: any = { anno: year }
                  data.scenarios.forEach(scen => {
                    point[scen.name] = scen.projections[year]?.revenue || 0
                  })
                  return point
                }),
                xKey: 'anno',
                yKey: data.scenarios.map(s => s.name),
                colors: data.scenarios.map((_, i) => getScenarioColor(i)),
                height: 300
              }} />

              <BusinessPlanChart config={{
                type: 'line',
                title: 'Confronto Utili per Scenario',
                data: data.projectionYears.map(year => {
                  const point: any = { anno: year }
                  data.scenarios.forEach(scen => {
                    point[scen.name] = scen.projections[year]?.profit || 0
                  })
                  return point
                }),
                xKey: 'anno',
                yKey: data.scenarios.map(s => s.name),
                colors: data.scenarios.map((_, i) => getScenarioColor(i)),
                height: 300
              }} />
            </>
          )}

          {data.scenarios.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Nessuno scenario creato</p>
              <p className="text-sm text-gray-400 mt-1">Crea scenari what-if per simulare diversi risultati</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
