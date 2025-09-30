import { useState } from 'react'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Logo from './common/Logo'
import apiService from '../services/api'

type UserRole = 'business' | 'admin'

interface User {
  email: string
  name: string
  role: UserRole
}

interface LoginRegisterProps {
  onBack: () => void
  onLogin: (user: User) => void
  initialMode?: boolean
}

export default function LoginRegister({ onBack, onLogin, initialMode = true }: LoginRegisterProps) {
  const [isLogin, setIsLogin] = useState(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (isLogin) {
        // Real API login
        const response = await apiService.login({
          email: formData.email,
          password: formData.password
        })

        onLogin({
          email: response.user.email,
          name: response.user.name,
          role: response.user.role
        })
      } else {
        // Real API registration
        if (formData.password !== formData.confirmPassword) {
          setError('Le password non coincidono')
          return
        }

        const response = await apiService.register({
          email: formData.email,
          password: formData.password,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          role: 'business'
        })

        onLogin({
          email: response.user.email,
          name: response.user.name,
          role: response.user.role
        })
      }
    } catch (error: any) {
      setError(error.message || 'Si è verificato un errore')
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
            {isLogin ? 'Accedi al tuo account' : 'Crea il tuo account'}
          </h2>
          <p className="text-gray-600 text-sm">
            {isLogin
              ? 'Gestisci la tua partita IVA forfettaria'
              : 'Inizia a gestire la tua partita IVA forfettaria'
            }
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          {/* Test users info */}
          {isLogin && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Utenti di test disponibili:</h3>
              <div className="text-xs text-blue-700 space-y-1">
                <div><strong>Business:</strong> marco.bianchi@email.com / cliente123</div>
                <div><strong>Admin:</strong> francesco.alberti@taxflow.it / admin123</div>
              </div>
            </div>
          )}

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
            {/* Error message */}
            {error && (
              <div className={`p-3 rounded-md text-sm ${
                error.includes('completata')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {error}
              </div>
            )}

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

            {!isLogin && (
              <div className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  Azienda (opzionale)
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  placeholder="La mia azienda"
                />
              </div>
            )}

            {/* Email field */}
            <div className="animate-fade-in-up" style={{animationDelay: isLogin ? '0s' : '0.2s'}}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
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
        </div>

      </div>
    </div>
  )
}