/**
 * Centralized API Configuration
 *
 * Single source of truth for all API-related configuration.
 * Prevents hardcoded URLs and inconsistent port numbers across the codebase.
 */

const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD

/**
 * API Configuration Object
 *
 * Default behavior:
 * - Production: Uses relative path '/api' (proxied by server)
 * - Development: Uses 'http://localhost:3000/api' (backend dev server)
 * - Can be overridden by VITE_API_URL environment variable
 */
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL ||
    (isProd ? '/api' : 'http://localhost:3000/api'),
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json'
  }
} as const

/**
 * Get full API URL for a given path
 *
 * @param path - API endpoint path (should start with /)
 * @returns Full URL to API endpoint
 *
 * @example
 * ```typescript
 * const url = getApiUrl('/auth/login')
 * // Development: 'http://localhost:3000/api/auth/login'
 * // Production: '/api/auth/login'
 * ```
 */
export const getApiUrl = (path: string): string => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_CONFIG.baseURL}${normalizedPath}`
}

/**
 * Get WebSocket URL for real-time connections
 *
 * Converts HTTP(S) URL to WS(S) URL automatically
 *
 * @param path - WebSocket endpoint path
 * @returns Full WebSocket URL
 */
export const getWebSocketUrl = (path: string): string => {
  const apiUrl = getApiUrl(path)

  // Convert http:// to ws:// and https:// to wss://
  if (apiUrl.startsWith('http://')) {
    return apiUrl.replace('http://', 'ws://')
  } else if (apiUrl.startsWith('https://')) {
    return apiUrl.replace('https://', 'wss://')
  }

  // Relative URL - assume same protocol as current page
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}${apiUrl}`
}

/**
 * Environment info helper
 */
export const ENV = {
  isDev,
  isProd,
  apiBaseUrl: API_CONFIG.baseURL
} as const

/**
 * Check if we're running in development mode
 */
export const isDevMode = (): boolean => isDev

/**
 * Check if we're running in production mode
 */
export const isProdMode = (): boolean => isProd

/**
 * Get base URL without /api suffix (for uploads, static files, etc.)
 *
 * @returns Base URL without /api
 *
 * @example
 * ```typescript
 * const uploadUrl = `${getBaseUrl()}/uploads/file.pdf`
 * // Development: 'http://localhost:3000/uploads/file.pdf'
 * // Production: '/uploads/file.pdf'
 * ```
 */
export const getBaseUrl = (): string => {
  return API_CONFIG.baseURL.replace('/api', '')
}
