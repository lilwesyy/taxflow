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
      // Use 'token' key to match AuthContext
      const token = localStorage.getItem('token') || localStorage.getItem('taxflow_token')
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

    // Store token in localStorage (using both keys for compatibility)
    if (data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
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

    // Store token in localStorage (using both keys for compatibility)
    if (data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
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
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('taxflow_token')
    localStorage.removeItem('taxflow_user')
  }

  getCurrentUser() {
    const userString = localStorage.getItem('user') || localStorage.getItem('taxflow_user')
    return userString ? JSON.parse(userString) : null
  }

  getToken() {
    return localStorage.getItem('token') || localStorage.getItem('taxflow_token')
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

  // Clients Management (Admin only)
  async getClients() {
    const response = await fetch(`${API_BASE_URL}/clients/list`, {
      method: 'GET',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get clients')
    }

    return response.json()
  }

  async getClientById(clientId: string) {
    const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
      method: 'GET',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get client')
    }

    return response.json()
  }

  async updateClient(clientId: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update client')
    }

    return response.json()
  }

  async addClientActivity(clientId: string, action: string, detail: string) {
    const response = await fetch(`${API_BASE_URL}/clients/${clientId}/activity`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ action, detail }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to add activity')
    }

    return response.json()
  }

  // Feedback Management
  // Business endpoints
  async getMyFeedbacks() {
    const response = await fetch(`${API_BASE_URL}/feedback/my-feedbacks`, {
      method: 'GET',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get feedbacks')
    }

    return response.json()
  }

  async createFeedback(data: {
    consultantId?: string
    consultantName: string
    service: string
    rating: number
    title: string
    message: string
    category?: string
    recommend?: boolean
    positiveAspects?: string
    suggestions?: string
  }) {
    const response = await fetch(`${API_BASE_URL}/feedback/create`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create feedback')
    }

    return response.json()
  }

  async getConsultants() {
    const response = await fetch(`${API_BASE_URL}/feedback/consultants/list`, {
      method: 'GET',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get consultants')
    }

    return response.json()
  }

  async getFeedbackById(feedbackId: string) {
    const response = await fetch(`${API_BASE_URL}/feedback/${feedbackId}`, {
      method: 'GET',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get feedback')
    }

    return response.json()
  }

  // Admin endpoints
  async getAllFeedbacks(filters?: {
    status?: string
    rating?: string
    category?: string
    consultantId?: string
  }) {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.rating) params.append('rating', filters.rating)
    if (filters?.category) params.append('category', filters.category)
    if (filters?.consultantId) params.append('consultantId', filters.consultantId)

    const url = `${API_BASE_URL}/feedback/admin/all${params.toString() ? '?' + params.toString() : ''}`
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get feedbacks')
    }

    return response.json()
  }

  async respondToFeedback(feedbackId: string, responseText: string) {
    const response = await fetch(`${API_BASE_URL}/feedback/${feedbackId}/respond`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ response: responseText }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to respond to feedback')
    }

    return response.json()
  }

  async updateFeedbackResponse(feedbackId: string, responseText: string) {
    const response = await fetch(`${API_BASE_URL}/feedback/${feedbackId}/response`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify({ response: responseText }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update response')
    }

    return response.json()
  }

  async archiveFeedback(feedbackId: string) {
    const response = await fetch(`${API_BASE_URL}/feedback/${feedbackId}/archive`, {
      method: 'PUT',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to archive feedback')
    }

    return response.json()
  }

  async getConsultantStats() {
    const response = await fetch(`${API_BASE_URL}/feedback/admin/consultant-stats`, {
      method: 'GET',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get consultant stats')
    }

    return response.json()
  }

  async getFeedbackStatistics() {
    const response = await fetch(`${API_BASE_URL}/feedback/admin/statistics`, {
      method: 'GET',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get statistics')
    }

    return response.json()
  }

  // Registration Approvals
  async getPendingRegistrations() {
    const response = await fetch(`${API_BASE_URL}/user/pending-registrations`, {
      method: 'GET',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get pending registrations')
    }

    return response.json()
  }

  async approveRegistration(userId: string, approved: boolean, note?: string) {
    const response = await fetch(`${API_BASE_URL}/user/pending-registrations/${userId}/approve`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ approved, note })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to approve registration')
    }

    return response.json()
  }

  // P.IVA Requests
  async getPivaRequests() {
    const response = await fetch(`${API_BASE_URL}/user/piva-requests`, {
      method: 'GET',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get P.IVA requests')
    }

    return response.json()
  }

  async approvePivaRequest(userId: string, approved: boolean, note?: string) {
    const response = await fetch(`${API_BASE_URL}/user/piva-requests/${userId}/approve`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ approved, note })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to approve request')
    }

    return response.json()
  }

  async updateUserProfile(data: any) {
    const response = await fetch(`${API_BASE_URL}/user/update`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update profile')
    }

    return response.json()
  }
}

export default new ApiService()