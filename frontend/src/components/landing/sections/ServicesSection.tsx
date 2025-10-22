import { CheckCircle } from 'lucide-react'
import { services } from '../../../data/landingPageData'

interface ServicesSectionProps {
  setSectionRef: (id: string) => (el: Element | null) => void
}

export default function ServicesSection({ setSectionRef }: ServicesSectionProps) {
  return (
    <section
      id="servizi"
      ref={setSectionRef('servizi')}
      className="py-16 sm:py-20 lg:py-24 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Servizi su misura per te
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tutto quello che serve per gestire la tua attività in un'unica piattaforma
          </p>
        </div>

        {/* Primary Services - Featured */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.filter(s => s.isPrimary).map((service, index) => {
            const Icon = service.icon
            const isPopular = index === 1
            return (
              <div
                key={index}
                className={`group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 flex flex-col ${
                  isPopular ? 'border-blue-600' : 'border-gray-200'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3 right-6">
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      PIÙ SCELTO
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-4xl font-extrabold text-gray-900">{service.price}</div>
                  {service.discount && (
                    <div className="text-sm text-blue-600 font-medium mt-1">{service.discount}</div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2 mb-8">
                  {service.features.slice(0, 3).map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA - Fixed at bottom */}
                <a
                  href={service.learnMoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full text-center py-4 rounded-2xl font-bold transition-all duration-200 mt-auto ${
                    isPopular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  Scopri di più →
                </a>
              </div>
            )
          })}
        </div>

        {/* Secondary Services - Compact */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Altri servizi disponibili</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {services.filter(s => !s.isPrimary).map((service, index) => {
              const Icon = service.icon
              return (
                <div
                  key={index}
                  className="group bg-gray-50 rounded-2xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-gray-200 flex flex-col"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h4>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                  <div className="text-2xl font-extrabold text-blue-600 mb-4">{service.price}</div>
                  <a
                    href={service.learnMoreUrl}
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold inline-flex items-center gap-1 mt-auto"
                  >
                    Scopri →
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
