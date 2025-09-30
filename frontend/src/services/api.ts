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
}

export default new ApiService()