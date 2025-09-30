import { type ReactNode } from 'react'

interface PlaceholderPageProps {
  icon: ReactNode
  title: string
  description: string
  features?: string[]
}

export default function PlaceholderPage({ icon, title, description, features }: PlaceholderPageProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
      <div className="mb-6">
        <div className="inline-flex p-4 rounded-full bg-primary-50">
          {icon}
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-2xl mx-auto">{description}</p>

      {features && features.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Funzionalità in arrivo:</h4>
          <ul className="text-sm text-gray-700 space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center justify-center">
                <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-sm text-gray-500">
        Questa sezione è in fase di sviluppo e sarà presto disponibile.
      </div>
    </div>
  )
}