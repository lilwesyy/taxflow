import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, X, FileText } from 'lucide-react'
import { ExecutiveSummaryData } from '../../../../types/businessPlan'

interface ExecutiveSummaryEditorProps {
  data: ExecutiveSummaryData
  onChange: (data: ExecutiveSummaryData) => void
  isExpanded: boolean
  onToggle: () => void
}

export default function ExecutiveSummaryEditor({
  data,
  onChange,
  isExpanded,
  onToggle
}: ExecutiveSummaryEditorProps) {
  const [newStrengthPoint, setNewStrengthPoint] = useState('')

  const updateField = (field: keyof ExecutiveSummaryData, value: any) => {
    onChange({ ...data, [field]: value })
  }

  const addStrengthPoint = () => {
    if (newStrengthPoint.trim()) {
      onChange({
        ...data,
        strengthPoints: [...data.strengthPoints, newStrengthPoint.trim()]
      })
      setNewStrengthPoint('')
    }
  }

  const removeStrengthPoint = (index: number) => {
    onChange({
      ...data,
      strengthPoints: data.strengthPoints.filter((_, i) => i !== index)
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
            <FileText className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Executive Summary</h3>
              <p className="text-sm text-gray-600 mt-1">
                Sintesi esecutiva del business plan con i punti chiave
              </p>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-6">
          {/* Company Name and Sector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Azienda *
              </label>
              <input
                type="text"
                value={data.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="es. TechStartup SRL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Settore *
              </label>
              <input
                type="text"
                value={data.sector}
                onChange={(e) => updateField('sector', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="es. Tecnologia, FinTech, E-commerce"
              />
            </div>
          </div>

          {/* Main Objective */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Obiettivo Principale *
            </label>
            <textarea
              value={data.mainObjective}
              onChange={(e) => updateField('mainObjective', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="es. Diventare il leader di mercato nella digitalizzazione delle PMI italiane"
            />
          </div>

          {/* Key Strategy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Strategia Chiave *
            </label>
            <textarea
              value={data.keyStrategy}
              onChange={(e) => updateField('keyStrategy', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="es. Offrire una piattaforma SaaS innovativa con pricing competitivo e supporto personalizzato"
            />
          </div>

          {/* Strength Points */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Punti di Forza
            </label>
            <div className="space-y-2">
              {data.strengthPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-gray-200"
                >
                  <span className="flex-1 text-gray-700">{point}</span>
                  <button
                    onClick={() => removeStrengthPoint(index)}
                    className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newStrengthPoint}
                  onChange={(e) => setNewStrengthPoint(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addStrengthPoint()
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="es. Proposta di valore unica e differenziante"
                />
                <button
                  onClick={addStrengthPoint}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Aggiungi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Financial Projections */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Proiezioni Finanziarie</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Break-even (mesi)
                </label>
                <input
                  type="number"
                  value={data.financialProjections.breakEvenMonths || ''}
                  onChange={(e) => updateField('financialProjections', {
                    ...data.financialProjections,
                    breakEvenMonths: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="es. 18"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crescita Fatturato (%)
                </label>
                <input
                  type="number"
                  value={data.financialProjections.revenueGrowthPercent || ''}
                  onChange={(e) => updateField('financialProjections', {
                    ...data.financialProjections,
                    revenueGrowthPercent: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="es. 150"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proiezioni Annuali
              </label>
              <textarea
                value={data.financialProjections.yearlyProjections || ''}
                onChange={(e) => updateField('financialProjections', {
                  ...data.financialProjections,
                  yearlyProjections: e.target.value
                })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="es. Anno 1: €250k, Anno 2: €600k, Anno 3: €1.2M"
              />
            </div>
          </div>

          {/* General Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sintesi Generale (opzionale)
            </label>
            <textarea
              value={data.generalSummary || ''}
              onChange={(e) => updateField('generalSummary', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Breve riassunto esecutivo del progetto, obiettivi e opportunità..."
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Suggerimento:</strong> L'Executive Summary è la prima sezione che gli investitori
              leggono. Deve essere conciso, convincente e catturare l'essenza del business plan.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
