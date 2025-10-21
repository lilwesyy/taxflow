import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, X, Lightbulb } from 'lucide-react'
import { IdeaData } from '../../../../types/businessPlan'

interface IdeaEditorProps {
  data: IdeaData
  onChange: (data: IdeaData) => void
  isExpanded: boolean
  onToggle: () => void
}

export default function IdeaEditor({
  data,
  onChange,
  isExpanded,
  onToggle
}: IdeaEditorProps) {
  const [newValuePoint, setNewValuePoint] = useState('')

  const updateField = (field: keyof IdeaData, value: any) => {
    onChange({ ...data, [field]: value })
  }

  const addValuePoint = () => {
    if (newValuePoint.trim()) {
      onChange({
        ...data,
        valueProposition: [...data.valueProposition, newValuePoint.trim()]
      })
      setNewValuePoint('')
    }
  }

  const removeValuePoint = (index: number) => {
    onChange({
      ...data,
      valueProposition: data.valueProposition.filter((_, i) => i !== index)
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
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">L'Idea</h3>
              <p className="text-sm text-gray-600 mt-1">
                Descrizione dell'idea imprenditoriale, problema e soluzione
              </p>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-6">
          {/* Problem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Il Problema *
            </label>
            <textarea
              value={data.problem}
              onChange={(e) => updateField('problem', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descrivi il problema che i tuoi clienti affrontano quotidianamente. Quali sono i pain point principali?"
            />
            <p className="text-xs text-gray-500 mt-1">
              Spiega quale problema reale del mercato stai risolvendo
            </p>
          </div>

          {/* Solution */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              La Soluzione *
            </label>
            <textarea
              value={data.solution}
              onChange={(e) => updateField('solution', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descrivi la tua soluzione innovativa. Come risolvi il problema in modo unico ed efficace?"
            />
            <p className="text-xs text-gray-500 mt-1">
              Illustra come il tuo prodotto/servizio risolve il problema
            </p>
          </div>

          {/* Value Proposition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proposta di Valore Unica *
            </label>
            <p className="text-xs text-gray-600 mb-3">
              Cosa ti differenzia dalla concorrenza? Quali sono i tuoi vantaggi competitivi?
            </p>
            <div className="space-y-2">
              {data.valueProposition.map((point, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-gray-200"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <span className="flex-1 text-gray-700">{point}</span>
                  <button
                    onClick={() => removeValuePoint(index)}
                    className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newValuePoint}
                  onChange={(e) => setNewValuePoint(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addValuePoint()
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="es. Innovazione tecnologica e approccio data-driven"
                />
                <button
                  onClick={addValuePoint}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Aggiungi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Vision */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vision *
            </label>
            <textarea
              value={data.vision}
              onChange={(e) => updateField('vision', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Dove vuoi portare l'azienda nei prossimi 5-10 anni? Qual è l'impatto che vuoi creare?"
            />
            <p className="text-xs text-gray-500 mt-1">
              La visione a lungo termine dell'azienda
            </p>
          </div>

          {/* Target Market (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mercato Target (opzionale)
            </label>
            <textarea
              value={data.targetMarket || ''}
              onChange={(e) => updateField('targetMarket', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="es. PMI italiane con 10-50 dipendenti nel settore retail"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Suggerimento:</strong> Una buona idea di business parte sempre da un problema
              reale e urgente. Assicurati che la tua soluzione sia chiara e i benefici siano misurabili.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
