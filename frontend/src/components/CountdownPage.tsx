import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import logoSvg from '../assets/logo.svg'

interface CountdownPageProps {
  launchDate: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const CountdownPage = ({ launchDate }: CountdownPageProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(launchDate) - +new Date()

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        }
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [launchDate])

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-6 sm:p-8 min-w-[100px] sm:min-w-[120px] transform hover:scale-105 transition-all duration-300">
      <div className="text-4xl sm:text-5xl font-extrabold text-blue-600 mb-2">
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-gray-600 text-xs sm:text-sm uppercase tracking-wider font-medium">{label}</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Modern Gradient Background - Same as Landing */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/20"></div>

      {/* Minimal Geometric Accents */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 min-h-screen flex flex-col items-center justify-center">
        {/* Logo - Grande e prominente */}
        <div className="mb-12 sm:mb-16">
          <img src={logoSvg} alt="TaxFlow" className="h-20 sm:h-28 md:h-32 w-auto mx-auto" />
        </div>

        {/* Badge - Modern Glass Effect */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-blue-100 shadow-sm mb-8">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm font-medium text-gray-700">Stiamo arrivando!</span>
        </div>

        {/* Main Headline - Bold Typography */}
        <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
            Qualcosa di{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-blue-600">straordinario</span>
              <span className="absolute bottom-2 left-0 w-full h-4 bg-blue-200/50 -rotate-1"></span>
            </span>
            {' '}sta arrivando
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed font-light">
            La piattaforma <span className="font-semibold text-gray-900">semplice e intuitiva</span> per giovani imprenditori che vogliono crescere
          </p>
        </div>

        {/* Launch Date */}
        <div className="text-center mb-8">
          <div className="text-lg sm:text-xl font-medium text-gray-500 mb-2">Lancio previsto per il</div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">
            {new Date(launchDate).toLocaleDateString('it-IT', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-16">
          <TimeBlock value={timeLeft.days} label="Giorni" />
          <TimeBlock value={timeLeft.hours} label="Ore" />
          <TimeBlock value={timeLeft.minutes} label="Minuti" />
          <TimeBlock value={timeLeft.seconds} label="Secondi" />
        </div>

        {/* Social Proof - Like Landing Page */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mb-12">
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

        {/* Footer */}
        <div className="text-gray-500 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} TaxFlow. Tutti i diritti riservati.</p>
        </div>
      </div>
    </div>
  )
}

export default CountdownPage
