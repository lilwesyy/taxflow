import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { logger } from '../utils/logger'

/**
 * Hook that intercepts fetch requests globally and handles 401 errors
 * by automatically logging out the user when the token expires
 */
export function useAuthInterceptor() {
  const { logout } = useAuth()

  useEffect(() => {
    // Store the original fetch function
    const originalFetch = window.fetch

    // Override the global fetch function
    window.fetch = async (...args) => {
      const response = await originalFetch(...args)

      // Check if the response is 401 Unauthorized
      if (response.status === 401) {
        // Extract URL from different possible types
        let url = ''
        if (typeof args[0] === 'string') {
          url = args[0]
        } else if (args[0] instanceof Request) {
          url = args[0].url
        } else if (args[0] instanceof URL) {
          url = args[0].toString()
        }

        // Only trigger logout for API calls (not for external resources)
        if (url.includes('/api/')) {
          logger.debug('Token scaduto rilevato, eseguo logout automatico')

          // Delay logout slightly to allow the current request to complete
          setTimeout(() => {
            logout()
          }, 100)
        }
      }

      return response
    }

    // Cleanup: restore original fetch when component unmounts
    return () => {
      window.fetch = originalFetch
    }
  }, [logout])
}
