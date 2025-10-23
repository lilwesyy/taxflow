import { CheckCircle, ArrowRight, GraduationCap, Award, Users, TrendingUp, Building, Shield, MapPin, Phone, Mail } from 'lucide-react'

interface SynetichSectionProps {
  setSectionRef: (id: string) => (el: Element | null) => void
  onShowLogin: () => void
}

export default function SynetichSection({ setSectionRef, onShowLogin }: SynetichSectionProps) {
  return (
    <section
      id="synetich"
      ref={setSectionRef('synetich')}
      className="py-16 sm:py-20 lg:py-24 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Corsi di Sicurezza <span className="text-blue-600">Synetich</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Formazione professionale certificata sulla sicurezza sul lavoro
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 max-w-5xl mx-auto">
          {[
            { number: '150+', label: 'Corsi', icon: GraduationCap },
            { number: '100%', label: 'Certificati', icon: Award },
            { number: '1000+', label: 'Studenti', icon: Users },
            { number: '15+', label: 'Anni', icon: TrendingUp }
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="text-center">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl font-extrabold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            )
          })}
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { title: 'Attrezzature', icon: Building, count: 11, description: 'Gru, piattaforme, movimento terra' },
            { title: 'Sicurezza', icon: Shield, count: 13, description: 'DPI, primo soccorso, antincendio' },
            { title: 'Dirigenti', icon: Users, count: 3, description: 'Dirigenti, datore di lavoro, RSPP' },
            { title: 'E-Learning', icon: GraduationCap, count: 140, description: 'Formazione online certificata' }
          ].map((category, index) => {
            const Icon = category.icon
            return (
              <div key={index} className="bg-gray-50 rounded-3xl p-6 hover:bg-white hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-600">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{category.title}</h3>
                  <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">
                    {category.count}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>
            )
          })}
        </div>

        {/* CTA Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 lg:p-12 text-white shadow-2xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-extrabold mb-6">Perché Synetich?</h3>
              <ul className="space-y-3">
                {[
                  'Formazione certificata',
                  'Docenti qualificati',
                  'Conforme al D.lgs. 81/2008',
                  'Attestati riconosciuti a livello nazionale',
                  'Sedi a Torino e Aosta',
                  'Supporto completo'
                ].map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h4 className="text-xl font-bold mb-4">Contatti</h4>
              <div className="space-y-3 text-blue-50">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-white" />
                  <div>
                    <div className="font-semibold text-white">Torino</div>
                    <div className="text-sm">Via Vincenzo Lancia 26</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-white" />
                  <div>
                    <div className="text-sm">+39 011 0263780</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-white" />
                  <div>
                    <div className="text-sm">contatti@synetich.com</div>
                  </div>
                </div>
              </div>
              <button
                onClick={onShowLogin}
                className="w-full mt-6 bg-white text-blue-700 py-3 rounded-2xl font-bold hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                Accedi ai corsi
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
