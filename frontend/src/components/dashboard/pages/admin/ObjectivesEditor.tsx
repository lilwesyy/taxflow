import { useState } from 'react'
import { Plus, Trash2, Edit2, Check, X, Target, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react'
import { ObjectivesData, SMARTObjective } from '../../../../types/businessPlan'

interface ObjectivesEditorProps {
  data: ObjectivesData
  onChange: (data: ObjectivesData) => void
  isExpanded: boolean
  onToggle: () => void
}

export default function ObjectivesEditor({
  data,
  onChange,
  isExpanded,
  onToggle
}: ObjectivesEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingObjective, setEditingObjective] = useState<Partial<SMARTObjective>>({})

  const handleAdd = () => {
    const newObjective: SMARTObjective = {
      id: `obj-${Date.now()}`,
      title: '',
      description: '',
      specific: '',
      measurable: '',
      achievable: '',
      relevant: '',
      timeBound: '',
      status: 'not_started',
      progress: 0
    }
    setEditingId(newObjective.id)
    setEditingObjective(newObjective)
  }

  const handleSave = () => {
    if (!editingObjective.title) {
      alert('Il titolo è obbligatorio')
      return
    }

    const updatedObjectives = editingId && data.objectives.some(o => o.id === editingId)
      ? data.objectives.map(o => o.id === editingId ? editingObjective as SMARTObjective : o)
      : [...data.objectives, editingObjective as SMARTObjective]

    onChange({
      ...data,
      objectives: updatedObjectives
    })

    setEditingId(null)
    setEditingObjective({})
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditingObjective({})
  }

  const handleEdit = (objective: SMARTObjective) => {
    setEditingId(objective.id)
    setEditingObjective({ ...objective })
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo obiettivo?')) {
      onChange({
        ...data,
        objectives: data.objectives.filter(o => o.id !== id)
      })
    }
  }

  const updateField = (field: keyof ObjectivesData, value: any) => {
    onChange({
      ...data,
      [field]: value
    })
  }

  const getStatusColor = (status: SMARTObjective['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: SMARTObjective['status']) => {
    switch (status) {
      case 'completed': return 'Completato'
      case 'in_progress': return 'In Corso'
      default: return 'Da Iniziare'
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

            <Target className="h-5 w-5 text-emerald-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Obiettivi</h3>
              <p className="text-sm text-gray-600">
                Obiettivi SMART e strategia aziendale
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            {data.objectives.length} obiettivi
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-6">
          {/* Vision & Mission */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vision Aziendale
              </label>
              <textarea
                value={data.vision || ''}
                onChange={(e) => updateField('vision', e.target.value)}
                placeholder="Dove vuoi che sia l'azienda in 5-10 anni?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mission Aziendale
              </label>
              <textarea
                value={data.mission || ''}
                onChange={(e) => updateField('mission', e.target.value)}
                placeholder="Qual è lo scopo dell'azienda? Cosa fa e per chi?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Core Values */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valori Aziendali
            </label>
            <textarea
              value={data.coreValues?.join('\n') || ''}
              onChange={(e) => updateField('coreValues', e.target.value.split('\n').filter(v => v.trim()))}
              placeholder="Elenca i valori fondamentali (uno per riga)&#10;es. Integrità&#10;es. Innovazione&#10;es. Customer Focus"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Un valore per riga. Saranno formattati come elenco puntato.
            </p>
          </div>

          {/* SMART Objectives */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Obiettivi SMART</h4>
              <button
                onClick={handleAdd}
                className="flex items-center space-x-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Aggiungi Obiettivo</span>
              </button>
            </div>

            {/* Editing Form */}
            {editingId && (
              <div className="bg-white p-4 rounded-lg border-2 border-emerald-500 mb-4 space-y-4">
                <h5 className="font-semibold text-gray-900">
                  {data.objectives.some(o => o.id === editingId) ? 'Modifica Obiettivo' : 'Nuovo Obiettivo'}
                </h5>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titolo Obiettivo *
                  </label>
                  <input
                    type="text"
                    value={editingObjective.title || ''}
                    onChange={(e) => setEditingObjective({ ...editingObjective, title: e.target.value })}
                    placeholder="es. Aumentare il fatturato del 30%"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrizione
                  </label>
                  <textarea
                    value={editingObjective.description || ''}
                    onChange={(e) => setEditingObjective({ ...editingObjective, description: e.target.value })}
                    placeholder="Descrizione generale dell'obiettivo"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* SMART Criteria */}
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-1">
                      <strong>S</strong>pecific (Specifico)
                    </label>
                    <input
                      type="text"
                      value={editingObjective.specific || ''}
                      onChange={(e) => setEditingObjective({ ...editingObjective, specific: e.target.value })}
                      placeholder="Cosa esattamente verrà realizzato?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-1">
                      <strong>M</strong>easurable (Misurabile)
                    </label>
                    <input
                      type="text"
                      value={editingObjective.measurable || ''}
                      onChange={(e) => setEditingObjective({ ...editingObjective, measurable: e.target.value })}
                      placeholder="Come verrà misurato? Quali metriche?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-1">
                      <strong>A</strong>chievable (Raggiungibile)
                    </label>
                    <input
                      type="text"
                      value={editingObjective.achievable || ''}
                      onChange={(e) => setEditingObjective({ ...editingObjective, achievable: e.target.value })}
                      placeholder="Come può essere raggiunto? Quali risorse servono?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-1">
                      <strong>R</strong>elevant (Rilevante)
                    </label>
                    <input
                      type="text"
                      value={editingObjective.relevant || ''}
                      onChange={(e) => setEditingObjective({ ...editingObjective, relevant: e.target.value })}
                      placeholder="Perché è importante? Allineato con la strategia?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-1">
                      <strong>T</strong>ime-bound (Temporizzato)
                    </label>
                    <input
                      type="text"
                      value={editingObjective.timeBound || ''}
                      onChange={(e) => setEditingObjective({ ...editingObjective, timeBound: e.target.value })}
                      placeholder="Quando sarà completato? Scadenza?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stato
                    </label>
                    <select
                      value={editingObjective.status || 'not_started'}
                      onChange={(e) => setEditingObjective({ ...editingObjective, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="not_started">Da Iniziare</option>
                      <option value="in_progress">In Corso</option>
                      <option value="completed">Completato</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Progresso (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingObjective.progress || 0}
                      onChange={(e) => setEditingObjective({ ...editingObjective, progress: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    <span>Salva</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Annulla</span>
                  </button>
                </div>
              </div>
            )}

            {/* Objectives List */}
            {data.objectives.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Nessun obiettivo aggiunto</p>
                <p className="text-sm text-gray-400 mt-1">Clicca su "Aggiungi Obiettivo" per iniziare</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.objectives.map((objective) => (
                  <div
                    key={objective.id}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h5 className="font-semibold text-gray-900">{objective.title}</h5>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(objective.status)}`}>
                            {getStatusLabel(objective.status)}
                          </span>
                        </div>
                        {objective.description && (
                          <p className="text-sm text-gray-600 mb-2">{objective.description}</p>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 ml-4">
                        <button
                          onClick={() => handleEdit(objective)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Modifica"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(objective.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Elimina"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progresso</span>
                        <span className="font-semibold">{objective.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-emerald-600 h-2 rounded-full transition-all"
                          style={{ width: `${objective.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* SMART Details */}
                    <div className="space-y-1 text-sm">
                      {objective.specific && (
                        <div className="flex items-start space-x-2">
                          <span className="font-semibold text-emerald-700 min-w-[20px]">S:</span>
                          <span className="text-gray-700">{objective.specific}</span>
                        </div>
                      )}
                      {objective.measurable && (
                        <div className="flex items-start space-x-2">
                          <span className="font-semibold text-emerald-700 min-w-[20px]">M:</span>
                          <span className="text-gray-700">{objective.measurable}</span>
                        </div>
                      )}
                      {objective.achievable && (
                        <div className="flex items-start space-x-2">
                          <span className="font-semibold text-emerald-700 min-w-[20px]">A:</span>
                          <span className="text-gray-700">{objective.achievable}</span>
                        </div>
                      )}
                      {objective.relevant && (
                        <div className="flex items-start space-x-2">
                          <span className="font-semibold text-emerald-700 min-w-[20px]">R:</span>
                          <span className="text-gray-700">{objective.relevant}</span>
                        </div>
                      )}
                      {objective.timeBound && (
                        <div className="flex items-start space-x-2">
                          <span className="font-semibold text-emerald-700 min-w-[20px]">T:</span>
                          <span className="text-gray-700">{objective.timeBound}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <h4 className="font-semibold text-emerald-900 mb-2 flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>💡 Cosa sono gli obiettivi SMART?</span>
            </h4>
            <ul className="text-sm text-emerald-800 space-y-1">
              <li>• <strong>Specific</strong> - Obiettivo chiaro e specifico</li>
              <li>• <strong>Measurable</strong> - Misurabile con metriche concrete</li>
              <li>• <strong>Achievable</strong> - Raggiungibile con le risorse disponibili</li>
              <li>• <strong>Relevant</strong> - Rilevante per la strategia aziendale</li>
              <li>• <strong>Time-bound</strong> - Con scadenza temporale definita</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
