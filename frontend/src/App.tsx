import { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage'
import LoginRegister from './components/LoginRegister'
import RegistrationSuccess from './components/RegistrationSuccess'
import Dashboard from './components/Dashboard'
import { useAuth } from './context/AuthContext'

function App() {
  const { user, isLoading } = useAuth()
  const [currentPage, setCurrentPage] = useState('landing')
  const [loginMode, setLoginMode] = useState(true)
  const [showLoading, setShowLoading] = useState(true)
  const [registeredEmail, setRegisteredEmail] = useState('')

  // Recupera lo stato di login dal AuthContext
  useEffect(() => {
    if (user) {
      setCurrentPage('dashboard')
    } else {
      setCurrentPage('landing')
    }
  }, [user])

  // Gestisci l'animazione di uscita del loading
  useEffect(() => {
    if (!isLoading) {
      // Aspetta 300ms per l'animazione di fade-out
      const timer = setTimeout(() => {
        setShowLoading(false)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setShowLoading(true)
    }
  }, [isLoading])

  const showLoginPage = () => {
    setLoginMode(true)
    setCurrentPage('login')
  }

  const showRegisterPage = () => {
    setLoginMode(false)
    setCurrentPage('login')
  }

  const showRegistrationSuccess = (email: string) => {
    setRegisteredEmail(email)
    setCurrentPage('registration-success')
  }

  const showLandingPage = () => {
    setCurrentPage('landing')
  }

  const handleLogin = () => {
    setCurrentPage('dashboard')
  }

  if (showLoading) {
    return (
      <div
        className={`min-h-screen bg-gray-50 flex items-center justify-center transition-opacity duration-300 ${
          isLoading ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (currentPage === 'dashboard' && user) {
    return (
      <Dashboard
        onLogout={showLandingPage}
        userRole={user.role}
        userName={user.name}
        userEmail={user.email}
      />
    )
  }

  if (currentPage === 'login') {
    return <LoginRegister onBack={showLandingPage} onLogin={handleLogin} onRegistrationSuccess={showRegistrationSuccess} initialMode={loginMode} />
  }

  if (currentPage === 'registration-success') {
    return <RegistrationSuccess userEmail={registeredEmail} onBackToLogin={showLoginPage} />
  }

  return <LandingPage onShowLogin={showLoginPage} onShowRegister={showRegisterPage} />
}

export default App
