import {
  CheckCircle,
  ArrowRight,
  Star,
  User,
  TrendingUp,
  Banknote,
  Target,
  Users,
  FileCheck,
  Brain,
  Shield
} from 'lucide-react'

interface HeroSectionProps {
  onShowRegister: () => void
  onScrollToSection: (section: string) => void
}

export default function HeroSection({ onShowRegister, onScrollToSection }: HeroSectionProps) {
  return (
    <section className="relative bg-white overflow-hidden min-h-[90vh] flex items-center">
      {/* Modern Gradient Background - Subtle and Clean */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/20"></div>

      {/* Minimal Geometric Accents */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content - Bold Typography, Clean Layout */}
          <div className="text-center lg:text-left space-y-8 max-w-2xl mx-auto lg:mx-0">
            {/* Badge - Modern Glass Effect */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-blue-100 shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700">Piattaforma Innovativa per PMI</span>
            </div>

            {/* Headline - Extra Bold, Modern Typography */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
              Gestisci la tua{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-blue-600">Partita IVA</span>
                <span className="absolute bottom-2 left-0 w-full h-4 bg-blue-200/50 -rotate-1"></span>
              </span>
              {' '}senza stress
            </h1>

            {/* Subtitle - Large, Readable */}
            <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed font-light">
              La piattaforma <span className="font-semibold text-gray-900">semplice e intuitiva</span> per giovani imprenditori che vogliono crescere
            </p>

            {/* Key Features - Pills Style */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {['Consulente dedicato', 'Dashboard intelligente', 'AI integrata'].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-200">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons - Modern, Bold Style */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={onShowRegister}
                className="group relative px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-2xl hover:bg-blue-700 transition-all duration-200 hover:scale-105 hover:shadow-2xl shadow-lg flex items-center justify-center gap-3"
              >
                <span>Inizia ora</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              <button
                onClick={() => onScrollToSection('servizi')}
                className="group px-8 py-4 bg-white text-gray-900 text-lg font-semibold rounded-2xl border-2 border-gray-200 hover:border-gray-900 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3"
              >
                <span>Scopri di più</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>

            {/* Social Proof - Minimalist, Below CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white"></div>
                  ))}
                </div>
                <span className="font-medium text-gray-900">+250 imprenditori</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="font-medium">4.9/5</span>
              </div>
            </div>
          </div>

          {/* Right Side - Dashboard Mockup Preview */}
          <div className="relative lg:block hidden">
            {/* Main Dashboard Card - Glassomorphism Effect */}
            <div className="relative">
              {/* Background Card with Glass Effect */}
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">La tua Dashboard</div>
                      <div className="text-xs text-gray-500">Panoramica completa</div>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Fatturato', value: '€45.2K', trend: '+12%', icon: TrendingUp, color: 'green' },
                    { label: 'Tasse', value: '€8.1K', trend: '-5%', icon: Banknote, color: 'blue' },
                    { label: 'Rating', value: '8.5/10', trend: '+0.8', icon: Target, color: 'purple' },
                    { label: 'Clienti', value: '127', trend: '+23', icon: Users, color: 'indigo' }
                  ].map((stat, idx) => {
                    const Icon = stat.icon
                    return (
                      <div key={idx} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`w-5 h-5 text-${stat.color}-500`} />
                          <span className={`text-xs font-semibold ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-blue-600'}`}>
                            {stat.trend}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-xs text-gray-500">{stat.label}</div>
                      </div>
                    )
                  })}
                </div>

                {/* Chart Placeholder */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 h-32 flex items-end justify-between gap-2">
                  {[40, 65, 45, 80, 55, 90, 70].map((height, idx) => (
                    <div key={idx} className="flex-1 bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t-lg opacity-80" style={{height: `${height}%`}}></div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: FileCheck, label: 'Fattura' },
                    { icon: Brain, label: 'AI' },
                    { icon: Shield, label: 'Report' }
                  ].map((action, idx) => {
                    const Icon = action.icon
                    return (
                      <button key={idx} className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200">
                        <Icon className="w-5 h-5 text-gray-700" />
                        <span className="text-xs font-medium text-gray-600">{action.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Floating notification badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold flex items-center gap-2 animate-bounce">
                <CheckCircle className="w-4 h-4" />
                Tutto ok!
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
