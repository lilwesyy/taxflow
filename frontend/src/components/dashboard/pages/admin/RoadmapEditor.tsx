import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, X, Calendar, MapPin, Trash2, Flag } from 'lucide-react'
import { RoadmapData, RoadmapMilestone } from '../../../../types/businessPlan'

interface RoadmapEditorProps {
  data: RoadmapData
  onChange: (data: RoadmapData) => void
  isExpanded: boolean
  onToggle: () => void
}

const statusColors = {
  planned: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  delayed: 'bg-red-100 text-red-700'
}

const statusLabels = {
  planned: 'Pianificato',
  in_progress: 'In Corso',
  completed: 'Completato',
  delayed: 'In Ritardo'
}

export default function RoadmapEditor({
  data,
  onChange,
  isExpanded,
  onToggle
}: RoadmapEditorProps) {
  const [showPhases, setShowPhases] = useState(false)

  const addMilestone = () => {
    const newMilestone: RoadmapMilestone = {
      id: `milestone_${Date.now()}`,
      title: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: undefined,
      status: 'planned',
      phase: undefined,
      dependencies: [],
      deliverables: [],
      team: []
    }
    onChange({
      ...data,
      milestones: [...data.milestones, newMilestone]
    })
  }

  const updateMilestone = (id: string, field: keyof RoadmapMilestone, value: any) => {
    onChange({
      ...data,
      milestones: data.milestones.map(milestone =>
        milestone.id === id ? { ...milestone, [field]: value } : milestone
      )
    })
  }

  const removeMilestone = (id: string) => {
    onChange({
      ...data,
      milestones: data.milestones.filter(milestone => milestone.id !== id)
    })
  }

  const addDeliverable = (milestoneId: string) => {
    onChange({
      ...data,
      milestones: data.milestones.map(milestone =>
        milestone.id === milestoneId
          ? { ...milestone, deliverables: [...(milestone.deliverables || []), ''] }
          : milestone
      )
    })
  }

  const updateDeliverable = (milestoneId: string, index: number, value: string) => {
    onChange({
      ...data,
      milestones: data.milestones.map(milestone =>
        milestone.id === milestoneId
          ? {
            ...milestone,
            deliverables: (milestone.deliverables || []).map((d, i) => i === index ? value : d)
          }
          : milestone
      )
    })
  }

  const removeDeliverable = (milestoneId: string, index: number) => {
    onChange({
      ...data,
      milestones: data.milestones.map(milestone =>
        milestone.id === milestoneId
          ? {
            ...milestone,
            deliverables: (milestone.deliverables || []).filter((_, i) => i !== index)
          }
          : milestone
      )
    })
  }

  const addPhase = () => {
    const newPhase = {
      id: `phase_${Date.now()}`,
      name: '',
      color: '#3B82F6',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }
    onChange({
      ...data,
      phases: [...(data.phases || []), newPhase]
    })
  }

  const updatePhase = (id: string, field: string, value: any) => {
    onChange({
      ...data,
      phases: (data.phases || []).map(phase =>
        phase.id === id ? { ...phase, [field]: value } : phase
      )
    })
  }

  const removePhase = (id: string) => {
    onChange({
      ...data,
      phases: (data.phases || []).filter(phase => phase.id !== id)
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
            <MapPin className="h-5 w-5 text-purple-600" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Roadmap e Go-to-Market</h3>
              <p className="text-sm text-gray-600 mt-1">
                Piano di sviluppo e strategia di lancio con milestone
              </p>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-6">
          {/* Visualization Type */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo Visualizzazione
              </label>
              <select
                value={data.visualizationType || 'timeline'}
                onChange={(e) => onChange({ ...data, visualizationType: e.target.value as any })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="timeline">Timeline</option>
                <option value="gantt">Gantt</option>
                <option value="phases">Fasi</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowPhases(!showPhases)}
                className={`px-4 py-2 rounded-lg transition-colors ${showPhases ? 'bg-purple-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Flag className="inline h-4 w-4 mr-1" />
                Gestisci Fasi
              </button>
            </div>
          </div>

          {/* Phases Section */}
          {showPhases && (
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-semibold text-gray-900">Fasi del Progetto</h4>
                <button
                  onClick={addPhase}
                  className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Aggiungi Fase</span>
                </button>
              </div>
              <div className="space-y-2">
                {(data.phases || []).map((phase) => (
                  <div key={phase.id} className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                    <input
                      type="color"
                      value={phase.color}
                      onChange={(e) => updatePhase(phase.id, 'color', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={phase.name}
                      onChange={(e) => updatePhase(phase.id, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome fase"
                    />
                    <input
                      type="date"
                      value={phase.startDate}
                      onChange={(e) => updatePhase(phase.id, 'startDate', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={phase.endDate}
                      onChange={(e) => updatePhase(phase.id, 'endDate', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => removePhase(phase.id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Milestones */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-gray-900">Milestone</h4>
              <button
                onClick={addMilestone}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Aggiungi Milestone</span>
              </button>
            </div>

            {data.milestones.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Nessuna milestone aggiunta</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.milestones.map((milestone) => (
                  <div key={milestone.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <input
                        type="text"
                        value={milestone.title}
                        onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                        className="text-lg font-semibold text-gray-900 border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 outline-none px-2 -ml-2 flex-1"
                        placeholder="Titolo milestone"
                      />
                      <button
                        onClick={() => removeMilestone(milestone.id)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <textarea
                      value={milestone.description}
                      onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                      placeholder="Descrizione della milestone..."
                    />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Data Inizio
                        </label>
                        <input
                          type="date"
                          value={milestone.startDate}
                          onChange={(e) => updateMilestone(milestone.id, 'startDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Data Fine
                        </label>
                        <input
                          type="date"
                          value={milestone.endDate || ''}
                          onChange={(e) => updateMilestone(milestone.id, 'endDate', e.target.value || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Stato
                        </label>
                        <select
                          value={milestone.status}
                          onChange={(e) => updateMilestone(milestone.id, 'status', e.target.value)}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${statusColors[milestone.status]}`}
                        >
                          <option value="planned">Pianificato</option>
                          <option value="in_progress">In Corso</option>
                          <option value="completed">Completato</option>
                          <option value="delayed">In Ritardo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Fase
                        </label>
                        <input
                          type="text"
                          value={milestone.phase || ''}
                          onChange={(e) => updateMilestone(milestone.id, 'phase', e.target.value || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="es. Launch"
                        />
                      </div>
                    </div>

                    {/* Deliverables */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Deliverables
                      </label>
                      <div className="space-y-2">
                        {(milestone.deliverables || []).map((deliverable, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={deliverable}
                              onChange={(e) => updateDeliverable(milestone.id, index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Deliverable..."
                            />
                            <button
                              onClick={() => removeDeliverable(milestone.id, index)}
                              className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addDeliverable(milestone.id)}
                          className="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors text-sm flex items-center space-x-1"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Aggiungi Deliverable</span>
                        </button>
                      </div>
                    </div>

                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[milestone.status]}`}>
                      {statusLabels[milestone.status]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note sulla Roadmap
            </label>
            <textarea
              value={data.notes || ''}
              onChange={(e) => onChange({ ...data, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Note aggiuntive sulla roadmap e strategia di go-to-market..."
            />
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              <strong>Suggerimento:</strong> Definisci milestone chiare e misurabili con date realistiche.
              Una buona roadmap bilancia ambizione e fattibilità.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
