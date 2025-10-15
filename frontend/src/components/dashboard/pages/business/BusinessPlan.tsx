import { Target, ShoppingCart, Clock, CheckCircle, Download, FileText, TrendingUp, DollarSign, BarChart3 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useToast } from '../../../../context/ToastContext'
import { useAuth } from '../../../../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || '/api'

interface PurchasedService {
  _id: string
  serviceType: 'business_plan' | 'analisi_swot'
  status: 'pending' | 'in_progress' | 'completed'
  amountPaid: number
  purchasedAt: string
  completedAt?: string
  businessPlanContent?: {
    executiveSummary: string
    objective: string
    marketAnalysis: string
    timeSeriesForecasting: string
    budgetSimulation: string
    alerts: string
    pdfUrl?: string
  }
}

export default function BusinessPlan() {
  const { showToast } = useToast()
  const { token } = useAuth()
  const [purchasedService, setPurchasedService] = useState<PurchasedService | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    checkPurchaseStatus()
  }, [])

  const checkPurchaseStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/services/get-services?serviceType=business_plan`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.services && data.services.length > 0) {
          setPurchasedService(data.services[0])
        }
      }
    } catch (error) {
      console.error('Error checking purchase status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    setPurchasing(true)
    try {
      const response = await fetch(`${API_URL}/services/purchase-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ serviceType: 'business_plan' })
      })

      const data = await response.json()

      if (response.ok && data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl
      } else {
        showToast(data.error || 'Errore durante l\'acquisto', 'error')
      }
    } catch (error) {
      console.error('Error purchasing service:', error)
      showToast('Errore durante l\'acquisto', 'error')
    } finally {
      setPurchasing(false)
    }
  }

  // Purchase Page
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!purchasedService) {
    return (
      <div className="h-full flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 w-full max-w-3xl">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 rounded-full mb-3">
              <Target className="h-6 w-6 sm:h-7 sm:w-7 text-primary-600" />
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">Business Plan Predittivo VisionFlow</h1>
            <p className="text-xs sm:text-sm text-gray-600">Sistema di pianificazione strategica con analisi predittiva D.Lgs. 14/2019</p>
          </div>

          <div className="bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200 rounded-xl p-4 sm:p-5 mb-4">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Investimento una tantum</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-600 my-2">€998</p>
              <p className="text-xs sm:text-sm text-gray-600">Pagamento unico - Nessun abbonamento</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5">Executive Summary + Obiettivo</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Riepilogo professionale con obiettivi chiari</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5">Analisi di Mercato</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Studio mercato e competitor</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5">Time Series Forecasting</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Proiezioni finanziarie avanzate</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5">Simulazione Budget + Alert</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Sistema allerta precoce</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="bg-primary-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center mx-auto disabled:opacity-50 text-xs sm:text-sm w-full sm:w-auto"
            >
              {purchasing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                  Reindirizzamento...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Acquista Ora
                </>
              )}
            </button>
            <p className="text-xs sm:text-sm text-gray-500 mt-3">
              Pagamento sicuro tramite Stripe • Garanzia soddisfatti o rimborsati
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Waiting Page
  if (purchasedService.status === 'pending' || purchasedService.status === 'in_progress') {
    return (
      <div className="h-full flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 w-full max-w-2xl">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-yellow-100 rounded-full mb-3">
              <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-600 animate-pulse" />
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
              {purchasedService.status === 'pending' ? 'In Attesa di Lavorazione' : 'Analisi in Corso'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Il tuo consulente sta preparando il Business Plan personalizzato
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-medium text-blue-900">Pagamento confermato</p>
                  <p className="text-xs sm:text-sm text-blue-700">
                    Acquistato il {new Date(purchasedService.purchasedAt).toLocaleDateString('it-IT')}
                  </p>
                </div>
              </div>
              {purchasedService.status === 'in_progress' && (
                <div className="flex items-start space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-600 mt-0.5 flex-shrink-0"></div>
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-medium text-blue-900">Analisi in corso</p>
                    <p className="text-xs sm:text-sm text-blue-700">
                      Il consulente sta lavorando al tuo Business Plan
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-700 font-medium mb-3">Cosa succede adesso?</p>
            <ol className="text-xs sm:text-sm text-gray-600 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm">1</span>
                <span>Il consulente analizza i dati della tua attività</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm">2</span>
                <span>Prepara il Business Plan con analisi predittiva e forecasting</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm">3</span>
                <span>Riceverai una notifica quando il documento sarà pronto</span>
              </li>
            </ol>
            <p className="text-xs sm:text-sm text-gray-500 mt-3">Tempo stimato: 3-5 giorni lavorativi</p>
          </div>
        </div>
      </div>
    )
  }

  // Completed - Show Results
  const content = purchasedService.businessPlanContent

  return (
    <div className="h-full overflow-y-auto space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-gray-900">Business Plan Completato</h1>
              <p className="text-xs text-gray-600">
                {purchasedService.completedAt ? new Date(purchasedService.completedAt).toLocaleDateString('it-IT') : '-'}
              </p>
            </div>
          </div>
          {content?.pdfUrl && (
            <a
              href={content.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-all duration-200 flex items-center text-xs w-full sm:w-auto justify-center"
            >
              <Download className="h-3 w-3 mr-1" />
              PDF
            </a>
          )}
        </div>
      </div>

      {/* Sections in 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {content?.executiveSummary && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-2">
            <h3 className="text-xs font-semibold text-gray-900 mb-1 flex items-center">
              <FileText className="h-3 w-3 mr-1 text-primary-600" />
              Executive Summary
            </h3>
            <div className="text-xs text-gray-700 line-clamp-2">
              {content.executiveSummary}
            </div>
          </div>
        )}

        {content?.objective && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-2">
            <h3 className="text-xs font-semibold text-gray-900 mb-1 flex items-center">
              <Target className="h-3 w-3 mr-1 text-primary-600" />
              Obiettivi
            </h3>
            <div className="text-xs text-gray-700 line-clamp-2">
              {content.objective}
            </div>
          </div>
        )}

        {content?.marketAnalysis && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-2">
            <h3 className="text-xs font-semibold text-gray-900 mb-1 flex items-center">
              <BarChart3 className="h-3 w-3 mr-1 text-primary-600" />
              Analisi Mercato
            </h3>
            <div className="text-xs text-gray-700 line-clamp-2">
              {content.marketAnalysis}
            </div>
          </div>
        )}

        {content?.timeSeriesForecasting && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-2">
            <h3 className="text-xs font-semibold text-gray-900 mb-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-primary-600" />
              Forecasting
            </h3>
            <div className="text-xs text-gray-700 line-clamp-2">
              {content.timeSeriesForecasting}
            </div>
          </div>
        )}

        {content?.budgetSimulation && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-2">
            <h3 className="text-xs font-semibold text-gray-900 mb-1 flex items-center">
              <DollarSign className="h-3 w-3 mr-1 text-primary-600" />
              Budget
            </h3>
            <div className="text-xs text-gray-700 line-clamp-2">
              {content.budgetSimulation}
            </div>
          </div>
        )}

        {content?.alerts && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-2">
            <h3 className="text-xs font-semibold text-gray-900 mb-1 flex items-center">
              <Clock className="h-3 w-3 mr-1 text-primary-600" />
              Alert
            </h3>
            <div className="text-xs text-gray-700 line-clamp-2">
              {content.alerts}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
