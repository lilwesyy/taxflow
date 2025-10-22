import { founderInfo, companyValues } from '../../../data/landingPageData'

interface AboutSectionProps {
  setSectionRef: (id: string) => (el: Element | null) => void
}

export default function AboutSection({ setSectionRef }: AboutSectionProps) {
  return (
    <section
      id="chi-siamo"
      ref={setSectionRef('chi-siamo')}
      className="py-16 sm:py-20 lg:py-24 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            La persona dietro TaxFlow
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Esperienza, passione e innovazione al servizio dei giovani imprenditori
          </p>
        </div>

        {/* Founder Card - Simple & Clean */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100">
            <div className="flex flex-col gap-8 items-start">
              {/* Content */}
              <div className="flex-1 w-full">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{founderInfo.name}</h3>
                <p className="text-lg text-blue-600 font-semibold mb-6">{founderInfo.role}</p>

                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  <strong className="font-bold text-gray-900">{founderInfo.bio}</strong>
                </p>

                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {founderInfo.mission}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap gap-8 pt-6 border-t border-gray-200">
                  {founderInfo.stats.map((stat, idx) => (
                    <div key={idx}>
                      <div className="text-4xl font-extrabold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Grid - Single Row */}
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">I nostri valori</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {companyValues.map((value, idx) => {
              const Icon = value.icon
              return (
                <div key={idx} className="flex flex-col items-center text-center bg-white rounded-2xl p-6 border border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">{value.title}</h4>
                    <p className="text-sm text-gray-600">{value.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
