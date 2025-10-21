import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, TrendingUp, TrendingDown, AlertTriangle, Target } from 'lucide-react'
import { SWOTData, SWOTItem } from '../../../../types/businessPlan'

interface SWOTEditorProps {
  data: SWOTData
  onChange: (data: SWOTData) => void
  isExpanded: boolean
  onToggle: () => void
}

type SWOTQuadrant = 'strengths' | 'weaknesses' | 'opportunities' | 'threats'

const QUADRANT_CONFIG = {
  strengths: {
    title: 'Punti di Forza',
    subtitle: 'Strengths',
    icon: TrendingUp,
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    iconColor: 'text-green-600'
  },
  weaknesses: {
    title: 'Punti di Debolezza',
    subtitle: 'Weaknesses',
    icon: TrendingDown,
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    iconColor: 'text-red-600'
  },
  opportunities: {
    title: 'Opportunità',
    subtitle: 'Opportunities',
    icon: Target,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-600'
  },
  threats: {
    title: 'Minacce',
    subtitle: 'Threats',
    icon: AlertTriangle,
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    iconColor: 'text-orange-600'
  }
}

export default function SWOTEditor({
  data,
  onChange,
  isExpanded,
  onToggle
}: SWOTEditorProps) {
  const [newItemText, setNewItemText] = useState<Record<SWOTQuadrant, string>>({
    strengths: '',
    weaknesses: '',
    opportunities: '',
    threats: ''
  })

  const addItem = (quadrant: SWOTQuadrant) => {
    const text = newItemText[quadrant].trim()
    if (!text) return

    const newItem: SWOTItem = {
      id: `${quadrant}-${Date.now()}`,
      text,
      priority: 'medium'
    }

    onChange({
      ...data,
      [quadrant]: [...data[quadrant], newItem]
    })

    setNewItemText({ ...newItemText, [quadrant]: '' })
  }

  const deleteItem = (quadrant: SWOTQuadrant, itemId: string) => {
    onChange({
      ...data,
      [quadrant]: data[quadrant].filter(item => item.id !== itemId)
    })
  }

  const updateItemPriority = (quadrant: SWOTQuadrant, itemId: string, priority: 'high' | 'medium' | 'low') => {
    onChange({
      ...data,
      [quadrant]: data[quadrant].map(item =>
        item.id === itemId ? { ...item, priority } : item
      )
    })
  }

  const renderQuadrant = (quadrant: SWOTQuadrant) => {
    const config = QUADRANT_CONFIG[quadrant]
    const Icon = config.icon
    const items = data[quadrant]

    return (
      <div className={`${config.bgColor} p-4 rounded-lg border-2 ${config.borderColor}`}>
        <div className="flex items-center space-x-2 mb-3">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
          <div>
            <h4 className={`font-bold ${config.textColor}`}>{config.title}</h4>
            <p className="text-xs text-gray-500">{config.subtitle}</p>
          </div>
        </div>

        {/* Items list */}
        <div className="space-y-2 mb-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="bg-white p-2 rounded border border-gray-200 flex items-start justify-between group hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start space-x-2 flex-1">
                <span className="text-xs text-gray-400 font-semibold mt-0.5">{index + 1}.</span>
                <p className="text-sm text-gray-700 flex-1">{item.text}</p>
              </div>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <select
                  value={item.priority || 'medium'}
                  onChange={(e) => updateItemPriority(quadrant, item.id, e.target.value as any)}
                  className="text-xs border border-gray-300 rounded px-1 py-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Bassa</option>
                </select>
                <button
                  onClick={() => deleteItem(quadrant, item.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add new item */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newItemText[quadrant]}
            onChange={(e) => setNewItemText({ ...newItemText, [quadrant]: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addItem(quadrant)
              }
            }}
            placeholder={`Aggiungi ${config.title.toLowerCase()}...`}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => addItem(quadrant)}
            className={`p-1 bg-${config.color}-600 text-white rounded hover:bg-${config.color}-700`}
            title="Aggiungi"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
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

            <Target className="h-5 w-5 text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Analisi SWOT</h3>
              <p className="text-sm text-gray-600">
                Analisi strategica dei fattori interni ed esterni
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            {data.strengths.length + data.weaknesses.length + data.opportunities.length + data.threats.length} elementi
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-6">
          {/* SWOT Matrix */}
          <div className="grid grid-cols-2 gap-4">
            {renderQuadrant('strengths')}
            {renderQuadrant('weaknesses')}
            {renderQuadrant('opportunities')}
            {renderQuadrant('threats')}
          </div>

          {/* Strategic Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sintesi Strategica
            </label>
            <textarea
              value={data.strategicSummary || ''}
              onChange={(e) => onChange({ ...data, strategicSummary: e.target.value })}
              placeholder="Riassumi l'analisi SWOT e le implicazioni strategiche principali..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Action Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Azioni Raccomandate
            </label>
            <textarea
              value={data.actionItems?.join('\n') || ''}
              onChange={(e) => onChange({
                ...data,
                actionItems: e.target.value.split('\n').filter(line => line.trim())
              })}
              placeholder="Elenca le azioni strategiche raccomandate (una per riga)..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Inserisci un'azione per riga. Saranno formattate come elenco puntato.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
