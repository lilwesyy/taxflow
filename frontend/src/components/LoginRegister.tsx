import { useState } from 'react'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Logo from './common/Logo'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

interface LoginRegisterProps {
  onBack: () => void
  onLogin: () => void
  onRegistrationSuccess?: (email: string) => void
  initialMode?: boolean
}

export default function LoginRegister({ onBack, onLogin, onRegistrationSuccess, initialMode = true }: LoginRegisterProps) {
  const { login } = useAuth()
  const { showToast } = useToast()
  const [isLogin, setIsLogin] = useState(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [requires2FA, setRequires2FA] = useState(false)
  const [twoFACode, setTwoFACode] = useState('')
  const [tempUserId, setTempUserId] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()

    if (twoFACode.length !== 6) {
      showToast('Inserisci un codice di 6 cifre', 'warning')
      return
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/auth/login/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: tempUserId,
          token: twoFACode
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Codice non valido')
      }

      const data = await response.json()

      // Salva il token e l'utente
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      showToast('Accesso eseguito con successo', 'success')

      // Ricarica l'app per aggiornare il contesto
      setTimeout(() => window.location.reload(), 500)
    } catch (error: any) {
      showToast(error.message || 'Errore durante la verifica', 'error')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isLogin) {
        // Login usando AuthContext - modificato per gestire 2FA
        const result = await login(formData.email, formData.password)

        // Se richiede 2FA, mostra il form per il codice
        if (result && result.requires2FA) {
          setRequires2FA(true)
          setTempUserId(result.userId || '')
          return
        }

        showToast('Accesso eseguito con successo', 'success')
        onLogin()
      } else {
        // Registration
        if (formData.password !== formData.confirmPassword) {
          showToast('Le password non coincidono', 'error')
          return
        }

        const API_URL = import.meta.env.VITE_API_URL || '/api'
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            phone: formData.phone,
            role: 'business'
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Registration failed')
        }

        // Reindirizza alla pagina di successo
        if (onRegistrationSuccess) {
          onRegistrationSuccess(formData.email)
        } else {
          showToast('Registrazione completata! Verrai contattato da un consulente entro 24-48 ore.', 'success')
          setIsLogin(true)
        }
      }
    } catch (error: any) {
      showToast(error.message || 'Si è verificato un errore', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center relative py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-primary-600 transition-colors duration-300 group z-10"
      >
        <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
        Torna alla home
      </button>

      <div className="max-w-md w-full space-y-6 px-4">
        <div className="text-center animate-fade-in-up">
          <div className="flex items-center justify-center mb-4">
            <Logo className="h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {requires2FA ? 'Autenticazione a Due Fattori' : isLogin ? 'Accedi al tuo account' : 'Crea il tuo account'}
          </h2>
          <p className="text-gray-600 text-sm">
            {requires2FA
              ? 'Inserisci il codice dalla tua app di autenticazione'
              : isLogin
              ? 'Gestisci la tua partita IVA forfettaria'
              : 'Inizia a gestire la tua partita IVA forfettaria'
            }
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          {requires2FA ? (
            // 2FA Form
            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Codice di Verifica
                </label>
                <input
                  type="text"
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  placeholder="123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-center text-2xl tracking-widest"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1 text-center">Inserisci il codice a 6 cifre dalla tua app</p>
              </div>

              <button
                type="submit"
                disabled={twoFACode.length !== 6}
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 hover:scale-105 hover:shadow-xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Verifica e Accedi
              </button>

              <button
                type="button"
                onClick={() => {
                  setRequires2FA(false)
                  setTwoFACode('')
                  setTempUserId('')
                }}
                className="w-full text-gray-600 py-2 text-sm hover:text-gray-900 transition-colors"
              >
                ← Torna al login
              </button>
            </form>
          ) : (
            <>
              {/* Toggle buttons */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                    isLogin
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Accedi
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                    !isLogin
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Registrati
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
            {/* Registration fields */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3 animate-fade-in-up" style={{animationDelay: '0s'}}>
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required={!isLogin}
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                    placeholder="Mario"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Cognome
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required={!isLogin}
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                    placeholder="Rossi"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="animate-fade-in-up" style={{animationDelay: isLogin ? '0s' : '0.1s'}}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                placeholder="mario.rossi@email.com"
              />
            </div>

            {/* Phone field (only for registration) */}
            {!isLogin && (
              <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Numero di Telefono *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required={!isLogin}
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  placeholder="+39 123 456 7890"
                />
              </div>
            )}

            {/* Password field */}
            <div className="animate-fade-in-up" style={{animationDelay: isLogin ? '0.1s' : '0.3s'}}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password field (only for registration) */}
            {!isLogin && (
              <div className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Conferma Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required={!isLogin}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot password link (only for login) */}
            {isLogin && (
              <div className="text-right animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <a href="#" className="text-sm text-primary-600 hover:text-primary-700 transition-colors duration-300">
                  Password dimenticata?
                </a>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-2.5 px-4 rounded-md font-medium hover:bg-primary-700 hover:shadow-lg hover:scale-105 transition-all duration-300 transform animate-fade-in-up"
              style={{animationDelay: isLogin ? '0.3s' : '0.5s'}}
            >
              {isLogin ? 'Accedi' : 'Crea Account'}
            </button>

            {/* Terms and conditions (only for registration) */}
            {!isLogin && (
              <p className="text-xs text-gray-600 text-center animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                Creando un account accetti i nostri{' '}
                <button 
                  type="button"
                  onClick={() => window.history.back()}
                  className="text-primary-600 hover:text-primary-700 transition-colors duration-300 underline"
                >
                  Termini di Servizio
                </button>{' '}
                e la{' '}
                <button 
                  type="button"
                  onClick={() => window.history.back()}
                  className="text-primary-600 hover:text-primary-700 transition-colors duration-300 underline"
                >
                  Privacy Policy
                </button>
              </p>
            )}
          </form>
            </>
          )}
        </div>

      </div>
    </div>
  )
}