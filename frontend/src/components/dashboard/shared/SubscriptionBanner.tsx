import { Crown, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'

export default function SubscriptionBanner() {
  const { user } = useAuth()

  // Don't show banner if user doesn't have a subscription system (backward compatibility)
  if (!user?.selectedPlan) {
    return null
  }

  const getStatusConfig = () => {
    switch (user.subscriptionStatus) {
      case 'active':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
          title: 'Abbonamento Attivo',
          message: `Piano ${user.selectedPlan?.name || 'Abbonamento'} attivo - Prossimo rinnovo: ${
            user.subscriptionCurrentPeriodEnd
              ? new Date(user.subscriptionCurrentPeriodEnd).toLocaleDateString('it-IT')
              : 'N/A'
          }`
        }

      case 'pending_payment':
        return {
          icon: Clock,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          title: 'Pagamento In Attesa',
          message: 'Completa il pagamento per attivare tutti i servizi'
        }

      case 'past_due':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          title: 'Pagamento Scaduto',
          message: 'Il tuo abbonamento è in sospeso. Aggiorna il metodo di pagamento.'
        }

      case 'canceled':
        return {
          icon: AlertCircle,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
          title: 'Abbonamento Cancellato',
          message: 'Il tuo abbonamento è stato cancellato'
        }

      case 'trialing':
        return {
          icon: Crown,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          title: 'Periodo di Prova',
          message: `Piano ${user.selectedPlan?.name || 'Abbonamento'} - Periodo di prova attivo`
        }

      default:
        return null
    }
  }

  const config = getStatusConfig()
  if (!config) return null

  const Icon = config.icon

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 mb-6`}>
      <div className="flex items-start">
        <Icon className={`${config.iconColor} h-5 w-5 mr-3 flex-shrink-0 mt-0.5`} />
        <div>
          <h4 className={`font-semibold ${config.textColor}`}>{config.title}</h4>
          <p className={`text-sm ${config.textColor} mt-1`}>{config.message}</p>
        </div>
      </div>
    </div>
  )
}
