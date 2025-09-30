const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api')

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  token: string
  user: {
    id: string
    email: string
    name: string
    role: 'business' | 'admin'
  }
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  role?: 'business' | 'admin'
}

class ApiService {
  private getHeaders(includeAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (includeAuth) {
      const token = localStorage.getItem('taxflow_token')
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    return headers
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }

    const data = await response.json()

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('taxflow_token', data.token)
      localStorage.setItem('taxflow_user', JSON.stringify(data.user))
    }

    return data
  }

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Registration failed')
    }

    const data = await response.json()

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('taxflow_token', data.token)
      localStorage.setItem('taxflow_user', JSON.stringify(data.user))
    }

    return data
  }

  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get profile')
    }

    return response.json()
  }

  logout() {
    localStorage.removeItem('taxflow_token')
    localStorage.removeItem('taxflow_user')
  }

  getCurrentUser() {
    const userString = localStorage.getItem('taxflow_user')
    return userString ? JSON.parse(userString) : null
  }

  getToken() {
    return localStorage.getItem('taxflow_token')
  }

  isAuthenticated() {
    return !!this.getToken()
  }

  // Security and Sessions
  async getSessions() {
    const response = await fetch(`${API_BASE_URL}/security/sessions`, {
      method: 'GET',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get sessions')
    }

    return response.json()
  }

  async terminateSession(sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/security/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to terminate session')
    }

    return response.json()
  }

  async terminateAllSessions() {
    const response = await fetch(`${API_BASE_URL}/security/sessions`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to terminate sessions')
    }

    return response.json()
  }

  async getSessionTimeout() {
    const response = await fetch(`${API_BASE_URL}/security/settings/session-timeout`, {
      method: 'GET',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get session timeout')
    }

    return response.json()
  }

  async updateSessionTimeout(sessionTimeout: number) {
    const response = await fetch(`${API_BASE_URL}/security/settings/session-timeout`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify({ sessionTimeout }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update session timeout')
    }

    return response.json()
  }

  async cleanupSessions() {
    const response = await fetch(`${API_BASE_URL}/security/sessions/cleanup`, {
      method: 'POST',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to cleanup sessions')
    }

    return response.json()
  }
}

export default new ApiService()