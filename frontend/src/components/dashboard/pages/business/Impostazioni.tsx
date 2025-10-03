import { Settings, User, Bell, Shield, CreditCard, Save, Eye, EyeOff, Building, Receipt, Clock, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import apiService from '../../../../services/api'
import { useToast } from '../../../../context/ToastContext'

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
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionTimeout, setSessionTimeout] = useState(43200) // Default 30 days
  const [loading, setLoading] = useState(false)

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
    regimeFiscale: 'Forfettario'
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

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

  const [systemSettings, setSystemSettings] = useState({
    language: 'it',
    timezone: 'Europe/Rome',
    dateFormat: 'DD/MM/YYYY',
    currency: 'EUR',
    theme: 'light'
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
    { id: 'payment', name: 'Pagamenti', icon: CreditCard },
    { id: 'system', name: 'Sistema', icon: Settings }
  ]

  // Load sessions when security tab is active
  useEffect(() => {
    if (activeTab === 'security') {
      loadSessions()
      loadSessionTimeout()
    }
  }, [activeTab])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const response = await apiService.getSessions()
      setSessions(response.sessions)
    } catch (error) {
      console.error('Failed to load sessions:', error)
      showToast('Errore nel caricamento delle sessioni', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadSessionTimeout = async () => {
    try {
      const response = await apiService.getSessionTimeout()
      setSessionTimeout(response.sessionTimeout)
    } catch (error) {
      console.error('Failed to load session timeout:', error)
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    if (!confirm('Sei sicuro di voler terminare questa sessione?')) return

    try {
      await apiService.terminateSession(sessionId)
      showToast('Sessione terminata con successo', 'success')
      loadSessions()
    } catch (error) {
      console.error('Failed to terminate session:', error)
      showToast('Errore nella terminazione della sessione', 'error')
    }
  }

  const handleTerminateAllSessions = async () => {
    if (!confirm('Sei sicuro di voler terminare tutte le altre sessioni?')) return

    try {
      await apiService.terminateAllSessions()
      showToast('Tutte le altre sessioni sono state terminate', 'success')
      loadSessions()
    } catch (error) {
      console.error('Failed to terminate all sessions:', error)
      showToast('Errore nella terminazione delle sessioni', 'error')
    }
  }

  const handleSaveSessionTimeout = async () => {
    try {
      await apiService.updateSessionTimeout(sessionTimeout)
      showToast('Timeout sessione aggiornato con successo', 'success')
    } catch (error) {
      console.error('Failed to update session timeout:', error)
      showToast('Errore nell\'aggiornamento del timeout', 'error')
    }
  }

  const handleCleanupSessions = async () => {
    if (!confirm('Eliminare manualmente tutte le sessioni inattive?')) return

    try {
      const response = await apiService.cleanupSessions()
      showToast(response.message, 'success')
      loadSessions()
    } catch (error) {
      console.error('Failed to cleanup sessions:', error)
      showToast('Errore nella pulizia delle sessioni', 'error')
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

  const handleSave = (section: string) => {
    // Qui sarebbe implementata la logica per salvare le impostazioni
    console.log(`Salvataggio impostazioni ${section}`)
    // Mostra notifica di successo
    showToast('Impostazioni salvate con successo!', 'success')
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
              value={profileData.nome}
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
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefono
            </label>
            <input
              type="tel"
              value={profileData.telefono}
              onChange={(e) => setProfileData(prev => ({ ...prev, telefono: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Codice Fiscale
            </label>
            <input
              type="text"
              value={profileData.codiceFiscale}
              onChange={(e) => setProfileData(prev => ({ ...prev, codiceFiscale: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professione
            </label>
            <input
              type="text"
              value={profileData.professione}
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
              value={profileData.settoreAttivita}
              onChange={(e) => setProfileData(prev => ({ ...prev, settoreAttivita: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Indirizzo Completo
          </label>
          <input
            type="text"
            value={profileData.indirizzo}
            onChange={(e) => setProfileData(prev => ({ ...prev, indirizzo: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Città
            </label>
            <input
              type="text"
              value={profileData.citta}
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
              value={profileData.cap}
              onChange={(e) => setProfileData(prev => ({ ...prev, cap: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Informazioni Fiscali */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-4">Informazioni Fiscali</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Partita IVA
              </label>
              <input
                type="text"
                value={profileData.partitaIva}
                onChange={(e) => setProfileData(prev => ({ ...prev, partitaIva: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="IT12345678901"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regime Fiscale
              </label>
              <select
                value={profileData.regimeFiscale}
                onChange={(e) => setProfileData(prev => ({ ...prev, regimeFiscale: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Forfettario">Regime Forfettario</option>
                <option value="Semplificato">Regime Semplificato</option>
                <option value="Ordinario">Regime Ordinario</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => handleSave('profile')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 hover:scale-105 hover:shadow-lg transition-all duration-200 flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            Salva Modifiche
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
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 hover:scale-105 hover:shadow-lg transition-all duration-200 flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            Salva Preferenze
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
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
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

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('password')}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 hover:scale-105 hover:shadow-lg transition-all duration-200 text-sm"
                >
                  Aggiorna Password
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
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 hover:scale-105 hover:shadow-lg transition-all duration-200 text-sm flex items-center"
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
                  className="text-orange-600 hover:text-orange-700 hover:scale-110 transition-all duration-200 text-sm font-medium flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Pulisci Inattive
                </button>
                {sessions.filter(s => !s.isCurrent).length > 0 && (
                  <button
                    onClick={handleTerminateAllSessions}
                    className="text-red-600 hover:text-red-700 hover:scale-110 transition-all duration-200 text-sm font-medium"
                  >
                    Termina Tutte
                  </button>
                )}
              </div>
            </div>

            {loading ? (
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

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Impostazioni Sistema</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lingua
            </label>
            <select
              value={systemSettings.language}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, language: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="it">Italiano</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fuso Orario
            </label>
            <select
              value={systemSettings.timezone}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="Europe/Rome">Europa/Roma (GMT+1)</option>
              <option value="Europe/London">Europa/Londra (GMT+0)</option>
              <option value="America/New_York">America/New York (GMT-5)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formato Data
            </label>
            <select
              value={systemSettings.dateFormat}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valuta
            </label>
            <select
              value={systemSettings.currency}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="EUR">Euro (€)</option>
              <option value="USD">Dollaro US ($)</option>
              <option value="GBP">Sterlina (£)</option>
              <option value="CHF">Franco Svizzero (CHF)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tema
            </label>
            <select
              value={systemSettings.theme}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, theme: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="light">Chiaro</option>
              <option value="dark">Scuro</option>
              <option value="auto">Automatico</option>
            </select>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Receipt className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Piano Attuale: Regime Forfettario</p>
              <p className="text-xs text-blue-800 mt-1">
                Hai accesso a tutte le funzionalità per la gestione del regime forfettario
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => handleSave('system')}
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
      case 'system':
        return renderSystemTab()
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