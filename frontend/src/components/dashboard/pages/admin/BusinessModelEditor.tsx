import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, X, Briefcase, DollarSign, Users, TrendingUp, Trash2 } from 'lucide-react'
import { BusinessModelData, BusinessRevenueStream, CustomerSegment, DistributionChannel } from '../../../../types/businessPlan'

interface BusinessModelEditorProps {
  data: BusinessModelData
  onChange: (data: BusinessModelData) => void
  isExpanded: boolean
  onToggle: () => void
}

export default function BusinessModelEditor({
  data,
  onChange,
  isExpanded,
  onToggle
}: BusinessModelEditorProps) {
  const [activeTab, setActiveTab] = useState<'revenue' | 'customers' | 'channels' | 'costs'>('revenue')

  // Revenue Stream Management
  const addRevenueStream = () => {
    const newStream: BusinessRevenueStream = {
      id: `revenue_${Date.now()}`,
      name: '',
      description: '',
      margin: undefined
    }
    onChange({
      ...data,
      revenueStreams: [...data.revenueStreams, newStream]
    })
  }

  const updateRevenueStream = (id: string, field: keyof BusinessRevenueStream, value: any) => {
    onChange({
      ...data,
      revenueStreams: data.revenueStreams.map(stream =>
        stream.id === id ? { ...stream, [field]: value } : stream
      )
    })
  }

  const removeRevenueStream = (id: string) => {
    onChange({
      ...data,
      revenueStreams: data.revenueStreams.filter(stream => stream.id !== id)
    })
  }

  // Customer Segment Management
  const addCustomerSegment = () => {
    const newSegment: CustomerSegment = {
      id: `segment_${Date.now()}`,
      name: '',
      description: '',
      type: 'primary'
    }
    onChange({
      ...data,
      customerSegments: [...data.customerSegments, newSegment]
    })
  }

  const updateCustomerSegment = (id: string, field: keyof CustomerSegment, value: any) => {
    onChange({
      ...data,
      customerSegments: data.customerSegments.map(segment =>
        segment.id === id ? { ...segment, [field]: value } : segment
      )
    })
  }

  const removeCustomerSegment = (id: string) => {
    onChange({
      ...data,
      customerSegments: data.customerSegments.filter(segment => segment.id !== id)
    })
  }

  // Distribution Channel Management
  const addDistributionChannel = () => {
    const newChannel: DistributionChannel = {
      id: `channel_${Date.now()}`,
      name: '',
      description: ''
    }
    onChange({
      ...data,
      distributionChannels: [...data.distributionChannels, newChannel]
    })
  }

  const updateDistributionChannel = (id: string, field: keyof DistributionChannel, value: any) => {
    onChange({
      ...data,
      distributionChannels: data.distributionChannels.map(channel =>
        channel.id === id ? { ...channel, [field]: value } : channel
      )
    })
  }

  const removeDistributionChannel = (id: string) => {
    onChange({
      ...data,
      distributionChannels: data.distributionChannels.filter(channel => channel.id !== id)
    })
  }

  // Cost Structure Management
  const addFixedCost = () => {
    onChange({
      ...data,
      costStructure: {
        ...data.costStructure,
        fixedCosts: [...data.costStructure.fixedCosts, { name: '', description: '' }]
      }
    })
  }

  const updateFixedCost = (index: number, field: 'name' | 'description', value: string) => {
    const newFixedCosts = [...data.costStructure.fixedCosts]
    newFixedCosts[index] = { ...newFixedCosts[index], [field]: value }
    onChange({
      ...data,
      costStructure: { ...data.costStructure, fixedCosts: newFixedCosts }
    })
  }

  const removeFixedCost = (index: number) => {
    onChange({
      ...data,
      costStructure: {
        ...data.costStructure,
        fixedCosts: data.costStructure.fixedCosts.filter((_, i) => i !== index)
      }
    })
  }

  const addVariableCost = () => {
    onChange({
      ...data,
      costStructure: {
        ...data.costStructure,
        variableCosts: [...data.costStructure.variableCosts, { name: '', description: '' }]
      }
    })
  }

  const updateVariableCost = (index: number, field: 'name' | 'description', value: string) => {
    const newVariableCosts = [...data.costStructure.variableCosts]
    newVariableCosts[index] = { ...newVariableCosts[index], [field]: value }
    onChange({
      ...data,
      costStructure: { ...data.costStructure, variableCosts: newVariableCosts }
    })
  }

  const removeVariableCost = (index: number) => {
    onChange({
      ...data,
      costStructure: {
        ...data.costStructure,
        variableCosts: data.costStructure.variableCosts.filter((_, i) => i !== index)
      }
    })
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
            <Briefcase className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Business Model</h3>
              <p className="text-sm text-gray-600 mt-1">
                Come l'azienda genera valore e ricavi
              </p>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          {/* Tabs */}
          <div className="flex space-x-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('revenue')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'revenue'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <DollarSign className="inline h-4 w-4 mr-1" />
              Flussi di Ricavi
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'customers'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="inline h-4 w-4 mr-1" />
              Segmenti Cliente
            </button>
            <button
              onClick={() => setActiveTab('channels')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'channels'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="inline h-4 w-4 mr-1" />
              Canali
            </button>
            <button
              onClick={() => setActiveTab('costs')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'costs'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Briefcase className="inline h-4 w-4 mr-1" />
              Struttura Costi
            </button>
          </div>

          {/* Revenue Streams Tab */}
          {activeTab === 'revenue' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-semibold text-gray-900">Flussi di Ricavi</h4>
                <button
                  onClick={addRevenueStream}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Aggiungi Flusso</span>
                </button>
              </div>

              {data.revenueStreams.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Nessun flusso di ricavi aggiunto</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.revenueStreams.map((stream) => (
                    <div key={stream.id} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <input
                          type="text"
                          value={stream.name}
                          onChange={(e) => updateRevenueStream(stream.id, 'name', e.target.value)}
                          className="text-lg font-semibold text-gray-900 border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 outline-none px-2 -ml-2 flex-1"
                          placeholder="Nome flusso di ricavi"
                        />
                        <button
                          onClick={() => removeRevenueStream(stream.id)}
                          className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <textarea
                        value={stream.description}
                        onChange={(e) => updateRevenueStream(stream.id, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                        placeholder="Descrizione del flusso di ricavi..."
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Margine (%)
                          </label>
                          <input
                            type="number"
                            value={stream.margin || ''}
                            onChange={(e) => updateRevenueStream(stream.id, 'margin', e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="es. 35"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Customer Segments Tab */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-semibold text-gray-900">Segmenti di Clientela</h4>
                <button
                  onClick={addCustomerSegment}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Aggiungi Segmento</span>
                </button>
              </div>

              {data.customerSegments.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Nessun segmento cliente aggiunto</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.customerSegments.map((segment) => (
                    <div key={segment.id} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <input
                          type="text"
                          value={segment.name}
                          onChange={(e) => updateCustomerSegment(segment.id, 'name', e.target.value)}
                          className="text-lg font-semibold text-gray-900 border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 outline-none px-2 -ml-2 flex-1"
                          placeholder="Nome segmento"
                        />
                        <button
                          onClick={() => removeCustomerSegment(segment.id)}
                          className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <textarea
                        value={segment.description}
                        onChange={(e) => updateCustomerSegment(segment.id, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                        placeholder="Descrizione del segmento cliente..."
                      />
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Tipo Segmento
                        </label>
                        <select
                          value={segment.type}
                          onChange={(e) => updateCustomerSegment(segment.id, 'type', e.target.value as 'primary' | 'secondary')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="primary">Primario</option>
                          <option value="secondary">Secondario</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Distribution Channels Tab */}
          {activeTab === 'channels' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-semibold text-gray-900">Canali di Distribuzione</h4>
                <button
                  onClick={addDistributionChannel}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Aggiungi Canale</span>
                </button>
              </div>

              {data.distributionChannels.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Nessun canale di distribuzione aggiunto</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.distributionChannels.map((channel) => (
                    <div key={channel.id} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <input
                          type="text"
                          value={channel.name}
                          onChange={(e) => updateDistributionChannel(channel.id, 'name', e.target.value)}
                          className="text-lg font-semibold text-gray-900 border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 outline-none px-2 -ml-2 flex-1"
                          placeholder="Nome canale"
                        />
                        <button
                          onClick={() => removeDistributionChannel(channel.id)}
                          className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <textarea
                        value={channel.description}
                        onChange={(e) => updateDistributionChannel(channel.id, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Descrizione del canale di distribuzione..."
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cost Structure Tab */}
          {activeTab === 'costs' && (
            <div className="space-y-6">
              {/* Fixed Costs */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-semibold text-gray-900">Costi Fissi</h4>
                  <button
                    onClick={addFixedCost}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Aggiungi</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {data.costStructure.fixedCosts.map((cost, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-start space-x-2">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={cost.name}
                            onChange={(e) => updateFixedCost(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nome costo fisso"
                          />
                          <input
                            type="text"
                            value={cost.description}
                            onChange={(e) => updateFixedCost(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Descrizione"
                          />
                        </div>
                        <button
                          onClick={() => removeFixedCost(index)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Variable Costs */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-semibold text-gray-900">Costi Variabili</h4>
                  <button
                    onClick={addVariableCost}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Aggiungi</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {data.costStructure.variableCosts.map((cost, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-start space-x-2">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={cost.name}
                            onChange={(e) => updateVariableCost(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nome costo variabile"
                          />
                          <input
                            type="text"
                            value={cost.description}
                            onChange={(e) => updateVariableCost(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Descrizione"
                          />
                        </div>
                        <button
                          onClick={() => removeVariableCost(index)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>Suggerimento:</strong> I costi fissi rimangono costanti indipendentemente dal volume
                  di produzione (es. affitto, stipendi). I costi variabili cambiano in base al volume (es. materie prime, commissioni).
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note Aggiuntive
            </label>
            <textarea
              value={data.notes || ''}
              onChange={(e) => onChange({ ...data, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Note aggiuntive sul business model..."
            />
          </div>
        </div>
      )}
    </div>
  )
}
