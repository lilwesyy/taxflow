import { useState } from 'react'
import { Trash2, ChevronDown, ChevronUp, Megaphone } from 'lucide-react'
import { MarketingStrategyData, MarketingChannel, MarketingCampaign } from '../../../../types/businessPlan'
import BusinessPlanChart from './BusinessPlanChart'

interface MarketingStrategyEditorProps {
  data: MarketingStrategyData
  onChange: (data: MarketingStrategyData) => void
  isExpanded: boolean
  onToggle: () => void
}

export default function MarketingStrategyEditor({
  data,
  onChange,
  isExpanded,
  onToggle
}: MarketingStrategyEditorProps) {
  const [newChannel, setNewChannel] = useState<Partial<MarketingChannel>>({})
  const [newCampaign, setNewCampaign] = useState<Partial<MarketingCampaign>>({})

  const addChannel = () => {
    if (!newChannel.name || !newChannel.budget) return

    const channel: MarketingChannel = {
      id: `ch-${Date.now()}`,
      name: newChannel.name,
      description: newChannel.description || '',
      budget: newChannel.budget,
      expectedROI: newChannel.expectedROI || 0,
      kpis: newChannel.kpis || []
    }

    onChange({
      ...data,
      channels: [...data.channels, channel]
    })

    setNewChannel({})
  }

  const deleteChannel = (id: string) => {
    onChange({
      ...data,
      channels: data.channels.filter(c => c.id !== id)
    })
  }

  const addCampaign = () => {
    if (!newCampaign.name || !newCampaign.objective) return

    const campaign: MarketingCampaign = {
      id: `camp-${Date.now()}`,
      name: newCampaign.name,
      objective: newCampaign.objective,
      channels: newCampaign.channels || [],
      budget: newCampaign.budget || 0,
      startDate: newCampaign.startDate || new Date().toISOString().split('T')[0],
      endDate: newCampaign.endDate || '',
      status: newCampaign.status || 'planned'
    }

    onChange({
      ...data,
      campaigns: [...data.campaigns, campaign]
    })

    setNewCampaign({})
  }

  const deleteCampaign = (id: string) => {
    onChange({
      ...data,
      campaigns: data.campaigns.filter(c => c.id !== id)
    })
  }

  const totalBudget = data.channels.reduce((sum, ch) => sum + ch.budget, 0)

  const getStatusColor = (status: MarketingCampaign['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
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
            <Megaphone className="h-5 w-5 text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Strategia di Marketing</h3>
              <p className="text-sm text-gray-600">Canali, campagne e budget marketing</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">€{totalBudget.toLocaleString()} totale</div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-6">
          {/* Strategic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
              <textarea
                value={data.targetAudience || ''}
                onChange={(e) => onChange({ ...data, targetAudience: e.target.value })}
                placeholder="Descrivi il pubblico target..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Positioning</label>
              <textarea
                value={data.positioning || ''}
                onChange={(e) => onChange({ ...data, positioning: e.target.value })}
                placeholder="Come ti posizioni rispetto ai competitor?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unique Selling Proposition (USP)</label>
            <textarea
              value={data.uniqueSellingProposition || ''}
              onChange={(e) => onChange({ ...data, uniqueSellingProposition: e.target.value })}
              placeholder="Cosa ti rende unico? Perché i clienti dovrebbero scegliere te?"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Channels */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Canali Marketing</h4>
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-3">
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Nome canale"
                  value={newChannel.name || ''}
                  onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <input
                  type="number"
                  placeholder="Budget €"
                  value={newChannel.budget || ''}
                  onChange={(e) => setNewChannel({ ...newChannel, budget: parseFloat(e.target.value) || 0 })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <input
                  type="number"
                  placeholder="ROI atteso %"
                  value={newChannel.expectedROI || ''}
                  onChange={(e) => setNewChannel({ ...newChannel, expectedROI: parseFloat(e.target.value) || 0 })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={addChannel}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  Aggiungi
                </button>
              </div>
            </div>

            {data.channels.length > 0 && (
              <div className="space-y-2">
                {data.channels.map(channel => (
                  <div key={channel.id} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{channel.name}</div>
                      <div className="text-sm text-gray-600">Budget: €{channel.budget.toLocaleString()} • ROI atteso: {channel.expectedROI}%</div>
                    </div>
                    <button onClick={() => deleteChannel(channel.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Budget Chart */}
          {data.channels.length > 0 && (
            <BusinessPlanChart config={{
              type: 'pie',
              title: 'Distribuzione Budget per Canale',
              data: data.channels.map(ch => ({ name: ch.name, value: ch.budget })),
              height: 300
            }} />
          )}

          {/* ROI Chart */}
          {data.channels.length > 0 && (
            <BusinessPlanChart config={{
              type: 'bar',
              title: 'ROI Atteso per Canale',
              data: data.channels.map(ch => ({ channel: ch.name, ROI: ch.expectedROI })),
              xKey: 'channel',
              yKey: 'ROI',
              colors: ['#9333ea'],
              height: 300
            }} />
          )}

          {/* Campaigns */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Campagne Marketing</h4>
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-3">
              <div className="grid grid-cols-3 gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Nome campagna"
                  value={newCampaign.name || ''}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Obiettivo"
                  value={newCampaign.objective || ''}
                  onChange={(e) => setNewCampaign({ ...newCampaign, objective: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Budget €"
                  value={newCampaign.budget || ''}
                  onChange={(e) => setNewCampaign({ ...newCampaign, budget: parseFloat(e.target.value) || 0 })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="date"
                  value={newCampaign.startDate || ''}
                  onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="date"
                  value={newCampaign.endDate || ''}
                  onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={addCampaign}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                >
                  Aggiungi
                </button>
              </div>
            </div>

            {data.campaigns.length > 0 && (
              <div className="space-y-2">
                {data.campaigns.map(campaign => (
                  <div key={campaign.id} className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">{campaign.name}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{campaign.objective}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          €{campaign.budget.toLocaleString()} • {new Date(campaign.startDate).toLocaleDateString()} - {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'In corso'}
                        </div>
                      </div>
                      <button onClick={() => deleteCampaign(campaign.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
