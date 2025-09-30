import { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage'
import LoginRegister from './components/LoginRegister'
import Dashboard from './components/Dashboard'
import apiService from './services/api'

type UserRole = 'business' | 'admin'

interface User {
  email: string
  name: string
  role: UserRole
}

function App() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [loginMode, setLoginMode] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Recupera lo stato di login dal localStorage al caricamento
  useEffect(() => {
    const savedUser = localStorage.getItem('taxflow_user')
    const savedPage = localStorage.getItem('taxflow_current_page')

    if (savedUser && savedPage) {
      try {
        const user = JSON.parse(savedUser)
        setCurrentUser(user)
        setCurrentPage(savedPage)
      } catch (error) {
        console.error('Errore nel recupero dati utente:', error)
        localStorage.removeItem('taxflow_user')
        localStorage.removeItem('taxflow_current_page')
      }
    }
    setIsLoading(false)
  }, [])

  const showLoginPage = () => {
    setLoginMode(true)
    setCurrentPage('login')
  }

  const showRegisterPage = () => {
    setLoginMode(false)
    setCurrentPage('login')
  }

  const showLandingPage = () => {
    setCurrentPage('landing')
    setCurrentUser(null)
    apiService.logout()
    localStorage.removeItem('taxflow_current_page')
  }

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    setCurrentPage('dashboard')
    localStorage.setItem('taxflow_user', JSON.stringify(user))
    localStorage.setItem('taxflow_current_page', 'dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (currentPage === 'dashboard' && currentUser) {
    return (
      <Dashboard
        onLogout={showLandingPage}
        userRole={currentUser.role}
        userName={currentUser.name}
        userEmail={currentUser.email}
      />
    )
  }

  if (currentPage === 'login') {
    return <LoginRegister onBack={showLandingPage} onLogin={handleLogin} initialMode={loginMode} />
  }

  return <LandingPage onShowLogin={showLoginPage} onShowRegister={showRegisterPage} />
}

export default App
