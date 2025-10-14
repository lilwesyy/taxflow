import { User, Bell, Shield, Database, Mail, CreditCard, Save, Eye, EyeOff, Clock, Trash2, FileText, CheckCircle, XCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../../../context/AuthContext'
import { useToast } from '../../../../context/ToastContext'
import Modal from '../../../common/Modal'
import AddressAutocomplete from '../../../common/AddressAutocomplete'

interface Session {
  id: string
  browser: string
  os: string
  location: string
  ip: string
  isCurrent: boolean
  lastActivity: string
}

export default function Impostazioni() {
  const { user, token, updateUser } = useAuth()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [loading, setLoading] = useState(false)

  const [profileData, setProfileData] = useState({
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
            console.log('Loaded notification settings:', userData.notificationSettings)
            setNotificationSettings(userData.notificationSettings)
          } else {
            console.log('No notification settings found in user data')
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      }
    }

    loadUserProfile()
  }, [user, token])

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
        console.error('Error loading 2FA status:', error)
      }
    }

    load2FAStatus()
  }, [token])

  // Load sessions when security tab is active
  useEffect(() => {
    if (activeTab === 'security' && token) {
      loadSessions()
      loadSessionTimeout()
    }
  }, [activeTab, token])

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
          // Sort by lastActivity (oldest first)
          const sortedSessions = [...sessions].sort((a, b) =>
            new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime()
          )

          // Get sessions to terminate (all except the 3 most recent)
          const sessionsToTerminate = sortedSessions.slice(0, sessions.length - 3)

          // Terminate old sessions
          for (const session of sessionsToTerminate) {
            try {
              await fetch(`${API_URL}/security/sessions/${session.id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              })
            } catch (err) {
              console.error('Error terminating session:', err)
            }
          }

          // Reload sessions after cleanup
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
      console.error('Error loading sessions:', error)
    } finally {
      setLoadingSessions(false)
    }
  }

  const loadSessionTimeout = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/security/settings/session-timeout`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSessionTimeout(data.sessionTimeout)
      }
    } catch (error) {
      console.error('Error loading session timeout:', error)
    }
  }

  const handleSaveSessionTimeout = async () => {
    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/security/settings/session-timeout`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionTimeout })
      })

      if (response.ok) {
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

  const handleCleanupSessions = async () => {
    if (!confirm('Eliminare manualmente tutte le sessioni inattive?')) return

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

  const handleTerminateAllSessions = async () => {
    if (!confirm('Sei sicuro di voler terminare tutte le altre sessioni?')) return

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

  const getTimeoutLabel = (minutes: number) => {
    if (minutes < 60) return `${minutes} minuti`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} or${hours === 1 ? 'a' : 'e'}`
    const days = Math.floor(hours / 24)
    return `${days} giorn${days === 1 ? 'o' : 'i'}`
  }

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false
  })

  // Validate password strength
  const validatePassword = (password: string) => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password)
    })
  }

  const isPasswordValid = passwordStrength.hasMinLength &&
    passwordStrength.hasUpperCase &&
    passwordStrength.hasLowerCase &&
    passwordStrength.hasNumber

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
  const [showTerminateSessionModal, setShowTerminateSessionModal] = useState(false)
  const [sessionToTerminate, setSessionToTerminate] = useState<string | null>(null)
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

  const handleTerminateSession = (sessionId: string) => {
    setSessionToTerminate(sessionId)
    setShowTerminateSessionModal(true)
  }

  const confirmTerminateSession = async () => {
    if (!sessionToTerminate) return

    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/security/sessions/${sessionToTerminate}`, {
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
      setShowTerminateSessionModal(false)
      setSessionToTerminate(null)
      loadSessions()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Errore sconosciuto', 'error')
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

  const handleSave = async (section: string) => {
    setLoading(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'

      if (section === 'profile') {
        const response = await fetch(`${API_URL}/user/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: `${profileData.nome} ${profileData.cognome}`.trim(),
            email: profileData.email,
            phone: profileData.telefono,
            professionalRole: profileData.ruolo,
            bio: profileData.bio,
            address: profileData.indirizzo,
            fiscalCode: profileData.codiceFiscale,
            registrationNumber: profileData.ordineIscrizione
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update profile')
        }

        const data = await response.json()
        updateUser(data.user)

        // Split name into first and last name
        const fullName = data.user.name || ''
        const nameParts = fullName.trim().split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        // Aggiorna anche i campi del form con i nuovi dati
        setProfileData({
          nome: firstName,
          cognome: lastName,
          email: data.user.email || '',
          telefono: data.user.phone || '',
          ruolo: data.user.professionalRole || '',
          bio: data.user.bio || '',
          indirizzo: data.user.address || '',
          codiceFiscale: data.user.fiscalCode || '',
          ordineIscrizione: data.user.registrationNumber || ''
        })

        showToast('Profilo aggiornato con successo!', 'success')
      } else if (section === 'password') {
        const response = await fetch(`${API_URL}/user/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update password')
        }

        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        showToast('Password aggiornata con successo!', 'success')
      } else if (section === 'notifications') {
        console.log('Saving notification settings:', notificationSettings)
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
          console.error('Error response:', error)
          throw new Error(error.error || 'Failed to update notifications')
        }

        const data = await response.json()
        console.log('Save response:', data)

        // Aggiorna lo stato locale con i dati salvati
        if (data.user?.notificationSettings) {
          setNotificationSettings(data.user.notificationSettings)
        }

        showToast('Preferenze notifiche aggiornate con successo!', 'success')
      } else {
        // Per ora le altre sezioni non sono implementate
        showToast(`Impostazioni ${section} salvate!`, 'success')
      }
    } catch (error) {
      console.error(`Error saving ${section}:`, error)
      showToast(error instanceof Error ? error.message : 'Errore durante il salvataggio', 'error')
    } finally {
      setLoading(false)
    }
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informazioni Personali</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome *
            </label>
            <input
              type="text"
              value={profileData.nome}
              onChange={(e) => setProfileData(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Il tuo nome</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cognome *
            </label>
            <input
              type="text"
              value={profileData.cognome}
              onChange={(e) => setProfileData(prev => ({ ...prev, cognome: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Il tuo cognome</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Email per accedere alla piattaforma</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefono
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 font-medium">+39</span>
              <input
                type="tel"
                value={profileData.telefono?.replace('+39', '').replace(/^\s+/, '') || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d\s]/g, '')
                  setProfileData(prev => ({ ...prev, telefono: `+39 ${value}` }))
                }}
                placeholder="XXX XXX XXXX"
                className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Numero di telefono italiano (10 cifre)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ruolo Professionale
            </label>
            <input
              type="text"
              value={profileData.ruolo}
              onChange={(e) => setProfileData(prev => ({ ...prev, ruolo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="es. Commercialista, Consulente Fiscale"
            />
            <p className="text-xs text-gray-500 mt-1">Il tuo ruolo o specializzazione professionale</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordine di Iscrizione
            </label>
            <input
              type="text"
              value={profileData.ordineIscrizione}
              onChange={(e) => setProfileData(prev => ({ ...prev, ordineIscrizione: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Numero iscrizione albo"
            />
            <p className="text-xs text-gray-500 mt-1">Numero di iscrizione all'albo professionale</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Codice Fiscale
            </label>
            <input
              type="text"
              value={profileData.codiceFiscale}
              onChange={(e) => setProfileData(prev => ({ ...prev, codiceFiscale: e.target.value.toUpperCase() }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="RSSMRA85M01H501Z"
              maxLength={16}
            />
            <p className="text-xs text-gray-500 mt-1">Codice fiscale italiano di 16 caratteri</p>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Indirizzo Studio
          </label>
          <AddressAutocomplete
            value={profileData.indirizzo}
            onChange={(value) => setProfileData(prev => ({ ...prev, indirizzo: value }))}
            onAddressSelect={(address) => {
              setProfileData(prev => ({
                ...prev,
                indirizzo: address.full
              }))
            }}
            placeholder="Inizia a digitare l'indirizzo dello studio..."
          />
          <p className="text-xs text-gray-500 mt-1">L'indirizzo completo include via, CAP, città, provincia e paese</p>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Biografia Professionale
          </label>
          <textarea
            value={profileData.bio}
            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Descrivi la tua esperienza e specializzazioni..."
          />
          <p className="text-xs text-gray-500 mt-1">Una breve descrizione della tua esperienza professionale e competenze</p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => handleSave('profile')}
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvataggio...' : 'Salva Modifiche'}
          </button>
        </div>
      </div>
    </div>
  )

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          onClick={() => handleSave('notifications')}
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
      {/* Security Status Banner */}
      <div className="bg-green-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mr-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Account Sicuro</h3>
            <p className="text-green-100 text-sm">Il tuo account è protetto con le migliori misure di sicurezza</p>
          </div>
        </div>
      </div>

      {/* Grid Layout per le card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card: Cambia Password */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center mr-3">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">Cambia Password</h4>
          </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Attuale *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nuova Password *
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => {
                    setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))
                    validatePassword(e.target.value)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {passwordData.newPassword && (
                  <div className="mt-2 space-y-1 text-sm">
                    <div className={`flex items-center ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-2">{passwordStrength.hasMinLength ? '✓' : '○'}</span>
                      Almeno 8 caratteri
                    </div>
                    <div className={`flex items-center ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-2">{passwordStrength.hasUpperCase ? '✓' : '○'}</span>
                      Una lettera maiuscola
                    </div>
                    <div className={`flex items-center ${passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-2">{passwordStrength.hasLowerCase ? '✓' : '○'}</span>
                      Una lettera minuscola
                    </div>
                    <div className={`flex items-center ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-2">{passwordStrength.hasNumber ? '✓' : '○'}</span>
                      Un numero
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conferma Nuova Password *
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-sm text-red-600 mt-2">Le password non corrispondono</p>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('password')}
                  disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword || !isPasswordValid}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Aggiornamento...' : 'Aggiorna Password'}
                </button>
              </div>
            </div>
          </div>

        {/* Card: Autenticazione 2FA */}
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

        {/* Card: Timeout Sessione */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center mr-3">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">Timeout Sessione</h4>
          </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Le sessioni inattive verranno eliminate automaticamente dopo il periodo impostato
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durata timeout
                </label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                >
                  <option value={30}>30 minuti</option>
                  <option value={60}>1 ora</option>
                  <option value={360}>6 ore</option>
                  <option value={720}>12 ore</option>
                  <option value={1440}>1 giorno</option>
                  <option value={10080}>7 giorni</option>
                  <option value={43200}>30 giorni</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Timeout corrente: {getTimeoutLabel(sessionTimeout)}
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSaveSessionTimeout}
                  disabled={loading}
                  className="bg-orange-600 text-white px-6 py-2.5 rounded-lg hover:bg-orange-700 transition-colors flex items-center disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salva Timeout
                </button>
              </div>
            </div>
          </div>
      </div>

      {/* Sessioni Attive - Full width */}
      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center mr-3">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">Sessioni Attive</h4>
          </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleCleanupSessions}
                  disabled={loading}
                  className="text-orange-600 hover:text-orange-700 transition-colors text-sm font-medium flex items-center disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Pulisci Inattive
                </button>
                {sessions.filter(s => !s.isCurrent).length > 0 && (
                  <button
                    onClick={handleTerminateAllSessions}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    Termina Tutte
                  </button>
                )}
            </div>
          </div>

          {loadingSessions ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4"></div>
              <p className="text-gray-600">Caricamento sessioni...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Nessuna sessione attiva</p>
              <p className="text-sm text-gray-500 mt-2">Le tue sessioni appariranno qui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const lastActivity = new Date(session.lastActivity)
                const now = new Date()
                const diffMinutes = Math.floor((now.getTime() - lastActivity.getTime()) / 60000)
                const timeAgo = diffMinutes < 1 ? 'adesso' :
                                diffMinutes < 60 ? `${diffMinutes} minuti fa` :
                                diffMinutes < 1440 ? `${Math.floor(diffMinutes / 60)} ore fa` :
                                `${Math.floor(diffMinutes / 1440)} giorni fa`

                return (
                  <div
                    key={session.id}
                    className={`group flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow duration-200 ${
                      session.isCurrent ? 'border-green-300 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {session.browser} su {session.os}
                        {session.isCurrent && (
                          <span className="ml-2 text-xs text-green-600 font-medium">Corrente</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        {session.location} • {session.ip}
                      </p>
                      <p className="text-xs text-gray-500">
                        Ultima attività: {timeAgo}
                      </p>
                    </div>
                    {!session.isCurrent && (
                      <button
                        onClick={() => handleTerminateSession(session.id)}
                        className="text-red-600 hover:text-red-700 transition-colors text-sm font-medium"
                      >
                        Termina Sessione
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
      </div>
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
            onClick={() => handleSave('integrations')}
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
        return renderProfileTab()
      case 'notifications':
        return renderNotificationsTab()
      case 'security':
        return renderSecurityTab()
      case 'integrations':
        return renderIntegrationsTab()
      default:
        return renderProfileTab()
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

      {/* Terminate Session Confirmation Modal */}
      <Modal
        isOpen={showTerminateSessionModal}
        onClose={() => {
          setShowTerminateSessionModal(false)
          setSessionToTerminate(null)
        }}
        title="Conferma Terminazione Sessione"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Sei sicuro di voler terminare questa sessione? L'utente verrà disconnesso immediatamente.
          </p>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowTerminateSessionModal(false)
                setSessionToTerminate(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={confirmTerminateSession}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Termina Sessione
            </button>
          </div>
        </div>
      </Modal>

      {/* Message feedback */}

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