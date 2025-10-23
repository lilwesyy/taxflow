import { UserPlus, CheckCircle, XCircle, Eye, Mail, Phone, Clock, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import Modal from '../../../common/Modal'
import NoteModal from '../../../common/NoteModal'
import apiService from '../../../../services/api'
import { useToast } from '../../../../context/ToastContext'
import { logger } from '../../../../utils/logger'

interface PendingUser {
  _id: string
  name: string
  email: string
  phone?: string
  createdAt: string
  registrationApprovalStatus: 'pending' | 'approved' | 'rejected'
  note?: string
}

interface PendingRegistrationsProps {
  onCountChange?: (count: number) => void
}

export default function PendingRegistrations({ onCountChange }: PendingRegistrationsProps = {}) {
  const { showToast } = useToast()
  const [users, setUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ userId: string; approved: boolean } | null>(null)

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  const fetchPendingUsers = async () => {
    try {
      setLoading(true)
      const response = await apiService.getPendingRegistrations()
      if (response.success) {
        setUsers(response.users)
        // Notify parent component of count change
        if (onCountChange) {
          onCountChange(response.users?.length || 0)
        }
      }
    } catch (error) {
      logger.error('Error fetching pending registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = (userId: string, approved: boolean) => {
    setPendingAction({ userId, approved })
    setShowNoteModal(true)
  }

  const handleConfirmApprove = async (note: string) => {
    if (!pendingAction) return

    try {
      setActionLoading(true)
      const response = await apiService.approveRegistration(
        pendingAction.userId,
        pendingAction.approved,
        note || undefined
      )

      if (response.success) {
        await fetchPendingUsers()
        setSelectedUser(null)
        showToast(response.message, 'success')
      }
    } catch (error) {
      logger.error('Error approving registration:', error)
      showToast(error instanceof Error ? error.message : 'Errore durante l\'approvazione', 'error')
    } finally {
      setActionLoading(false)
      setPendingAction(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nuove Registrazioni</h2>
          <p className="text-gray-600 text-sm mt-1">Approva le registrazioni per permettere l'accesso</p>
        </div>
        <div className="bg-yellow-100 px-4 py-2 rounded-lg">
          <span className="text-yellow-800 font-semibold">{users.length} in attesa</span>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna registrazione in attesa</h3>
          <p className="text-gray-500">Le nuove registrazioni appariranno qui</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Nome</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Contatti</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Data Registrazione</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <UserPlus className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{user.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center text-gray-600">
                          <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center text-gray-600">
                            <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-sm">{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm">{formatDate(user.createdAt)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-primary-600 hover:text-primary-700 p-2 rounded hover:bg-primary-50 transition-all"
                          title="Visualizza dettagli"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleApprove(user._id, true)}
                          disabled={actionLoading}
                          className="text-green-600 hover:text-green-700 p-2 rounded hover:bg-green-50 transition-all disabled:opacity-50"
                          title="Approva"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleApprove(user._id, false)}
                          disabled={actionLoading}
                          className="text-red-600 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-all disabled:opacity-50"
                          title="Respingi"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={selectedUser ? `Dettagli Registrazione - ${selectedUser.name}` : ""}
        maxWidth="2xl"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-yellow-900 mb-1">In attesa di approvazione</h4>
                  <p className="text-sm text-yellow-800">
                    Questo utente si è registrato e attende di essere approvato per poter accedere alla piattaforma.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Nome Completo</label>
                <p className="font-medium text-gray-900">{selectedUser.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="font-medium text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Telefono</label>
                <p className="font-medium text-gray-900">
                  {selectedUser.phone ? (selectedUser.phone.startsWith('+39') ? selectedUser.phone : `+39 ${selectedUser.phone}`) : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Data Registrazione</label>
                <p className="font-medium text-gray-900">{formatDate(selectedUser.createdAt)}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-600">Stato</label>
                <div>
                  <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600">
                    <Clock className="h-3 w-3 mr-1" />
                    In attesa
                  </span>
                </div>
              </div>
            </div>

            {selectedUser.note && (
              <div>
                <label className="text-sm text-gray-600">Note</label>
                <div className="p-4 bg-gray-50 rounded-lg mt-2">
                  <p className="text-gray-700">{selectedUser.note}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  if (selectedUser) {
                    handleApprove(selectedUser._id, false)
                  }
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all"
              >
                {actionLoading ? 'Elaborazione...' : 'Respingi'}
              </button>
              <button
                onClick={() => {
                  if (selectedUser) {
                    handleApprove(selectedUser._id, true)
                  }
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
              >
                {actionLoading ? 'Elaborazione...' : 'Approva Registrazione'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Note Modal */}
      <NoteModal
        isOpen={showNoteModal}
        onClose={() => {
          setShowNoteModal(false)
          setPendingAction(null)
        }}
        onConfirm={handleConfirmApprove}
        title={pendingAction?.approved ? 'Aggiungi una nota' : 'Motivo del rifiuto'}
        placeholder={pendingAction?.approved ? 'Aggiungi una nota (opzionale)...' : 'Motivo del rifiuto (opzionale)...'}
        confirmButtonText={pendingAction?.approved ? 'Approva' : 'Respingi'}
        confirmButtonColor={pendingAction?.approved ? 'green' : 'red'}
      />
    </div>
  )
}
