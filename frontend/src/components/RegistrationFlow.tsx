import { useState } from 'react'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Logo from './common/Logo'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import PivaRequestForm, { type PivaRequestData } from './PivaRequestForm'

interface RegistrationFlowProps {
  onBack: () => void
  onComplete: () => void
}

export default function RegistrationFlow({ onBack, onComplete }: RegistrationFlowProps) {
  const { login } = useAuth()
  const { showToast } = useToast()
  const [step, setStep] = useState<'register' | 'questionnaire'>('register')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      showToast('Le password non coincidono', 'error')
      return
    }

    if (formData.password.length < 6) {
      showToast('La password deve essere di almeno 6 caratteri', 'error')
      return
    }

    try {
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
          role: 'business'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Registrazione fallita')
      }

      // Salva le credenziali e passa al questionario
      setCredentials({ email: formData.email, password: formData.password })
      setStep('questionnaire')
      showToast('Account creato! Compila il questionario per continuare', 'success')
    } catch (error: any) {
      showToast(error.message || 'Si è verificato un errore', 'error')
    }
  }

  const handleQuestionnaireSubmit = async (pivaData: PivaRequestData) => {
    try {
      // Prima effettua il login per ottenere il token
      await login(credentials.email, credentials.password)

      // Ottieni il token dal localStorage
      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Token non trovato')
      }

      // Invia i dati del questionario al backend usando apiService
      const apiService = (await import('../services/api')).default
      await apiService.updateUserProfile({
        pivaRequestData: {
          ...pivaData,
          submittedAt: new Date()
        },
        approvalStatus: 'pending_approval'
      })

      showToast('Questionario inviato con successo!', 'success')

      // Aggiorna l'utente nel localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      userData.approvalStatus = 'pending_approval'
      userData.pivaRequestData = { ...pivaData, submittedAt: new Date() }
      localStorage.setItem('user', JSON.stringify(userData))

      // Completa il flusso
      setTimeout(() => {
        onComplete()
      }, 1000)
    } catch (error: any) {
      showToast(error.message || 'Errore durante l\'invio', 'error')
      throw error
    }
  }

  if (step === 'questionnaire') {
    return <PivaRequestForm onSubmit={handleQuestionnaireSubmit} />
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
            Crea il tuo account
          </h2>
          <p className="text-gray-600 text-sm">
            Inizia a gestire la tua partita IVA forfettaria
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Registration fields */}
            <div className="grid grid-cols-2 gap-3 animate-fade-in-up" style={{animationDelay: '0s'}}>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
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
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  placeholder="Rossi"
                />
              </div>
            </div>

            {/* Email field */}
            <div className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
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
            <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
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

            {/* Confirm password field */}
            <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Conferma Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
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

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-2.5 px-4 rounded-md font-medium hover:bg-primary-700 hover:shadow-lg hover:scale-105 transition-all duration-300 transform animate-fade-in-up"
              style={{animationDelay: '0.4s'}}
            >
              Continua con il Questionario
            </button>

            {/* Terms and conditions */}
            <p className="text-xs text-gray-600 text-center animate-fade-in-up" style={{animationDelay: '0.5s'}}>
              Creando un account accetti i nostri{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 transition-colors duration-300 underline">
                Termini di Servizio
              </a>{' '}
              e la{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 transition-colors duration-300 underline">
                Privacy Policy
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
