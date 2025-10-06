const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api')

const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  const token = localStorage.getItem('token')
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export interface PaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
}

export interface PaymentStatusResponse {
  fatturata: boolean
  stripePaymentStatus?: 'pending' | 'succeeded' | 'failed' | 'canceled'
  stripePaymentIntentId?: string
  paidAt?: string
  importo: number
}

class StripeService {
  // Create payment intent for a consultation
  async createPaymentIntent(conversationId: string): Promise<PaymentIntentResponse> {
    const response = await fetch(`${API_BASE_URL}/stripe/create-payment-intent`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ conversationId })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create payment intent')
    }

    return response.json()
  }

  // Get payment status for a conversation
  async getPaymentStatus(conversationId: string): Promise<PaymentStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/stripe/payment-status/${conversationId}`, {
      method: 'GET',
      headers: getHeaders()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch payment status')
    }

    return response.json()
  }
}

const stripeService = new StripeService()
export default stripeService
