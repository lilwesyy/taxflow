import { Users, TrendingUp, Star, Shield, FileCheck, Lock } from 'lucide-react'

export default function SocialProofSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats - Clean Number Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-16">
          {[
            { number: '250+', label: 'Imprenditori attivi', icon: Users },
            { number: '+18%', label: 'Rating medio', icon: TrendingUp },
            { number: '4.9/5', label: 'Soddisfazione', icon: Star },
            { number: '24/7', label: 'Supporto dedicato', icon: Shield }
          ].map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="text-center space-y-2">
                <Icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-4xl lg:text-5xl font-extrabold text-gray-900">{stat.number}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            )
          })}
        </div>

        {/* Trust Badges - Subtle Bottom Row */}
        <div className="flex flex-wrap justify-center items-center gap-8 pt-12 border-t border-gray-200">
          {[
            { icon: Shield, text: 'Banca d\'Italia' },
            { icon: FileCheck, text: 'GDPR Compliant' },
            { icon: Lock, text: 'SSL Encrypted' }
          ].map((badge, idx) => {
            const Icon = badge.icon
            return (
              <div key={idx} className="flex items-center gap-3 text-gray-600">
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{badge.text}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
