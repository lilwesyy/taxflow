import { ChevronDown, Phone, CheckCircle, ArrowRight } from 'lucide-react'
import { faqs } from '../../../data/landingPageData'

interface FAQSectionProps {
  onShowRegister: () => void
  onScrollToSection: (section: string) => void
}

export default function FAQSection({ onShowRegister, onScrollToSection }: FAQSectionProps) {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Domande Frequenti
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Risposte chiare alle domande più comuni
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-gray-200">
              <details className="group/details">
                <summary className="flex justify-between items-center cursor-pointer list-none select-none">
                  <h3 className="text-lg font-bold text-gray-900 pr-4">{faq.question}</h3>
                  <div className="text-blue-600 group-open/details:rotate-180 transition-transform duration-200 flex-shrink-0">
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </summary>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 p-8 bg-gray-50 rounded-3xl">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Altre domande?</h3>
          <p className="text-gray-600 mb-6">Il nostro team di esperti è pronto ad aiutarti</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onScrollToSection('footer')}
              className="group bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Phone className="h-4 w-4" />
              <span>Contattaci</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            <button
              onClick={onShowRegister}
              className="group bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Inizia ora</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
