import { useState, useEffect } from 'react'
import { Users, Building2, Clock, Activity, CheckCircle2, AlertCircle, UserX, Trash2, RefreshCw, Eye, Edit, Mail, Phone, Calendar, X, Save } from 'lucide-react'

interface UserData {
  _id: string
  email: string
  name: string
  role: string
  webmaster?: boolean
  registrationApprovalStatus?: string
  pivaApprovalStatus?: string
  pivaFormSubmitted?: boolean
  subscriptionStatus?: string
  createdAt: string
  updatedAt: string
  phone?: string
  company?: string
  piva?: string
}

interface UsersByType {
  admins: UserData[]
  businessPendingRegistration: UserData[]
  businessApprovedWaitingPiva: UserData[]
  businessPendingPiva: UserData[]
  businessFullyApproved: UserData[]
  businessRejected: UserData[]
}

interface RejectedUser {
  _id: string
  email: string
  name: string
  role: string
  registrationApprovalStatus?: string
  pivaApprovalStatus?: string
  createdAt: string
  updatedAt: string
}

interface UserBreakdown {
  businessPendingRegistration: number
  businessApprovedRegistration: number
  businessRejectedRegistration: number
  businessPendingPiva: number
  businessApprovedPiva: number
  businessRejectedPiva: number
  businessFullyApproved: number
}

interface ServerStats {
  totalUsers: number
  adminUsers: number
  businessUsers: number
  webmasterUsers: number
  recentRegistrations: number
  activeSubscriptions: number
  pendingRegistrations: number
  pendingPivaRequests: number
  breakdown: UserBreakdown
}

interface WebMasterUsersProps {
  stats: ServerStats | null
  onRefreshStats: () => Promise<void>
}

export default function WebMasterUsers({ stats, onRefreshStats }: WebMasterUsersProps) {
  const [usersByType, setUsersByType] = useState<UsersByType | null>(null)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [rejectedUsers, setRejectedUsers] = useState<RejectedUser[]>([])
  const [loadingRejected, setLoadingRejected] = useState(false)
  const [showRejectedUsers, setShowRejectedUsers] = useState(false)

  useEffect(() => {
    loadUsersByType()
  }, [])

  const loadUsersByType = async () => {
    try {
      setLoadingUsers(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/webmaster/users/by-type`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Errore nel caricamento degli utenti')
      }

      const data = await response.json()
      if (data.success && data.users) {
        setUsersByType(data.users)
      }
    } catch (err) {
      console.error('Error loading users by type:', err)
    } finally {
      setLoadingUsers(false)
    }
  }

  const loadRejectedUsers = async () => {
    try {
      setLoadingRejected(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/webmaster/rejected-users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Errore nel caricamento degli utenti rifiutati')
      }

      const data = await response.json()
      if (data.success && data.users) {
        setRejectedUsers(data.users)
      }
    } catch (err) {
      console.error('Error loading rejected users:', err)
    } finally {
      setLoadingRejected(false)
    }
  }

  const viewUser = (user: UserData) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const editUser = (user: UserData) => {
    setEditingUser({ ...user })
    setShowEditModal(true)
  }

  const updateUser = async () => {
    if (!editingUser) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/update-user/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          phone: editingUser.phone,
          company: editingUser.company,
          piva: editingUser.piva,
          webmaster: editingUser.webmaster,
          registrationApprovalStatus: editingUser.registrationApprovalStatus,
          pivaApprovalStatus: editingUser.pivaApprovalStatus
        })
      })

      if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento dell\'utente')
      }

      const data = await response.json()
      if (data.success) {
        alert('✅ Utente aggiornato con successo')
        setShowEditModal(false)
        setEditingUser(null)
        await Promise.all([loadUsersByType(), onRefreshStats()])
      }
    } catch (err) {
      console.error('Error updating user:', err)
      alert('❌ Errore nell\'aggiornamento dell\'utente')
    }
  }

  const deleteUserFromTable = async (userId: string) => {
    if (!confirm('Sei sicuro di voler eliminare definitivamente questo utente dal database? Questa azione non può essere annullata.')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/webmaster/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Errore nell\'eliminazione dell\'utente')
      }

      const data = await response.json()
      if (data.success) {
        alert(`✅ ${data.message}`)
        await Promise.all([loadUsersByType(), onRefreshStats()])
      }
    } catch (err) {
      console.error('Error deleting user:', err)
      alert('❌ Errore nell\'eliminazione dell\'utente')
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Sei sicuro di voler eliminare definitivamente questo utente dal database? Questa azione non può essere annullata.')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/webmaster/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Errore nell\'eliminazione dell\'utente')
      }

      const data = await response.json()
      if (data.success) {
        alert(`✅ ${data.message}`)
        await Promise.all([loadRejectedUsers(), onRefreshStats()])
      }
    } catch (err) {
      console.error('Error deleting user:', err)
      alert('❌ Errore nell\'eliminazione dell\'utente')
    }
  }

  const bulkDeleteRejectedUsers = async (type: 'registration' | 'piva' | 'all') => {
    const typeLabels = {
      registration: 'con registrazione rifiutata',
      piva: 'con P.IVA rifiutata',
      all: 'rifiutati'
    }

    if (!confirm(`Sei sicuro di voler eliminare TUTTI gli utenti ${typeLabels[type]}? Questa azione non può essere annullata.`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/webmaster/rejected-users/bulk`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      })

      if (!response.ok) {
        throw new Error('Errore nell\'eliminazione degli utenti')
      }

      const data = await response.json()
      if (data.success) {
        alert(`✅ ${data.message}`)
        await Promise.all([loadRejectedUsers(), onRefreshStats(), loadUsersByType()])
      }
    } catch (err) {
      console.error('Error bulk deleting users:', err)
      alert('❌ Errore nell\'eliminazione degli utenti')
    }
  }

  const renderUserTable = (title: string, users: UserData[], color: string, description: string) => {
    if (!users || users.length === 0) return null

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className={`bg-${color}-50 border-b border-${color}-200 p-4`}>
          <h3 className={`text-lg font-semibold text-${color}-900 flex items-center justify-between`}>
            <span>{title}</span>
            <span className={`text-sm font-normal bg-${color}-100 px-3 py-1 rounded-full`}>
              {users.length} {users.length === 1 ? 'utente' : 'utenti'}
            </span>
          </h3>
          <p className={`text-sm text-${color}-700 mt-1`}>{description}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Registrazione</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        {user.webmaster && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">WebMaster</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-3 w-3 mr-1" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(user.createdAt).toLocaleDateString('it-IT')}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {user.registrationApprovalStatus && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          user.registrationApprovalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                          user.registrationApprovalStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          Reg: {user.registrationApprovalStatus}
                        </span>
                      )}
                      {user.pivaApprovalStatus && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          user.pivaApprovalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                          user.pivaApprovalStatus === 'pending' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          P.IVA: {user.pivaApprovalStatus}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => viewUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Visualizza dettagli"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => editUser(user)}
                        className="text-green-600 hover:text-green-900"
                        title="Modifica utente"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteUserFromTable(user._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Elimina utente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {loadingUsers ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Caricamento utenti...</p>
        </div>
      ) : (
        <>
          {/* User Tables */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Gestione Utenti per Tipologia</h2>

            {usersByType && (
              <>
                {renderUserTable(
                  'Utenti Admin',
                  usersByType.admins,
                  'purple',
                  'Amministratori del sistema con accesso completo'
                )}

                {renderUserTable(
                  'Clienti Attivi',
                  usersByType.businessFullyApproved,
                  'green',
                  'Utenti business con registrazione e P.IVA approvate - visibili in Gestione Clienti'
                )}

                {renderUserTable(
                  'Pending Registrazione',
                  usersByType.businessPendingRegistration,
                  'yellow',
                  'Utenti in attesa di prima approvazione - non possono ancora accedere'
                )}

                {renderUserTable(
                  'Registrazione Approvata - In Attesa P.IVA',
                  usersByType.businessApprovedWaitingPiva,
                  'blue',
                  'Possono fare login ma devono ancora compilare il form P.IVA'
                )}

                {renderUserTable(
                  'Pending P.IVA',
                  usersByType.businessPendingPiva,
                  'orange',
                  'Form P.IVA inviato, in attesa di revisione e approvazione'
                )}

                {renderUserTable(
                  'Utenti Rifiutati',
                  usersByType.businessRejected,
                  'red',
                  'Utenti con registrazione o P.IVA rifiutata'
                )}
              </>
            )}
          </div>

          {/* User Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Breakdown Dettagliato Utenti
            </h2>

            <div className="space-y-4">
              {/* Total Users Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Totale Utenti Sistema</p>
                    <p className="text-2xl font-bold text-blue-600">{stats?.totalUsers || 0}</p>
                  </div>
                  <Users className="h-10 w-10 text-blue-400" />
                </div>
              </div>

              {/* Admin Users */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-900 flex items-center">
                      <Activity className="h-4 w-4 mr-2" />
                      Utenti Admin
                    </p>
                    <p className="text-xl font-bold text-purple-600">{stats?.adminUsers || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-purple-700">WebMasters</p>
                    <p className="text-lg font-semibold text-purple-600">{stats?.webmasterUsers || 0}</p>
                  </div>
                </div>
              </div>

              {/* Business Users - Detailed Breakdown */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-900 flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    Utenti Business - Totale
                  </p>
                  <p className="text-2xl font-bold text-gray-700">{stats?.businessUsers || 0}</p>
                </div>

                <div className="space-y-3 mt-4">
                  {/* Fully Approved - Green */}
                  <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-green-900">Clienti Attivi (Gestione Clienti)</p>
                          <p className="text-xs text-green-700">Registrazione + P.IVA approvate</p>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-green-600">{stats?.breakdown?.businessFullyApproved || 0}</p>
                    </div>
                  </div>

                  {/* Pending Registration - Yellow */}
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-yellow-900">Pending Registrazione</p>
                          <p className="text-xs text-yellow-700">In attesa di prima approvazione</p>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-yellow-600">{stats?.breakdown?.businessPendingRegistration || 0}</p>
                    </div>
                  </div>

                  {/* Approved Registration (waiting for P.IVA form) - Blue */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Activity className="h-5 w-5 text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Registrazione Approvata</p>
                          <p className="text-xs text-blue-700">Possono compilare form P.IVA</p>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-blue-600">{(stats?.breakdown?.businessApprovedRegistration || 0) - (stats?.breakdown?.businessFullyApproved || 0)}</p>
                    </div>
                  </div>

                  {/* Pending P.IVA - Orange */}
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-orange-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-orange-900">Pending P.IVA</p>
                          <p className="text-xs text-orange-700">Form P.IVA inviato, in revisione</p>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-orange-600">{stats?.breakdown?.businessPendingPiva || 0}</p>
                    </div>
                  </div>

                  {/* Rejected Registration - Red */}
                  {(stats?.breakdown?.businessRejectedRegistration || 0) > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-red-900">Registrazione Rifiutata</p>
                            <p className="text-xs text-red-700">Non approvati</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-xl font-bold text-red-600">{stats?.breakdown?.businessRejectedRegistration || 0}</p>
                          <button
                            onClick={() => bulkDeleteRejectedUsers('registration')}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 flex items-center gap-1"
                            title="Elimina tutti gli utenti con registrazione rifiutata"
                          >
                            <Trash2 className="h-3 w-3" />
                            Elimina Tutti
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rejected P.IVA - Red */}
                  {(stats?.breakdown?.businessRejectedPiva || 0) > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-red-900">P.IVA Rifiutata</p>
                            <p className="text-xs text-red-700">Richiesta P.IVA respinta</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-xl font-bold text-red-600">{stats?.breakdown?.businessRejectedPiva || 0}</p>
                          <button
                            onClick={() => bulkDeleteRejectedUsers('piva')}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 flex items-center gap-1"
                            title="Elimina tutti gli utenti con P.IVA rifiutata"
                          >
                            <Trash2 className="h-3 w-3" />
                            Elimina Tutti
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* View/Manage All Rejected Users */}
                  {((stats?.breakdown?.businessRejectedRegistration || 0) > 0 || (stats?.breakdown?.businessRejectedPiva || 0) > 0) && (
                    <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
                      <button
                        onClick={() => {
                          setShowRejectedUsers(!showRejectedUsers)
                          if (!showRejectedUsers && rejectedUsers.length === 0) {
                            loadRejectedUsers()
                          }
                        }}
                        className="w-full flex items-center justify-between text-gray-700 hover:text-gray-900"
                      >
                        <div className="flex items-center gap-2">
                          <UserX className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {showRejectedUsers ? 'Nascondi' : 'Mostra'} Dettagli Utenti Rifiutati
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                            {(stats?.breakdown?.businessRejectedRegistration || 0) + (stats?.breakdown?.businessRejectedPiva || 0)} totali
                          </span>
                          <span className={`transform transition-transform ${showRejectedUsers ? 'rotate-180' : ''}`}>▼</span>
                        </div>
                      </button>

                      {showRejectedUsers && (
                        <div className="mt-4 space-y-2">
                          {loadingRejected ? (
                            <div className="text-center py-4">
                              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                              <p className="text-sm text-gray-500 mt-2">Caricamento...</p>
                            </div>
                          ) : rejectedUsers.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">Nessun utente rifiutato</p>
                          ) : (
                            <>
                              <div className="flex justify-end mb-2">
                                <button
                                  onClick={() => bulkDeleteRejectedUsers('all')}
                                  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Elimina Tutti gli Utenti Rifiutati
                                </button>
                              </div>
                              <div className="max-h-96 overflow-y-auto space-y-2">
                                {rejectedUsers.map(rejUser => (
                                  <div key={rejUser._id} className="bg-white border border-red-200 rounded p-3 flex items-center justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900">{rejUser.name}</p>
                                      <p className="text-sm text-gray-600">{rejUser.email}</p>
                                      <div className="flex gap-2 mt-1">
                                        {rejUser.registrationApprovalStatus === 'rejected' && (
                                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Registrazione Rifiutata</span>
                                        )}
                                        {rejUser.pivaApprovalStatus === 'rejected' && (
                                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">P.IVA Rifiutata</span>
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => deleteUser(rejUser._id)}
                                      className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center gap-1"
                                      title={`Elimina ${rejUser.name}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Elimina
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <p className="text-xs text-indigo-700 mb-1">Nuove Registrazioni (30gg)</p>
                  <p className="text-lg font-bold text-indigo-600">{stats?.recentRegistrations || 0}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-xs text-emerald-700 mb-1">Sottoscrizioni Attive</p>
                  <p className="text-lg font-bold text-emerald-600">{stats?.activeSubscriptions || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Dettagli Utente</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Informazioni Base
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Nome</p>
                    <p className="text-sm font-medium text-gray-900">{selectedUser.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {selectedUser.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ruolo</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{selectedUser.role}</p>
                  </div>
                  {selectedUser.webmaster && (
                    <div>
                      <p className="text-xs text-gray-500">Permessi Speciali</p>
                      <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">WebMaster</span>
                    </div>
                  )}
                  {selectedUser.phone && (
                    <div>
                      <p className="text-xs text-gray-500">Telefono</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {selectedUser.phone}
                      </p>
                    </div>
                  )}
                  {selectedUser.company && (
                    <div>
                      <p className="text-xs text-gray-500">Azienda</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        <Building2 className="h-3 w-3 mr-1" />
                        {selectedUser.company}
                      </p>
                    </div>
                  )}
                  {selectedUser.piva && (
                    <div>
                      <p className="text-xs text-gray-500">P.IVA</p>
                      <p className="text-sm font-medium text-gray-900">{selectedUser.piva}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Stato e Approvazioni
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedUser.registrationApprovalStatus && (
                    <div>
                      <p className="text-xs text-gray-500">Stato Registrazione</p>
                      <span className={`inline-block text-xs px-2 py-1 rounded ${
                        selectedUser.registrationApprovalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                        selectedUser.registrationApprovalStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {selectedUser.registrationApprovalStatus}
                      </span>
                    </div>
                  )}
                  {selectedUser.pivaFormSubmitted !== undefined && (
                    <div>
                      <p className="text-xs text-gray-500">Form P.IVA</p>
                      <span className={`inline-block text-xs px-2 py-1 rounded ${
                        selectedUser.pivaFormSubmitted ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedUser.pivaFormSubmitted ? 'Inviato' : 'Non inviato'}
                      </span>
                    </div>
                  )}
                  {selectedUser.pivaApprovalStatus && (
                    <div>
                      <p className="text-xs text-gray-500">Stato P.IVA</p>
                      <span className={`inline-block text-xs px-2 py-1 rounded ${
                        selectedUser.pivaApprovalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                        selectedUser.pivaApprovalStatus === 'pending' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {selectedUser.pivaApprovalStatus}
                      </span>
                    </div>
                  )}
                  {selectedUser.subscriptionStatus && (
                    <div>
                      <p className="text-xs text-gray-500">Sottoscrizione</p>
                      <span className={`inline-block text-xs px-2 py-1 rounded ${
                        selectedUser.subscriptionStatus === 'active' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedUser.subscriptionStatus}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Date Importanti
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Data Registrazione</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedUser.createdAt).toLocaleString('it-IT')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ultimo Aggiornamento</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedUser.updatedAt).toLocaleString('it-IT')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowUserModal(false)
                    editUser(selectedUser)
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Modifica
                </button>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Modifica Utente</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingUser(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Basic Info Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                  <input
                    type="text"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Azienda</label>
                  <input
                    type="text"
                    value={editingUser.company || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">P.IVA</label>
                <input
                  type="text"
                  value={editingUser.piva || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, piva: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Approval Status */}
              {editingUser.role === 'business' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stato Registrazione</label>
                      <select
                        value={editingUser.registrationApprovalStatus || 'pending'}
                        onChange={(e) => setEditingUser({ ...editingUser, registrationApprovalStatus: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stato P.IVA</label>
                      <select
                        value={editingUser.pivaApprovalStatus || 'pending'}
                        onChange={(e) => setEditingUser({ ...editingUser, pivaApprovalStatus: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* WebMaster Permission */}
              {editingUser.role === 'admin' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingUser.webmaster || false}
                      onChange={(e) => setEditingUser({ ...editingUser, webmaster: e.target.checked })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-900">Permessi WebMaster</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Consente all'utente di accedere al pannello WebMaster
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingUser(null)
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Annulla
                </button>
                <button
                  onClick={updateUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Salva Modifiche
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
