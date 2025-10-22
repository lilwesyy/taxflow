import {
  Brain,
  Phone,
  Mail,
  Shield,
  Clock,
  FileCheck,
  Banknote,
  X,
  Menu,
  Building,
  TrendingUp,
  BarChart3,
  Users,
  Zap,
  Target,
  CheckCircle,
  Award,
  Star,
  User,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  MapPin,
  Lock
} from 'lucide-react'
import { useEffect, useRef, useState, useCallback } from 'react'
import Logo from './common/Logo'
import { useCookieConsent } from '../hooks/useCookieConsent'
import logoSvg from '../assets/logo.svg'

interface LandingPageProps {
  onShowLogin: () => void
  onShowRegister: () => void
  showCookieModal?: boolean
  setShowCookieModal?: (show: boolean) => void
}

export default function LandingPage({ onShowLogin, onShowRegister, showCookieModal = false, setShowCookieModal }: LandingPageProps) {
  useCookieConsent() // Keep hook call for side effects
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // States for closing animations
  const [isClosingPrivacy, setIsClosingPrivacy] = useState(false)
  const [isClosingTerms, setIsClosingTerms] = useState(false)
  const [isClosingCookie, setIsClosingCookie] = useState(false)

  // Scroll to top button state
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Navbar visibility state
  const [showNavbar, setShowNavbar] = useState(true)
  const lastScrollY = useRef(0)

  const sectionRefs = useRef<Record<string, Element | null>>({})

  // Removed intersection observer for section visibility animations
  // Keeping simplified design without scroll-based animations

  // Show/hide scroll to top button and navbar based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Show scroll to top button after 400px
      setShowScrollTop(currentScrollY > 400)

      // Hide/show navbar based on scroll direction with threshold
      const scrollDifference = currentScrollY - lastScrollY.current

      // Only trigger if scrolled more than 50px to avoid jittery behavior
      if (Math.abs(scrollDifference) > 50) {
        if (scrollDifference > 0 && currentScrollY > 300) {
          // Scrolling down significantly & past 300px - hide navbar
          setShowNavbar(false)
        } else if (scrollDifference < 0) {
          // Scrolling up - show navbar
          setShowNavbar(true)
        }

        lastScrollY.current = currentScrollY
      }

      // Always show navbar at the very top
      if (currentScrollY < 100) {
        setShowNavbar(true)
        lastScrollY.current = currentScrollY
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const setSectionRef = (id: string) => (el: Element | null) => {
    sectionRefs.current[id] = el
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setShowMobileMenu(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Modal closing functions with animation
  const closePrivacyModal = useCallback(() => {
    setIsClosingPrivacy(true)
    setTimeout(() => {
      setShowPrivacyModal(false)
      setIsClosingPrivacy(false)
    }, 300)
  }, [])

  const closeTermsModal = useCallback(() => {
    setIsClosingTerms(true)
    setTimeout(() => {
      setShowTermsModal(false)
      setIsClosingTerms(false)
    }, 300)
  }, [])

  const closeCookieModal = useCallback(() => {
    setIsClosingCookie(true)
    setTimeout(() => {
      setShowCookieModal?.(false)
      setIsClosingCookie(false)
    }, 300)
  }, [setShowCookieModal])

  // Modal component
  const Modal = ({ isOpen, onClose, title, children, isClosing }: {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    isClosing?: boolean
  }) => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-[80] overflow-hidden">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div
            className={`fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50 ${
              isClosing ? 'animate-fade-out' : 'animate-fade-in'
            }`}
            onClick={onClose}
          ></div>
          <div className={`relative w-full max-w-4xl max-h-[90vh] bg-white shadow-2xl rounded-2xl flex flex-col ${
            isClosing ? 'animate-scale-out' : 'animate-scale-in'
          }`}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {children}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const services = [
    {
      icon: TrendingUp,
      title: "Business Plan Predittivo VisionFlow",
      description: "Sistema di pianificazione strategica con analisi predittiva conforme al D.Lgs. 14/2019 per anticipare le dinamiche di mercato e garantire la crescita sostenibile.",
      price: "da €998",
      features: ["Executive Summary + Obiettivo", "Analisi di mercato", "Time Series Forecasting", "Simulazione budget + Alert"],
      learnMoreUrl: "https://www.gazzettaufficiale.it/eli/id/2019/02/14/19G00007/sg",
      learnMoreText: "Leggi il D.Lgs. 14/2019 - Codice della Crisi",
      isPrimary: true
    },
    {
      icon: Building,
      title: "P.IVA Forfettari",
      description: "Apertura e gestione partita IVA forfettaria. Dashboard integrata con il tuo cassetto fiscale e previdenziale (INPS-INAIL) gratis.",
      price: "€129,90",
      originalPrice: "€169,90",
      discount: "Offerta lancio fino al 31/12/2025",
      features: [
        "Setup creditizio",
        "Regime forfettario",
        "Rating optimization",
        "Adempimenti fiscali"
      ],
      paymentOptions: [
        "Abbonamento annuale €368,90 (pagamento unico)",
        "Oppure €35/mese (pagamento mensile automatico)"
      ],
      learnMoreUrl: "https://www.agenziaentrate.gov.it/portale/web/guest/schede/dichiarazioni/dichiarazione-di-inizio-attivita-iva/infogen-dichiarazione-inizio-attivita",
      learnMoreText: "Guida Agenzia Entrate P.IVA forfettaria",
      isPrimary: true
    },
    {
      icon: Target,
      title: "Analisi SWOT Evolutio",
      description: "Matrice strategica avanzata per valutare punti di forza, debolezze, opportunità e minacce. Minimizza i rischi e definisci strategie vincenti sul lungo periodo.",
      price: "da €998",
      features: ["Matrice 4 quadranti dinamica", "Analisi Strengths/Weaknesses", "Opportunità e Minacce", "Sintesi strategica + Azioni"],
      learnMoreUrl: "https://www.bancaditalia.it/compiti/polmon-garanzie/gestione-garanzie/qualita-crediti/index.html",
      learnMoreText: "Sistema ICAS Banca d'Italia",
      isPrimary: true
    },
    {
      icon: Brain,
      title: "Consulenza Proattiva e Strategica",
      description: "Supporto continuo con metodologia proattiva per anticipare sfide fiscali, ottimizzare la gestione aziendale e migliorare le performance.",
      price: "€170/ora",
      features: ["Monitoraggio continuo", "Ottimizzazione fiscale", "Supporto strategico", "Consulenza dedicata"],
      learnMoreUrl: "https://www.bancaditalia.it/compiti/polmon-garanzie/gestione-garanzie/",
      learnMoreText: "Sistema gestione garanzie Banca d'Italia",
      isPrimary: false
    },
    {
      icon: Banknote,
      title: "Assistenza Accesso al Credito Bancario",
      description: "Supporto completo per l'accesso al credito bancario con garanzia MCC L.662/96 e calcolo scoring creditizio secondo metodologia Banca d'Italia.",
      price: "da €998",
      features: ["Consulenza finanziamento ottimale", "Business plan con scoring", "Garanzia MCC L.662/96", "Conformità Banca d'Italia"],
      learnMoreUrl: "https://www.fondidigaranzia.it/",
      learnMoreText: "Info Fondo di Garanzia PMI",
      isPrimary: false
    },
    {
      icon: GraduationCap,
      title: "Corsi Sicurezza Synetich",
      description: "Formazione professionale certificata sulla sicurezza sul lavoro. 19 corsi disponibili per attrezzature, sicurezza, management e specializzazioni.",
      price: "da €150",
      features: ["19 corsi certificati", "Docenti qualificati", "Sedi Torino e Aosta", "Conformi alle normative"],
      learnMoreUrl: "#synetich",
      learnMoreText: "Scopri tutti i corsi",
      isPrimary: false
    }
  ]

  const benefits = [
    {
      icon: Shield,
      title: "Metodologia Banca d'Italia",
      description: "Utilizziamo gli stessi criteri ICAS per valutare e migliorare il tuo profilo creditizio",
      learnMoreUrl: "https://www.bancaditalia.it/compiti/polmon-garanzie/gestione-garanzie/qualita-crediti/index.html",
      learnMoreText: "Sistema ICAS Banca d'Italia"
    },
    {
      icon: TrendingUp,
      title: "Basel IV Compliant",
      description: "Sistema allineato agli accordi di Basilea per massima credibilità bancaria",
      learnMoreUrl: "https://www.bis.org/basel_framework/",
      learnMoreText: "Framework Basilea III"
    },
    {
      icon: FileCheck,
      title: "D.Lgs. 14/2019 Ready",
      description: "Piena conformità al Codice della Crisi d'Impresa con monitoraggio predittivo",
      learnMoreUrl: "https://www.gazzettaufficiale.it/eli/id/2019/02/14/19G00007/sg",
      learnMoreText: "Codice della Crisi d'Impresa"
    },
    {
      icon: BarChart3,
      title: "Centrale Rischi Integration",
      description: "Monitoraggio e ottimizzazione della tua posizione nella Centrale Rischi",
      learnMoreUrl: "https://www.bancaditalia.it/statistiche/raccolta-dati/segnalazioni/centrale-rischi/index.html",
      learnMoreText: "Info Centrale Rischi"
    },
    {
      icon: Clock,
      title: "Early Warning System",
      description: "Sistema di allerta precoce per prevenire crisi e garantire continuità",
      learnMoreUrl: "https://www.gazzettaufficiale.it/eli/id/2019/02/14/19G00007/sg",
      learnMoreText: "Normativa Early Warning"
    },
    {
      icon: Banknote,
      title: "Costo del Credito Ridotto",
      description: "Migliora il tuo rating per ottenere condizioni di finanziamento più vantaggiose",
      learnMoreUrl: "https://www.bancaditalia.it/compiti/polmon-garanzie/gestione-garanzie/",
      learnMoreText: "Gestione Garanzie e Rating"
    }
  ]

  const process = [
    {
      step: "1",
      title: "Registrati",
      description: "Crea il tuo account e inserisci i dati della tua attività",
      icon: Users
    },
    {
      step: "2",
      title: "Configurazione",
      description: "Il nostro team configura tutto per la tua partita IVA",
      icon: Zap
    },
    {
      step: "3",
      title: "Operativo",
      description: "Inizia subito a fatturare e gestire la tua contabilità",
      icon: Target
    }
  ]

  return (
    <div className="min-h-screen bg-white overflow-x-hidden sm:overflow-x-auto">
      {/* Header - Premium 2025 Design */}
      <header className={`bg-white/95 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 shadow-[0_1px_3px_0_rgb(0,0,0,0.05)] transition-transform duration-300 ${
        showNavbar ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <button
              onClick={scrollToTop}
              className="flex items-center hover:opacity-80 transition-opacity duration-200"
              aria-label="Torna alla home"
            >
              <img src={logoSvg} alt="TaxFlow" className="h-10 sm:h-12 w-auto" />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => scrollToSection('servizi')}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200 font-medium text-sm px-4 py-2 rounded-lg"
              >
                Servizi
              </button>
              <button
                onClick={() => scrollToSection('benefici')}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200 font-medium text-sm px-4 py-2 rounded-lg"
              >
                Vantaggi
              </button>
              <button
                onClick={() => scrollToSection('come-funziona')}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200 font-medium text-sm px-4 py-2 rounded-lg"
              >
                Come Funziona
              </button>
              <button
                onClick={() => scrollToSection('synetich')}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200 font-medium text-sm px-4 py-2 rounded-lg"
              >
                Formazione
              </button>
              <button
                onClick={() => scrollToSection('footer')}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200 font-medium text-sm px-4 py-2 rounded-lg"
              >
                Contatti
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={onShowLogin}
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 font-semibold transition-all duration-200 text-sm px-5 py-2 rounded-lg"
              >
                Accedi
              </button>
              <button
                onClick={onShowRegister}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold text-sm shadow-[0_2px_8px_0_rgb(37,99,235,0.2)] hover:shadow-[0_4px_12px_0_rgb(37,99,235,0.3)] hover:scale-[1.02]"
              >
                Inizia ora
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100">
            <div className="px-4 py-4 space-y-1">
              <button
                onClick={() => { scrollToSection('servizi'); setShowMobileMenu(false); }}
                className="block w-full text-left px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200 font-medium"
              >
                Servizi
              </button>
              <button
                onClick={() => { scrollToSection('benefici'); setShowMobileMenu(false); }}
                className="block w-full text-left px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200 font-medium"
              >
                Vantaggi
              </button>
              <button
                onClick={() => { scrollToSection('come-funziona'); setShowMobileMenu(false); }}
                className="block w-full text-left px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200 font-medium"
              >
                Come Funziona
              </button>
              <button
                onClick={() => { scrollToSection('synetich'); setShowMobileMenu(false); }}
                className="block w-full text-left px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200 font-medium"
              >
                Formazione
              </button>
              <button
                onClick={() => { scrollToSection('footer'); setShowMobileMenu(false); }}
                className="block w-full text-left px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200 font-medium"
              >
                Contatti
              </button>
              <div className="border-t border-gray-100 pt-3 mt-3 space-y-2">
                <button
                  onClick={onShowLogin}
                  className="block w-full text-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200 font-semibold"
                >
                  Accedi
                </button>
                <button
                  onClick={onShowRegister}
                  className="block w-full text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 font-semibold shadow-[0_2px_8px_0_rgb(37,99,235,0.2)] hover:shadow-[0_4px_12px_0_rgb(37,99,235,0.3)]"
                >
                  Inizia ora
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section - Fiscozen/FidoCommercialista Inspired Design */}
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
                  onClick={() => scrollToSection('servizi')}
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
                <div className="absolute -top-4 -right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold flex items-center gap-2 animate-bounce">
                  <CheckCircle className="w-4 h-4" />
                  Tutto ok!
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Social Proof Section - Minimalist Design */}
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

      {/* Services Section - Clean Modern Design */}
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

      {/* Chi Siamo Section - Clean Modern */}
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
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Teresa Marrari</h3>
                  <p className="text-lg text-blue-600 font-semibold mb-6">Founder & CEO</p>

                  <p className="text-lg text-gray-700 leading-relaxed mb-6">
                    <strong className="font-bold text-gray-900">Commercialista con studio a Torino da oltre 25 anni</strong>. Dal 1998 si distingue nella consulenza fiscale, tributaria e societaria, con un focus particolare sulla formazione dell'imprenditore.
                  </p>

                  <p className="text-lg text-gray-700 leading-relaxed mb-6">
                    Con TaxFlow, Teresa ha creato uno strumento innovativo per supportare i giovani imprenditori, rendendo semplice la gestione fiscale e fornendo le basi per costruire attività solide.
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-8 pt-6 border-t border-gray-200">
                    <div>
                      <div className="text-4xl font-extrabold text-gray-900">25+</div>
                      <div className="text-sm text-gray-600">Anni esperienza</div>
                    </div>
                    <div>
                      <div className="text-4xl font-extrabold text-gray-900">250+</div>
                      <div className="text-sm text-gray-600">Imprenditori</div>
                    </div>
                    <div>
                      <div className="text-4xl font-extrabold text-gray-900">100%</div>
                      <div className="text-sm text-gray-600">Conforme</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Values Grid - Single Row */}
          <div className="max-w-7xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">I nostri valori</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Shield, title: 'Conformità', desc: 'D.Lgs. 14/2019 e standard Banca d\'Italia' },
                { icon: Users, title: 'Orientamento cliente', desc: 'Supporto personalizzato dedicato' },
                { icon: Brain, title: 'Innovazione', desc: 'AI e analytics avanzati' },
                { icon: Award, title: 'Eccellenza', desc: 'Team qualificato ed esperto' }
              ].map((value, idx) => {
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

      {/* Benefits Section - Simplified */}
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

      {/* Process Section - Clean Grid */}
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

          {/* Steps Grid - Simplified */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {process.map((step, index) => {
              const Icon = step.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-3xl p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-600"
                >
                  {/* Step Number - Large & Bold */}
                  <div className="text-6xl font-extrabold text-blue-600 mb-6">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              )
            })}
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

      {/* Synetich Training Section - Simplified */}
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
              { number: '19', label: 'Corsi', icon: GraduationCap },
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
              { title: 'Attrezzature', icon: Building, count: 10, description: 'Gru, piattaforme, movimento terra' },
              { title: 'Sicurezza', icon: Shield, count: 5, description: 'DPI, primo soccorso, antincendio' },
              { title: 'Management', icon: Users, count: 4, description: 'RSPP, RLS, dirigenti, preposti' },
              { title: 'Specializzato', icon: Target, count: 3, description: 'Segnaletica, perforazioni' }
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
                    'Conformi alle normative',
                    'Riconosciute a livello nazionale',
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

      {/* Regulatory Info Section - Simplified */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Normative di Riferimento
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Servizi conformi alle normative bancarie e fiscali
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">D.Lgs. 14/2019</h3>
              <p className="text-sm text-gray-600 mb-4">Codice Crisi d'Impresa</p>
              <a
                href="https://www.gazzettaufficiale.it/eli/id/2019/02/14/19G00007/sg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center font-semibold"
              >
                Leggi →
              </a>
            </div>

            <div className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">Basel IV</h3>
              <p className="text-sm text-gray-600 mb-4">Regolamentazione bancaria</p>
              <a
                href="https://www.bis.org/basel_framework/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center font-semibold"
              >
                Framework →
              </a>
            </div>

            <div className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">Sistema ICAS</h3>
              <p className="text-sm text-gray-600 mb-4">Banca d'Italia</p>
              <a
                href="https://www.bancaditalia.it/compiti/polmon-garanzie/gestione-garanzie/qualita-crediti/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center font-semibold"
              >
                Scopri →
              </a>
            </div>

            <div className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">Centrale Rischi</h3>
              <p className="text-sm text-gray-600 mb-4">Rapporti di credito</p>
              <a
                href="https://www.bancaditalia.it/statistiche/raccolta-dati/segnalazioni/centrale-rischi/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center font-semibold"
              >
                Info →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Simplified */}
      <section
        id="cta"
        ref={setSectionRef('cta')}
        className="py-16 sm:py-20 lg:py-24 bg-blue-600"
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
            Inizia oggi stesso
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Ottimizza le tue relazioni bancarie con metodologie certificate
          </p>
          <button
            onClick={onShowRegister}
            className="bg-white text-blue-600 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-blue-50 transition-all duration-200 hover:scale-105 shadow-xl"
          >
            Inizia ora
          </button>
        </div>
      </section>

      {/* FAQ Section - Clean & Simple */}
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
            {[
              {
                question: "Quali adempimenti sono compresi nell'abbonamento?",
                answer: "È compreso il modello Unico completo di ogni reddito e tutti i servizi ed adempimenti fiscali ordinari relativi alla tua Partita IVA."
              },
              {
                question: "Se non mi trovo bene, posso ricevere il rimborso?",
                answer: "Sì! Se non ti trovi bene con il nostro abbonamento, hai fino a 30 giorni per richiedere un rimborso completo, senza bisogno di spiegazioni. La tua soddisfazione viene prima di tutto."
              },
              {
                question: "Come posso contattare il mio consulente?",
                answer: "Puoi contattare il tuo commercialista aprendo una consulenza in app oppure via telefono, video-call e chat. Tramite la piattaforma avrai il collegamento diretto alla sua agenda e potrei fissare con lui appuntamenti ogni qual volta lo reputi necessario."
              },
              {
                question: "Le consulenze sono illimitate?",
                answer: "Si, la consulenza relativa alla gestione ordinaria della tua Partita IVA e a tutti i redditi da dichiarare nel modello unico sono compresi."
              },
              {
                question: "Cosa non è compreso nel mio abbonamento?",
                answer: "L'abbonamento comprende tutti gli adempimenti previsti nella gestione ordinaria della tua attività. Non sono compresi: Tutto ciò che puoi trovare tra i servizi extra del tuo piano; le spese vive, diritti e bolli di segreteria per le pratiche presso i vari enti; per le aziende senza dipendenti, autoliquidazione INAIL annuale, chiusura della posizione INAIL, variazioni della posizione INAIL (cambio socio lavoratore, cambio sede, variazione attività), e denunce di infortuni INAIL; Business Plan; Valutazioni d'azienda (Swot Evolutio); Tutte le operazioni straordinarie (fusioni, scissioni, ricorsi, cessioni, partecipazioni, liquidazione); Comunicazione dati al sistema tessera sanitaria per le professioni sanitarie; Calcolo IMU per immobili non intestati alla società, al libero professionista o ditta individuale che ha acquistato il servizio; Fiscalità internazionale; Visto di conformità; Rateizzazione ed analisi avvisi bonari."
              },
              {
                question: "Quanti codici ATECO gestisce Taxflow?",
                answer: "Taxflow gestisce fino a 3 codici ATECO per ciascun cliente, che è il massimo consentito per una Partita IVA. Siamo in grado di assisterti anche se i codici appartengono a settori con casse previdenziali differenti, offrendo una gestione completa e personalizzata per ogni esigenza fiscale."
              }
            ].map((faq, index) => (
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
                onClick={() => scrollToSection('footer')}
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

      {/* Servizi Extra Section - Simplified */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Servizi Extra
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Servizi aggiuntivi per la tua attività
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-3xl p-8 border-2 border-gray-200">
              <div className="space-y-4">
                {[
                  { service: "Variazione SCIAA", note: "Spese vive escluse", price: "150 €" },
                  { service: "Riduzione contributi INPS", price: "35 €" },
                  { service: "Variazione agli enti", note: "Spese vive escluse", price: "100 €" },
                  { service: "Risoluzione Agenzia Entrate", price: "75 €" },
                  { service: "Dichiarazione redditi pregressa", price: "200 €" },
                  { service: "Ravvedimento e DURC", price: "20 €" }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-start bg-white rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex-1 pr-6">
                      <h3 className="font-bold text-gray-900 mb-1">{item.service}</h3>
                      {item.note && (
                        <p className="text-sm text-gray-600">{item.note}</p>
                      )}
                    </div>
                    <div className="text-2xl font-extrabold text-blue-600">{item.price}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">* Prezzi IVA esclusa</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Simplified */}
      <footer id="footer" className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <Logo className="h-12" inverted={true} />
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Piattaforma semplice per giovani imprenditori
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-400">
                  <Shield className="h-4 w-4 text-blue-400 mr-2" />
                  <span>Conforme D.Lgs. 14/2019</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <FileCheck className="h-4 w-4 text-blue-400 mr-2" />
                  <span>Basel IV Framework</span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Servizi</h3>
              <ul className="space-y-3">
                {[
                  "Gestione Partita IVA",
                  "Consulenza Fiscale",
                  "Business Plan",
                  "Analisi AI",
                  "Fatturazione"
                ].map((service, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Supporto</h3>
              <ul className="space-y-3">
                {[
                  "Consulenza dedicata",
                  "Documenti",
                  "Compliance",
                  "FAQ"
                ].map((support, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      {support}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Contatti</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-blue-400 mr-3" />
                  <span className="text-sm text-gray-300">800 123 456</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-blue-400 mr-3" />
                  <span className="text-sm text-gray-300">info@taxflow.it</span>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={onShowRegister}
                  className="group bg-white text-gray-900 px-6 py-3 rounded-2xl font-bold hover:bg-gray-100 transition-all duration-200 flex items-center justify-center w-full"
                >
                  <span>Inizia ora</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-gray-400 text-center md:text-left">
                <span className="text-sm">&copy; 2025 TaxFlow. Tutti i diritti riservati.</span>
              </div>

              <div className="flex flex-wrap justify-center gap-6">
                <button
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Privacy
                </button>
                <button
                  onClick={() => setShowTermsModal(true)}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Termini
                </button>
                <button
                  onClick={() => setShowCookieModal?.(true)}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Cookie
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      <Modal isOpen={showPrivacyModal} onClose={closePrivacyModal} title="Privacy Policy" isClosing={isClosingPrivacy}>
        <div className="prose prose-sm max-w-none">
          <h4 className="text-lg font-semibold mb-3">Informativa sulla Privacy</h4>
          <p className="mb-4 text-sm">
            Ai sensi del Regolamento UE 2016/679 (GDPR) e del D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018,
            TaxFlow informa gli utenti circa il trattamento dei dati personali.
          </p>

          <h5 className="font-semibold mb-2 mt-6">1. Titolare del Trattamento</h5>
          <p className="mb-4 text-sm">
            <strong>TaxFlow</strong><br />
            Titolare: Teresa Marrari<br />
            Sede: Torino, Italia<br />
            Email: info@taxflow.it<br />
            Email Privacy: privacy@taxflow.it
          </p>

          <h5 className="font-semibold mb-2 mt-6">2. Tipologie di Dati Raccolti</h5>

          <h6 className="font-semibold text-sm mb-2 mt-4">2.1 Dati forniti dall'utente</h6>
          <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
            <li><strong>Dati anagrafici:</strong> nome, cognome, data e luogo di nascita, codice fiscale</li>
            <li><strong>Dati di contatto:</strong> email, telefono, indirizzo di residenza (via, città, CAP, provincia)</li>
            <li><strong>Dati fiscali:</strong> Partita IVA, codice ATECO, regime contabile, fatturato previsto, ragione sociale, sede legale</li>
            <li><strong>Dati finanziari:</strong> informazioni pagamento tramite Stripe, piano abbonamento, stato abbonamento</li>
            <li><strong>Documenti:</strong> documento d'identità, codice fiscale, dichiarazioni fiscali</li>
          </ul>

          <h6 className="font-semibold text-sm mb-2 mt-4">2.2 Dati raccolti automaticamente</h6>
          <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
            <li><strong>Dati di navigazione:</strong> indirizzo IP, browser, sistema operativo</li>
            <li><strong>Cookie:</strong> tecnici, di preferenze e analytics (vedi Cookie Policy)</li>
            <li><strong>Log di sistema:</strong> data/ora accesso, azioni effettuate</li>
          </ul>

          <h6 className="font-semibold text-sm mb-2 mt-4">2.3 Dati generati dal servizio</h6>
          <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
            <li><strong>Consulenze:</strong> contenuto chat, allegati</li>
            <li><strong>Fatture:</strong> numero, importo, IVA, stato pagamento</li>
            <li><strong>Feedback:</strong> rating, commenti</li>
            <li><strong>Analisi:</strong> Business Plan, rating creditizio Basel IV</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">3. Finalità e Base Giuridica</h5>
          <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
            <li>Consulenza fiscale e gestione P.IVA → Esecuzione contratto (art. 6.1.b GDPR)</li>
            <li>Gestione registrazione e profilo → Esecuzione contratto (art. 6.1.b GDPR)</li>
            <li>Elaborazione pagamenti → Esecuzione contratto (art. 6.1.b GDPR)</li>
            <li>Adempimenti fiscali → Obbligo legale (art. 6.1.c GDPR)</li>
            <li>Assistenza clienti → Interesse legittimo (art. 6.1.f GDPR)</li>
            <li>Marketing → Consenso (art. 6.1.a GDPR)</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">4. Destinatari dei Dati</h5>
          <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
            <li><strong>Personale autorizzato:</strong> consulenti fiscali, amministratori</li>
            <li><strong>Fornitori:</strong> Stripe (pagamenti), MongoDB (database), Vercel (hosting), Google (analytics)</li>
            <li><strong>Autorità:</strong> Agenzia Entrate, GdF su richiesta legale</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">5. Conservazione</h5>
          <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
            <li>Dati contrattuali: 10 anni</li>
            <li>Fatturazione: 10 anni</li>
            <li>Log navigazione: 6 mesi</li>
            <li>Marketing: fino a revoca o 24 mesi inattività</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">6. Diritti dell'Interessato</h5>
          <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
            <li>Accesso, rettifica, cancellazione dati</li>
            <li>Limitazione, portabilità, opposizione trattamento</li>
            <li>Revoca consenso, reclamo al Garante</li>
          </ul>
          <p className="mb-4 text-sm">
            Contatta: <strong>privacy@taxflow.it</strong> (risposta entro 30 giorni)
          </p>

          <h5 className="font-semibold mb-2 mt-6">7. Sicurezza</h5>
          <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
            <li>Crittografia TLS/SSL</li>
            <li>Password hashate (bcrypt)</li>
            <li>Autenticazione JWT</li>
            <li>Backup regolari</li>
            <li>Accesso limitato</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">8. Reclami</h5>
          <p className="mb-4 text-sm">
            <strong>Garante Privacy</strong><br />
            Piazza Venezia, 11 - 00187 Roma<br />
            Tel: +39 06.696771<br />
            <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.garanteprivacy.it</a>
          </p>

          <div className="bg-gray-50 p-4 rounded-lg mt-6">
            <p className="text-sm font-semibold mb-1">Ultimo aggiornamento: 13 Ottobre 2025</p>
            <p className="text-xs text-gray-600">Versione 1.0</p>
          </div>
        </div>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal isOpen={showTermsModal} onClose={closeTermsModal} title="Termini di Servizio" isClosing={isClosingTerms}>
        <div className="prose prose-sm max-w-none">
          <h4 className="text-lg font-semibold mb-3">Termini e Condizioni di Servizio</h4>
          <p className="mb-4 text-sm">
            I presenti Termini e Condizioni di Servizio ("Termini") regolano l'accesso e l'utilizzo della piattaforma TaxFlow
            e dei relativi servizi professionali. Utilizzando la piattaforma, l'utente accetta integralmente i presenti Termini.
          </p>

          <h5 className="font-semibold mb-2 mt-6">1. Definizioni</h5>
          <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
            <li><strong>"Piattaforma":</strong> il sito web www.taxflow.it e l'applicazione web</li>
            <li><strong>"Servizi":</strong> tutti i servizi professionali offerti da TaxFlow</li>
            <li><strong>"Utente":</strong> persona fisica o giuridica che utilizza la Piattaforma</li>
            <li><strong>"Cliente" o "Business":</strong> utente che sottoscrive un abbonamento</li>
            <li><strong>"Consulente" o "Admin":</strong> commercialista abilitato che eroga i servizi</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">2. Servizi Offerti</h5>
          <p className="mb-2 text-sm">TaxFlow fornisce i seguenti servizi professionali:</p>
          <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
            <li><strong>Consulenza fiscale specializzata</strong> in regime forfettario, ordinario e semplificato</li>
            <li><strong>Apertura e gestione Partita IVA</strong> con supporto documentale completo</li>
            <li><strong>Fatturazione elettronica</strong> con integrazione Sistema di Interscambio (SDI)</li>
            <li><strong>Adempimenti fiscali ordinari:</strong> modello Unico, dichiarazione redditi, F24, comunicazioni obbligatorie</li>
            <li><strong>Business Plan personalizzati</strong> e analisi di fattibilità</li>
            <li><strong>Analisi SWOT avanzate:</strong> rating creditizio Basel IV, analisi SWOT, simulazione imposte</li>
            <li><strong>Gestione documentale:</strong> archiviazione sicura documenti fiscali e dichiarazioni</li>
            <li><strong>Reports e analytics:</strong> dashboard in tempo reale con KPI fiscali e finanziari</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">3. Registrazione e Approvazione</h5>
          <p className="mb-2 text-sm">Il processo di attivazione del servizio prevede:</p>
          <ol className="list-decimal pl-5 mb-4 space-y-1 text-sm">
            <li>Registrazione utente con email e password sicura</li>
            <li>Approvazione registrazione da parte del Consulente</li>
            <li>Compilazione form richiesta apertura P.IVA (se applicabile)</li>
            <li>Approvazione pratica P.IVA da parte del Consulente</li>
            <li>Sottoscrizione abbonamento tramite pagamento sicuro Stripe</li>
            <li>Attivazione completa servizi</li>
          </ol>
          <p className="mb-4 text-sm">
            TaxFlow si riserva il diritto di rifiutare o sospendere registrazioni in caso di informazioni incomplete,
            false o per violazione dei presenti Termini.
          </p>

          <h5 className="font-semibold mb-2 mt-6">4. Obblighi dell'Utente</h5>
          <p className="mb-2 text-sm">L'Utente si impegna a:</p>
          <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
            <li>Fornire dati anagrafici e fiscali <strong>veritieri, accurati e completi</strong></li>
            <li>Comunicare tempestivamente variazioni di dati fiscali, P.IVA, residenza, fatturato</li>
            <li>Conservare le credenziali di accesso con la massima riservatezza</li>
            <li>Rispettare le <strong>scadenze fiscali</strong> indicate dal Consulente</li>
            <li>Fornire <strong>documentazione richiesta</strong> entro i termini concordati</li>
            <li>Pagare gli abbonamenti secondo le modalità e tempistiche pattuite</li>
            <li>Collaborare attivamente per la corretta erogazione dei servizi</li>
            <li>Non utilizzare la Piattaforma per scopi illeciti o contrari alla legge</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">5. Abbonamenti e Pagamenti</h5>

          <h6 className="font-semibold text-sm mb-2 mt-4">5.1 Piani di Abbonamento</h6>
          <p className="mb-4 text-sm">
            TaxFlow offre piani di abbonamento <strong>mensili e annuali</strong> con tariffe pubblicate sul sito.
            Il piano include tutti gli adempimenti fiscali ordinari relativi alla Partita IVA e al modello Unico.
          </p>

          <h6 className="font-semibold text-sm mb-2 mt-4">5.2 Modalità di Pagamento</h6>
          <p className="mb-4 text-sm">
            I pagamenti vengono elaborati tramite <strong>Stripe</strong>, processore di pagamenti certificato PCI-DSS Level 1.
            TaxFlow non memorizza dati di carte di credito sui propri server. Metodi accettati: carta di credito, carta di debito.
          </p>

          <h6 className="font-semibold text-sm mb-2 mt-4">5.3 Rinnovo e Cancellazione</h6>
          <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
            <li>L'abbonamento si rinnova <strong>automaticamente</strong> alla scadenza</li>
            <li>L'utente può cancellare in qualsiasi momento dalle Impostazioni</li>
            <li>La cancellazione ha effetto al termine del periodo già pagato</li>
            <li>Non sono previsti rimborsi parziali per periodi non utilizzati</li>
          </ul>

          <h6 className="font-semibold text-sm mb-2 mt-4">5.4 Garanzia Soddisfatti o Rimborsati</h6>
          <p className="mb-4 text-sm">
            TaxFlow offre <strong>garanzia 30 giorni</strong> soddisfatti o rimborsati. Se non sei soddisfatto entro 30 giorni
            dalla sottoscrizione, puoi richiedere rimborso completo senza fornire spiegazioni. Contatta: info@taxflow.it
          </p>

          <h6 className="font-semibold text-sm mb-2 mt-4">5.5 Servizi Extra</h6>
          <p className="mb-4 text-sm">
            Alcuni servizi non sono inclusi nell'abbonamento base e sono fatturati separatamente (vedi sezione "Servizi Extra" sul sito):
            variazioni INAIL, Business Plan personalizzati, analisi SWOT evolute, valutazioni d'azienda, operazioni straordinarie.
          </p>

          <h5 className="font-semibold mb-2 mt-6">6. Esclusioni dal Servizio</h5>
          <p className="mb-2 text-sm">L'abbonamento <strong>NON include:</strong></p>
          <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
            <li>Spese vive, diritti e bolli per pratiche presso enti (INPS, Camera di Commercio, ecc.)</li>
            <li>Per aziende senza dipendenti: autoliquidazione INAIL, chiusura/variazioni posizione INAIL, denunce infortuni</li>
            <li>Business Plan e valutazioni d'azienda (Swot Evolution)</li>
            <li>Operazioni straordinarie: fusioni, scissioni, liquidazioni, cessioni quote</li>
            <li>Comunicazione dati sistema tessera sanitaria (professioni sanitarie)</li>
            <li>Calcolo IMU per immobili non intestati al Cliente</li>
            <li>Fiscalità internazionale</li>
            <li>Visto di conformità</li>
            <li>Rateizzazione e analisi avvisi bonari</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">7. Proprietà Intellettuale</h5>
          <p className="mb-4 text-sm">
            Tutti i contenuti della Piattaforma (testi, grafiche, loghi, software, analytics) sono di proprietà esclusiva di
            TaxFlow o dei suoi licenzianti. È vietata la riproduzione, copia, distribuzione o modifica senza autorizzazione scritta.
          </p>

          <h5 className="font-semibold mb-2 mt-6">8. Limitazioni di Responsabilità</h5>
          <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
            <li>TaxFlow si impegna a fornire servizi professionali con diligenza ma <strong>non garantisce risultati fiscali specifici</strong></li>
            <li>Il Consulente non è responsabile per danni derivanti da <strong>informazioni incomplete, errate o tardive</strong> fornite dal Cliente</li>
            <li>TaxFlow non è responsabile per <strong>malfunzionamenti temporanei</strong> della Piattaforma dovuti a manutenzione, cause di forza maggiore o attacchi informatici</li>
            <li>La responsabilità di TaxFlow è <strong>limitata all'importo</strong> dell'abbonamento pagato dal Cliente nell'anno corrente</li>
            <li>Sono escluse responsabilità per <strong>danni indiretti, lucro cessante o perdite</strong> di opportunità</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">9. Sospensione e Risoluzione</h5>
          <p className="mb-2 text-sm">TaxFlow può sospendere o risolvere il contratto in caso di:</p>
          <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
            <li>Mancato pagamento dell'abbonamento</li>
            <li>Violazione dei presenti Termini</li>
            <li>Condotta fraudolenta o illecita</li>
            <li>Mancata collaborazione del Cliente</li>
            <li>Fornitura ripetuta di informazioni false</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">10. Modifiche ai Termini</h5>
          <p className="mb-4 text-sm">
            TaxFlow si riserva il diritto di modificare i presenti Termini in qualsiasi momento. Le modifiche saranno comunicate
            via email con <strong>30 giorni di preavviso</strong>. L'uso continuato della Piattaforma costituisce accettazione delle modifiche.
          </p>

          <h5 className="font-semibold mb-2 mt-6">11. Legge Applicabile e Foro Competente</h5>
          <p className="mb-4 text-sm">
            I presenti Termini sono regolati dalla <strong>legge italiana</strong>.<br />
            Per ogni controversia, sarà competente in via esclusiva il <strong>Foro di Torino</strong>.
          </p>

          <h5 className="font-semibold mb-2 mt-6">12. Contatti</h5>
          <p className="mb-4 text-sm">
            Per informazioni sui Termini di Servizio:<br />
            Email: <strong>info@taxflow.it</strong><br />
            Email Legale: <strong>legal@taxflow.it</strong>
          </p>

          <div className="bg-gray-50 p-4 rounded-lg mt-6">
            <p className="text-sm font-semibold mb-1">Ultimo aggiornamento: 13 Ottobre 2025</p>
            <p className="text-xs text-gray-600">Versione 1.0</p>
          </div>
        </div>
      </Modal>

      {/* Cookie Policy Modal */}
      <Modal isOpen={showCookieModal} onClose={closeCookieModal} title="Cookie Policy" isClosing={isClosingCookie}>
        <div className="prose prose-sm max-w-none">
          <h4 className="text-lg font-semibold mb-3">Informativa sui Cookie</h4>
          <p className="mb-4">
            La presente Cookie Policy ha lo scopo di informare gli utenti del sito www.taxflow.it
            sull'utilizzo dei cookie e di altre tecnologie di tracciamento in conformità con il
            Regolamento UE 2016/679 (GDPR) e la normativa italiana in materia di protezione dei dati personali.
          </p>

          <h5 className="font-semibold mb-2 mt-6">1. Titolare del Trattamento</h5>
          <p className="mb-4">
            <strong>TaxFlow</strong><br />
            Titolare: Teresa Marrari<br />
            Sede: Torino, Italia<br />
            Email: info@taxflow.it<br />
            Email Privacy: privacy@taxflow.it
          </p>

          <h5 className="font-semibold mb-2 mt-6">2. Cosa sono i Cookie</h5>
          <p className="mb-4">
            I cookie sono piccoli file di testo che vengono memorizzati sul dispositivo dell'utente
            (computer, tablet, smartphone) quando visita un sito web. I cookie permettono al sito di
            riconoscere il dispositivo e memorizzare alcune informazioni sulle preferenze o azioni passate.
          </p>

          <h5 className="font-semibold mb-2 mt-6">3. Tipologie di Cookie Utilizzati</h5>

          <h6 className="font-semibold text-sm mb-2 mt-4">3.1 Cookie Tecnici (Necessari)</h6>
          <p className="mb-2 text-sm">
            Questi cookie sono essenziali per il funzionamento del sito e non richiedono il consenso dell'utente
            ai sensi dell'art. 122 del Codice Privacy italiano.
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full text-xs border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 px-2 py-1 text-left">Nome</th>
                  <th className="border border-gray-200 px-2 py-1 text-left">Finalità</th>
                  <th className="border border-gray-200 px-2 py-1 text-left">Durata</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-2 py-1">taxflow_token</td>
                  <td className="border border-gray-200 px-2 py-1">Autenticazione utente</td>
                  <td className="border border-gray-200 px-2 py-1">30 giorni</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-2 py-1">taxflow_user</td>
                  <td className="border border-gray-200 px-2 py-1">Dati profilo utente</td>
                  <td className="border border-gray-200 px-2 py-1">30 giorni</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-2 py-1">taxflow_cookie_consent</td>
                  <td className="border border-gray-200 px-2 py-1">Memorizzazione consenso cookie</td>
                  <td className="border border-gray-200 px-2 py-1">12 mesi</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h6 className="font-semibold text-sm mb-2 mt-4">3.2 Cookie Analitici</h6>
          <p className="mb-2 text-sm">
            Utilizzati per raccogliere informazioni sull'utilizzo del sito in forma aggregata e anonima.
            Richiedono il consenso dell'utente.
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full text-xs border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 px-2 py-1 text-left">Nome</th>
                  <th className="border border-gray-200 px-2 py-1 text-left">Fornitore</th>
                  <th className="border border-gray-200 px-2 py-1 text-left">Finalità</th>
                  <th className="border border-gray-200 px-2 py-1 text-left">Durata</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-2 py-1">_ga, _gid</td>
                  <td className="border border-gray-200 px-2 py-1">Google Analytics</td>
                  <td className="border border-gray-200 px-2 py-1">Analisi traffico e comportamento utenti</td>
                  <td className="border border-gray-200 px-2 py-1">24 mesi / 24 ore</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mb-4 text-xs">
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Privacy Policy Google Analytics
            </a>
          </p>

          <h6 className="font-semibold text-sm mb-2 mt-4">3.3 Cookie di Marketing</h6>
          <p className="mb-4 text-sm">
            Utilizzati per tracciare i visitatori sui siti web al fine di mostrare annunci pubblicitari
            pertinenti e coinvolgenti. Richiedono il consenso esplicito dell'utente.
          </p>

          <h5 className="font-semibold mb-2 mt-6">4. Base Giuridica del Trattamento</h5>
          <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
            <li><strong>Cookie Tecnici:</strong> Interesse legittimo del Titolare (art. 6.1.f GDPR)</li>
            <li><strong>Cookie Analitici e Marketing:</strong> Consenso dell'utente (art. 6.1.a GDPR)</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">5. Durata dei Cookie</h5>
          <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
            <li><strong>Cookie di sessione:</strong> Vengono cancellati automaticamente alla chiusura del browser</li>
            <li><strong>Cookie persistenti:</strong> Rimangono memorizzati fino alla scadenza o cancellazione manuale</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">6. Gestione delle Preferenze Cookie</h5>
          <p className="mb-2 text-sm">
            L'utente può gestire le proprie preferenze sui cookie in qualsiasi momento:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
            <li>Attraverso il banner cookie presente alla prima visita del sito</li>
            <li>Dalle impostazioni del proprio browser web</li>
            <li>Contattando il Titolare all'indirizzo privacy@taxflow.it</li>
          </ul>

          <h6 className="font-semibold text-sm mb-2 mt-4">Impostazioni Browser</h6>
          <p className="mb-2 text-xs">
            Guide per la gestione dei cookie nei principali browser:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-1 text-xs">
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/it/kb/Gestione%20dei%20cookie" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/it-it/HT201265" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Safari</a></li>
            <li><a href="https://support.microsoft.com/it-it/microsoft-edge" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Microsoft Edge</a></li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">7. Diritti dell'Utente</h5>
          <p className="mb-2 text-sm">
            Ai sensi degli artt. 15-22 del GDPR, l'utente ha diritto di:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
            <li>Accedere ai propri dati personali</li>
            <li>Rettificare dati inesatti</li>
            <li>Cancellare i dati ("diritto all'oblio")</li>
            <li>Limitare il trattamento</li>
            <li>Portabilità dei dati</li>
            <li>Opporsi al trattamento</li>
            <li>Revocare il consenso in qualsiasi momento</li>
            <li>Proporre reclamo al Garante per la Protezione dei Dati Personali</li>
          </ul>

          <p className="mb-4 text-sm">
            Per esercitare i propri diritti, l'utente può contattare:<br />
            Email: <strong>privacy@taxflow.it</strong>
          </p>

          <h5 className="font-semibold mb-2 mt-6">8. Reclami</h5>
          <p className="mb-4 text-sm">
            In caso di violazione della normativa sulla protezione dei dati, l'utente ha il diritto di
            proporre reclamo all'autorità di controllo competente:<br /><br />
            <strong>Garante per la Protezione dei Dati Personali</strong><br />
            Piazza Venezia, 11 - 00187 Roma<br />
            Tel: +39 06.696771<br />
            Email: garante@gpdp.it<br />
            PEC: protocollo@pec.gpdp.it<br />
            Web: <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.garanteprivacy.it</a>
          </p>

          <h5 className="font-semibold mb-2 mt-6">9. Riferimenti Normativi</h5>
          <ul className="list-disc pl-5 mb-4 space-y-1 text-xs">
            <li>Regolamento UE 2016/679 (GDPR)</li>
            <li>D.Lgs. 196/2003 (Codice Privacy italiano) come modificato dal D.Lgs. 101/2018</li>
            <li>Direttiva 2002/58/CE (ePrivacy)</li>
            <li>Provvedimento del Garante Privacy del 10 giugno 2021, n. 231</li>
            <li>Linee guida cookie e altri strumenti di tracciamento - 4 giugno 2021</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">10. Modifiche alla Cookie Policy</h5>
          <p className="mb-4 text-sm">
            Il Titolare si riserva il diritto di modificare o aggiornare la presente Cookie Policy in qualsiasi momento.
            Le modifiche saranno pubblicate su questa pagina con indicazione della data di ultimo aggiornamento.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg mt-6">
            <p className="text-sm font-semibold mb-1">Ultimo aggiornamento: 13 Ottobre 2025</p>
            <p className="text-xs text-gray-600">Versione 1.0</p>
          </div>
        </div>
      </Modal>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Torna su"
      >
        <ChevronUp className="w-6 h-6" />
      </button>
    </div>
  )
}