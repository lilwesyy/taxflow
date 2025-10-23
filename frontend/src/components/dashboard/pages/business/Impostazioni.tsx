import { User, Bell, Shield, CreditCard, Save, Mail } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../../../context/AuthContext'
import { useToast } from '../../../../context/ToastContext'
import Modal from '../../../common/Modal'
import {
  SettingsProfile,
  SettingsPassword,
  SettingsSecurity,
  SettingsSubscription,
  type Session
} from '../../shared/settings'

interface ProfileData {
  nome: string
  cognome: string
  email: string
  telefono?: string
  codiceFiscale?: string
  indirizzo?: string
  citta?: string
  cap?: string
  settoreAttivita?: string
  partitaIva?: string
  regimeFiscale?: string
  company?: string
  codiceAteco?: string
  aliquotaIva?: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface Invoice {
  _id: string
  numero: string
  servizio: string
  tipo: string
  importo: number
  iva: number
  totale: number
  status: 'paid' | 'pending' | 'failed' | 'canceled'
  dataEmissione: string
  dataPagamento?: string
  metodoPagamento?: string
  subscriptionPlanName?: string
  subscriptionInterval?: 'month' | 'year'
  createdAt: string
}

export default function Impostazioni() {
  const { user, token, updateUser } = useAuth()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)

  const [profileData, setProfileData] = useState<ProfileData>({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    codiceFiscale: '',
    indirizzo: '',
    citta: '',
    cap: '',
    settoreAttivita: '',
    partitaIva: '',
    regimeFiscale: '',
    company: '',
    codiceAteco: '',
    aliquotaIva: ''
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

          // Extract city and CAP from address if not separate fields
          const addressMatch = userData.address?.match(/(\d{5})\s*\(([A-Z]{2})\)/) || []
          const extractedCAP = addressMatch[1] || ''

          // Try to extract city from address (format: "street, CAP City (Province)")
          const cityMatch = userData.address?.match(/\d{5}\s+([^(]+)\s*\(/) || []
          const extractedCity = cityMatch[1]?.trim() || ''

          setProfileData({
            nome: firstName,
            cognome: lastName,
            email: userData.email || '',
            telefono: userData.phone || '',
            codiceFiscale: userData.fiscalCode || '',
            indirizzo: userData.address || '',
            citta: extractedCity,
            cap: extractedCAP,
            settoreAttivita: userData.settoreAttivita || userData.pivaRequestData?.businessActivity || '',
            partitaIva: userData.piva || '',
            regimeFiscale: userData.regimeContabile || '',
            company: userData.company || '',
            codiceAteco: userData.codiceAteco || '',
            aliquotaIva: userData.aliquotaIva || ''
          })

          if (userData.notificationSettings) {
            setNotificationSettings(userData.notificationSettings)
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      }
    }

    loadUserProfile()
  }, [user, token])

  const [notificationSettings, setNotificationSettings] = useState({
    emailFatture: true,
    emailScadenze: true,
    emailDocumenti: false,
    pushNotifications: true,
    weeklyReport: false,
    smsUrgenti: false,
    promozionali: false
  })

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [disable2FAPassword, setDisable2FAPassword] = useState('')

  const [sessions, setSessions] = useState<Session[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState(43200) // Default 30 days

  const [subscriptionData, setSubscriptionData] = useState<any>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [paymentSettings, setPaymentSettings] = useState({ autoRinnovo: true })

  const tabs = [
    {
      id: 'profile',
      name: 'Profilo',
      icon: User,
      description: 'Gestisci i tuoi dati personali e aziendali'
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
      id: 'subscription',
      name: 'Abbonamento',
      icon: CreditCard,
      description: 'Gestisci il tuo piano e fatturazione'
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
        console.error('Error loading 2FA status:', error)
      }
    }

    load2FAStatus()
  }, [token])

  // Load subscription when tab is active
  useEffect(() => {
    if (activeTab === 'subscription' && token) {
      loadSubscription()
      loadInvoices()
    }
  }, [activeTab, token])

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
          fiscalCode: data.codiceFiscale,
          address: data.indirizzo,
          company: data.company,
          piva: data.partitaIva,
          codiceAteco: data.codiceAteco,
          regimeContabile: data.regimeFiscale,
          aliquotaIva: data.aliquotaIva,
          settoreAttivita: data.settoreAttivita
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

      // Update local state - use same mapping as initial load
      const addressMatch = responseData.user.address?.match(/(\d{5})\s*\(([A-Z]{2})\)/) || []
      const extractedCAP = addressMatch[1] || ''
      const cityMatch = responseData.user.address?.match(/\d{5}\s+([^(]+)\s*\(/) || []
      const extractedCity = cityMatch[1]?.trim() || ''

      setProfileData({
        nome: firstName,
        cognome: lastName,
        email: responseData.user.email || '',
        telefono: responseData.user.phone || '',
        codiceFiscale: responseData.user.fiscalCode || '',
        indirizzo: responseData.user.address || '',
        citta: extractedCity,
        cap: extractedCAP,
        settoreAttivita: responseData.user.settoreAttivita || responseData.user.pivaRequestData?.businessActivity || '',
        partitaIva: responseData.user.piva || '',
        regimeFiscale: responseData.user.regimeContabile || '',
        company: responseData.user.company || '',
        codiceAteco: responseData.user.codiceAteco || '',
        aliquotaIva: responseData.user.aliquotaIva || ''
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
              console.error('Error terminating session:', err)
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
      console.error('Error loading sessions:', error)
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

  // Subscription handlers
  const loadSubscription = async () => {
    setLoadingSubscription(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/subscription/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSubscriptionData(data)
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
    } finally {
      setLoadingSubscription(false)
    }
  }

  const loadInvoices = async () => {
    setLoadingInvoices(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/subscription/invoices`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices || [])
      }
    } catch (error) {
      console.error('Error loading invoices:', error)
    } finally {
      setLoadingInvoices(false)
    }
  }

  const handleToggleAutoRenew = async (enabled: boolean) => {
    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/subscription/auto-renew`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ autoRenew: enabled })
      })

      if (response.ok) {
        setPaymentSettings({ autoRinnovo: enabled })
        showToast('Impostazioni rinnovo aggiornate', 'success')
        loadSubscription()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Errore nell\'aggiornamento')
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Errore sconosciuto', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = () => {
    setIsCancelModalOpen(true)
  }

  const confirmCancelSubscription = async () => {
    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        showToast('Abbonamento cancellato con successo', 'success')
        setIsCancelModalOpen(false)
        loadSubscription()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Errore nella cancellazione')
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Errore sconosciuto', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleReactivateSubscription = async () => {
    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/subscription/reactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        showToast('Abbonamento riattivato con successo', 'success')
        loadSubscription()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Errore nella riattivazione')
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Errore sconosciuto', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = async (invoiceId: string, numero: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/subscription/invoices/${invoiceId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `fattura-${numero}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        showToast('Fattura scaricata con successo', 'success')
      }
    } catch (error) {
      showToast('Errore durante il download della fattura', 'error')
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
              checked={notificationSettings.emailFatture}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailFatture: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
            />
            <div className="ml-3 flex-1">
              <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Nuove Fatture</p>
              <p className="text-sm text-gray-600">Emissione fatture</p>
            </div>
          </label>

          <label className="group flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.emailScadenze}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailScadenze: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
            />
            <div className="ml-3 flex-1">
              <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Scadenze Fiscali</p>
              <p className="text-sm text-gray-600">Promemoria pagamenti</p>
            </div>
          </label>

          <label className="group flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.emailDocumenti}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailDocumenti: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
            />
            <div className="ml-3 flex-1">
              <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Nuovi Documenti</p>
              <p className="text-sm text-gray-600">Upload consulente</p>
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
              <p className="text-sm text-gray-600">Riepilogo attività</p>
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
          <p className="text-sm text-gray-600">SMS per scadenze critiche</p>
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
          <p className="text-sm text-gray-600">Offerte e novità</p>
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <SettingsProfile profileData={profileData} onUpdate={handleProfileUpdate} loading={loading} showBusinessFields={true} />
      case 'notifications':
        return renderNotificationsTab()
      case 'security':
        return renderSecurityTab()
      case 'subscription':
        return (
          <SettingsSubscription
            subscriptionData={subscriptionData}
            invoices={invoices}
            paymentSettings={paymentSettings}
            loading={loading}
            loadingSubscription={loadingSubscription}
            loadingInvoices={loadingInvoices}
            onToggleAutoRenew={handleToggleAutoRenew}
            onCancelSubscription={handleCancelSubscription}
            onReactivateSubscription={handleReactivateSubscription}
            onDownloadInvoice={handleDownloadInvoice}
            onLoadSubscription={loadSubscription}
            onLoadInvoices={loadInvoices}
            showToast={showToast}
          />
        )
      default:
        return <SettingsProfile profileData={profileData} onUpdate={handleProfileUpdate} loading={loading} showBusinessFields={true} />
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

      {/* Cancel Subscription Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Conferma Cancellazione Abbonamento"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Sei sicuro di voler cancellare il tuo abbonamento? Potrai continuare ad utilizzare i servizi fino alla fine del periodo di fatturazione corrente.
          </p>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={confirmCancelSubscription}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Cancellazione...' : 'Conferma Cancellazione'}
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
