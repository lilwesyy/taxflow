import type { User, UpdateProfileData } from '../types'

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
      const token = localStorage.getItem('token')
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

    if (data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
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

    if (data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
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
  }

  getCurrentUser() {
    const userString = localStorage.getItem('user')
    return userString ? JSON.parse(userString) : null
  }

  getToken() {
    return localStorage.getItem('token')
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

  async updateClient(clientId: string, data: Partial<User>) {
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

  async updateUserProfile(data: UpdateProfileData) {
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

  // Documents Management
  async getDocuments(filters?: {
    categoria?: string
    status?: string
    anno?: string
    clientId?: string
  }) {
    const params = new URLSearchParams()
    if (filters?.categoria) params.append('categoria', filters.categoria)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.anno) params.append('anno', filters.anno)
    if (filters?.clientId) params.append('clientId', filters.clientId)

    const url = `${API_BASE_URL}/documents${params.toString() ? '?' + params.toString() : ''}`
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get documents')
    }

    return response.json()
  }

  async uploadDocument(formData: FormData) {
    const token = this.getToken()
    const headers: HeadersInit = {}

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers, // Don't set Content-Type, browser will set it with boundary for multipart/form-data
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to upload document')
    }

    return response.json()
  }

  async getDocument(documentId: string) {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'GET',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get document')
    }

    return response.json()
  }

  async updateDocument(documentId: string, data: {
    nome?: string
    descrizione?: string
    status?: string
    protocollo?: string
    importo?: string
    note?: string
  }) {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update document')
    }

    return response.json()
  }

  async deleteDocument(documentId: string) {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete document')
    }

    return response.json()
  }

  async getDocumentStats(clientId?: string) {
    const params = new URLSearchParams()
    if (clientId) params.append('clientId', clientId)

    const url = `${API_BASE_URL}/documents/stats/summary${params.toString() ? '?' + params.toString() : ''}`
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get document stats')
    }

    return response.json()
  }

  getDocumentUrl(fileUrl: string) {
    // Remove /api prefix if present and add backend base URL
    const cleanUrl = fileUrl.startsWith('/api/') ? fileUrl.substring(4) : fileUrl
    return `${API_BASE_URL.replace('/api', '')}${cleanUrl}`
  }

  // Fattura Elettronica API Integration
  async createFatturaElettronicaCompany(data: {
    ragione_sociale: string
    piva: string
    cfis: string
    [key: string]: any
  }) {
    const response = await fetch(`${API_BASE_URL}/fatturaelettronica/aziende`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create company')
    }

    return response.json()
  }

  async getFatturaElettronicaCompany() {
    try {
      const response = await fetch(`${API_BASE_URL}/fatturaelettronica/aziende`, {
        method: 'GET',
        headers: this.getHeaders(true),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to get company')
      }

      const data = await response.json()

      // Check if company exists
      if (!data.success || data.hasCompany === false) {
        return null
      }

      return data
    } catch (error: any) {
      console.error('Error getting Fattura Elettronica company:', error)
      return null
    }
  }

  async updateFatturaElettronicaCompany(data: any) {
    const response = await fetch(`${API_BASE_URL}/fatturaelettronica/aziende`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update company')
    }

    return response.json()
  }

  async deleteFatturaElettronicaCompany() {
    const response = await fetch(`${API_BASE_URL}/fatturaelettronica/aziende`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete company')
    }

    return response.json()
  }

  async testFatturaElettronicaConnection() {
    const response = await fetch(`${API_BASE_URL}/fatturaelettronica/status`, {
      method: 'GET',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to test connection')
    }

    return response.json()
  }

  // Invoice Management
  async sendInvoice(invoiceData: any, format: 'json' | 'xml' = 'json') {
    const response = await fetch(`${API_BASE_URL}/fatturaelettronica/fatture`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ data: invoiceData, format }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send invoice')
    }

    return response.json()
  }

  async getInvoices(params?: {
    page?: number
    per_page?: number
    unread?: boolean
    date_from?: string
    date_to?: string
    partita_iva?: string
    numero_documento?: string
    tipo_documento?: string
  }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
    if (params?.unread !== undefined) queryParams.append('unread', params.unread.toString())
    if (params?.date_from) queryParams.append('date_from', params.date_from)
    if (params?.date_to) queryParams.append('date_to', params.date_to)
    if (params?.partita_iva) queryParams.append('partita_iva', params.partita_iva)
    if (params?.numero_documento) queryParams.append('numero_documento', params.numero_documento)
    if (params?.tipo_documento) queryParams.append('tipo_documento', params.tipo_documento)

    const url = `${API_BASE_URL}/fatturaelettronica/fatture${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get invoices')
    }

    return response.json()
  }

  async getInvoicePdf(invoiceId: string) {
    const response = await fetch(`${API_BASE_URL}/fatturaelettronica/fatture/${invoiceId}/pdf`, {
      method: 'GET',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get invoice PDF')
    }

    return response.blob()
  }

  async syncInvoiceStatus(invoiceId: string) {
    const response = await fetch(`${API_BASE_URL}/fatturaelettronica/fatture/${invoiceId}/sync-status`, {
      method: 'POST',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to sync invoice status')
    }

    return response.json()
  }

  // Business Clients Management (Clienti dei clienti di TaxFlow)
  async getBusinessClients() {
    const response = await fetch(`${API_BASE_URL}/business-clients/list`, {
      method: 'GET',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get business clients')
    }

    return response.json()
  }

  async getBusinessClientById(clientId: string) {
    const response = await fetch(`${API_BASE_URL}/business-clients/${clientId}`, {
      method: 'GET',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get business client')
    }

    return response.json()
  }

  async createBusinessClient(data: {
    ragioneSociale: string
    partitaIva?: string
    codiceFiscale: string
    indirizzo: string
    numeroCivico?: string
    cap: string
    comune: string
    provincia: string
    nazione?: string
    email?: string
    telefono?: string
    pec?: string
    codiceDestinatario?: string
    note?: string
  }) {
    const response = await fetch(`${API_BASE_URL}/business-clients/create`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create business client')
    }

    return response.json()
  }

  async updateBusinessClient(clientId: string, data: {
    ragioneSociale?: string
    partitaIva?: string
    codiceFiscale?: string
    indirizzo?: string
    numeroCivico?: string
    cap?: string
    comune?: string
    provincia?: string
    nazione?: string
    email?: string
    telefono?: string
    pec?: string
    codiceDestinatario?: string
    note?: string
  }) {
    const response = await fetch(`${API_BASE_URL}/business-clients/${clientId}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update business client')
    }

    return response.json()
  }

  async deleteBusinessClient(clientId: string) {
    const response = await fetch(`${API_BASE_URL}/business-clients/${clientId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete business client')
    }

    return response.json()
  }
}

export default new ApiService()