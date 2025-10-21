import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, TrendingUp, Users, Target } from 'lucide-react'
import { PredictiveAnalysisData, TimeSeriesForecast, ClusterData, PropensityModel } from '../../../../types/businessPlan'
import BusinessPlanChart from './BusinessPlanChart'

interface PredictiveAnalysisEditorProps {
  data: PredictiveAnalysisData
  onChange: (data: PredictiveAnalysisData) => void
  isExpanded: boolean
  onToggle: () => void
}

export default function PredictiveAnalysisEditor({
  data,
  onChange,
  isExpanded,
  onToggle
}: PredictiveAnalysisEditorProps) {
  const [activeTab, setActiveTab] = useState<'timeseries' | 'clustering' | 'propensity'>('timeseries')

  // Time Series Functions
  const addTimeSeries = () => {
    const forecast: TimeSeriesForecast = {
      id: `ts-${Date.now()}`,
      metric: 'Nuova Metrica',
      historicalData: [],
      forecastData: [],
      algorithm: 'Linear Regression'
    }
    onChange({
      ...data,
      timeSeriesForecasts: [...data.timeSeriesForecasts, forecast]
    })
  }

  const deleteTimeSeries = (id: string) => {
    onChange({
      ...data,
      timeSeriesForecasts: data.timeSeriesForecasts.filter(ts => ts.id !== id)
    })
  }

  // Clustering Functions
  const addCluster = () => {
    const cluster: ClusterData = {
      id: `cl-${Date.now()}`,
      name: 'Nuovo Cluster',
      description: '',
      customerCount: 0,
      averageValue: 0,
      characteristics: []
    }
    onChange({
      ...data,
      clusters: [...data.clusters, cluster]
    })
  }

  const deleteCluster = (id: string) => {
    onChange({
      ...data,
      clusters: data.clusters.filter(c => c.id !== id)
    })
  }

  const updateCluster = (id: string, field: keyof ClusterData, value: any) => {
    onChange({
      ...data,
      clusters: data.clusters.map(c => c.id === id ? { ...c, [field]: value } : c)
    })
  }

  // Propensity Functions
  const addPropensityModel = () => {
    const model: PropensityModel = {
      id: `pm-${Date.now()}`,
      name: 'Nuovo Modello',
      description: '',
      segments: []
    }
    onChange({
      ...data,
      propensityModels: [...data.propensityModels, model]
    })
  }

  const deletePropensityModel = (id: string) => {
    onChange({
      ...data,
      propensityModels: data.propensityModels.filter(pm => pm.id !== id)
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button className="text-gray-400 hover:text-gray-600 transition-colors" onClick={(e) => { e.stopPropagation(); onToggle() }}>
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Proposta Predittiva</h3>
              <p className="text-sm text-gray-600">Time Series Forecasting, Clustering, Propensity Modeling</p>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-6">
          {/* Tabs */}
          <div className="flex space-x-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('timeseries')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'timeseries'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Time Series Forecasting
            </button>
            <button
              onClick={() => setActiveTab('clustering')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'clustering'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Clustering
            </button>
            <button
              onClick={() => setActiveTab('propensity')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'propensity'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Propensity Modeling
            </button>
          </div>

          {/* Time Series Tab */}
          {activeTab === 'timeseries' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">Previsioni Time Series</h4>
                <button
                  onClick={addTimeSeries}
                  className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Aggiungi Previsione</span>
                </button>
              </div>

              {data.timeSeriesForecasts.length > 0 ? (
                <div className="space-y-4">
                  {data.timeSeriesForecasts.map(forecast => {
                    const combinedData = [
                      ...forecast.historicalData.map(d => ({ ...d, type: 'Storico' })),
                      ...forecast.forecastData.map(d => ({ ...d, type: 'Previsione' }))
                    ]

                    return (
                      <div key={forecast.id} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-semibold text-gray-900">{forecast.metric}</div>
                            <div className="text-xs text-gray-500">Algoritmo: {forecast.algorithm}</div>
                          </div>
                          <button onClick={() => deleteTimeSeries(forecast.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {combinedData.length > 0 && (
                          <BusinessPlanChart config={{
                            type: 'line',
                            title: `Forecast: ${forecast.metric}`,
                            data: combinedData.map(d => ({
                              data: d.date,
                              valore: d.value,
                              tipo: d.type
                            })),
                            xKey: 'data',
                            yKey: 'valore',
                            colors: ['#6366f1'],
                            height: 250
                          }} />
                        )}

                        <div className="mt-3 text-sm text-gray-600">
                          Dati storici: {forecast.historicalData.length} • Previsioni: {forecast.forecastData.length}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Nessuna previsione time series</p>
                  <p className="text-sm text-gray-400 mt-1">Aggiungi previsioni basate su dati storici</p>
                </div>
              )}
            </div>
          )}

          {/* Clustering Tab */}
          {activeTab === 'clustering' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">Segmentazione Clienti</h4>
                <button
                  onClick={addCluster}
                  className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Aggiungi Cluster</span>
                </button>
              </div>

              {data.clusters.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.clusters.map(cluster => (
                      <div key={cluster.id} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <input
                            type="text"
                            value={cluster.name}
                            onChange={(e) => updateCluster(cluster.id, 'name', e.target.value)}
                            className="font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1"
                          />
                          <button onClick={() => deleteCluster(cluster.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <textarea
                          value={cluster.description}
                          onChange={(e) => updateCluster(cluster.id, 'description', e.target.value)}
                          placeholder="Descrizione cluster"
                          rows={2}
                          className="w-full text-sm text-gray-600 px-2 py-1 border border-gray-300 rounded mb-2"
                        />

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <label className="text-xs text-gray-500">Numero Clienti</label>
                            <input
                              type="number"
                              value={cluster.customerCount}
                              onChange={(e) => updateCluster(cluster.id, 'customerCount', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Valore Medio €</label>
                            <input
                              type="number"
                              value={cluster.averageValue}
                              onChange={(e) => updateCluster(cluster.id, 'averageValue', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Clustering Charts */}
                  <BusinessPlanChart config={{
                    type: 'pie',
                    title: 'Distribuzione Clienti per Cluster',
                    data: data.clusters.map(c => ({ name: c.name, value: c.customerCount })),
                    height: 300
                  }} />

                  <BusinessPlanChart config={{
                    type: 'bar',
                    title: 'Valore Medio per Cluster',
                    data: data.clusters.map(c => ({ cluster: c.name, valore: c.averageValue })),
                    xKey: 'cluster',
                    yKey: 'valore',
                    colors: ['#6366f1'],
                    height: 300
                  }} />
                </>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Nessun cluster definito</p>
                  <p className="text-sm text-gray-400 mt-1">Segmenta i clienti in cluster omogenei</p>
                </div>
              )}
            </div>
          )}

          {/* Propensity Tab */}
          {activeTab === 'propensity' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">Modelli di Propensione</h4>
                <button
                  onClick={addPropensityModel}
                  className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Aggiungi Modello</span>
                </button>
              </div>

              {data.propensityModels.length > 0 ? (
                <div className="space-y-4">
                  {data.propensityModels.map(model => (
                    <div key={model.id} className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-semibold text-gray-900">{model.name}</div>
                          <div className="text-sm text-gray-600">{model.description}</div>
                        </div>
                        <button onClick={() => deletePropensityModel(model.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {model.segments.length > 0 && (
                        <BusinessPlanChart config={{
                          type: 'bar',
                          title: `Propensione: ${model.name}`,
                          data: model.segments.map(seg => ({
                            segmento: seg.name,
                            propensione: seg.propensity,
                            dimensione: seg.size
                          })),
                          xKey: 'segmento',
                          yKey: 'propensione',
                          colors: ['#8b5cf6'],
                          height: 250
                        }} />
                      )}

                      <div className="mt-3 text-sm text-gray-600">
                        Segmenti: {model.segments.length}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Nessun modello di propensione</p>
                  <p className="text-sm text-gray-400 mt-1">Prevedi comportamenti futuri dei clienti</p>
                </div>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <h4 className="font-semibold text-indigo-900 mb-2">💡 Analisi Predittiva</h4>
            <ul className="text-sm text-indigo-800 space-y-1">
              <li>• <strong>Time Series</strong> - Prevedi trend futuri basati su dati storici</li>
              <li>• <strong>Clustering</strong> - Segmenta i clienti in gruppi omogenei</li>
              <li>• <strong>Propensity</strong> - Prevedi probabilità di acquisto, churn, ecc.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
