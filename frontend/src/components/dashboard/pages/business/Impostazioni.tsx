import { User, Bell, Shield, CreditCard, Save, Eye, EyeOff, Building, Clock, Trash2 } from 'lucide-react'
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

export default function Impostazioni() {
  const { user, token, updateUser } = useAuth()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionTimeout, setSessionTimeout] = useState(43200) // Default 30 days
  const [loading, setLoading] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(false)

  const [profileData, setProfileData] = useState({
    nome: 'Mario Rossi',
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
    const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/
    return cfRegex.test(cf.toUpperCase())
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
  const formatPhone = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('39') && cleaned.length === 12) {
      return `+39 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
    }
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
    }
    return phone
  }

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

  const formatCAP = (cap: string): string => {
    return cap.replace(/\D/g, '').slice(0, 5)
  }


  const validateProfile = (): boolean => {
    const errors: {[key: string]: string} = {}

    if (!profileData.nome.trim()) {
      errors.nome = 'Il nome è obbligatorio'
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
      errors.codiceFiscale = 'Codice fiscale non valido (16 caratteri)'
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
    metodoPagamentoPredefinito: 'carta',
    fatturazione: {
      ragioneSociale: 'Mario Rossi',
      partitaIva: 'IT12345678901',
      codiceFiscale: 'RSSMRA85M15F205Z',
      indirizzo: 'Via Milano 45, 20121 Milano',
      pec: 'mario.rossi@pec.it',
      codiceDestinatario: 'XXXXXXX'
    },
    autoRinnovo: true,
    emailRicevute: true
  })

  const tabs = [
    { id: 'profile', name: 'Profilo', icon: User },
    { id: 'notifications', name: 'Notifiche', icon: Bell },
    { id: 'security', name: 'Sicurezza', icon: Shield },
    { id: 'payment', name: 'Pagamenti', icon: CreditCard }
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

        setProfileData({
          nome: userData.name || '',
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
            name: profileData.nome,
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

        setProfileData({
          nome: data.user.name || '',
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
              Nome Completo *
            </label>
            <input
              type="text"
              value={profileData.nome || ''}
              onChange={(e) => setProfileData(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
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
            {validationErrors.email && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefono
            </label>
            <input
              type="tel"
              value={profileData.telefono || ''}
              onChange={(e) => {
                setProfileData(prev => ({ ...prev, telefono: e.target.value }))
                if (validationErrors.telefono) {
                  setValidationErrors(prev => ({ ...prev, telefono: '' }))
                }
              }}
              onBlur={(e) => {
                if (e.target.value) {
                  setProfileData(prev => ({ ...prev, telefono: formatPhone(e.target.value) }))
                }
              }}
              placeholder="+39 XXX XXX XXXX"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                validationErrors.telefono ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.telefono && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.telefono}</p>
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
            {validationErrors.codiceFiscale && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.codiceFiscale}</p>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Città
            </label>
            <input
              type="text"
              value={profileData.citta || ''}
              onChange={(e) => setProfileData(prev => ({ ...prev, citta: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CAP
            </label>
            <input
              type="text"
              value={profileData.cap || ''}
              onChange={(e) => {
                const formatted = formatCAP(e.target.value)
                setProfileData(prev => ({ ...prev, cap: formatted }))
                if (validationErrors.cap) {
                  setValidationErrors(prev => ({ ...prev, cap: '' }))
                }
              }}
              maxLength={5}
              placeholder="00100"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                validationErrors.cap ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.cap && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.cap}</p>
            )}
          </div>
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
              {validationErrors.partitaIva && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.partitaIva}</p>
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
              {validationErrors.codiceAteco && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.codiceAteco}</p>
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
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => handleSave('profile')}
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 hover:scale-105 hover:shadow-lg transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferenze Notifiche</h3>

        <div className="space-y-4">
          <div className="group bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100 group-hover:scale-110 transition-transform mr-3">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">Notifiche Email</p>
                <p className="text-sm text-blue-700">Ricevi aggiornamenti importanti via email</p>
              </div>
            </div>
          </div>

          <div className="ml-8 space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notificationSettings.emailDocumentiRichiesti}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailDocumentiRichiesti: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Richieste documenti dal consulente</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notificationSettings.emailScadenzeFiscali}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailScadenzeFiscali: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Scadenze fiscali e tributarie</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notificationSettings.emailFattureRicevute}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailFattureRicevute: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Fatture e pagamenti</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notificationSettings.emailConsulenza}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailConsulenza: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Risposte del consulente</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notificationSettings.newsletterFiscale}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, newsletterFiscale: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Newsletter fiscale settimanale</span>
            </label>
          </div>

          <div className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-50 group-hover:scale-110 transition-transform mr-3">
                <Bell className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Notifiche Push</p>
                <p className="text-sm text-gray-600">Notifiche in tempo reale sul browser</p>
              </div>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notificationSettings.pushNotifications}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
          </div>

          <div className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-orange-50 group-hover:scale-110 transition-transform mr-3">
                <Bell className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">SMS Urgenti</p>
                <p className="text-sm text-gray-600">SMS per scadenze fiscali imminenti</p>
              </div>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notificationSettings.smsUrgenti}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, smsUrgenti: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
          </div>

          <div className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-purple-50 group-hover:scale-110 transition-transform mr-3">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Email Promozionali</p>
                <p className="text-sm text-gray-600">Offerte speciali e nuovi servizi</p>
              </div>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notificationSettings.promozionali}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, promozionali: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => handleSave('notifications')}
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 hover:scale-105 hover:shadow-lg transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvataggio...' : 'Salva Preferenze'}
          </button>
        </div>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Sicurezza Account</h3>

        <div className="group bg-green-50 border border-green-200 rounded-lg p-4 mb-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center">
            <div className="p-1 rounded-lg bg-green-100 group-hover:scale-110 transition-transform mr-2">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-900">Account Sicuro</p>
              <p className="text-sm text-green-700">Il tuo account è protetto e sicuro</p>
            </div>
          </div>
        </div>

        {/* Grid Layout per le card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card: Cambia Password */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 text-primary-600 mr-2" />
              Cambia Password
            </h4>
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
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform duration-200"
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
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 hover:scale-105 hover:shadow-lg transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Aggiornamento...' : 'Aggiorna Password'}
                </button>
              </div>
            </div>
          </div>

          {/* Card: Timeout Sessione */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 text-blue-600 mr-2" />
              Timeout Sessione
            </h4>
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
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 hover:scale-105 hover:shadow-lg transition-all duration-200 text-sm flex items-center disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Salva Timeout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sessioni Attive - Full width */}
        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Shield className="h-5 w-5 text-green-600 mr-2" />
              Sessioni Attive
            </h4>
              <div className="flex space-x-2">
                <button
                  onClick={handleCleanupSessions}
                  disabled={loading}
                  className="text-orange-600 hover:text-orange-700 hover:scale-110 transition-all duration-200 text-sm font-medium flex items-center disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Pulisci Inattive
                </button>
                {sessions.filter(s => !s.isCurrent).length > 0 && (
                  <button
                    onClick={handleTerminateAllSessions}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700 hover:scale-110 transition-all duration-200 text-sm font-medium disabled:opacity-50"
                  >
                    Termina Tutte
                  </button>
                )}
              </div>
            </div>

            {loadingSessions ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Caricamento sessioni...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Nessuna sessione attiva</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow duration-300 ${
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
                        className="text-red-600 hover:text-red-700 hover:scale-110 transition-all duration-200 text-sm font-medium"
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
          <div className="group flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-300 bg-white">
            <div>
              <p className="font-medium text-gray-900">Scarica i tuoi dati</p>
              <p className="text-sm text-gray-600">Esporta tutti i tuoi dati personali</p>
            </div>
            <button className="text-primary-600 hover:text-primary-700 hover:scale-110 transition-all duration-200 text-sm font-medium">
              Scarica
            </button>
          </div>

          <div className="group flex items-center justify-between p-4 border border-red-200 rounded-xl hover:shadow-md transition-shadow duration-300 bg-white">
            <div>
              <p className="font-medium text-red-900">Elimina Account</p>
              <p className="text-sm text-red-600">Elimina permanentemente il tuo account e tutti i dati</p>
            </div>
            <button className="text-red-600 hover:text-red-700 hover:scale-110 transition-all duration-200 text-sm font-medium">
              Elimina
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPaymentTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Impostazioni Pagamento</h3>

        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Metodo di Pagamento Predefinito</h4>
            <div className="space-y-3">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="metodoPagamento"
                  value="carta"
                  checked={paymentSettings.metodoPagamentoPredefinito === 'carta'}
                  onChange={(e) => setPaymentSettings(prev => ({ ...prev, metodoPagamentoPredefinito: e.target.value }))}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <div className="ml-3 flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-900">Carta di Credito/Debito</span>
                </div>
              </label>

              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="metodoPagamento"
                  value="paypal"
                  checked={paymentSettings.metodoPagamentoPredefinito === 'paypal'}
                  onChange={(e) => setPaymentSettings(prev => ({ ...prev, metodoPagamentoPredefinito: e.target.value }))}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <div className="ml-3 flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-900">PayPal</span>
                </div>
              </label>

              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="metodoPagamento"
                  value="bonifico"
                  checked={paymentSettings.metodoPagamentoPredefinito === 'bonifico'}
                  onChange={(e) => setPaymentSettings(prev => ({ ...prev, metodoPagamentoPredefinito: e.target.value }))}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <div className="ml-3 flex items-center">
                  <Building className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-900">Bonifico Bancario</span>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-4">Dati Fatturazione</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ragione Sociale
                </label>
                <input
                  type="text"
                  value={paymentSettings.fatturazione.ragioneSociale}
                  onChange={(e) => setPaymentSettings(prev => ({
                    ...prev,
                    fatturazione: { ...prev.fatturazione, ragioneSociale: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partita IVA
                </label>
                <input
                  type="text"
                  value={paymentSettings.fatturazione.partitaIva}
                  onChange={(e) => setPaymentSettings(prev => ({
                    ...prev,
                    fatturazione: { ...prev.fatturazione, partitaIva: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Codice Fiscale
                </label>
                <input
                  type="text"
                  value={paymentSettings.fatturazione.codiceFiscale}
                  onChange={(e) => setPaymentSettings(prev => ({
                    ...prev,
                    fatturazione: { ...prev.fatturazione, codiceFiscale: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PEC
                </label>
                <input
                  type="email"
                  value={paymentSettings.fatturazione.pec}
                  onChange={(e) => setPaymentSettings(prev => ({
                    ...prev,
                    fatturazione: { ...prev.fatturazione, pec: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Indirizzo Fatturazione
                </label>
                <input
                  type="text"
                  value={paymentSettings.fatturazione.indirizzo}
                  onChange={(e) => setPaymentSettings(prev => ({
                    ...prev,
                    fatturazione: { ...prev.fatturazione, indirizzo: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Codice Destinatario
                </label>
                <input
                  type="text"
                  value={paymentSettings.fatturazione.codiceDestinatario}
                  onChange={(e) => setPaymentSettings(prev => ({
                    ...prev,
                    fatturazione: { ...prev.fatturazione, codiceDestinatario: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="XXXXXXX"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-4">Preferenze</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={paymentSettings.autoRinnovo}
                  onChange={(e) => setPaymentSettings(prev => ({ ...prev, autoRinnovo: e.target.checked }))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Auto-rinnovo abbonamento</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={paymentSettings.emailRicevute}
                  onChange={(e) => setPaymentSettings(prev => ({ ...prev, emailRicevute: e.target.checked }))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Ricevi ricevute via email</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => handleSave('payment')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 hover:scale-105 hover:shadow-lg transition-all duration-200 flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            Salva Impostazioni
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
      case 'payment':
        return renderPaymentTab()
      default:
        return renderProfileTab()
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 hover:scale-105 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
        {renderTabContent()}
      </div>
    </div>
  )
}