import { useState } from 'react'
import { Plus, Trash2, Edit2, Check, X, Users, ChevronDown, ChevronUp, Eye } from 'lucide-react'
import { TeamSectionData, TeamMember } from '../../../../types/businessPlan'
import TeamOrgChart from './TeamOrgChart'

interface TeamSectionEditorProps {
  data: TeamSectionData
  onChange: (data: TeamSectionData) => void
  isExpanded: boolean
  onToggle: () => void
}

export default function TeamSectionEditor({
  data,
  onChange,
  isExpanded,
  onToggle
}: TeamSectionEditorProps) {
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [editingMember, setEditingMember] = useState<Partial<TeamMember>>({})

  const handleAddMember = () => {
    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: '',
      role: '',
      department: '',
      description: ''
    }
    setEditingMemberId(newMember.id)
    setEditingMember(newMember)
  }

  const handleSaveMember = () => {
    if (!editingMember.name || !editingMember.role) {
      alert('Nome e ruolo sono obbligatori')
      return
    }

    const updatedMembers = editingMemberId && data.members.some(m => m.id === editingMemberId)
      ? data.members.map(m => m.id === editingMemberId ? editingMember as TeamMember : m)
      : [...data.members, editingMember as TeamMember]

    onChange({
      ...data,
      members: updatedMembers
    })

    setEditingMemberId(null)
    setEditingMember({})
  }

  const handleCancelEdit = () => {
    setEditingMemberId(null)
    setEditingMember({})
  }

  const handleEditMember = (member: TeamMember) => {
    setEditingMemberId(member.id)
    setEditingMember({ ...member })
  }

  const handleDeleteMember = (memberId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo membro del team?')) {
      onChange({
        ...data,
        members: data.members.filter(m => m.id !== memberId)
      })
    }
  }

  const handleDescriptionChange = (description: string) => {
    onChange({
      ...data,
      description
    })
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

            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Team</h3>
              <p className="text-sm text-gray-600">
                Membri del team e struttura organizzativa
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            {data.members.length} {data.members.length === 1 ? 'membro' : 'membri'}
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-6">
          {/* Team Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrizione del Team
            </label>
            <textarea
              value={data.description || ''}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Descrivi brevemente il team e la sua struttura organizzativa..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Team Members List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Membri del Team</h4>
              <button
                onClick={handleAddMember}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Aggiungi Membro</span>
              </button>
            </div>

            {/* Editing Form */}
            {editingMemberId && (
              <div className="bg-white p-4 rounded-lg border-2 border-blue-500 mb-4 space-y-4">
                <h5 className="font-semibold text-gray-900">
                  {data.members.some(m => m.id === editingMemberId) ? 'Modifica Membro' : 'Nuovo Membro'}
                </h5>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={editingMember.name || ''}
                      onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                      placeholder="es. Mario Rossi"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ruolo *
                    </label>
                    <input
                      type="text"
                      value={editingMember.role || ''}
                      onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                      placeholder="es. CEO, CTO, Marketing Manager"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dipartimento
                    </label>
                    <input
                      type="text"
                      value={editingMember.department || ''}
                      onChange={(e) => setEditingMember({ ...editingMember, department: e.target.value })}
                      placeholder="es. CDA, Marketing, Tech"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editingMember.email || ''}
                      onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={editingMember.linkedIn || ''}
                      onChange={(e) => setEditingMember({ ...editingMember, linkedIn: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Foto URL
                    </label>
                    <input
                      type="url"
                      value={editingMember.photoUrl || ''}
                      onChange={(e) => setEditingMember({ ...editingMember, photoUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrizione & Esperienza
                  </label>
                  <textarea
                    value={editingMember.description || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, description: e.target.value })}
                    placeholder="Descrivi l'esperienza, le competenze e le responsabilità..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSaveMember}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    <span>Salva</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Annulla</span>
                  </button>
                </div>
              </div>
            )}

            {/* Members Grid */}
            {data.members.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Nessun membro del team aggiunto</p>
                <p className="text-sm text-gray-400 mt-1">Clicca su "Aggiungi Membro" per iniziare</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-3">
                      {member.photoUrl ? (
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-lg">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-gray-900">{member.name}</h5>
                        <p className="text-sm text-blue-600">{member.role}</p>
                        {member.department && (
                          <p className="text-xs text-gray-500 mt-1">{member.department}</p>
                        )}
                        {member.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {member.description}
                          </p>
                        )}
                        {(member.email || member.linkedIn) && (
                          <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                            {member.email && <span>{member.email}</span>}
                            {member.linkedIn && <span>• LinkedIn</span>}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditMember(member)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Modifica"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Elimina"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Org Chart Type Selector */}
          {data.members.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo di Visualizzazione Organigramma
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="orgChartType"
                    value="hierarchical"
                    checked={data.orgChartType === 'hierarchical' || !data.orgChartType}
                    onChange={(e) => onChange({ ...data, orgChartType: e.target.value as 'hierarchical' | 'flat' })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Gerarchico</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="orgChartType"
                    value="flat"
                    checked={data.orgChartType === 'flat'}
                    onChange={(e) => onChange({ ...data, orgChartType: e.target.value as 'hierarchical' | 'flat' })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Piatto</span>
                </label>
              </div>
            </div>
          )}

          {/* Org Chart Visualization */}
          {data.members.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Eye className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Anteprima Organigramma</h4>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-lg border-2 border-blue-100">
                <TeamOrgChart
                  members={data.members}
                  type={data.orgChartType || 'hierarchical'}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
