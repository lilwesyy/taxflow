import { ArrowRight } from 'lucide-react'
import { benefits } from '../../../data/landingPageData'

interface BenefitsSectionProps {
  setSectionRef: (id: string) => (el: Element | null) => void
}

export default function BenefitsSection({ setSectionRef }: BenefitsSectionProps) {
  return (
    <section
      id="benefici"
      ref={setSectionRef('benefici')}
      className="py-16 sm:py-20 lg:py-24 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Perché TaxFlow
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Metodologie bancarie certificate per la tua crescita
          </p>
        </div>

        {/* Benefits Grid - Simplified */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div
                key={index}
                className="bg-gray-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-gray-200"
              >
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{benefit.description}</p>
                <a
                  href={benefit.learnMoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm inline-flex items-center gap-2"
                >
                  <span>Scopri di più</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
