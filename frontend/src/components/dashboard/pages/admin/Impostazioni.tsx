import { User, Bell, Shield, Database, Mail, CreditCard, Save, Eye, EyeOff, FileText, CheckCircle, XCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../../../context/AuthContext'
import { useToast } from '../../../../context/ToastContext'
import Modal from '../../../common/Modal'
import { logger } from '../../../../utils/logger'
import {
  SettingsProfile,
  SettingsPassword,
  SettingsSecurity,
  type Session
} from '../../shared/settings'

interface ProfileData {
  nome: string
  cognome: string
  email: string
  telefono?: string
  ruolo?: string
  bio?: string
  indirizzo?: string
  codiceFiscale?: string
  ordineIscrizione?: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function Impostazioni() {
  const { user, token, updateUser } = useAuth()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('profile')
  const [showApiKey, setShowApiKey] = useState(false)
  const [loading, setLoading] = useState(false)

  const [profileData, setProfileData] = useState<ProfileData>({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    ruolo: '',
    bio: '',
    indirizzo: '',
    codiceFiscale: '',
    ordineIscrizione: ''
  })

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user || !token) return

      try {
        const API_URL = import.meta.env.VITE_API_URL || '/api'
        const response = await fetch(`${API_URL}/user/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          const userData = data.user

          // Split name into first and last name
          const fullName = userData.name || ''
          const nameParts = fullName.trim().split(' ')
          const firstName = nameParts[0] || ''
          const lastName = nameParts.slice(1).join(' ') || ''

          setProfileData({
            nome: firstName,
            cognome: lastName,
            email: userData.email || '',
            telefono: userData.phone || '',
            ruolo: userData.professionalRole || '',
            bio: userData.bio || '',
            indirizzo: userData.address || '',
            codiceFiscale: userData.fiscalCode || '',
            ordineIscrizione: userData.registrationNumber || ''
          })

          if (userData.notificationSettings) {
            setNotificationSettings(userData.notificationSettings)
          }
        }
      } catch (error) {
        logger.error('Error loading profile:', error)
      }
    }

    loadUserProfile()
  }, [user, token])

  const [notificationSettings, setNotificationSettings] = useState({
    emailNewClient: true,
    emailNewRequest: true,
    emailPayment: false,
    pushNotifications: true,
    weeklyReport: true,
    smsUrgenti: false,
    promozionali: false
  })

  const [integrationSettings, setIntegrationSettings] = useState({
    apiKey: 'sk_live_1234567890abcdef',
    webhookUrl: 'https://taxflow.it/api/webhooks',
    autoBackup: true,
    backupFrequency: 'daily'
  })

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [disable2FAPassword, setDisable2FAPassword] = useState('')

  const [sessions, setSessions] = useState<Session[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState(43200) // Default 30 days

  // Invoicetronic states
  const [invoicetronicStatus, setInvoicetronicStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [invoicetronicMessage, setInvoicetronicMessage] = useState('')
  const [testingInvoicetronic, setTestingInvoicetronic] = useState(false)
  const [invoicetronicData, setInvoicetronicData] = useState<{
    operationLeft?: number
    signatureLeft?: number
    sandboxMode?: boolean
  }>({})

  const tabs = [
    {
      id: 'profile',
      name: 'Profilo',
      icon: User,
      description: 'Gestisci i tuoi dati personali e professionali'
    },
    {
      id: 'notifications',
      name: 'Notifiche',
      icon: Bell,
      description: 'Configura le preferenze di notifica'
    },
    {
      id: 'security',
      name: 'Sicurezza',
      icon: Shield,
      description: 'Password, 2FA, sessioni e privacy'
    },
    {
      id: 'integrations',
      name: 'Integrazioni',
      icon: Database,
      description: 'API e servizi esterni'
    }
  ]

  // Load 2FA status
  useEffect(() => {
    const load2FAStatus = async () => {
      if (!token) return

      try {
        const API_URL = import.meta.env.VITE_API_URL || '/api'
        const response = await fetch(`${API_URL}/security/2fa/status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setTwoFactorEnabled(data.enabled)
        }
      } catch (error) {
        logger.error('Error loading 2FA status:', error)
      }
    }

    load2FAStatus()
  }, [token])

  const handle2FAEnable = async () => {
    setLoading(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/security/2fa/enable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Errore durante l\'attivazione 2FA')
      }

      const data = await response.json()
      setQrCode(data.qrCode)
      setShow2FAModal(true)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Errore sconosciuto', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handle2FAVerify = async () => {
    if (!verificationCode) {
      showToast('Inserisci il codice di verifica', 'warning')
      return
    }

    setLoading(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/security/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token: verificationCode })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Codice di verifica non valido')
      }

      setTwoFactorEnabled(true)
      setShow2FAModal(false)
      setVerificationCode('')
      setQrCode('')
      showToast('2FA attivato con successo!', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Errore sconosciuto', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handle2FADisable = async () => {
    if (!disable2FAPassword) {
      showToast('Inserisci la password per disattivare 2FA', 'warning')
      return
    }

    setLoading(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/security/2fa/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: disable2FAPassword })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Errore durante la disattivazione 2FA')
      }

      setTwoFactorEnabled(false)
      setDisable2FAPassword('')
      showToast('2FA disattivato con successo!', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Errore sconosciuto', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleTestInvoicetronicStatus = async () => {
    setTestingInvoicetronic(true)
    setInvoicetronicStatus('testing')
    setInvoicetronicMessage('Connessione a Invoicetronic in corso...')

    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/invoicetronic/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setInvoicetronicStatus('success')
        setInvoicetronicData({
          operationLeft: data.operationLeft,
          signatureLeft: data.signatureLeft,
          sandboxMode: data.sandboxMode
        })

        const mode = data.sandboxMode ? 'Sandbox' : 'Produzione'
        setInvoicetronicMessage(`Connesso con successo! Ambiente: ${mode}`)
        showToast('Invoicetronic connesso correttamente!', 'success')
      } else {
        setInvoicetronicStatus('error')
        setInvoicetronicMessage(data.message || 'Errore di connessione')
        showToast('Errore nella connessione a Invoicetronic', 'error')
      }
    } catch (error) {
      setInvoicetronicStatus('error')
      setInvoicetronicMessage('Errore di connessione al server')
      showToast('Errore di connessione', 'error')
    } finally {
      setTestingInvoicetronic(false)
    }
  }

  // Profile update handler
  const handleProfileUpdate = async (data: ProfileData) => {
    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/user/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `${data.nome} ${data.cognome}`.trim(),
          email: data.email,
          phone: data.telefono,
          professionalRole: data.ruolo,
          bio: data.bio,
          address: data.indirizzo,
          fiscalCode: data.codiceFiscale,
          registrationNumber: data.ordineIscrizione
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }

      const responseData = await response.json()
      updateUser(responseData.user)

      // Split name into first and last name
      const fullName = responseData.user.name || ''
      const nameParts = fullName.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      // Update local state
      setProfileData({
        nome: firstName,
        cognome: lastName,
        email: responseData.user.email || '',
        telefono: responseData.user.phone || '',
        ruolo: responseData.user.professionalRole || '',
        bio: responseData.user.bio || '',
        indirizzo: responseData.user.address || '',
        codiceFiscale: responseData.user.fiscalCode || '',
        ordineIscrizione: responseData.user.registrationNumber || ''
      })

      showToast('Profilo aggiornato con successo!', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Errore durante il salvataggio', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Password update handler
  const handlePasswordUpdate = async (data: PasswordData) => {
    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/user/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update password')
      }

      showToast('Password aggiornata con successo!', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Errore durante il salvataggio', 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Sessions handlers
  const loadSessions = async () => {
    setLoadingSessions(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/security/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const sessions = data.sessions

        // Auto-terminate sessions if more than 3
        if (sessions.length > 3) {
          const sortedSessions = [...sessions].sort((a: Session, b: Session) =>
            new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime()
          )

          const sessionsToTerminate = sortedSessions.slice(0, sessions.length - 3)

          for (const session of sessionsToTerminate) {
            try {
              await fetch(`${API_URL}/security/sessions/${session.id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              })
            } catch (err) {
              logger.error('Error terminating session:', err)
            }
          }

          const updatedResponse = await fetch(`${API_URL}/security/sessions`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (updatedResponse.ok) {
            const updatedData = await updatedResponse.json()
            setSessions(updatedData.sessions)
          }
        } else {
          setSessions(sessions)
        }
      }
    } catch (error) {
      logger.error('Error loading sessions:', error)
    } finally {
      setLoadingSessions(false)
    }
  }


  const handleUpdateTimeout = async (minutes: number) => {
    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/security/settings/session-timeout`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionTimeout: minutes })
      })

      if (response.ok) {
        setSessionTimeout(minutes)
        showToast('Timeout sessione aggiornato con successo', 'success')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Errore nell\'aggiornamento del timeout')
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Errore sconosciuto', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/security/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Errore durante la terminazione della sessione')
      }

      showToast('Sessione terminata con successo', 'success')
      loadSessions()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Errore sconosciuto', 'error')
    }
  }

  const handleTerminateAllSessions = async () => {
    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/security/sessions`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        showToast('Tutte le altre sessioni sono state terminate', 'success')
        loadSessions()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Errore nella terminazione delle sessioni')
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Errore sconosciuto', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCleanupSessions = async () => {
    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/security/sessions/cleanup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        showToast(data.message, 'success')
        loadSessions()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Errore nella pulizia delle sessioni')
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Errore sconosciuto', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/user/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          notificationSettings
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update notifications')
      }

      const data = await response.json()

      if (data.user?.notificationSettings) {
        setNotificationSettings(data.user.notificationSettings)
      }

      showToast('Preferenze notifiche aggiornate con successo!', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Errore durante il salvataggio', 'error')
    } finally {
      setLoading(false)
    }
  }

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      {/* Email Notifications Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mr-4">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Notifiche Email</h3>
            <p className="text-sm text-gray-600">Ricevi aggiornamenti importanti via email</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <label className="group flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.emailNewClient}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNewClient: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
            />
            <div className="ml-3 flex-1">
              <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Nuovo Cliente</p>
              <p className="text-sm text-gray-600">Registrazioni</p>
            </div>
          </label>

          <label className="group flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.emailNewRequest}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNewRequest: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
            />
            <div className="ml-3 flex-1">
              <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Richieste P.IVA</p>
              <p className="text-sm text-gray-600">Nuove pratiche</p>
            </div>
          </label>

          <label className="group flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.emailPayment}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailPayment: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
            />
            <div className="ml-3 flex-1">
              <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Pagamenti Ricevuti</p>
              <p className="text-sm text-gray-600">Transazioni</p>
            </div>
          </label>

          <label className="group flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.weeklyReport}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, weeklyReport: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
            />
            <div className="ml-3 flex-1">
              <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Report Settimanale</p>
              <p className="text-sm text-gray-600">Statistiche clienti</p>
            </div>
          </label>
        </div>
      </div>

      {/* Other Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Push Notifications */}
        <div className="group border-2 border-gray-200 rounded-xl p-5 hover:border-green-300 hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.pushNotifications}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Notifiche Push</h4>
          <p className="text-sm text-gray-600">Notifiche in tempo reale sul browser</p>
        </div>

        {/* SMS Notifications */}
        <div className="group border-2 border-gray-200 rounded-xl p-5 hover:border-orange-300 hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.smsUrgenti || false}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, smsUrgenti: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">SMS Urgenti</h4>
          <p className="text-sm text-gray-600">SMS per eventi critici</p>
        </div>

        {/* Promotional */}
        <div className="group border-2 border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.promozionali || false}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, promozionali: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Email Promozionali</h4>
          <p className="text-sm text-gray-600">Aggiornamenti e novità</p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveNotifications}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-5 w-5 mr-2" />
          {loading ? 'Salvataggio...' : 'Salva Preferenze'}
        </button>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Password Section */}
      <SettingsPassword onUpdate={handlePasswordUpdate} loading={loading} />

      {/* 2FA Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center mr-3">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900">Autenticazione a Due Fattori</h4>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div>
              <p className="font-medium text-gray-900">Stato 2FA</p>
              <p className="text-sm text-gray-600">Proteggi il tuo account con un livello aggiuntivo di sicurezza</p>
            </div>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${twoFactorEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
              {twoFactorEnabled ? 'Attiva' : 'Non attiva'}
            </span>
          </div>

          {!twoFactorEnabled ? (
            <button
              onClick={handle2FAEnable}
              disabled={loading}
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm disabled:opacity-50"
            >
              Attiva 2FA
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="password"
                placeholder="Inserisci password per disattivare"
                value={disable2FAPassword}
                onChange={(e) => setDisable2FAPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handle2FADisable}
                disabled={loading || !disable2FAPassword}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
              >
                Disattiva 2FA
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sessions Section */}
      <SettingsSecurity
        sessions={sessions}
        sessionTimeout={sessionTimeout}
        onTerminateSession={handleTerminateSession}
        onTerminateAllSessions={handleTerminateAllSessions}
        onCleanupSessions={handleCleanupSessions}
        onUpdateTimeout={handleUpdateTimeout}
        onLoadSessions={loadSessions}
        loading={loading}
        loadingSessions={loadingSessions}
      />
    </div>
  )

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integrazioni e API</h3>

        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Chiave API</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={integrationSettings.apiKey}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                    Rigenera
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Usa questa chiave per autenticare le chiamate API
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={integrationSettings.webhookUrl}
                  onChange={(e) => setIntegrationSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://yoursite.com/webhook"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-4">Backup Automatico</h4>
            <div className="space-y-4">
              <div className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                <div>
                  <p className="font-medium text-gray-900">Backup Automatico</p>
                  <p className="text-sm text-gray-600">Backup automatico dei dati ogni giorno</p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={integrationSettings.autoBackup}
                    onChange={(e) => setIntegrationSettings(prev => ({ ...prev, autoBackup: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </label>
              </div>

              {integrationSettings.autoBackup && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequenza Backup
                  </label>
                  <select
                    value={integrationSettings.backupFrequency}
                    onChange={(e) => setIntegrationSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="daily">Giornaliero</option>
                    <option value="weekly">Settimanale</option>
                    <option value="monthly">Mensile</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-4">Fatturazione Elettronica</h4>
            <div className="space-y-3">
              <div className="group border-2 border-blue-300 bg-blue-50 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Invoicetronic Fatturazione Elettronica</p>
                      <p className="text-sm text-gray-600">Sistema di fatturazione elettronica per i clienti</p>
                    </div>
                  </div>
                  {invoicetronicStatus === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {invoicetronicStatus === 'error' && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>

                {invoicetronicMessage && (
                  <div className={`mb-4 p-3 rounded-lg text-sm ${
                    invoicetronicStatus === 'success' ? 'bg-green-100 text-green-800' :
                    invoicetronicStatus === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {invoicetronicMessage}
                  </div>
                )}

                {invoicetronicStatus === 'success' && invoicetronicData.operationLeft !== undefined && (
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <p className="text-xs text-gray-600 mb-1">Operazioni Rimaste</p>
                      <p className="text-2xl font-bold text-blue-600">{invoicetronicData.operationLeft}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <p className="text-xs text-gray-600 mb-1">Firme Rimaste</p>
                      <p className="text-2xl font-bold text-blue-600">{invoicetronicData.signatureLeft}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleTestInvoicetronicStatus}
                  disabled={testingInvoicetronic}
                  className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testingInvoicetronic ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Connessione in corso...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Verifica Stato Invoicetronic
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-600 mt-3">
                  Verifica lo stato dell'account Invoicetronic e i crediti disponibili
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-4">Altri Servizi</h4>
            <div className="space-y-3">
              <div className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Stripe</p>
                    <p className="text-sm text-gray-600">Pagamenti online</p>
                  </div>
                </div>
                <span className="text-sm text-green-600 font-medium">Connesso</span>
              </div>

              <div className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Mail className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">SendGrid</p>
                    <p className="text-sm text-gray-600">Invio email</p>
                  </div>
                </div>
                <button className="text-primary-600 hover:text-primary-700 transition-colors text-sm font-medium">
                  Connetti
                </button>
              </div>

              <div className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <Database className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Agenzia Entrate API</p>
                    <p className="text-sm text-gray-600">Verifica P.IVA automatica</p>
                  </div>
                </div>
                <span className="text-sm text-green-600 font-medium">Connesso</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => showToast('Integrazioni salvate!', 'success')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            Salva Integrazioni
          </button>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <SettingsProfile profileData={profileData} onUpdate={handleProfileUpdate} loading={loading} showProfessionalFields={true} />
      case 'notifications':
        return renderNotificationsTab()
      case 'security':
        return renderSecurityTab()
      case 'integrations':
        return renderIntegrationsTab()
      default:
        return <SettingsProfile profileData={profileData} onUpdate={handleProfileUpdate} loading={loading} showProfessionalFields={true} />
    }
  }

  return (
    <div className="space-y-6">
      {/* 2FA Modal */}
      <Modal
        isOpen={show2FAModal}
        onClose={() => {
          setShow2FAModal(false)
          setVerificationCode('')
          setQrCode('')
        }}
        title="Attiva Autenticazione a Due Fattori"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Scansiona questo codice QR con un'app di autenticazione (Google Authenticator, Authy, ecc.):
            </p>
            {qrCode && (
              <div className="flex justify-center my-4">
                <img src={qrCode} alt="QR Code" className="border border-gray-200 rounded-lg p-2" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inserisci il codice di verifica a 6 cifre
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              placeholder="123456"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-widest"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShow2FAModal(false)
                setVerificationCode('')
                setQrCode('')
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Annulla
            </button>
            <button
              onClick={handle2FAVerify}
              disabled={loading || verificationCode.length !== 6}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifica...' : 'Verifica e Attiva'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-lg text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <tab.icon className="h-5 w-5" />
                <span className="font-medium text-sm">{tab.name}</span>
              </div>
              <p className={`text-xs ${activeTab === tab.id ? 'text-blue-100' : 'text-gray-500'}`}>
                {tab.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
        {renderTabContent()}
      </div>
    </div>
  )
}
