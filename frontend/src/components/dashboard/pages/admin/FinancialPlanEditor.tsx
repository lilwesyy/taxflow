import { useState } from 'react'
import { Plus, Trash2, Edit2, Check, X, DollarSign, ChevronDown, ChevronUp, Calculator, BarChart3 } from 'lucide-react'
import { FinancialPlanData, FinancialScenario, FinancialCategory } from '../../../../types/businessPlan'
import BusinessPlanChart from './BusinessPlanChart'

interface FinancialPlanEditorProps {
  data: FinancialPlanData
  onChange: (data: FinancialPlanData) => void
  isExpanded: boolean
  onToggle: () => void
}

export default function FinancialPlanEditor({
  data,
  onChange,
  isExpanded,
  onToggle
}: FinancialPlanEditorProps) {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0)
  const [editingCategory, setEditingCategory] = useState<{
    type: 'cost' | 'revenue'
    category?: FinancialCategory
    index?: number
  } | null>(null)

  const currentScenario = data.scenarios[selectedScenarioIndex]

  // Calculate totals for a scenario
  const calculateTotals = (scenario: FinancialScenario) => {
    const costs: { [year: string]: number } = {}
    const revenues: { [year: string]: number } = {}
    const profits: { [year: string]: number } = {}

    data.projectionYears.forEach(year => {
      costs[year] = scenario.costCategories.reduce(
        (sum, cat) => sum + (cat.values[year] || 0),
        0
      )
      revenues[year] = scenario.revenueCategories.reduce(
        (sum, cat) => sum + (cat.values[year] || 0),
        0
      )
      profits[year] = revenues[year] - costs[year]
    })

    return { costs, revenues, profits }
  }

  const handleAddYear = () => {
    const newYear = prompt('Inserisci anno (es. 2025):')
    if (newYear && !data.projectionYears.includes(newYear)) {
      onChange({
        ...data,
        projectionYears: [...data.projectionYears, newYear].sort()
      })
    }
  }

  const handleRemoveYear = (year: string) => {
    if (window.confirm(`Rimuovere l'anno ${year}?`)) {
      // Remove year from all categories
      const updatedScenarios = data.scenarios.map(scenario => ({
        ...scenario,
        costCategories: scenario.costCategories.map(cat => {
          const { [year]: _, ...restValues } = cat.values
          return { ...cat, values: restValues }
        }),
        revenueCategories: scenario.revenueCategories.map(cat => {
          const { [year]: _, ...restValues } = cat.values
          return { ...cat, values: restValues }
        })
      }))

      onChange({
        ...data,
        projectionYears: data.projectionYears.filter(y => y !== year),
        scenarios: updatedScenarios
      })
    }
  }

  const handleAddCategory = (type: 'cost' | 'revenue') => {
    setEditingCategory({
      type,
      category: {
        id: `cat-${Date.now()}`,
        name: '',
        values: {},
        description: '',
        isRecurring: false
      }
    })
  }

  const handleSaveCategory = () => {
    if (!editingCategory?.category?.name) {
      alert('Il nome della categoria è obbligatorio')
      return
    }

    const updatedScenarios = data.scenarios.map((scenario, idx) => {
      if (idx !== selectedScenarioIndex) return scenario

      const categories = editingCategory.type === 'cost'
        ? scenario.costCategories
        : scenario.revenueCategories

      const updatedCategories = editingCategory.index !== undefined
        ? categories.map((cat, i) => i === editingCategory.index ? editingCategory.category! : cat)
        : [...categories, editingCategory.category!]

      return editingCategory.type === 'cost'
        ? { ...scenario, costCategories: updatedCategories }
        : { ...scenario, revenueCategories: updatedCategories }
    })

    onChange({ ...data, scenarios: updatedScenarios })
    setEditingCategory(null)
  }

  const handleEditCategory = (type: 'cost' | 'revenue', index: number) => {
    const category = type === 'cost'
      ? currentScenario.costCategories[index]
      : currentScenario.revenueCategories[index]

    setEditingCategory({
      type,
      category: { ...category },
      index
    })
  }

  const handleDeleteCategory = (type: 'cost' | 'revenue', index: number) => {
    if (window.confirm('Sei sicuro di voler eliminare questa categoria?')) {
      const updatedScenarios = data.scenarios.map((scenario, idx) => {
        if (idx !== selectedScenarioIndex) return scenario

        return type === 'cost'
          ? { ...scenario, costCategories: scenario.costCategories.filter((_, i) => i !== index) }
          : { ...scenario, revenueCategories: scenario.revenueCategories.filter((_, i) => i !== index) }
      })

      onChange({ ...data, scenarios: updatedScenarios })
    }
  }

  const handleAddScenario = () => {
    const name = prompt('Nome scenario (es. Conservativo, Ottimistico):')
    if (name) {
      const newScenario: FinancialScenario = {
        id: `scenario-${Date.now()}`,
        name,
        description: '',
        costCategories: [],
        revenueCategories: []
      }
      onChange({
        ...data,
        scenarios: [...data.scenarios, newScenario]
      })
    }
  }

  const totals = currentScenario ? calculateTotals(currentScenario) : null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: data.currency || 'EUR',
      minimumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                onToggle()
              }}
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>

            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Piano Finanziario</h3>
              <p className="text-sm text-gray-600">
                Proiezioni di costi e ricavi
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            {data.projectionYears.length} anni • {data.scenarios.length} scenari
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-6">
          {/* Projection Years Management */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anni di Proiezione
            </label>
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              {data.projectionYears.map(year => (
                <div key={year} className="flex items-center space-x-1 bg-blue-100 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-blue-900">{year}</span>
                  <button
                    onClick={() => handleRemoveYear(year)}
                    className="text-blue-700 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddYear}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 text-sm"
              >
                <Plus className="h-3 w-3" />
                <span>Aggiungi Anno</span>
              </button>
            </div>
          </div>

          {/* Scenario Selector */}
          {data.scenarios.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Scenario
                </label>
                <button
                  onClick={handleAddScenario}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Nuovo Scenario
                </button>
              </div>
              <div className="flex items-center space-x-2">
                {data.scenarios.map((scenario, idx) => (
                  <button
                    key={scenario.id}
                    onClick={() => setSelectedScenarioIndex(idx)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      idx === selectedScenarioIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {scenario.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentScenario && (
            <>
              {/* Editing Form */}
              {editingCategory && (
                <div className="bg-white p-4 rounded-lg border-2 border-blue-500 space-y-4">
                  <h5 className="font-semibold text-gray-900">
                    {editingCategory.index !== undefined ? 'Modifica' : 'Nuova'}{' '}
                    {editingCategory.type === 'cost' ? 'Voce di Costo' : 'Voce di Ricavo'}
                  </h5>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome *
                      </label>
                      <input
                        type="text"
                        value={editingCategory.category?.name || ''}
                        onChange={(e) => setEditingCategory({
                          ...editingCategory,
                          category: { ...editingCategory.category!, name: e.target.value }
                        })}
                        placeholder="es. Personale, Marketing, Licenze software"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrizione
                      </label>
                      <input
                        type="text"
                        value={editingCategory.category?.description || ''}
                        onChange={(e) => setEditingCategory({
                          ...editingCategory,
                          category: { ...editingCategory.category!, description: e.target.value }
                        })}
                        placeholder="Breve descrizione"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editingCategory.category?.isRecurring || false}
                        onChange={(e) => setEditingCategory({
                          ...editingCategory,
                          category: { ...editingCategory.category!, isRecurring: e.target.checked }
                        })}
                        className="text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <span className="text-sm text-gray-700">Costo/Ricavo ricorrente</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valori per Anno
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {data.projectionYears.map(year => (
                        <div key={year}>
                          <label className="block text-xs text-gray-600 mb-1">{year}</label>
                          <input
                            type="number"
                            value={editingCategory.category?.values[year] || 0}
                            onChange={(e) => setEditingCategory({
                              ...editingCategory,
                              category: {
                                ...editingCategory.category!,
                                values: {
                                  ...editingCategory.category!.values,
                                  [year]: parseFloat(e.target.value) || 0
                                }
                              }
                            })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveCategory}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      <span>Salva</span>
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>Annulla</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Cost Categories */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                    <span>Costi</span>
                  </h4>
                  <button
                    onClick={() => handleAddCategory('cost')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Aggiungi Costo
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Categoria</th>
                        {data.projectionYears.map(year => (
                          <th key={year} className="px-4 py-2 text-right font-semibold text-gray-700">
                            {year}
                          </th>
                        ))}
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentScenario.costCategories.map((category, idx) => (
                        <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <div>
                              <div className="font-medium text-gray-900">{category.name}</div>
                              {category.description && (
                                <div className="text-xs text-gray-500">{category.description}</div>
                              )}
                            </div>
                          </td>
                          {data.projectionYears.map(year => (
                            <td key={year} className="px-4 py-2 text-right text-gray-700">
                              {formatCurrency(category.values[year] || 0)}
                            </td>
                          ))}
                          <td className="px-4 py-2">
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleEditCategory('cost', idx)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory('cost', idx)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {totals && (
                        <tr className="bg-red-50 border-t-2 border-red-200 font-semibold">
                          <td className="px-4 py-2 text-gray-900">COSTO TOTALE</td>
                          {data.projectionYears.map(year => (
                            <td key={year} className="px-4 py-2 text-right text-red-700">
                              {formatCurrency(totals.costs[year] || 0)}
                            </td>
                          ))}
                          <td></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Revenue Categories */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Ricavi</h4>
                  <button
                    onClick={() => handleAddCategory('revenue')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Aggiungi Ricavo
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Categoria</th>
                        {data.projectionYears.map(year => (
                          <th key={year} className="px-4 py-2 text-right font-semibold text-gray-700">
                            {year}
                          </th>
                        ))}
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentScenario.revenueCategories.map((category, idx) => (
                        <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <div>
                              <div className="font-medium text-gray-900">{category.name}</div>
                              {category.description && (
                                <div className="text-xs text-gray-500">{category.description}</div>
                              )}
                            </div>
                          </td>
                          {data.projectionYears.map(year => (
                            <td key={year} className="px-4 py-2 text-right text-gray-700">
                              {formatCurrency(category.values[year] || 0)}
                            </td>
                          ))}
                          <td className="px-4 py-2">
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleEditCategory('revenue', idx)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory('revenue', idx)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {totals && (
                        <tr className="bg-green-50 border-t-2 border-green-200 font-semibold">
                          <td className="px-4 py-2 text-gray-900">RICAVI TOTALI</td>
                          {data.projectionYears.map(year => (
                            <td key={year} className="px-4 py-2 text-right text-green-700">
                              {formatCurrency(totals.revenues[year] || 0)}
                            </td>
                          ))}
                          <td></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Profit Summary */}
              {totals && (
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Utile/Perdita</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {data.projectionYears.map(year => {
                      const profit = totals.profits[year] || 0
                      const isProfit = profit >= 0
                      return (
                        <div key={year} className="bg-white rounded-lg p-3">
                          <div className="text-xs text-gray-600 mb-1">{year}</div>
                          <div className={`text-lg font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(profit)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Financial Charts */}
              {totals && data.projectionYears.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Visualizzazioni</h4>
                  </div>

                  {/* Line Chart: Trend over time */}
                  <BusinessPlanChart
                    config={{
                      type: 'line',
                      title: 'Andamento Finanziario',
                      data: data.projectionYears.map(year => ({
                        anno: year,
                        Ricavi: totals.revenues[year] || 0,
                        Costi: totals.costs[year] || 0,
                        Utile: totals.profits[year] || 0
                      })),
                      xKey: 'anno',
                      yKey: ['Ricavi', 'Costi', 'Utile'],
                      colors: ['#22c55e', '#ef4444', '#3b82f6'],
                      height: 300,
                      showLegend: true,
                      showGrid: true
                    }}
                  />

                  {/* Bar Chart: Revenue vs Costs */}
                  <BusinessPlanChart
                    config={{
                      type: 'bar',
                      title: 'Confronto Ricavi vs Costi',
                      data: data.projectionYears.map(year => ({
                        anno: year,
                        Ricavi: totals.revenues[year] || 0,
                        Costi: totals.costs[year] || 0
                      })),
                      xKey: 'anno',
                      yKey: ['Ricavi', 'Costi'],
                      colors: ['#22c55e', '#ef4444'],
                      height: 300,
                      showLegend: true,
                      showGrid: true
                    }}
                  />

                  {/* Area Chart: Cost breakdown */}
                  {currentScenario.costCategories.length > 0 && (
                    <BusinessPlanChart
                      config={{
                        type: 'area',
                        title: 'Composizione Costi per Categoria',
                        data: data.projectionYears.map(year => {
                          const dataPoint: any = { anno: year }
                          currentScenario.costCategories.slice(0, 5).forEach(cat => {
                            dataPoint[cat.name] = cat.values[year] || 0
                          })
                          return dataPoint
                        }),
                        xKey: 'anno',
                        yKey: currentScenario.costCategories.slice(0, 5).map(cat => cat.name),
                        height: 300,
                        showLegend: true,
                        showGrid: true
                      }}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
