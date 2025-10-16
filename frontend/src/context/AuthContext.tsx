import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '../types'

interface LoginResponse {
  requires2FA?: boolean
  userId?: string
  message?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<LoginResponse | void>
  logout: () => void
  isLoading: boolean
  updateUser: (userData: Partial<User>) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Refresh user data from backend
  const refreshUser = async () => {
    const savedToken = localStorage.getItem('token')
    if (!savedToken) return

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      const response = await fetch(`${API_URL}/user/me`, {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      })

      if (response.status === 401) {
        // Token scaduto o non valido - logout automatico
        console.log('Token scaduto, eseguo logout automatico')
        logout()
        return
      }

      if (response.ok) {
        const data = await response.json()
        const freshUser = data.user || data
        setUser(freshUser)
        localStorage.setItem('user', JSON.stringify(freshUser))
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  useEffect(() => {
    // Carica token e utente da localStorage all'avvio
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      // Refresh data from backend on mount
      refreshUser()
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<LoginResponse | void> => {
    const API_URL = import.meta.env.VITE_API_URL || '/api'

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }

    const data = await response.json()

    // Check if 2FA is required
    if (data.requires2FA) {
      return {
        requires2FA: true,
        userId: data.userId,
        message: data.message
      }
    }

    // Normal login flow
    // Save token first
    setToken(data.token)
    localStorage.setItem('token', data.token)

    // Don't set user yet - wait for fresh data from /user/me
    // This prevents showing dashboard before we know subscription status

    // Get fresh user data with subscription status
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      const response = await fetch(`${API_URL}/user/me`, {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      })

      if (response.ok) {
        const freshData = await response.json()
        const freshUser = freshData.user || freshData
        setUser(freshUser)
        localStorage.setItem('user', JSON.stringify(freshUser))
      } else {
        // Fallback to original user data if refresh fails
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
    } catch (error) {
      console.error('Error fetching fresh user data:', error)
      // Fallback to original user data
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}