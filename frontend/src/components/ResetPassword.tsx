import { useState, useEffect } from 'react'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Logo from './common/Logo'
import { useToast } from '../context/ToastContext'

interface ResetPasswordProps {
  onBack: () => void
  onSuccess: () => void
}

export default function ResetPassword({ onBack, onSuccess }: ResetPasswordProps) {
  const { showToast } = useToast()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)

  // Password validation
  const passwordValidation = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    passwordsMatch: password === confirmPassword && confirmPassword.length > 0
  }

  const isPasswordValid = Object.values(passwordValidation).every(Boolean)

  useEffect(() => {
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search)
    const tokenFromUrl = urlParams.get('token')

    if (tokenFromUrl) {
      setToken(tokenFromUrl)
    } else {
      showToast('Token di reset non valido', 'error')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      showToast('Token di reset non valido', 'error')
      return
    }

    if (password !== confirmPassword) {
      showToast('Le password non coincidono', 'error')
      return
    }

    if (password.length < 8) {
      showToast('La password deve essere di almeno 8 caratteri', 'error')
      return
    }

    if (!/[A-Z]/.test(password)) {
      showToast('La password deve contenere almeno una lettera maiuscola', 'error')
      return
    }

    if (!/[a-z]/.test(password)) {
      showToast('La password deve contenere almeno una lettera minuscola', 'error')
      return
    }

    if (!/[0-9]/.test(password)) {
      showToast('La password deve contenere almeno un numero', 'error')
      return
    }

    setIsLoading(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante il reset')
      }

      setIsSuccess(true)
      showToast(data.message, 'success')

      // Clean URL completely (remove token and path)
      window.history.replaceState({}, document.title, '/')

      // Redirect to login after 2 seconds
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore durante il reset'
      showToast(errorMessage, 'error')
    } finally {
      setIsLoading(false)
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
            {isSuccess ? 'Password Reimpostata!' : 'Reimposta Password'}
          </h2>
          <p className="text-gray-600 text-sm">
            {isSuccess
              ? 'La tua password è stata reimpostata con successo'
              : 'Inserisci la tua nuova password'
            }
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          {isSuccess ? (
            <div className="text-center py-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Verrai reindirizzato alla pagina di login tra pochi secondi...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Password field */}
              <div className="animate-fade-in-up" style={{animationDelay: '0s'}}>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Nuova Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setPasswordTouched(true)}
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

                {/* Password strength indicators */}
                {passwordTouched && password && (
                  <div className="mt-2 space-y-1">
                    <div className={`text-xs flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-1">{passwordValidation.minLength ? '✓' : '○'}</span>
                      Almeno 8 caratteri
                    </div>
                    <div className={`text-xs flex items-center ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-1">{passwordValidation.hasUpperCase ? '✓' : '○'}</span>
                      Una lettera maiuscola
                    </div>
                    <div className={`text-xs flex items-center ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-1">{passwordValidation.hasLowerCase ? '✓' : '○'}</span>
                      Una lettera minuscola
                    </div>
                    <div className={`text-xs flex items-center ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-1">{passwordValidation.hasNumber ? '✓' : '○'}</span>
                      Un numero
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password field */}
              <div className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Conferma Nuova Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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

                {/* Password match indicator */}
                {confirmPassword && (
                  <div className={`text-xs flex items-center mt-2 ${passwordValidation.passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="mr-1">{passwordValidation.passwordsMatch ? '✓' : '✗'}</span>
                    {passwordValidation.passwordsMatch ? 'Le password coincidono' : 'Le password non coincidono'}
                  </div>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading || !isPasswordValid}
                className="w-full bg-primary-600 text-white py-2.5 px-4 rounded-md font-medium hover:bg-primary-700 hover:shadow-lg hover:scale-105 transition-all duration-300 transform animate-fade-in-up disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{animationDelay: '0.2s'}}
              >
                {isLoading ? 'Reimpostazione...' : 'Reimposta Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
