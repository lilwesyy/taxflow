import { useState, useEffect } from 'react'
import { Cookie, Settings, Check, ChevronLeft } from 'lucide-react'
import { useCookieConsent } from '../../hooks/useCookieConsent'

interface CookieBannerProps {
  onOpenCookiePolicy?: () => void
}

export default function CookieBanner({ onOpenCookiePolicy }: CookieBannerProps) {
  const { showBanner, acceptAll, acceptNecessary, updatePreferences } = useCookieConsent()
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false
  })

  // Disable scroll when banner is shown
  useEffect(() => {
    if (showBanner) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showBanner])

  if (!showBanner) return null

  const handleSavePreferences = () => {
    updatePreferences(preferences)
    setShowPreferences(false)
  }

  const handleAcceptAll = () => {
    acceptAll()
  }

  const handleAcceptNecessary = () => {
    acceptNecessary()
  }

  return (
    <>
      {/* Main Backdrop - Always visible when banner is shown */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] animate-fade-in" />

      {/* Cookie Modal Container */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
          <div className="p-6 sm:p-8">
            {!showPreferences ? (
              // Simple Modal View
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Cookie className="h-8 w-8 text-blue-600" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Questo sito utilizza i cookie
                </h3>

                <p className="text-gray-600 leading-relaxed mb-6 max-w-lg mx-auto">
                  Utilizziamo cookie tecnici necessari per il funzionamento del sito e, con il tuo consenso,
                  cookie di analytics per migliorare la tua esperienza.
                </p>

                {onOpenCookiePolicy && (
                  <button
                    onClick={onOpenCookiePolicy}
                    className="text-blue-600 hover:text-blue-700 underline text-sm mb-6 inline-flex items-center"
                  >
                    Leggi la Cookie Policy completa
                  </button>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                  <button
                    onClick={() => setShowPreferences(true)}
                    className="flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Gestisci preferenze
                  </button>
                  <button
                    onClick={handleAcceptNecessary}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Solo necessari
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg hover:shadow-xl"
                  >
                    Accetta tutti
                  </button>
                </div>
              </div>
            ) : (
              // Preferences View
              <div>
                <div className="text-center mb-6">
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    <span className="text-sm">Torna indietro</span>
                  </button>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Gestisci le preferenze cookie
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Scegli quali cookie vuoi accettare
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Necessary Cookies */}
                  <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">Cookie necessari</h4>
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-200 rounded">
                          Sempre attivi
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Questi cookie sono essenziali per il funzionamento del sito e non possono essere disabilitati.
                        Includono funzionalità come autenticazione e sicurezza.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-11 h-6 bg-blue-600 rounded-full flex items-center px-1">
                        <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                      </div>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1 pr-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Cookie di analytics</h4>
                      <p className="text-xs text-gray-600">
                        Ci aiutano a capire come i visitatori interagiscono con il sito raccogliendo informazioni
                        in forma anonima. Include Google Analytics.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                        className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors ${
                          preferences.analytics ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          preferences.analytics ? 'translate-x-5' : 'translate-x-0'
                        }`}></div>
                      </button>
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1 pr-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Cookie di marketing</h4>
                      <p className="text-xs text-gray-600">
                        Utilizzati per mostrare contenuti pubblicitari personalizzati in base ai tuoi interessi.
                        Possono essere impostati dai nostri partner pubblicitari.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => setPreferences(prev => ({ ...prev, marketing: !prev.marketing }))}
                        className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors ${
                          preferences.marketing ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          preferences.marketing ? 'translate-x-5' : 'translate-x-0'
                        }`}></div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleSavePreferences}
                    className="flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg hover:shadow-xl"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Salva preferenze
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Accetta tutti
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
