/**
 * Utility for standardized error handling across the application
 */

export interface ApiError {
  message: string
  details?: Array<{ field: string; message: string }>
  statusCode?: number
}

/**
 * Extract user-friendly error message from API response
 */
export function getErrorMessage(error: unknown): string {
  // Handle API error responses
  if (error instanceof Error) {
    return error.message
  }

  // Handle fetch/network errors
  if (typeof error === 'string') {
    return error
  }

  // Handle structured API errors
  if (error && typeof error === 'object' && 'error' in error) {
    return (error as { error: string }).error
  }

  // Default fallback
  return 'Si è verificato un errore imprevisto. Riprova.'
}

/**
 * Parse API error response body
 */
export async function parseApiError(response: Response): Promise<ApiError> {
  try {
    const data = await response.json()
    return {
      message: data.error || data.message || 'Errore sconosciuto',
      details: data.details,
      statusCode: response.status
    }
  } catch {
    return {
      message: `Errore ${response.status}: ${response.statusText}`,
      statusCode: response.status
    }
  }
}

/**
 * Handle API errors with user-friendly messages
 */
export function handleApiError(error: unknown): never {
  const message = getErrorMessage(error)
  throw new Error(message)
}

/**
 * Common error messages mapping
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Impossibile connettersi al server. Controlla la tua connessione.',
  UNAUTHORIZED: 'Sessione scaduta. Effettua nuovamente il login.',
  FORBIDDEN: 'Non hai i permessi per eseguire questa operazione.',
  NOT_FOUND: 'Risorsa non trovata.',
  VALIDATION_ERROR: 'I dati inseriti non sono validi.',
  SERVER_ERROR: 'Errore del server. Riprova più tardi.',
  TIMEOUT: 'La richiesta ha impiegato troppo tempo. Riprova.',
} as const

/**
 * Get error message by status code
 */
export function getErrorByStatus(status: number): string {
  switch (status) {
    case 400:
      return ERROR_MESSAGES.VALIDATION_ERROR
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED
    case 403:
      return ERROR_MESSAGES.FORBIDDEN
    case 404:
      return ERROR_MESSAGES.NOT_FOUND
    case 408:
      return ERROR_MESSAGES.TIMEOUT
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_MESSAGES.SERVER_ERROR
    default:
      return 'Si è verificato un errore imprevisto.'
  }
}

/**
 * Log error for debugging (can be extended to send to monitoring service)
 */
export function logError(error: unknown, context?: string) {
  if (import.meta.env.DEV) {
    console.error(`[${context || 'Error'}]:`, error)
  }

  // TODO: In production, send to error monitoring service (e.g., Sentry)
  // if (import.meta.env.PROD) {
  //   sendToMonitoring(error, context)
  // }
}
