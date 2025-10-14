import { User, Bell, Shield, CreditCard, Save, Eye, EyeOff, Clock, Trash2, Download, Settings, CheckCircle, AlertTriangle, FileText, Mail } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../../../context/AuthContext'
import { useToast } from '../../../../context/ToastContext'
import ATECOAutocomplete from '../../../common/ATECOAutocomplete'
import AddressAutocomplete from '../../../common/AddressAutocomplete'

interface Session {
  id: string
  browser: string
  os: string
  device: string
  location: string
  ip: string
  lastActivity: string
  createdAt: string
  isCurrent: boolean
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
  const [showPassword, setShowPassword] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionTimeout, setSessionTimeout] = useState(43200) // Default 30 days
  const [loading, setLoading] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)

  const [profileData, setProfileData] = useState({
    nome: 'Mario',
    cognome: 'Rossi',
    email: 'mario.rossi@gmail.com',
    telefono: '+39 338 987 6543',
    codiceFiscale: 'RSSMRA85M15F205Z',
    indirizzo: 'Via Milano 45, 20121 Milano',
    citta: 'Milano',
    cap: '20121',
    professione: 'Consulente IT',
    settoreAttivita: 'Servizi informatici',
    partitaIva: 'IT12345678901',
    regimeFiscale: 'Forfettario',
    company: 'Mario Rossi Consulting',
    codiceAteco: '62.02.00',
    aliquotaIva: '22%'
  })

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

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true // Optional field
    const phoneRegex = /^(\+39)?[ ]?[0-9]{9,10}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const validateFiscalCode = (cf: string): boolean => {
    if (!cf) return true // Optional field
    // Remove spaces and convert to uppercase before validation
    const cleaned = cf.toUpperCase().replace(/\s/g, '')
    const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/
    return cfRegex.test(cleaned)
  }

  const validatePIVA = (piva: string): boolean => {
    if (!piva) return true // Optional field
    const pivaRegex = /^(IT)?[0-9]{11}$/
    return pivaRegex.test(piva.replace(/\s/g, ''))
  }

  const validateCAP = (cap: string): boolean => {
    if (!cap) return true // Optional field
    const capRegex = /^[0-9]{5}$/
    return capRegex.test(cap)
  }

  const validateCodiceATECO = (codice: string): boolean => {
    if (!codice) return true // Optional field
    const atecoRegex = /^[0-9]{2}\.[0-9]{2}\.[0-9]{2}$/
    return atecoRegex.test(codice)
  }

  // Formatting functions
  // const formatPhone = (phone: string): string => {
  //   const cleaned = phone.replace(/\D/g, '')
  //   if (cleaned.startsWith('39') && cleaned.length === 12) {
  //     return `+39 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
  //   }
  //   if (cleaned.length === 10) {
  //     return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  //   }
  //   return phone
  // }

  const formatFiscalCode = (cf: string): string => {
    return cf.toUpperCase().replace(/\s/g, '')
  }

  const formatPIVA = (piva: string): string => {
    const cleaned = piva.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return `IT${cleaned}`
    }
    if (piva.startsWith('IT')) {
      return piva.toUpperCase()
    }
    return cleaned
  }

  // const formatCAP = (cap: string): string => {
  //   return cap.replace(/\D/g, '').slice(0, 5)
  // }


  const validateProfile = (): boolean => {
    const errors: {[key: string]: string} = {}

    if (!profileData.nome.trim()) {
      errors.nome = 'Il nome è obbligatorio'
    }

    if (!profileData.cognome.trim()) {
      errors.cognome = 'Il cognome è obbligatorio'
    }

    if (!profileData.email.trim()) {
      errors.email = 'L\'email è obbligatoria'
    } else if (!validateEmail(profileData.email)) {
      errors.email = 'Email non valida'
    }

    if (profileData.telefono && !validatePhone(profileData.telefono)) {
      errors.telefono = 'Numero di telefono non valido (formato: +39 XXX XXX XXXX o XXX XXX XXXX)'
    }

    if (profileData.codiceFiscale && !validateFiscalCode(profileData.codiceFiscale)) {
      errors.codiceFiscale = 'Codice fiscale non valido. Formato richiesto: 6 lettere, 2 cifre, 1 lettera, 2 cifre, 1 lettera, 3 cifre, 1 lettera (es: RSSMRA85M01H501Z)'
    }

    if (profileData.cap && !validateCAP(profileData.cap)) {
      errors.cap = 'CAP non valido (5 cifre)'
    }

    if (profileData.partitaIva && !validatePIVA(profileData.partitaIva)) {
      errors.partitaIva = 'Partita IVA non valida (11 cifre)'
    }

    if (profileData.codiceAteco && !validateCodiceATECO(profileData.codiceAteco)) {
      errors.codiceAteco = 'Codice ATECO non valido (formato: XX.XX.XX)'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const [notificationSettings, setNotificationSettings] = useState({
    emailDocumentiRichiesti: true,
    emailScadenzeFiscali: true,
    emailFattureRicevute: true,
    emailConsulenza: true,
    pushNotifications: true,
    smsUrgenti: false,
    newsletterFiscale: true,
    promozionali: false
  })


  const [paymentSettings, setPaymentSettings] = useState({
    autoRinnovo: true,
    emailRicevute: true
  })

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
      description: 'Password, sessioni e privacy'
    },
    {
      id: 'subscription',
      name: 'Abbonamento',
      icon: CreditCard,
      description: 'Piano attivo e storico fatture'
    }
  ]

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile()
  }, [user, token])

  // Load sessions when security tab is active
  useEffect(() => {
    if (activeTab === 'security' && token) {
      loadSessions()
      loadSessionTimeout()
    }
  }, [activeTab, token])

  // Load invoices when subscription tab is active
  useEffect(() => {
    if (activeTab === 'subscription' && token) {
      loadInvoices()
    }
  }, [activeTab, token])

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
          codiceFiscale: userData.fiscalCode || '',
          indirizzo: userData.address || '',
          citta: userData.city || '',
          cap: userData.cap || '',
          professione: userData.professionalRole || '',
          settoreAttivita: userData.settoreAttivita || '',
          partitaIva: userData.piva || '',
          regimeFiscale: userData.regimeContabile || 'Forfettario',
          company: userData.company || '',
          codiceAteco: userData.codiceAteco || '',
          aliquotaIva: userData.aliquotaIva || '22%'
        })

        if (userData.notificationSettings) {
          setNotificationSettings(userData.notificationSettings)
        }
      }
    } catch (error) {
      console.error('Failed to load user profile:', error)
    }
  }

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
          const sortedSessions = [...sessions].sort((a, b) =>
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
      console.error('Failed to load sessions:', error)
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
      console.error('Failed to load session timeout:', error)
    }
  }

  const loadInvoices = async () => {
    setLoadingInvoices(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/invoices`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Filter only subscription/abbonamento invoices
        const subscriptionInvoices = data.invoices.filter((inv: Invoice) =>
          inv.tipo === 'Abbonamento' && inv.status === 'paid'
        )
        setInvoices(subscriptionInvoices)
      }
    } catch (error) {
      console.error('Failed to load invoices:', error)
      showToast('Errore nel caricamento delle fatture', 'error')
    } finally {
      setLoadingInvoices(false)
    }
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return ''

    // Check if it's already in DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      return dateString
    }

    // Parse ISO date or other formats
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString

    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
  }

  const handleDownloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
    try {
      showToast('Generazione PDF in corso...', 'info')

      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/chat/invoices/${invoiceId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Errore nel download del PDF')
      }

      // Create blob from response
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fattura-${invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      showToast('PDF scaricato con successo!', 'success')
    } catch (error) {
      console.error('Error downloading invoice:', error)
      showToast('Errore nel download del PDF', 'error')
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    if (!confirm('Sei sicuro di voler terminare questa sessione?')) return

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

  const formatLastActivity = (date: string) => {
    const now = new Date()
    const activityDate = new Date(date)
    const diffMs = now.getTime() - activityDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'adesso'
    if (diffMins < 60) return `${diffMins} minut${diffMins === 1 ? 'o' : 'i'} fa`
    if (diffHours < 24) return `${diffHours} or${diffHours === 1 ? 'a' : 'e'} fa`
    return `${diffDays} giorn${diffDays === 1 ? 'o' : 'i'} fa`
  }

  const getTimeoutLabel = (minutes: number) => {
    if (minutes < 60) return `${minutes} minuti`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} or${hours === 1 ? 'a' : 'e'}`
    const days = Math.floor(hours / 24)
    return `${days} giorn${days === 1 ? 'o' : 'i'}`
  }

  const handleSave = async (section: string) => {
    setLoading(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'

      if (section === 'profile') {
        // Validate before saving
        if (!validateProfile()) {
          setLoading(false)
          showToast('Correggi gli errori nel form prima di salvare', 'error')
          return
        }
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
            fiscalCode: profileData.codiceFiscale,
            address: profileData.indirizzo,
            city: profileData.citta,
            cap: profileData.cap,
            company: profileData.company,
            piva: profileData.partitaIva,
            codiceAteco: profileData.codiceAteco,
            settoreAttivita: profileData.settoreAttivita,
            regimeContabile: profileData.regimeFiscale,
            aliquotaIva: profileData.aliquotaIva,
            professionalRole: profileData.professione
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

        setProfileData({
          nome: firstName,
          cognome: lastName,
          email: data.user.email || '',
          telefono: data.user.phone || '',
          codiceFiscale: data.user.fiscalCode || '',
          indirizzo: data.user.address || '',
          citta: data.user.city || '',
          cap: data.user.cap || '',
          professione: data.user.professionalRole || '',
          settoreAttivita: data.user.settoreAttivita || '',
          partitaIva: data.user.piva || '',
          regimeFiscale: data.user.regimeContabile || 'Forfettario',
          company: data.user.company || '',
          codiceAteco: data.user.codiceAteco || '',
          aliquotaIva: data.user.aliquotaIva || '22%'
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
      } else {
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
              value={profileData.nome || ''}
              onChange={(e) => setProfileData(prev => ({ ...prev, nome: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                validationErrors.nome ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.nome ? (
              <p className="text-sm text-red-600 mt-1">{validationErrors.nome}</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Il tuo nome</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cognome *
            </label>
            <input
              type="text"
              value={profileData.cognome || ''}
              onChange={(e) => setProfileData(prev => ({ ...prev, cognome: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                validationErrors.cognome ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.cognome ? (
              <p className="text-sm text-red-600 mt-1">{validationErrors.cognome}</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Il tuo cognome</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={profileData.email || ''}
              onChange={(e) => {
                setProfileData(prev => ({ ...prev, email: e.target.value }))
                if (validationErrors.email) {
                  setValidationErrors(prev => ({ ...prev, email: '' }))
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                validationErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.email ? (
              <p className="text-sm text-red-600 mt-1">{validationErrors.email}</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Email per accedere alla piattaforma</p>
            )}
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
                  if (validationErrors.telefono) {
                    setValidationErrors(prev => ({ ...prev, telefono: '' }))
                  }
                }}
                placeholder="XXX XXX XXXX"
                className={`w-full pl-12 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  validationErrors.telefono ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {validationErrors.telefono ? (
              <p className="text-sm text-red-600 mt-1">{validationErrors.telefono}</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Numero di telefono italiano (10 cifre)</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Codice Fiscale
            </label>
            <input
              type="text"
              value={profileData.codiceFiscale || ''}
              onChange={(e) => {
                setProfileData(prev => ({ ...prev, codiceFiscale: e.target.value.toUpperCase() }))
                if (validationErrors.codiceFiscale) {
                  setValidationErrors(prev => ({ ...prev, codiceFiscale: '' }))
                }
              }}
              onBlur={(e) => {
                if (e.target.value) {
                  setProfileData(prev => ({ ...prev, codiceFiscale: formatFiscalCode(e.target.value) }))
                }
              }}
              maxLength={16}
              placeholder="RSSMRA85M01H501Z"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                validationErrors.codiceFiscale ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.codiceFiscale ? (
              <p className="text-sm text-red-600 mt-1">{validationErrors.codiceFiscale}</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Codice fiscale italiano di 16 caratteri</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professione
            </label>
            <input
              type="text"
              value={profileData.professione || ''}
              onChange={(e) => setProfileData(prev => ({ ...prev, professione: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">La tua professione o ruolo professionale</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Settore di Attività
            </label>
            <input
              type="text"
              value={profileData.settoreAttivita || ''}
              onChange={(e) => setProfileData(prev => ({ ...prev, settoreAttivita: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Il settore economico in cui operi</p>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Indirizzo Completo
          </label>
          <AddressAutocomplete
            value={profileData.indirizzo || ''}
            onChange={(value) => setProfileData(prev => ({ ...prev, indirizzo: value }))}
            onAddressSelect={(address) => {
              setProfileData(prev => ({
                ...prev,
                indirizzo: address.full,
                citta: address.city,
                cap: address.postcode
              }))
            }}
            placeholder="Inizia a digitare l'indirizzo (es. Via Milano 45, Milano)..."
          />
          <p className="text-xs text-gray-500 mt-1">L'indirizzo completo include via, CAP, città, provincia e paese</p>
        </div>

        {/* Informazioni Aziendali */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-4">Informazioni Aziendali</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ragione Sociale / Nome Azienda
              </label>
              <input
                type="text"
                value={profileData.company || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Nome azienda o tuo nome"
              />
              <p className="text-xs text-gray-500 mt-1">Nome della tua azienda o il tuo nome se lavori in proprio</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Partita IVA
              </label>
              <input
                type="text"
                value={profileData.partitaIva || ''}
                onChange={(e) => {
                  setProfileData(prev => ({ ...prev, partitaIva: e.target.value.toUpperCase() }))
                  if (validationErrors.partitaIva) {
                    setValidationErrors(prev => ({ ...prev, partitaIva: '' }))
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value) {
                    setProfileData(prev => ({ ...prev, partitaIva: formatPIVA(e.target.value) }))
                  }
                }}
                maxLength={13}
                placeholder="IT12345678901"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  validationErrors.partitaIva ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.partitaIva ? (
                <p className="text-sm text-red-600 mt-1">{validationErrors.partitaIva}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Partita IVA italiana (11 cifre con prefisso IT)</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Codice ATECO
              </label>
              <ATECOAutocomplete
                value={profileData.codiceAteco || ''}
                onChange={(value) => {
                  setProfileData(prev => ({ ...prev, codiceAteco: value }))
                  if (validationErrors.codiceAteco) {
                    setValidationErrors(prev => ({ ...prev, codiceAteco: '' }))
                  }
                }}
                error={validationErrors.codiceAteco}
                placeholder="Cerca per codice o descrizione (es. 62.02.00 o consulenza informatica)"
              />
              {validationErrors.codiceAteco ? (
                <p className="text-sm text-red-600 mt-1">{validationErrors.codiceAteco}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Codice che identifica la tua attività economica</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regime Contabile
              </label>
              <select
                value={profileData.regimeFiscale || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, regimeFiscale: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Forfettario">Regime Forfettario</option>
                <option value="Semplificato">Regime Semplificato</option>
                <option value="Ordinario">Regime Ordinario</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Il regime fiscale applicato alla tua attività</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aliquota IVA
              </label>
              <select
                value={profileData.aliquotaIva || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, aliquotaIva: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Seleziona aliquota</option>
                <option value="0%">0% - Esente</option>
                <option value="4%">4% - Ridotta (alimentari, libri)</option>
                <option value="5%">5% - Forfettario</option>
                <option value="10%">10% - Ridotta (turismo, edilizia)</option>
                <option value="22%">22% - Ordinaria</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Aliquota IVA applicata ai tuoi servizi/prodotti</p>
            </div>
          </div>
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
              checked={notificationSettings.emailDocumentiRichiesti}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailDocumentiRichiesti: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
            />
            <div className="ml-3 flex-1">
              <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Richieste Documenti</p>
              <p className="text-sm text-gray-600">Dal consulente</p>
            </div>
          </label>

          <label className="group flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.emailScadenzeFiscali}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailScadenzeFiscali: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
            />
            <div className="ml-3 flex-1">
              <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Scadenze Fiscali</p>
              <p className="text-sm text-gray-600">Tributarie</p>
            </div>
          </label>

          <label className="group flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.emailFattureRicevute}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailFattureRicevute: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
            />
            <div className="ml-3 flex-1">
              <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Fatture e Pagamenti</p>
              <p className="text-sm text-gray-600">Transazioni</p>
            </div>
          </label>

          <label className="group flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.emailConsulenza}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailConsulenza: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
            />
            <div className="ml-3 flex-1">
              <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Risposte Consulente</p>
              <p className="text-sm text-gray-600">Chat e messaggi</p>
            </div>
          </label>

          <label className="group flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer md:col-span-2">
            <input
              type="checkbox"
              checked={notificationSettings.newsletterFiscale}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, newsletterFiscale: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
            />
            <div className="ml-3 flex-1">
              <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Newsletter Fiscale Settimanale</p>
              <p className="text-sm text-gray-600">Aggiornamenti normativi e consigli fiscali</p>
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
                checked={notificationSettings.smsUrgenti}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, smsUrgenti: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">SMS Urgenti</h4>
          <p className="text-sm text-gray-600">SMS per scadenze fiscali imminenti</p>
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
                checked={notificationSettings.promozionali}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, promozionali: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Email Promozionali</h4>
          <p className="text-sm text-gray-600">Offerte speciali e nuovi servizi</p>
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
                {sessions.map((session) => (
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
                        {session.device} • {session.ip}
                      </p>
                      <p className="text-xs text-gray-500">
                        Ultima attività: {formatLastActivity(session.lastActivity)}
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
                ))}
              </div>
            )}
        </div>

        {/* Privacy - Grid 2 columns */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="group flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-200 bg-white">
            <div>
              <p className="font-medium text-gray-900">Scarica i tuoi dati</p>
              <p className="text-sm text-gray-600">Esporta tutti i tuoi dati personali</p>
            </div>
            <button className="text-primary-600 hover:text-primary-700 transition-colors text-sm font-medium">
              Scarica
            </button>
          </div>

          <div className="group flex items-center justify-between p-4 border border-red-200 rounded-xl hover:shadow-md transition-shadow duration-200 bg-white">
            <div>
              <p className="font-medium text-red-900">Elimina Account</p>
              <p className="text-sm text-red-600">Elimina permanentemente il tuo account e tutti i dati</p>
            </div>
            <button className="text-red-600 hover:text-red-700 transition-colors text-sm font-medium">
              Elimina
            </button>
          </div>
        </div>
      </div>
    )

  const renderSubscriptionTab = () => {
    // Get user's selected plan details
    const userPlan = user?.selectedPlan
    const planName = userPlan?.name || 'Piano P.IVA Forfettari'
    const planPrice = userPlan?.price || 0
    const planInterval = userPlan?.interval === 'year' ? 'anno' : 'mese'

    // Calculate next renewal date based on interval
    const getNextRenewalDate = () => {
      if (!paymentSettings.autoRinnovo) {
        return 'Non programmato'
      }
      const nextRenewal = new Date()
      if (userPlan?.interval === 'year') {
        nextRenewal.setFullYear(nextRenewal.getFullYear() + 1)
      } else {
        nextRenewal.setMonth(nextRenewal.getMonth() + 1)
      }
      return nextRenewal.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

    return (
      <div className="space-y-6">
        {/* Current Subscription Status */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">{planName}</h2>
                <p className="text-blue-100 text-sm">Il tuo abbonamento è attivo e include tutte le funzionalità premium</p>
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <p className="text-3xl font-bold">Attivo</p>
                <p className="text-blue-100 text-sm">Stato</p>
              </div>
              <div className="h-12 w-px bg-blue-400"></div>
              <div className="text-center">
                <p className="text-3xl font-bold">{getNextRenewalDate()}</p>
                <p className="text-blue-100 text-sm">Prossimo rinnovo</p>
              </div>
              <div className="h-12 w-px bg-blue-400"></div>
              <div className="text-center">
                <p className="text-3xl font-bold">€{planPrice}/{planInterval}</p>
                <p className="text-blue-100 text-sm">Prezzo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Features */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Funzionalità Incluse</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Fatturazione Elettronica</p>
                <p className="text-xs text-gray-600">Creazione e invio illimitato</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Consulenza Fiscale</p>
                <p className="text-xs text-gray-600">Chat illimitata con consulenti</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Gestione Documenti</p>
                <p className="text-xs text-gray-600">Archiviazione cloud sicura</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Simulazione Imposte</p>
                <p className="text-xs text-gray-600">Calcolo per codice ATECO</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Actions */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-6 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-gray-600" />
            Gestisci il tuo Abbonamento
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Auto-rinnovo Card */}
            <div className="group relative overflow-hidden rounded-xl p-5 bg-green-600 hover:bg-green-700 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mr-3">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <h5 className="font-semibold text-white">Auto-rinnovo</h5>
                  </div>
                  <p className="text-sm text-green-100 ml-13">Il tuo abbonamento si rinnoverà automaticamente</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-3">
                  <input
                    type="checkbox"
                    checked={paymentSettings.autoRinnovo}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, autoRinnovo: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-white/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/30"></div>
                </label>
              </div>
            </div>

            {/* Cambia Piano Card */}
            <button className="group text-left rounded-xl p-5 bg-blue-600 hover:bg-blue-700 hover:shadow-md transition-all duration-200">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mr-3">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-white mb-1">Cambia Piano</h5>
                  <p className="text-sm text-blue-100">Esplora altri piani disponibili e aggiorna il tuo abbonamento</p>
                </div>
              </div>
            </button>

            {/* Sospendi Abbonamento Card */}
            <button className="group text-left rounded-xl p-5 bg-orange-600 hover:bg-orange-700 hover:shadow-md transition-all duration-200">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mr-3">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-white mb-1">Sospendi Abbonamento</h5>
                  <p className="text-sm text-orange-100">Metti in pausa temporaneamente il tuo abbonamento</p>
                </div>
              </div>
            </button>

            {/* Cancella Abbonamento Card */}
            <button className="group text-left rounded-xl p-5 bg-red-600 hover:bg-red-700 hover:shadow-md transition-all duration-200">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mr-3">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-white mb-1">Cancella Abbonamento</h5>
                  <p className="text-sm text-red-100">Termina definitivamente il tuo abbonamento</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-gray-600" />
              Storico Fatture
            </h4>
            {invoices.length > 0 && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                {invoices.length} {invoices.length === 1 ? 'fattura' : 'fatture'}
              </span>
            )}
          </div>

          {loadingInvoices ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4"></div>
              <p className="text-gray-600">Caricamento fatture...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Nessuna fattura disponibile</p>
              <p className="text-sm text-gray-500 mt-2">Le tue fatture appariranno qui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice, index) => (
                <div
                  key={invoice._id}
                  className="group relative overflow-hidden border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50 hover:shadow-md hover:border-blue-300 transition-all duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                        <FileText className="h-6 w-6 text-white" />
                      </div>

                      {/* Invoice Details */}
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {invoice.servizio}
                        </h5>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                          <span className="flex items-center">
                            <span className="font-medium text-gray-900 mr-1">N°</span>
                            {invoice.numero}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {formatDate(invoice.dataEmissione)}
                          </span>
                          {invoice.dataPagamento && (
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Pagata il {formatDate(invoice.dataPagamento)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Amount and Action */}
                    <div className="flex items-center gap-6">
                      <p className="text-2xl font-bold text-gray-900">
                        €{invoice.totale.toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleDownloadInvoice(invoice._id, invoice.numero)}
                        className="group/btn inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 hover:shadow-md transition-all duration-200"
                      >
                        <Download className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                        Scarica PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab()
      case 'notifications':
        return renderNotificationsTab()
      case 'security':
        return renderSecurityTab()
      case 'subscription':
        return renderSubscriptionTab()
      default:
        return renderProfileTab()
    }
  }

  return (
    <div className="space-y-6">
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