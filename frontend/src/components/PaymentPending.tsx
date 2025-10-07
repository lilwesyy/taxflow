import { CreditCard, CheckCircle, Clock, AlertCircle, ExternalLink, Shield, LogOut } from 'lucide-react'
import { useState } from 'react'
import { SUBSCRIPTION_PLANS } from '../config/subscriptionPlans'
import { useAuth } from '../context/AuthContext'
import Logo from './common/Logo'

interface PaymentPendingProps {
  onLogout: () => void
}

export default function PaymentPending({ onLogout }: PaymentPendingProps) {
  const { logout, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string>('piva-forfettari-annual')

  // Check if user already has P.IVA (no setup fee needed)
  const hasExistingPiva = user?.pivaRequestData?.hasExistingPiva || false
  const SETUP_FEE = 129.90

  const handleLogout = () => {
    logout()
    onLogout()
  }

  const handleProceedToPayment = async () => {
    if (!selectedPlanId) {
      alert('Seleziona un piano prima di procedere')
      return
    }

    setLoading(true)

    try {
      // Call API to create Stripe Checkout Session
      const response = await fetch('http://localhost:3000/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          planId: selectedPlanId
        })
      })

      const data = await response.json()

      if (data.success && data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl
      } else {
        alert('Errore durante la creazione della sessione di pagamento. Riprova più tardi.')
        console.error('Checkout error:', data)
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
      alert('Errore di connessione. Riprova più tardi.')
    } finally {
      setLoading(false)
    }
  }

  const selectedPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === selectedPlanId)

  if (!selectedPlan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Errore caricamento piani</h2>
          <p className="text-gray-600">Contatta il supporto per assistenza.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Logo and Logout */}
        <div className="flex items-center justify-between mb-8">
          <Logo />
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Esci
          </button>
        </div>

        {/* Success Badge */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-green-900 mb-1">
                Richiesta P.IVA Approvata! 🎉
              </h3>
              <p className="text-green-800">
                La tua richiesta di apertura Partita IVA forfettaria è stata approvata dal nostro team.
                Seleziona il tuo piano e completa il pagamento per attivare tutti i servizi.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Scegli il Tuo Piano
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Seleziona il piano di abbonamento che preferisci per completare l'attivazione del servizio
            </p>
          </div>

        {/* Plan Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all ${
                selectedPlanId === plan.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              {selectedPlanId === plan.id && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">€{plan.price}</span>
                    <span className="ml-2 text-gray-500">/{plan.interval === 'year' ? 'anno' : 'mese'}</span>
                  </div>
                  {plan.interval === 'year' && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      Risparmi €120/anno
                    </p>
                  )}
                </div>

                <ul className="space-y-2">
                  {plan.features.slice(0, 4).map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Cost Breakdown */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Riepilogo Costi</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Piano abbonamento</span>
              <span className="font-medium text-gray-900">€{selectedPlan.price}</span>
            </div>
            {!hasExistingPiva && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Costo apertura P.IVA (una tantum)</span>
                <div className="text-right">
                  <span className="font-medium text-gray-900">€{SETUP_FEE.toFixed(2)}</span>
                  <div className="text-xs text-gray-500 line-through">€169,90</div>
                </div>
              </div>
            )}
            <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Totale primo pagamento</span>
              <span className="text-2xl font-bold text-blue-600">
                €{(selectedPlan.price + (hasExistingPiva ? 0 : SETUP_FEE)).toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-gray-500 text-right">
              {selectedPlan.interval === 'month' ? 'Poi €35,00/mese' : 'Poi €368,90/anno'}
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-blue-900 mb-1">Pagamento Sicuro</h5>
              <p className="text-sm text-blue-800">
                Il pagamento è gestito da Stripe, una delle piattaforme di pagamento più sicure al mondo.
                I tuoi dati di carta non vengono mai condivisi con noi.
              </p>
            </div>
          </div>
        </div>

        {/* Money-Back Guarantee */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-green-900 mb-1">Garanzia Soddisfatto o Rimborsato</h5>
              <p className="text-sm text-green-800">
                {selectedPlan.interval === 'year'
                  ? '14 giorni soddisfatto o rimborsato, valido solo per il piano P.IVA Forfettari se l\'apertura P.IVA avviene dopo 14 giorni dalla sottoscrizione.'
                  : '14 giorni soddisfatto o rimborsato, valido solo se l\'apertura P.IVA avviene dopo 14 giorni dalla sottoscrizione.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleProceedToPayment}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
        >
          {loading ? (
            <>
              <Clock className="h-5 w-5 mr-2 animate-spin" />
              Creazione sessione pagamento...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Procedi al Pagamento
              <ExternalLink className="h-4 w-4 ml-2" />
            </>
          )}
        </button>

          <p className="text-center text-xs text-gray-500 mt-4">
            Verrai reindirizzato alla pagina di pagamento sicuro di Stripe
          </p>
        </div>

        {/* What Happens Next */}
        <div className="bg-gray-50 rounded-xl p-6 mt-8">
          <h3 className="font-semibold text-gray-900 mb-4">Cosa succede dopo il pagamento?</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
                <span className="text-blue-600 text-sm font-semibold">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Attivazione immediata</h4>
                <p className="text-sm text-gray-600">
                  Il tuo account verrà attivato immediatamente e potrai accedere a tutte le funzionalità.
                </p>
              </div>
            </div>
            {!hasExistingPiva && (
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
                  <span className="text-blue-600 text-sm font-semibold">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Apertura P.IVA</h4>
                  <p className="text-sm text-gray-600">
                    Il nostro team inizierà immediatamente le pratiche per l'apertura della tua Partita IVA forfettaria.
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
                <span className="text-blue-600 text-sm font-semibold">{hasExistingPiva ? '2' : '3'}</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Dashboard completa</h4>
                <p className="text-sm text-gray-600">
                  Accesso completo alla dashboard con integrazione cassetto fiscale e previdenziale INPS-INAIL.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Hai domande? {' '}
            <a href="mailto:support@taxflow.it" className="text-blue-600 hover:text-blue-700 font-medium">
              Contatta il supporto
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
