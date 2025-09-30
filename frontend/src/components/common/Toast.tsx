import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  id: string
  message: string
  type: ToastType
  duration?: number
  onClose: (id: string) => void
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle
}

const styleMap = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200'
}

const iconStyleMap = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-yellow-500'
}

export default function Toast({ id, message, type, duration = 5000, onClose }: ToastProps) {
  const Icon = iconMap[type]

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [id, duration, onClose])

  return (
    <div
      className={`flex items-center p-4 rounded-lg border shadow-lg transition-all duration-300 animate-slide-in-right ${styleMap[type]}`}
    >
      <Icon className={`h-5 w-5 mr-3 flex-shrink-0 ${iconStyleMap[type]}`} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="ml-3 p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}