import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, Plus, X, DollarSign, Trash2, TrendingUp } from 'lucide-react'
import { RevenueProjectionsData } from '../../../../types/businessPlan'

interface RevenueProjectionsEditorProps {
  data: RevenueProjectionsData
  onChange: (data: RevenueProjectionsData) => void
  isExpanded: boolean
  onToggle: () => void
}

export default function RevenueProjectionsEditor({
  data,
  onChange,
  isExpanded,
  onToggle
}: RevenueProjectionsEditorProps) {
  const [newYear, setNewYear] = useState('')

  // Calculate totals for each scenario
  const calculatedData = useMemo(() => {
    const totals: { [scenarioId: string]: { [year: string]: number } } = {}

    // Base scenario (no multiplier)
    totals['base'] = {}
    data.projectionYears.forEach(year => {
      totals['base'][year] = data.streams.reduce((sum, stream) => {
        const units = stream.projectedUnits[year] || 0
        return sum + (units * stream.pricing)
      }, 0)
    })

    // Other scenarios with multipliers
    ;(data.scenarios || []).forEach(scenario => {
      totals[scenario.id] = {}
      data.projectionYears.forEach(year => {
        totals[scenario.id][year] = totals['base'][year] * scenario.multiplier
      })
    })

    return totals
  }, [data.streams, data.projectionYears, data.scenarios])

  const addYear = () => {
    if (newYear && !data.projectionYears.includes(newYear)) {
      onChange({
        ...data,
        projectionYears: [...data.projectionYears, newYear].sort()
      })
      setNewYear('')
    }
  }

  const removeYear = (year: string) => {
    onChange({
      ...data,
      projectionYears: data.projectionYears.filter(y => y !== year),
      streams: data.streams.map(stream => ({
        ...stream,
        projectedUnits: Object.fromEntries(
          Object.entries(stream.projectedUnits).filter(([y]) => y !== year)
        )
      }))
    })
  }

  const addRevenueStream = () => {
    const newStream = {
      id: `stream_${Date.now()}`,
      name: '',
      description: '',
      pricing: 0,
      projectedUnits: Object.fromEntries(data.projectionYears.map(year => [year, 0]))
    }
    onChange({
      ...data,
      streams: [...data.streams, newStream]
    })
  }

  const updateRevenueStream = (id: string, field: string, value: any) => {
    onChange({
      ...data,
      streams: data.streams.map(stream =>
        stream.id === id ? { ...stream, [field]: value } : stream
      )
    })
  }

  const updateStreamUnits = (id: string, year: string, units: number) => {
    onChange({
      ...data,
      streams: data.streams.map(stream =>
        stream.id === id
          ? { ...stream, projectedUnits: { ...stream.projectedUnits, [year]: units } }
          : stream
      )
    })
  }

  const removeRevenueStream = (id: string) => {
    onChange({
      ...data,
      streams: data.streams.filter(stream => stream.id !== id)
    })
  }

  const addScenario = () => {
    const newScenario = {
      id: `scenario_${Date.now()}`,
      name: '',
      multiplier: 1.0
    }
    onChange({
      ...data,
      scenarios: [...(data.scenarios || []), newScenario]
    })
  }

  const updateScenario = (id: string, field: string, value: any) => {
    onChange({
      ...data,
      scenarios: (data.scenarios || []).map(scenario =>
        scenario.id === id ? { ...scenario, [field]: value } : scenario
      )
    })
  }

  const removeScenario = (id: string) => {
    onChange({
      ...data,
      scenarios: (data.scenarios || []).filter(scenario => scenario.id !== id)
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
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
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Proiezioni Ricavi</h3>
              <p className="text-sm text-gray-600 mt-1">
                Proiezioni di fatturato per flusso di ricavi e scenario
              </p>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-6">
          {/* Projection Years */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anni di Proiezione
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {data.projectionYears.map((year) => (
                <div key={year} className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  <span className="font-medium">{year}</span>
                  <button
                    onClick={() => removeYear(year)}
                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addYear()
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="es. 2025"
              />
              <button
                onClick={addYear}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Aggiungi Anno
              </button>
            </div>
          </div>

          {/* Revenue Streams */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-gray-900">Flussi di Ricavi</h4>
              <button
                onClick={addRevenueStream}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Aggiungi Flusso</span>
              </button>
            </div>

            {data.streams.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Nessun flusso di ricavi aggiunto</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.streams.map((stream) => (
                  <div key={stream.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={stream.name}
                          onChange={(e) => updateRevenueStream(stream.id, 'name', e.target.value)}
                          className="text-lg font-semibold text-gray-900 border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 outline-none px-2 -ml-2 w-full"
                          placeholder="Nome flusso (es. Subscription Tier 1)"
                        />
                        <input
                          type="text"
                          value={stream.description || ''}
                          onChange={(e) => updateRevenueStream(stream.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Descrizione..."
                        />
                      </div>
                      <button
                        onClick={() => removeRevenueStream(stream.id)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Prezzo Unitario (€)
                      </label>
                      <input
                        type="number"
                        value={stream.pricing}
                        onChange={(e) => updateRevenueStream(stream.id, 'pricing', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="es. 99.90"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Unità Vendute per Anno
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {data.projectionYears.map((year) => (
                          <div key={year}>
                            <label className="block text-xs text-gray-600 mb-1">{year}</label>
                            <input
                              type="number"
                              value={stream.projectedUnits[year] || 0}
                              onChange={(e) => updateStreamUnits(stream.id, year, parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="0"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {formatCurrency((stream.projectedUnits[year] || 0) * stream.pricing)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scenarios */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-gray-900">Scenari</h4>
              <button
                onClick={addScenario}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Aggiungi Scenario</span>
              </button>
            </div>

            <div className="space-y-2">
              {(data.scenarios || []).map((scenario) => (
                <div key={scenario.id} className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200">
                  <input
                    type="text"
                    value={scenario.name}
                    onChange={(e) => updateScenario(scenario.id, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome scenario (es. Conservativo)"
                  />
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Moltiplicatore:</label>
                    <input
                      type="number"
                      value={scenario.multiplier}
                      onChange={(e) => updateScenario(scenario.id, 'multiplier', parseFloat(e.target.value) || 1)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      step="0.1"
                    />
                  </div>
                  <button
                    onClick={() => removeScenario(scenario.id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          {data.projectionYears.length > 0 && data.streams.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-emerald-200">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Riepilogo Ricavi Totali</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-gray-700">Scenario</th>
                      {data.projectionYears.map((year) => (
                        <th key={year} className="text-right py-2 px-3 text-gray-700">{year}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-3 font-medium text-gray-900">Base</td>
                      {data.projectionYears.map((year) => (
                        <td key={year} className="text-right py-2 px-3 font-medium text-emerald-600">
                          {formatCurrency(calculatedData['base'][year])}
                        </td>
                      ))}
                    </tr>
                    {(data.scenarios || []).map((scenario) => (
                      <tr key={scenario.id} className="border-b border-gray-100">
                        <td className="py-2 px-3 text-gray-700">{scenario.name}</td>
                        {data.projectionYears.map((year) => (
                          <td key={year} className="text-right py-2 px-3 text-gray-700">
                            {formatCurrency(calculatedData[scenario.id][year])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note e Assunzioni
            </label>
            <textarea
              value={data.notes || ''}
              onChange={(e) => onChange({ ...data, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descrive le assunzioni chiave dietro le proiezioni (CAC, LTV, churn rate, ecc.)..."
            />
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-sm text-emerald-800">
              <strong>Suggerimento:</strong> Basa le proiezioni su dati realistici e assunzioni conservative.
              Includi metriche chiave come CAC, LTV, churn rate e tasso di conversione nelle note.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
