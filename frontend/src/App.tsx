import { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage'
import LoginRegister from './components/LoginRegister'
import RegistrationSuccess from './components/RegistrationSuccess'
import Dashboard from './components/Dashboard'
import PaymentPending from './components/PaymentPending'
import ResetPassword from './components/ResetPassword'
import CookieBanner from './components/common/CookieBanner'
import { useAuth } from './context/AuthContext'

function App() {
  const { user, isLoading } = useAuth()
  const [currentPage, setCurrentPage] = useState('landing')
  const [loginMode, setLoginMode] = useState(true)
  const [showLoading, setShowLoading] = useState(true)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [showCookiePolicy, setShowCookiePolicy] = useState(false)

  // Check for reset password token in URL and set initial page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const resetToken = urlParams.get('token')

    if (resetToken) {
      setCurrentPage('reset-password')
    }
  }, [])

  // Recupera lo stato di login dal AuthContext
  useEffect(() => {
    // Check if we're on reset password page by checking URL
    const urlParams = new URLSearchParams(window.location.search)
    const hasResetToken = urlParams.get('token')

    // Don't override if we have a reset token in URL
    if (hasResetToken) {
      return
    }

    if (user) {
      // Check if user needs payment - don't set currentPage to dashboard
      if (
        user.role === 'business' &&
        user.pivaApprovalStatus === 'approved' &&
        user.subscriptionStatus === 'pending_payment'
      ) {
        setCurrentPage('payment-pending')
      } else {
        setCurrentPage('dashboard')
      }
    } else {
      // Only set to landing if not on reset-password page
      if (currentPage !== 'reset-password') {
        setCurrentPage('landing')
      }
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
    // Don't set currentPage here - let the useEffect handle it based on user state
    // This prevents briefly showing the dashboard before redirecting to payment
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

  if (currentPage === 'payment-pending' && user) {
    return <PaymentPending onLogout={showLandingPage} />
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

  if (currentPage === 'reset-password') {
    return <ResetPassword onBack={showLandingPage} onSuccess={showLoginPage} />
  }

  if (currentPage === 'login') {
    return <LoginRegister onBack={showLandingPage} onLogin={handleLogin} onRegistrationSuccess={showRegistrationSuccess} initialMode={loginMode} />
  }

  if (currentPage === 'registration-success') {
    return <RegistrationSuccess userEmail={registeredEmail} onBackToLogin={showLoginPage} />
  }

  return (
    <>
      <LandingPage
        onShowLogin={showLoginPage}
        onShowRegister={showRegisterPage}
        showCookieModal={showCookiePolicy}
        setShowCookieModal={setShowCookiePolicy}
      />
      <CookieBanner onOpenCookiePolicy={() => setShowCookiePolicy(true)} />
    </>
  )
}

export default App
