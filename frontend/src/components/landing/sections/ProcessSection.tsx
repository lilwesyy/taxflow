import { ArrowRight } from 'lucide-react'
import { processSteps } from '../../../data/landingPageData'

interface ProcessSectionProps {
  setSectionRef: (id: string) => (el: Element | null) => void
  onShowRegister: () => void
}

export default function ProcessSection({ setSectionRef, onShowRegister }: ProcessSectionProps) {
  return (
    <section
      id="come-funziona"
      ref={setSectionRef('come-funziona')}
      className="py-16 sm:py-20 lg:py-24 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Come funziona
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Inizia in pochi minuti e trasforma la gestione della tua attività
          </p>
        </div>

        {/* Timeline - Modern Design */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="relative">
            {/* Vertical Line - Hidden on mobile, shown on md+ */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-blue-500 to-green-500 transform -translate-x-1/2"></div>

            {processSteps.map((step, index) => {
              const Icon = step.icon
              const isLeft = index % 2 === 0
              const isLast = index === processSteps.length - 1

              return (
                <div key={index} className="relative mb-12 last:mb-0">
                  {/* Mobile & Tablet Layout */}
                  <div className="md:hidden">
                    <div className="flex items-start gap-4">
                      {/* Number Circle */}
                      <div className={`flex-shrink-0 w-12 h-12 ${isLast ? 'bg-green-500' : 'bg-blue-600'} rounded-full flex items-center justify-center shadow-lg`}>
                        <span className="text-xl font-extrabold text-white">{step.step}</span>
                      </div>

                      {/* Content Card */}
                      <div className={`flex-1 bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border-2 ${isLast ? 'border-green-500' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 ${isLast ? 'bg-green-100' : 'bg-blue-100'} rounded-xl flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${isLast ? 'text-green-600' : 'text-blue-600'}`} />
                          </div>
                          <h3 className="text-lg font-extrabold text-gray-900">{step.title}</h3>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout - Alternating */}
                  <div className="hidden md:block">
                    <div className="flex items-center">
                      {/* Left Content */}
                      {isLeft ? (
                        <div className="w-1/2 pr-12">
                          <div className={`bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 border-2 ${isLast ? 'border-green-500 hover:border-green-600' : 'border-gray-200 hover:border-blue-600'}`}>
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`w-12 h-12 ${isLast ? 'bg-green-100' : 'bg-blue-100'} rounded-xl flex items-center justify-center`}>
                                <Icon className={`w-6 h-6 ${isLast ? 'text-green-600' : 'text-blue-600'}`} />
                              </div>
                              <h3 className="text-xl font-extrabold text-gray-900">{step.title}</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed">{step.description}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-1/2"></div>
                      )}

                      {/* Center Circle */}
                      <div className="relative z-10 flex-shrink-0">
                        <div className={`w-16 h-16 ${isLast ? 'bg-green-500' : 'bg-blue-600'} rounded-full flex items-center justify-center shadow-xl border-4 border-gray-50`}>
                          <span className="text-2xl font-extrabold text-white">{step.step}</span>
                        </div>
                      </div>

                      {/* Right Content */}
                      {!isLeft ? (
                        <div className="w-1/2 pl-12">
                          <div className={`bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 border-2 ${isLast ? 'border-green-500 hover:border-green-600' : 'border-gray-200 hover:border-blue-600'}`}>
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`w-12 h-12 ${isLast ? 'bg-green-100' : 'bg-blue-100'} rounded-xl flex items-center justify-center`}>
                                <Icon className={`w-6 h-6 ${isLast ? 'text-green-600' : 'text-blue-600'}`} />
                              </div>
                              <h3 className="text-xl font-extrabold text-gray-900">{step.title}</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed">{step.description}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-1/2"></div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={onShowRegister}
            className="group bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3 mx-auto shadow-xl"
          >
            <span>Inizia ora</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </section>
  )
}
