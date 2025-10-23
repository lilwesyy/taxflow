import { CreditCard, Settings, CheckCircle, AlertTriangle, FileText, Download, Clock } from 'lucide-react'
import { useEffect } from 'react'

interface Invoice {
  _id: string
  numero: string
  servizio: string
  tipo: string
  importo: number
  iva: number
  totale: number
  status: 'paid' | 'pending' | 'failed' | 'canceled'
  dataEmissione: string
  dataPagamento?: string
  metodoPagamento?: string
  subscriptionPlanName?: string
  subscriptionInterval?: 'month' | 'year'
  createdAt: string
}

interface SubscriptionData {
  hasSubscription: boolean
  subscription?: {
    id: string
    status: 'active' | 'canceled' | 'past_due' | 'incomplete'
    plan: {
      name: string
      price: number
      interval: 'month' | 'year'
    }
    current_period_end: number
    cancel_at_period_end: boolean
  }
}

interface PaymentSettings {
  autoRinnovo: boolean
}

interface SettingsSubscriptionProps {
  subscriptionData: SubscriptionData | null
  invoices: Invoice[]
  paymentSettings: PaymentSettings
  onToggleAutoRenew: (enabled: boolean) => Promise<void>
  onCancelSubscription: () => void
  onReactivateSubscription: () => Promise<void>
  onDownloadInvoice: (invoiceId: string, numero: string) => void
  onLoadSubscription: () => Promise<void>
  onLoadInvoices: () => Promise<void>
  loading?: boolean
  loadingSubscription?: boolean
  loadingInvoices?: boolean
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export default function SettingsSubscription({
  subscriptionData,
  invoices,
  paymentSettings,
  onToggleAutoRenew,
  onCancelSubscription,
  onReactivateSubscription,
  onDownloadInvoice,
  onLoadSubscription,
  onLoadInvoices,
  loading = false,
  loadingSubscription = false,
  loadingInvoices = false,
  showToast
}: SettingsSubscriptionProps) {
  useEffect(() => {
    onLoadSubscription()
    onLoadInvoices()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT')
  }

  // Get subscription data
  const hasSubscription = subscriptionData?.hasSubscription || false
  const subscription = subscriptionData?.subscription
  const planName = subscription?.plan?.name || 'Piano P.IVA Forfettari'
  const planPrice = subscription?.plan?.price || 0
  const planInterval = subscription?.plan?.interval === 'year' ? 'anno' : 'mese'

  // Get subscription status
  const getSubscriptionStatus = () => {
    if (!hasSubscription) return 'Nessun abbonamento'
    if (subscription?.cancel_at_period_end) return 'In scadenza'
    if (subscription?.status === 'active') return 'Attivo'
    if (subscription?.status === 'past_due') return 'Pagamento scaduto'
    if (subscription?.status === 'canceled') return 'Cancellato'
    return subscription?.status || 'Sconosciuto'
  }

  const getStatusColor = () => {
    if (!hasSubscription) return 'from-gray-600 to-gray-700'
    if (subscription?.cancel_at_period_end) return 'from-orange-600 to-orange-700'
    if (subscription?.status === 'active') return 'from-blue-600 to-blue-700'
    if (subscription?.status === 'past_due') return 'from-red-600 to-red-700'
    return 'from-gray-600 to-gray-700'
  }

  // Get next renewal date
  const getNextRenewalDate = () => {
    if (!hasSubscription || !subscription?.current_period_end) {
      return 'Non disponibile'
    }
    if (subscription.cancel_at_period_end) {
      return `Scade il ${new Date(subscription.current_period_end * 1000).toLocaleDateString('it-IT')}`
    }
    return new Date(subscription.current_period_end * 1000).toLocaleDateString('it-IT')
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      {loadingSubscription ? (
        <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl shadow-lg p-6 animate-pulse">
          <div className="h-20 bg-gray-300 rounded"></div>
        </div>
      ) : (
        <div className={`bg-gradient-to-r ${getStatusColor()} rounded-xl shadow-lg p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">{planName}</h2>
                <p className="text-blue-100 text-sm">
                  {hasSubscription && subscription?.status === 'active'
                    ? 'Il tuo abbonamento è attivo e include tutte le funzionalità premium'
                    : subscription?.cancel_at_period_end
                    ? 'Il tuo abbonamento scadrà alla fine del periodo corrente'
                    : 'Stato abbonamento'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <p className="text-3xl font-bold">{getSubscriptionStatus()}</p>
                <p className="text-blue-100 text-sm">Stato</p>
              </div>
              <div className="h-12 w-px bg-blue-400"></div>
              <div className="text-center">
                <p className="text-xl font-bold">{getNextRenewalDate()}</p>
                <p className="text-blue-100 text-sm">
                  {subscription?.cancel_at_period_end ? 'Data scadenza' : 'Prossimo rinnovo'}
                </p>
              </div>
              <div className="h-12 w-px bg-blue-400"></div>
              <div className="text-center">
                <p className="text-3xl font-bold">€{planPrice}/{planInterval}</p>
                <p className="text-blue-100 text-sm">Prezzo</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Features */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Funzionalità Incluse</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
              <span className="text-green-600 text-xs">✓</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Fatturazione Elettronica</p>
              <p className="text-xs text-gray-600">Creazione e invio illimitato</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
              <span className="text-green-600 text-xs">✓</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Consulenza Fiscale</p>
              <p className="text-xs text-gray-600">Chat illimitata con consulenti</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
              <span className="text-green-600 text-xs">✓</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Gestione Documenti</p>
              <p className="text-xs text-gray-600">Archiviazione cloud sicura</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
              <span className="text-green-600 text-xs">✓</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Simulazione Imposte</p>
              <p className="text-xs text-gray-600">Calcolo per codice ATECO</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Actions */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h4 className="font-semibold text-gray-900 mb-6 flex items-center">
          <Settings className="h-5 w-5 mr-2 text-gray-600" />
          Gestisci il tuo Abbonamento
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Auto-rinnovo Card */}
          <div className={`group relative overflow-hidden rounded-xl p-5 transition-all duration-200 ${
            paymentSettings.autoRinnovo
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-orange-600 hover:bg-orange-700'
          } hover:shadow-md`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mr-3">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <h5 className="font-semibold text-white">Auto-rinnovo</h5>
                </div>
                <p className="text-sm text-white/80 ml-13">
                  {paymentSettings.autoRinnovo
                    ? 'Il tuo abbonamento si rinnoverà automaticamente'
                    : 'L\'abbonamento scadrà alla fine del periodo'
                  }
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-3">
                <input
                  type="checkbox"
                  checked={paymentSettings.autoRinnovo}
                  disabled={loading || !hasSubscription}
                  onChange={(e) => onToggleAutoRenew(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-white/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/30 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
              </label>
            </div>
          </div>

          {/* Cambia Piano Card */}
          <button
            onClick={() => showToast('Funzionalità in sviluppo. Contatta il supporto per cambiare piano.', 'info')}
            disabled={loading || !hasSubscription}
            className="group text-left rounded-xl p-5 bg-blue-600 hover:bg-blue-700 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mr-3">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-white mb-1">Cambia Piano</h5>
                <p className="text-sm text-blue-100">Esplora altri piani disponibili e aggiorna il tuo abbonamento</p>
              </div>
            </div>
          </button>

          {/* Riattiva o Cancella Abbonamento */}
          {subscription?.cancel_at_period_end ? (
            <button
              onClick={onReactivateSubscription}
              disabled={loading}
              className="group text-left rounded-xl p-5 bg-green-600 hover:bg-green-700 hover:shadow-md transition-all duration-200 disabled:opacity-50"
            >
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mr-3">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-white mb-1">Riattiva Abbonamento</h5>
                  <p className="text-sm text-green-100">Annulla la cancellazione e continua con il tuo abbonamento</p>
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={onCancelSubscription}
              disabled={loading || !hasSubscription}
              className="group text-left rounded-xl p-5 bg-red-600 hover:bg-red-700 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mr-3">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-white mb-1">Cancella Abbonamento</h5>
                  <p className="text-sm text-red-100">Termina il tuo abbonamento (rimarrà attivo fino alla scadenza)</p>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-gray-600" />
            Storico Fatture
          </h4>
          {invoices.length > 0 && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              {invoices.length} {invoices.length === 1 ? 'fattura' : 'fatture'}
            </span>
          )}
        </div>

        {loadingInvoices ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Caricamento fatture...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Nessuna fattura disponibile</p>
            <p className="text-sm text-gray-500 mt-2">Le tue fatture appariranno qui</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice, index) => (
              <div
                key={invoice._id}
                className="group relative overflow-hidden border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50 hover:shadow-md hover:border-blue-300 transition-all duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <FileText className="h-6 w-6 text-white" />
                    </div>

                    {/* Invoice Details */}
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {invoice.servizio}
                      </h5>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                        <span className="flex items-center">
                          <span className="font-medium text-gray-900 mr-1">N°</span>
                          {invoice.numero}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {formatDate(invoice.dataEmissione)}
                        </span>
                        {invoice.dataPagamento && (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Pagata il {formatDate(invoice.dataPagamento)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount and Action */}
                  <div className="flex items-center gap-6">
                    <p className="text-2xl font-bold text-gray-900">
                      €{invoice.totale.toFixed(2)}
                    </p>
                    <button
                      onClick={() => onDownloadInvoice(invoice._id, invoice.numero)}
                      className="group/btn inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 hover:shadow-md transition-all duration-200"
                    >
                      <Download className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                      Scarica PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
