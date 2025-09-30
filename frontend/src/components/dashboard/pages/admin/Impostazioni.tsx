import { Settings, User, Bell, Shield, Database, Mail, CreditCard, Save, Eye, EyeOff } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../../../context/AuthContext'

export default function Impostazioni() {
  const { user, token, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [profileData, setProfileData] = useState({
    nome: '',
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

          setProfileData({
            nome: userData.name || '',
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
        console.error('Error loading profile:', error)
      }
    }

    loadUserProfile()
  }, [user, token])

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNewClient: true,
    emailNewRequest: true,
    emailPayment: false,
    pushNotifications: true,
    weeklyReport: true
  })

  const [systemSettings, setSystemSettings] = useState({
    language: 'it',
    timezone: 'Europe/Rome',
    dateFormat: 'DD/MM/YYYY',
    currency: 'EUR',
    theme: 'light'
  })

  const [integrationSettings, setIntegrationSettings] = useState({
    apiKey: 'sk_live_1234567890abcdef',
    webhookUrl: 'https://taxflow.it/api/webhooks',
    autoBackup: true,
    backupFrequency: 'daily'
  })

  const tabs = [
    { id: 'profile', name: 'Profilo', icon: User },
    { id: 'notifications', name: 'Notifiche', icon: Bell },
    { id: 'security', name: 'Sicurezza', icon: Shield },
    { id: 'system', name: 'Sistema', icon: Settings },
    { id: 'integrations', name: 'Integrazioni', icon: Database }
  ]

  const handleSave = async (section: string) => {
    setLoading(true)
    setMessage(null)

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
            name: profileData.nome,
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

        // Aggiorna anche i campi del form con i nuovi dati
        setProfileData({
          nome: data.user.name || '',
          email: data.user.email || '',
          telefono: data.user.phone || '',
          ruolo: data.user.professionalRole || '',
          bio: data.user.bio || '',
          indirizzo: data.user.address || '',
          codiceFiscale: data.user.fiscalCode || '',
          ordineIscrizione: data.user.registrationNumber || ''
        })

        setMessage({ type: 'success', text: 'Profilo aggiornato con successo!' })
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
        setMessage({ type: 'success', text: 'Password aggiornata con successo!' })
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

        setMessage({ type: 'success', text: 'Preferenze notifiche aggiornate con successo!' })
      } else {
        // Per ora le altre sezioni non sono implementate
        setMessage({ type: 'success', text: `Impostazioni ${section} salvate!` })
      }
    } catch (error: any) {
      console.error(`Error saving ${section}:`, error)
      setMessage({ type: 'error', text: error.message || 'Errore durante il salvataggio' })
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
              Ruolo Professionale
            </label>
            <input
              type="text"
              value={profileData.ruolo}
              onChange={(e) => setProfileData(prev => ({ ...prev, ruolo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
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
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Indirizzo Studio
          </label>
          <input
            type="text"
            value={profileData.indirizzo}
            onChange={(e) => setProfileData(prev => ({ ...prev, indirizzo: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
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
          <div className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-50 group-hover:scale-110 transition-transform mr-3">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Notifiche Email</p>
                <p className="text-sm text-gray-600">Ricevi notifiche via email per eventi importanti</p>
              </div>
            </div>
          </div>

          <div className="ml-8 space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notificationSettings.emailNewClient}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNewClient: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Nuovo cliente registrato</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notificationSettings.emailNewRequest}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNewRequest: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Nuova richiesta P.IVA</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notificationSettings.emailPayment}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailPayment: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Pagamenti ricevuti</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notificationSettings.weeklyReport}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, weeklyReport: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Report settimanale</span>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sicurezza Account</h3>

        <div className="group bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center">
            <div className="p-1 rounded-lg bg-blue-100 group-hover:scale-110 transition-transform mr-2">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-900">Account Sicuro</p>
              <p className="text-sm text-blue-700">Il tuo account è protetto con autenticazione a due fattori</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Cambia Password</h4>
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
                  disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 hover:scale-105 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Aggiornamento...' : 'Aggiorna Password'}
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-4">Autenticazione a Due Fattori</h4>
            <div className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300">
              <div>
                <p className="font-medium text-gray-900">2FA Attivata</p>
                <p className="text-sm text-gray-600">Proteggi il tuo account con un livello aggiuntivo di sicurezza</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-green-600 font-medium">Attiva</span>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 hover:scale-105 hover:shadow-lg transition-all duration-200 text-sm">
                  Disattiva
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-4">Sessioni Attive</h4>
            <div className="space-y-3">
              <div className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300">
                <div>
                  <p className="font-medium text-gray-900">Browser Corrente</p>
                  <p className="text-sm text-gray-600">Chrome su Windows • Milano, Italia</p>
                  <p className="text-xs text-gray-500">Ultima attività: adesso</p>
                </div>
                <span className="text-sm text-green-600 font-medium">Attuale</span>
              </div>

              <div className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300">
                <div>
                  <p className="font-medium text-gray-900">Safari su iPhone</p>
                  <p className="text-sm text-gray-600">Milano, Italia</p>
                  <p className="text-xs text-gray-500">Ultima attività: 2 ore fa</p>
                </div>
                <button className="text-red-600 hover:text-red-700 hover:scale-110 transition-all duration-200 text-sm font-medium">
                  Termina Sessione
                </button>
              </div>
            </div>
          </div>
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
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform duration-200"
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 hover:scale-105 hover:shadow-lg transition-all duration-200">
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
              <div className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300">
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
            <h4 className="font-medium text-gray-900 mb-4">Servizi Esterni</h4>
            <div className="space-y-3">
              <div className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 hover:scale-110 transition-transform">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Stripe</p>
                    <p className="text-sm text-gray-600">Pagamenti online</p>
                  </div>
                </div>
                <span className="text-sm text-green-600 font-medium">Connesso</span>
              </div>

              <div className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 hover:scale-110 transition-transform">
                    <Mail className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">SendGrid</p>
                    <p className="text-sm text-gray-600">Invio email</p>
                  </div>
                </div>
                <button className="text-primary-600 hover:text-primary-700 hover:scale-110 transition-all duration-200 text-sm font-medium">
                  Connetti
                </button>
              </div>

              <div className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 hover:scale-110 transition-transform">
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
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 hover:scale-105 hover:shadow-lg transition-all duration-200 flex items-center"
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
      case 'system':
        return renderSystemTab()
      case 'integrations':
        return renderIntegrationsTab()
      default:
        return renderProfileTab()
    }
  }

  return (
    <div className="space-y-6">
      {/* Message feedback */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {message.text}
          </p>
        </div>
      )}

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