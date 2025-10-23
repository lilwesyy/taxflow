import { useState, useEffect } from 'react'
import { logger } from '../utils/logger'

export interface CookieConsent {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  timestamp: string
}

const CONSENT_KEY = 'taxflow_cookie_consent'

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Load consent from localStorage on mount
    const savedConsent = localStorage.getItem(CONSENT_KEY)
    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent)
        setConsent(parsed)
        setShowBanner(false)
      } catch (error) {
        logger.error('Error parsing cookie consent:', error)
        setShowBanner(true)
      }
    } else {
      setShowBanner(true)
    }
  }, [])

  const saveConsent = (newConsent: Omit<CookieConsent, 'timestamp'>) => {
    const consentWithTimestamp: CookieConsent = {
      ...newConsent,
      timestamp: new Date().toISOString()
    }
    setConsent(consentWithTimestamp)
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consentWithTimestamp))
    setShowBanner(false)

    // Reload page to apply analytics scripts if needed
    if (newConsent.analytics) {
      // Initialize Google Analytics or other tracking here
      logger.debug('Analytics consent granted')
    }
  }

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true
    })
  }

  const acceptNecessary = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false
    })
  }

  const updatePreferences = (preferences: Omit<CookieConsent, 'timestamp'>) => {
    saveConsent(preferences)
  }

  const resetConsent = () => {
    localStorage.removeItem(CONSENT_KEY)
    setConsent(null)
    setShowBanner(true)
  }

  return {
    consent,
    showBanner,
    acceptAll,
    acceptNecessary,
    updatePreferences,
    resetConsent,
    setShowBanner
  }
}
