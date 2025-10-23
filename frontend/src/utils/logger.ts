/**
 * Logger Utility
 *
 * Centralized logging system that:
 * - Only logs debug/info in development
 * - Always logs warnings and errors
 * - Can be extended to send errors to monitoring services (Sentry, etc.)
 * - Prevents sensitive data logging in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private isDev = import.meta.env.DEV

  /**
   * Debug level - Only in development
   * Use for detailed debugging information
   */
  debug(...args: any[]) {
    if (this.isDev) {
      console.log('[DEBUG]', ...args)
    }
  }

  /**
   * Info level - Only in development
   * Use for general informational messages
   */
  info(...args: any[]) {
    if (this.isDev) {
      console.info('[INFO]', ...args)
    }
  }

  /**
   * Warning level - Always logged
   * Use for warnings that don't break functionality
   */
  warn(...args: any[]) {
    console.warn('[WARN]', ...args)
  }

  /**
   * Error level - Always logged
   * Use for errors and exceptions
   * In production, this should send to monitoring service
   */
  error(...args: any[]) {
    console.error('[ERROR]', ...args)

    // TODO: Send to Sentry or other monitoring service in production
    if (!this.isDev) {
      // Example: Sentry.captureException(args[0])
      // this.sendToMonitoring(args)
    }
  }

  /**
   * Log network requests - Only in development
   */
  request(method: string, url: string, data?: any) {
    if (this.isDev) {
      console.log(`[REQUEST] ${method} ${url}`, data || '')
    }
  }

  /**
   * Log network responses - Only in development
   */
  response(method: string, url: string, status: number, data?: any) {
    if (this.isDev) {
      console.log(`[RESPONSE] ${method} ${url} - ${status}`, data || '')
    }
  }

  /**
   * Group related logs together - Only in development
   */
  group(label: string) {
    if (this.isDev) {
      console.group(label)
    }
  }

  groupEnd() {
    if (this.isDev) {
      console.groupEnd()
    }
  }

  /**
   * Private method for sending errors to monitoring service
   * Implement when adding Sentry or similar service
   * Commented out to avoid unused code warning - uncomment when implementing
   */
  /*
  private sendToMonitoring(args: any[]) {
    // TODO: Implement monitoring service integration
    // Example: Sentry, LogRocket, etc.
  }
  */
}

// Export singleton instance
export const logger = new Logger()

// Export type for reference
export type { LogLevel }
