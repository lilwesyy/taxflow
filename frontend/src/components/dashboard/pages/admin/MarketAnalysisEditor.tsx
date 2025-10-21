import { useState } from 'react'
import { Trash2, Edit2, Check, X, TrendingUp, ChevronDown, ChevronUp, PieChart } from 'lucide-react'
import { MarketAnalysisData, CompetitorData, MarketSegment } from '../../../../types/businessPlan'
import BusinessPlanChart from './BusinessPlanChart'

interface MarketAnalysisEditorProps {
  data: MarketAnalysisData
  onChange: (data: MarketAnalysisData) => void
  isExpanded: boolean
  onToggle: () => void
}

export default function MarketAnalysisEditor({
  data,
  onChange,
  isExpanded,
  onToggle
}: MarketAnalysisEditorProps) {
  const [editingCompetitor, setEditingCompetitor] = useState<{
    competitor?: CompetitorData
    index?: number
  } | null>(null)

  const [editingSegment, setEditingSegment] = useState<{
    segment?: MarketSegment
    index?: number
  } | null>(null)

  const handleAddCompetitor = () => {
    setEditingCompetitor({
      competitor: {
        id: `comp-${Date.now()}`,
        name: '',
        description: '',
        strengths: '',
        weaknesses: ''
      }
    })
  }

  const handleSaveCompetitor = () => {
    if (!editingCompetitor?.competitor?.name) {
      alert('Il nome del competitor è obbligatorio')
      return
    }

    const updatedCompetitors = editingCompetitor.index !== undefined
      ? data.competitors.map((c, i) => i === editingCompetitor.index ? editingCompetitor.competitor! : c)
      : [...data.competitors, editingCompetitor.competitor!]

    onChange({ ...data, competitors: updatedCompetitors })
    setEditingCompetitor(null)
  }

  const handleEditCompetitor = (index: number) => {
    setEditingCompetitor({
      competitor: { ...data.competitors[index] },
      index
    })
  }

  const handleDeleteCompetitor = (index: number) => {
    if (window.confirm('Sei sicuro di voler eliminare questo competitor?')) {
      onChange({
        ...data,
        competitors: data.competitors.filter((_, i) => i !== index)
      })
    }
  }

  const handleAddSegment = () => {
    setEditingSegment({
      segment: {
        id: `seg-${Date.now()}`,
        name: '',
        size: 0,
        growth: 0
      }
    })
  }

  const handleSaveSegment = () => {
    if (!editingSegment?.segment?.name) {
      alert('Il nome del segmento è obbligatorio')
      return
    }

    const updatedSegments = editingSegment.index !== undefined
      ? data.segments.map((s, i) => i === editingSegment.index ? editingSegment.segment! : s)
      : [...data.segments, editingSegment.segment!]

    onChange({ ...data, segments: updatedSegments })
    setEditingSegment(null)
  }

  const handleEditSegment = (index: number) => {
    setEditingSegment({
      segment: { ...data.segments[index] },
      index
    })
  }

  const handleDeleteSegment = (index: number) => {
    if (window.confirm('Sei sicuro di voler eliminare questo segmento?')) {
      onChange({
        ...data,
        segments: data.segments.filter((_, i) => i !== index)
      })
    }
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

            <TrendingUp className="h-5 w-5 text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Analisi di Mercato</h3>
              <p className="text-sm text-gray-600">
                Competitor e segmenti di mercato
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            {data.competitors.length} competitor • {data.segments.length} segmenti
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-6">
          {/* Market Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dimensione Mercato Totale (€)
              </label>
              <input
                type="number"
                value={data.totalMarketSize || ''}
                onChange={(e) => onChange({ ...data, totalMarketSize: parseFloat(e.target.value) || undefined })}
                placeholder="es. 1000000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mercato Target (€)
              </label>
              <input
                type="number"
                value={data.targetMarketSize || ''}
                onChange={(e) => onChange({ ...data, targetMarketSize: parseFloat(e.target.value) || undefined })}
                placeholder="es. 100000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tasso di Crescita (%)
              </label>
              <input
                type="number"
                value={data.marketGrowthRate || ''}
                onChange={(e) => onChange({ ...data, marketGrowthRate: parseFloat(e.target.value) || undefined })}
                placeholder="es. 15.5"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Market Segments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Segmenti di Mercato</h4>
              <button
                onClick={handleAddSegment}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Aggiungi Segmento
              </button>
            </div>

            {/* Segment Editing Form */}
            {editingSegment && (
              <div className="bg-white p-4 rounded-lg border-2 border-blue-500 mb-4 space-y-4">
                <h5 className="font-semibold text-gray-900">
                  {editingSegment.index !== undefined ? 'Modifica' : 'Nuovo'} Segmento
                </h5>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Segmento *
                    </label>
                    <input
                      type="text"
                      value={editingSegment.segment?.name || ''}
                      onChange={(e) => setEditingSegment({
                        ...editingSegment,
                        segment: { ...editingSegment.segment!, name: e.target.value }
                      })}
                      placeholder="es. B2B Enterprise, SME, Consumer"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrizione
                    </label>
                    <input
                      type="text"
                      value={editingSegment.segment?.description || ''}
                      onChange={(e) => setEditingSegment({
                        ...editingSegment,
                        segment: { ...editingSegment.segment!, description: e.target.value }
                      })}
                      placeholder="Descrizione del segmento"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dimensione (€)
                    </label>
                    <input
                      type="number"
                      value={editingSegment.segment?.size || 0}
                      onChange={(e) => setEditingSegment({
                        ...editingSegment,
                        segment: { ...editingSegment.segment!, size: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Crescita (%)
                    </label>
                    <input
                      type="number"
                      value={editingSegment.segment?.growth || 0}
                      onChange={(e) => setEditingSegment({
                        ...editingSegment,
                        segment: { ...editingSegment.segment!, growth: parseFloat(e.target.value) || 0 }
                      })}
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSaveSegment}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    <span>Salva</span>
                  </button>
                  <button
                    onClick={() => setEditingSegment(null)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Annulla</span>
                  </button>
                </div>
              </div>
            )}

            {/* Segments Table */}
            {data.segments.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Segmento</th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-700">Dimensione</th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-700">Crescita</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.segments.map((segment, idx) => (
                      <tr key={segment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <div className="font-medium text-gray-900">{segment.name}</div>
                          {segment.description && (
                            <div className="text-xs text-gray-500">{segment.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-700">
                          €{segment.size.toLocaleString('it-IT')}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-700">
                          {segment.growth}%
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleEditSegment(idx)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteSegment(idx)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Competitors */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Analisi Competitor</h4>
              <button
                onClick={handleAddCompetitor}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Aggiungi Competitor
              </button>
            </div>

            {/* Competitor Editing Form */}
            {editingCompetitor && (
              <div className="bg-white p-4 rounded-lg border-2 border-blue-500 mb-4 space-y-4">
                <h5 className="font-semibold text-gray-900">
                  {editingCompetitor.index !== undefined ? 'Modifica' : 'Nuovo'} Competitor
                </h5>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={editingCompetitor.competitor?.name || ''}
                      onChange={(e) => setEditingCompetitor({
                        ...editingCompetitor,
                        competitor: { ...editingCompetitor.competitor!, name: e.target.value }
                      })}
                      placeholder="es. Twitch, Roblox, OnlyFans"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      value={editingCompetitor.competitor?.website || ''}
                      onChange={(e) => setEditingCompetitor({
                        ...editingCompetitor,
                        competitor: { ...editingCompetitor.competitor!, website: e.target.value }
                      })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quota di Mercato (%)
                    </label>
                    <input
                      type="number"
                      value={editingCompetitor.competitor?.marketShare || ''}
                      onChange={(e) => setEditingCompetitor({
                        ...editingCompetitor,
                        competitor: { ...editingCompetitor.competitor!, marketShare: parseFloat(e.target.value) || undefined }
                      })}
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ricavi (€)
                    </label>
                    <input
                      type="number"
                      value={editingCompetitor.competitor?.revenue || ''}
                      onChange={(e) => setEditingCompetitor({
                        ...editingCompetitor,
                        competitor: { ...editingCompetitor.competitor!, revenue: parseFloat(e.target.value) || undefined }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrizione
                  </label>
                  <textarea
                    value={editingCompetitor.competitor?.description || ''}
                    onChange={(e) => setEditingCompetitor({
                      ...editingCompetitor,
                      competitor: { ...editingCompetitor.competitor!, description: e.target.value }
                    })}
                    placeholder="Descrivi il competitor e il suo modello di business..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Punti di Forza
                    </label>
                    <textarea
                      value={editingCompetitor.competitor?.strengths || ''}
                      onChange={(e) => setEditingCompetitor({
                        ...editingCompetitor,
                        competitor: { ...editingCompetitor.competitor!, strengths: e.target.value }
                      })}
                      placeholder="Es. Brand forte, ampia customer base..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Punti di Debolezza
                    </label>
                    <textarea
                      value={editingCompetitor.competitor?.weaknesses || ''}
                      onChange={(e) => setEditingCompetitor({
                        ...editingCompetitor,
                        competitor: { ...editingCompetitor.competitor!, weaknesses: e.target.value }
                      })}
                      placeholder="Es. Tecnologia obsoleta, costi elevati..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSaveCompetitor}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    <span>Salva</span>
                  </button>
                  <button
                    onClick={() => setEditingCompetitor(null)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Annulla</span>
                  </button>
                </div>
              </div>
            )}

            {/* Competitors List */}
            {data.competitors.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Nessun competitor aggiunto</p>
                <p className="text-sm text-gray-400 mt-1">Clicca su "Aggiungi Competitor" per iniziare</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.competitors.map((competitor, idx) => (
                  <div
                    key={competitor.id}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900 text-lg">{competitor.name}</h5>
                        {competitor.website && (
                          <a
                            href={competitor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {competitor.website}
                          </a>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditCompetitor(idx)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCompetitor(idx)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {competitor.description && (
                      <p className="text-sm text-gray-600 mb-3">{competitor.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="bg-green-50 p-3 rounded">
                        <h6 className="text-xs font-semibold text-green-900 mb-1">Punti di Forza</h6>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{competitor.strengths || '-'}</p>
                      </div>
                      <div className="bg-red-50 p-3 rounded">
                        <h6 className="text-xs font-semibold text-red-900 mb-1">Punti di Debolezza</h6>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{competitor.weaknesses || '-'}</p>
                      </div>
                    </div>

                    {(competitor.marketShare || competitor.revenue) && (
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {competitor.marketShare && (
                          <span>Quota: {competitor.marketShare}%</span>
                        )}
                        {competitor.revenue && (
                          <span>Ricavi: €{competitor.revenue.toLocaleString('it-IT')}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Market Charts */}
          {(data.competitors.length > 0 || data.segments.length > 0) && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <PieChart className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900">Visualizzazioni</h4>
              </div>

              {/* Pie Chart: Market Share by Competitor */}
              {data.competitors.filter(c => c.marketShare).length > 0 && (
                <BusinessPlanChart
                  config={{
                    type: 'pie',
                    title: 'Quote di Mercato Competitor',
                    data: data.competitors
                      .filter(c => c.marketShare && c.marketShare > 0)
                      .map(c => ({
                        name: c.name,
                        value: c.marketShare || 0
                      })),
                    xKey: 'name',
                    yKey: 'value',
                    height: 300,
                    showLegend: true
                  }}
                />
              )}

              {/* Bar Chart: Competitor Revenue */}
              {data.competitors.filter(c => c.revenue).length > 0 && (
                <BusinessPlanChart
                  config={{
                    type: 'bar',
                    title: 'Ricavi Competitor',
                    data: data.competitors
                      .filter(c => c.revenue && c.revenue > 0)
                      .map(c => ({
                        name: c.name,
                        Ricavi: c.revenue || 0
                      })),
                    xKey: 'name',
                    yKey: 'Ricavi',
                    colors: ['#8b5cf6'],
                    height: 300,
                    showLegend: false,
                    showGrid: true
                  }}
                />
              )}

              {/* Bar Chart: Market Segments Size */}
              {data.segments.length > 0 && (
                <BusinessPlanChart
                  config={{
                    type: 'bar',
                    title: 'Dimensione Segmenti di Mercato',
                    data: data.segments.map(s => ({
                      name: s.name,
                      Dimensione: s.size
                    })),
                    xKey: 'name',
                    yKey: 'Dimensione',
                    colors: ['#14b8a6'],
                    height: 300,
                    showLegend: false,
                    showGrid: true
                  }}
                />
              )}

              {/* Bar Chart: Segment Growth Rates */}
              {data.segments.length > 0 && (
                <BusinessPlanChart
                  config={{
                    type: 'bar',
                    title: 'Tasso di Crescita Segmenti (%)',
                    data: data.segments.map(s => ({
                      name: s.name,
                      Crescita: s.growth
                    })),
                    xKey: 'name',
                    yKey: 'Crescita',
                    colors: ['#f59e0b'],
                    height: 300,
                    showLegend: false,
                    showGrid: true
                  }}
                />
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note Aggiuntive
            </label>
            <textarea
              value={data.notes || ''}
              onChange={(e) => onChange({ ...data, notes: e.target.value })}
              placeholder="Aggiungi note, fonti dati (es. ISTAT), o altre informazioni rilevanti..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      )}
    </div>
  )
}
