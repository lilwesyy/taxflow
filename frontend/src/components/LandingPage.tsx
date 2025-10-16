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
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Users,
  Zap,
  Target,
  CheckCircle,
  Award,
  Globe,
  PieChart,
  LineChart,
  DollarSign,
  Laptop,
  BookOpen,
  Star,
  User,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useEffect, useRef, useState, useCallback } from 'react'
import Logo from './common/Logo'
import { useCookieConsent } from '../hooks/useCookieConsent'

interface LandingPageProps {
  onShowLogin: () => void
  onShowRegister: () => void
  showCookieModal?: boolean
  setShowCookieModal?: (show: boolean) => void
}

export default function LandingPage({ onShowLogin, onShowRegister, showCookieModal = false, setShowCookieModal }: LandingPageProps) {
  const { showBanner } = useCookieConsent()
  const [visibleSections, setVisibleSections] = useState(new Set<string>())
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // States for closing animations
  const [isClosingPrivacy, setIsClosingPrivacy] = useState(false)
  const [isClosingTerms, setIsClosingTerms] = useState(false)
  const [isClosingCookie, setIsClosingCookie] = useState(false)

  // Carousel states
  const [currentBanner, setCurrentBanner] = useState(0)
  const [currentService, setCurrentService] = useState(0)

  // Scroll to top button state
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Navbar visibility state
  const [showNavbar, setShowNavbar] = useState(true)
  const lastScrollY = useRef(0)

  const sectionRefs = useRef<Record<string, Element | null>>({})

  // Banner data for carousel
  const banners = [
    {
      badge: { text: "Valutazione Inquadramento Fiscale", icon: FileCheck },
      title: "Partita IVA Forfettaria",
      subtitle: "il tuo | fisco con un click",
      description: "Gestione fiscale avanzata della tua partita IVA forfettaria. Attraverso la tua dashboard controlli la tua fiscalità, monitori ed ottimizzi le tue relazioni bancarie.",
      features: ["Valutazione inquadramento fiscale", "Gestione e controllo fiscalità", "Ottimizzazione relazioni bancarie"],
      image: "https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg?auto=compress&cs=tinysrgb&w=800",
      floatingCards: {
        top: { icon: FileCheck, title: "Fiscalità", subtitle: "Sotto controllo", color: "green" },
        bottom: { icon: BarChart3, title: "Relazioni", subtitle: "Bancarie ottimizzate", color: "blue" }
      }
    },
    {
      badge: { text: "Metodologia Banca D'Italia", icon: Shield },
      title: "Business Plan Predittivo",
      subtitle: "strategie aziendali proattive",
      description: "Sistema di allerta precoce conforme al D.Lgs. 14/2019 per identificare tempestivamente i segnali di crisi e garantire la continuità aziendale.",
      features: ["Strategico", "Innovativo", "Dinamico"],
      image: "https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=800",
      floatingCards: {
        top: { icon: Clock, title: "Alert 24/7", subtitle: "Monitoraggio", color: "orange" },
        bottom: { icon: FileCheck, title: "D.Lgs. 14/2019", subtitle: "Compliant", color: "purple" }
      }
    },
    {
      badge: { text: "Pianificazione Strategica", icon: Target },
      title: "Analisi SWOT",
      subtitle: "per decisioni vincenti",
      description: "Matrice strategica per valutare punti di forza, debolezze, opportunità e minacce del tuo business. Minimizza i rischi e definisci la tua strategia di crescita sul lungo periodo.",
      features: ["Analisi interna/esterna", "Riduzione rischi", "Obiettivi chiari"],
      image: "https://images.pexels.com/photos/3760069/pexels-photo-3760069.jpeg?auto=compress&cs=tinysrgb&w=800",
      floatingCards: {
        top: { icon: Target, title: "Strategia", subtitle: "Obiettivi chiari", color: "purple" },
        bottom: { icon: Shield, title: "Risk Control", subtitle: "Minimizzato", color: "green" }
      }
    }
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.id]))
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '-50px 0px'
      }
    )

    Object.values(sectionRefs.current).forEach(ref => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  // Carousel auto-rotation - only when cookies are accepted and modals are closed
  useEffect(() => {
    // Don't auto-rotate if cookie banner is visible or any modal is open
    if (showBanner || showCookieModal || showPrivacyModal || showTermsModal) return

    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 10000) // Change every 10 seconds

    return () => clearInterval(interval)
  }, [showBanner, showCookieModal, showPrivacyModal, showTermsModal])

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
      learnMoreText: "Guida Agenzia Entrate P.IVA forfettaria"
    },
    {
      icon: TrendingUp,
      title: "Business Plan Predittivo VisionFlow",
      description: "Sistema di pianificazione strategica con analisi predittiva conforme al D.Lgs. 14/2019 per anticipare le dinamiche di mercato e garantire la crescita sostenibile.",
      price: "da €998",
      features: ["Executive Summary + Obiettivo", "Analisi di mercato", "Time Series Forecasting", "Simulazione budget + Alert"],
      learnMoreUrl: "https://www.gazzettaufficiale.it/eli/id/2019/02/14/19G00007/sg",
      learnMoreText: "Leggi il D.Lgs. 14/2019 - Codice della Crisi"
    },
    {
      icon: Target,
      title: "Analisi SWOT Evolutio",
      description: "Matrice strategica avanzata per valutare punti di forza, debolezze, opportunità e minacce. Minimizza i rischi e definisci strategie vincenti sul lungo periodo.",
      price: "da €998",
      features: ["Matrice 4 quadranti dinamica", "Analisi Strengths/Weaknesses", "Opportunità e Minacce", "Sintesi strategica + Azioni"],
      learnMoreUrl: "https://www.bancaditalia.it/compiti/polmon-garanzie/gestione-garanzie/qualita-crediti/index.html",
      learnMoreText: "Sistema ICAS Banca d'Italia"
    },
    {
      icon: Brain,
      title: "Consulenza Proattiva e Strategica",
      description: "Supporto continuo con metodologia proattiva per anticipare sfide fiscali, ottimizzare la gestione aziendale e migliorare le performance.",
      price: "€170/ora",
      features: ["Monitoraggio continuo", "Ottimizzazione fiscale", "Supporto strategico", "Consulenza dedicata"],
      learnMoreUrl: "https://www.bancaditalia.it/compiti/polmon-garanzie/gestione-garanzie/",
      learnMoreText: "Sistema gestione garanzie Banca d'Italia"
    },
    {
      icon: Banknote,
      title: "Assistenza Accesso al Credito Bancario",
      description: "Supporto completo per l'accesso al credito bancario con garanzia MCC L.662/96 e calcolo scoring creditizio secondo metodologia Banca d'Italia.",
      price: "da €998",
      features: ["Consulenza finanziamento ottimale", "Business plan con scoring", "Garanzia MCC L.662/96", "Conformità Banca d'Italia"],
      learnMoreUrl: "https://www.fondidigaranzia.it/",
      learnMoreText: "Info Fondo di Garanzia PMI"
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
      {/* Header */}
      <header className={`bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md bg-white/90 transition-transform duration-300 ${
        showNavbar ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Logo className="h-10 sm:h-12" />
            </div>

            <nav className="hidden md:flex space-x-4 lg:space-x-8">
              <button
                onClick={() => scrollToSection('servizi')}
                className="text-sm lg:text-base text-gray-600 hover:text-blue-600 transition-colors font-medium relative group"
              >
                Servizi
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button
                onClick={() => scrollToSection('benefici')}
                className="text-sm lg:text-base text-gray-600 hover:text-blue-600 transition-colors font-medium relative group"
              >
                Vantaggi
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button
                onClick={() => scrollToSection('come-funziona')}
                className="text-sm lg:text-base text-gray-600 hover:text-blue-600 transition-colors font-medium relative group"
              >
                Come Funziona
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button
                onClick={() => scrollToSection('footer')}
                className="text-sm lg:text-base text-gray-600 hover:text-blue-600 transition-colors font-medium relative group"
              >
                Contatti
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
            </nav>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              <button
                onClick={onShowLogin}
                className="text-sm lg:text-base text-gray-600 hover:text-blue-600 font-medium transition-colors px-2 lg:px-0"
              >
                Accedi
              </button>
              <button
                onClick={onShowRegister}
                className="text-sm lg:text-base bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium hover:shadow-lg"
              >
                Registrati
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-2 space-y-1">
              <button
                onClick={() => scrollToSection('servizi')}
                className="block w-full text-left px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                Servizi
              </button>
              <button
                onClick={() => scrollToSection('benefici')}
                className="block w-full text-left px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                Vantaggi
              </button>
              <button
                onClick={() => scrollToSection('come-funziona')}
                className="block w-full text-left px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                Come Funziona
              </button>
              <button
                onClick={() => scrollToSection('footer')}
                className="block w-full text-left px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                Contatti
              </button>
              <div className="border-t border-gray-100 pt-2 mt-2">
                <button
                  onClick={onShowLogin}
                  className="block w-full text-left px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  Accedi
                </button>
                <button
                  onClick={onShowRegister}
                  className="block w-full text-left px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 mt-1"
                >
                  Registrati
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gray-50"></div>

        {/* Geometric Background Elements */}
        <div className="absolute inset-0">
          <svg className="absolute top-0 right-0 w-96 h-96 text-blue-50" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="75" cy="25" r="25" opacity="0.6"/>
          </svg>
          <svg className="absolute bottom-0 left-0 w-80 h-80 text-indigo-50" viewBox="0 0 100 100" fill="currentColor">
            <polygon points="0,100 50,0 100,100" opacity="0.4"/>
          </svg>
          <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-32 w-3 h-3 bg-indigo-400 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-40 left-1/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-700"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 xl:py-32">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Dynamic Content Carousel */}
            <div className="text-center lg:text-left relative">
              <div className="relative min-h-[400px] sm:min-h-[450px] lg:min-h-[500px] flex flex-col">
                {banners.map((banner, index) => {
                  const BadgeIcon = banner.badge.icon
                  return (
                    <div
                      key={index}
                      className={`absolute inset-0 flex flex-col justify-between transition-all duration-1000 ${
                        index === currentBanner
                          ? 'opacity-100 transform translate-x-0 z-10'
                          : 'opacity-0 transform translate-x-4 z-0 pointer-events-none'
                      }`}
                    >
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="inline-flex items-center bg-blue-50 text-blue-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 w-fit mx-auto lg:mx-0">
                          <BadgeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                          <span className="whitespace-nowrap">{banner.badge.text}</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                          {banner.title}
                          <br />
                          {banner.subtitle.includes('|') ? (
                            <>
                              <span className="text-blue-600">{banner.subtitle.split('|')[0].trim()}</span>
                              <br />
                              <span className="text-gray-600 text-xl sm:text-2xl lg:text-3xl xl:text-4xl">
                                {banner.subtitle.split('|')[1].trim()}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-blue-600">{banner.subtitle.split(' ')[0]}</span>
                              <br />
                              <span className="text-gray-600 text-xl sm:text-2xl lg:text-3xl xl:text-4xl">
                                {banner.subtitle.split(' ').slice(1).join(' ')}
                              </span>
                            </>
                          )}
                        </h1>

                        <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                          {banner.description}
                        </p>

                        {/* Key Points */}
                        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start mb-6 sm:mb-8">
                          {banner.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-sm border border-gray-100">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-1 sm:mr-2" />
                              <span className="text-xs sm:text-sm font-medium text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mt-2">
                <button
                  onClick={onShowRegister}
                  className="group bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center"
                >
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Inizia Valutazione Gratuita</span>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                <button
                  onClick={() => scrollToSection('servizi')}
                  className="group border-2 border-gray-300 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-300 hover:shadow-md hover:scale-105 flex items-center justify-center"
                >
                  <span className="group-hover:-translate-x-1 transition-transform duration-300">Vedi tutti i servizi</span>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>

              {/* Carousel Navigation - Below CTA */}
              <div className="flex justify-center lg:justify-start items-center mt-6 sm:mt-8 space-x-3 sm:space-x-4">
                <button
                  onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
                  className="p-2 sm:p-2.5 rounded-full bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                  type="button"
                  aria-label="Banner precedente"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                </button>

                <div className="flex space-x-2 sm:space-x-3">
                  {banners.map((_, dotIndex) => (
                    <button
                      key={dotIndex}
                      onClick={() => setCurrentBanner(dotIndex)}
                      className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                        dotIndex === currentBanner
                          ? 'bg-blue-600 scale-110 shadow-md'
                          : 'bg-gray-300 hover:bg-gray-400 hover:scale-105'
                      }`}
                      type="button"
                      aria-label={`Vai al banner ${dotIndex + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
                  className="p-2 sm:p-2.5 rounded-full bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                  type="button"
                  aria-label="Banner successivo"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                </button>
              </div>

              {/* Social Proof */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center group cursor-default">
                    <div className="flex -space-x-2 mr-2 sm:mr-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animation-delay-100">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      </div>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-100 border-2 border-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animation-delay-200">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                      </div>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animation-delay-300">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                      </div>
                    </div>
                    <span className="group-hover:text-gray-900 transition-colors duration-300"><strong>+250</strong> imprenditori</span>
                  </div>
                  <div className="flex items-center group cursor-default">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-1.5 sm:mr-2 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="group-hover:text-gray-900 transition-colors duration-300"><strong>+15%</strong> rating medio</span>
                  </div>
                  <div className="flex items-center group cursor-default">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-1.5 sm:mr-2 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="group-hover:text-gray-900 transition-colors duration-300"><strong>100%</strong> conformità normativa</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Professional Images */}
            <div className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Dynamic images from Pexels based on current banner */}
                {banners.map((banner, index) => (
                  <div
                    key={index}
                    className={`aspect-[4/3] transition-all duration-1000 ${
                      index === currentBanner
                        ? 'opacity-100'
                        : 'opacity-0 absolute inset-0'
                    }`}
                  >
                    <img
                      src={banner.image}
                      alt={`${banner.title} - Professional business environment`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>

              {/* Dynamic Floating Stats Cards - Outside the image container */}
              {banners.map((banner, index) => {
                const TopIcon = banner.floatingCards.top.icon
                const BottomIcon = banner.floatingCards.bottom.icon
                const topColorClass = banner.floatingCards.top.color === 'green' ? 'text-green-500' :
                                    banner.floatingCards.top.color === 'blue' ? 'text-blue-500' :
                                    banner.floatingCards.top.color === 'orange' ? 'text-orange-500' : 'text-purple-500'
                const bottomColorClass = banner.floatingCards.bottom.color === 'green' ? 'text-green-500' :
                                       banner.floatingCards.bottom.color === 'blue' ? 'text-blue-500' :
                                       banner.floatingCards.bottom.color === 'orange' ? 'text-orange-500' : 'text-purple-500'

                return (
                  <div key={index} className={`transition-all duration-1000 ${
                    index === currentBanner ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}>
                    <div className="absolute top-2 right-2 sm:-top-6 sm:-right-12 bg-white rounded-lg shadow-lg p-2 sm:p-4 border border-gray-100 z-10">
                      <div className="flex items-center">
                        <TopIcon className={`h-4 w-4 sm:h-6 sm:w-6 ${topColorClass} mr-1 sm:mr-2`} />
                        <div>
                          <div className="text-xs sm:text-sm font-semibold text-gray-900">{banner.floatingCards.top.title}</div>
                          <div className="text-[10px] sm:text-xs text-gray-500">{banner.floatingCards.top.subtitle}</div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-2 left-2 sm:-bottom-6 sm:-left-12 bg-white rounded-lg shadow-lg p-2 sm:p-4 border border-gray-100 z-10">
                      <div className="flex items-center">
                        <BottomIcon className={`h-4 w-4 sm:h-6 sm:w-6 ${bottomColorClass} mr-1 sm:mr-2`} />
                        <div>
                          <div className="text-xs sm:text-sm font-semibold text-gray-900">{banner.floatingCards.bottom.title}</div>
                          <div className="text-[10px] sm:text-xs text-gray-500">{banner.floatingCards.bottom.subtitle}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </section>

      {/* Trust & Credibility Section */}
      <section className="py-8 sm:py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Trusted by professionals, certified by institutions</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-center opacity-60">
            {/* Loghi partner simulati */}
            <div className="flex items-center justify-center h-14 sm:h-16 bg-white rounded-lg shadow-sm border border-gray-100 px-2">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Building className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                <span className="font-semibold text-gray-700 text-xs sm:text-base">Banca d'Italia</span>
              </div>
            </div>

            <div className="flex items-center justify-center h-14 sm:h-16 bg-white rounded-lg shadow-sm border border-gray-100 px-2">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Shield className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                <span className="font-semibold text-gray-700 text-xs sm:text-base">Basel IV</span>
              </div>
            </div>

            <div className="flex items-center justify-center h-14 sm:h-16 bg-white rounded-lg shadow-sm border border-gray-100 px-2">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <FileCheck className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
                <span className="font-semibold text-gray-700 text-xs sm:text-base">GDPR</span>
              </div>
            </div>

            <div className="flex items-center justify-center h-14 sm:h-16 bg-white rounded-lg shadow-sm border border-gray-100 px-2">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Award className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600" />
                <span className="font-semibold text-gray-700 text-xs sm:text-base">ISO 27001</span>
              </div>
            </div>
          </div>

          {/* Testimonial veloce */}
          <div className="mt-8 sm:mt-12 text-center">
            <div className="max-w-3xl mx-auto">
              <blockquote className="text-base sm:text-lg text-gray-600 italic mb-4">
                "Grazie a TaxFlow il mio rating creditizio è migliorato del 18% in soli 6 mesi.
                Ora ottengo finanziamenti a condizioni molto più vantaggiose."
              </blockquote>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">Marco Bianchi</p>
                  <p className="text-xs sm:text-sm text-gray-600">CEO, Innovazione SRL</p>
                </div>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="servizi"
        ref={setSectionRef('servizi')}
        className="py-12 sm:py-16 lg:py-20 bg-white overflow-hidden"
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 ${visibleSections.has('servizi') ? 'animate-fade-in-up' : 'opacity-0'}`}>
              I nostri servizi
            </h2>
            <p className={`text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4 ${visibleSections.has('servizi') ? 'animate-fade-in-up' : 'opacity-0'}`} style={visibleSections.has('servizi') ? {animationDelay: '0.2s'} : {}}>
              Tutto quello che ti serve per gestire la tua partita IVA con standard bancari professionali
            </p>
          </div>

          {/* Infinite Carousel Container */}
          <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
            {/* Navigation Buttons */}
            <button
              onClick={() => setCurrentService((prev) => prev - 1)}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border border-gray-200"
              aria-label="Scorri a sinistra"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
            </button>

            <button
              onClick={() => setCurrentService((prev) => prev + 1)}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border border-gray-200"
              aria-label="Scorri a destra"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
            </button>

            {/* Infinite Scrolling Services */}
            <div className="overflow-visible px-4 sm:px-6 lg:px-8 py-4">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(calc(-${(currentService % services.length) * (100 / 3)}% - ${currentService * 1.5}rem))` }}
              >
                {/* Render services 3 times for infinite effect */}
                {[...services, ...services, ...services].map((service, index) => {
                  const Icon = service.icon
                  const actualIndex = index % services.length
                  const isPopular = actualIndex === 1 // Second service is most popular
                  return (
                    <div
                      key={index}
                      className="w-full md:w-1/3 flex-shrink-0 px-2 md:px-3"
                    >
                      <div
                        className={`group bg-white border-2 ${isPopular ? 'border-primary-300 ring-2 ring-primary-100' : 'border-gray-100'} rounded-2xl p-4 sm:p-6 hover:border-primary-200 hover:shadow-xl transition-all duration-300 relative h-full flex flex-col`}
                      >
                        {/* Popular Badge */}
                        {isPopular && (
                          <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
                            <div className="bg-gradient-to-r from-primary-600 to-green-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold shadow-lg">
                              <Star className="h-2 w-2 sm:h-3 sm:w-3 inline mr-0.5 sm:mr-1" />
                              Più Popolare
                            </div>
                          </div>
                        )}

                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className={`${isPopular ? 'bg-primary-100' : 'bg-primary-50'} w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors`}>
                              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                            </div>
                            <div className="text-right">
                              {service.originalPrice && (
                                <div className="text-xs sm:text-sm text-gray-400 line-through">{service.originalPrice}</div>
                              )}
                              <div className={`text-lg sm:text-xl font-bold ${isPopular ? 'text-primary-700' : 'text-primary-600'}`}>{service.price}</div>
                              {service.discount && (
                                <div className="text-[10px] sm:text-xs text-red-600 font-medium">{service.discount}</div>
                              )}
                              {isPopular && !service.discount && (
                                <div className="text-[10px] sm:text-xs text-green-600 font-medium">Best Value</div>
                              )}
                            </div>
                          </div>

                          <h3 className={`text-base sm:text-lg font-bold ${isPopular ? 'text-primary-900' : 'text-gray-900'} mb-2 sm:mb-3`}>{service.title}</h3>
                          <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-xs sm:text-sm">{service.description}</p>

                          {service.title === "P.IVA Forfettari" && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-blue-800 font-medium text-xs">
                                Se ti abboni oggi pagherai il secondo anno al 31/12/2026
                              </p>
                            </div>
                          )}

                          <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                            {service.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center text-gray-700">
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1.5 sm:mr-2 flex-shrink-0" />
                                <span className="text-xs sm:text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>

                          {/* Payment Options */}
                          {service.paymentOptions && (
                            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <div className="space-y-1">
                                {service.paymentOptions.map((option, idx) => (
                                  <p key={idx} className="text-amber-900 text-xs font-medium">
                                    {option}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Guarantee Badge */}
                        {service.title === "P.IVA Forfettari" && (
                          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center">
                              <Shield className="h-4 w-4 text-green-600 mr-2" />
                              <span className="text-green-800 font-medium text-xs">
                                14gg soddisfatto o rimborsato (solo se apertura avviene dopo 14gg)
                              </span>
                            </div>
                          </div>
                        )}

                        <a
                          href={service.learnMoreUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm group-hover:underline"
                          title={service.learnMoreText}
                        >
                          Scopri di più
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-center mt-6 space-x-2">
              {services.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentService(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    (currentService % services.length) === index
                      ? 'w-8 bg-primary-600'
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Vai al servizio ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Chi Siamo Section */}
      <section
        id="chi-siamo"
        ref={setSectionRef('chi-siamo')}
        className="py-12 sm:py-16 lg:py-20 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className={`${visibleSections.has('chi-siamo') ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Chi Siamo
              </h2>

              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 sm:p-6 mb-4 sm:mb-6 rounded-r-lg">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Una Visionaria Dietro TaxFlow</h3>
                <p className="text-sm sm:text-base text-gray-700 mb-2 sm:mb-3">
                  <strong>Teresa Marrari</strong>, commercialista con studio a Torino da oltre 25 anni, è la
                  fondatrice della piattaforma innovativa. Dal 1998 gestisce il proprio studio professionale, distinguendosi
                  come figura poliedrica nella consulenza fiscale, tributaria e societaria e del lavoro oltre alla formazione
                  individuale dell'imprenditore.
                </p>
                <p className="text-sm sm:text-base text-gray-700">
                  Con TaxFlow, Teresa ha voluto creare uno strumento innovativo per supportare i giovani imprenditori,
                  rendendo più semplice la gestione fiscale e fornendo loro le basi per costruire attività solide e di successo.
                  La sua passione e competenza hanno trasformato TaxFlow in una realtà al servizio di chi desidera avviare e
                  gestire la propria impresa con sicurezza ed efficienza.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-6 sm:mt-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary-600 mb-1 sm:mb-2">25+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Anni Esperienza</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary-600 mb-1 sm:mb-2">250+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Imprenditori</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary-600 mb-1 sm:mb-2">100%</div>
                  <div className="text-xs sm:text-sm text-gray-600">Conformità</div>
                </div>
              </div>
            </div>

            {/* Right Image/Features */}
            <div className={`${visibleSections.has('chi-siamo') ? 'animate-fade-in-up' : 'opacity-0'}`} style={visibleSections.has('chi-siamo') ? {animationDelay: '0.2s'} : {}}>
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">I Nostri Valori</h3>

                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="bg-primary-100 rounded-lg p-2 sm:p-3 flex-shrink-0">
                      <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Conformità Normativa</h4>
                      <p className="text-gray-600 text-xs sm:text-sm">Piena aderenza a D.Lgs. 14/2019 e standard Banca d'Italia</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="bg-green-100 rounded-lg p-2 sm:p-3 flex-shrink-0">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Orientamento al Cliente</h4>
                      <p className="text-gray-600 text-xs sm:text-sm">Supporto personalizzato e consulenza dedicata</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="bg-blue-100 rounded-lg p-2 sm:p-3 flex-shrink-0">
                      <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Innovazione Tecnologica</h4>
                      <p className="text-gray-600 text-xs sm:text-sm">AI e analytics avanzati per previsioni accurate</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="bg-purple-100 rounded-lg p-2 sm:p-3 flex-shrink-0">
                      <Award className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Eccellenza Professionale</h4>
                      <p className="text-gray-600 text-xs sm:text-sm">Metodologie bancarie certificate e team qualificato</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefici"
        ref={setSectionRef('benefici')}
        className="py-12 sm:py-16 lg:py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 ${visibleSections.has('benefici') ? 'animate-fade-in-up' : 'opacity-0'}`}>
              Perché scegliere TaxFlow
            </h2>
            <p className={`text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-4 ${visibleSections.has('benefici') ? 'animate-fade-in-up' : 'opacity-0'}`} style={visibleSections.has('benefici') ? {animationDelay: '0.2s'} : {}}>
              Dashboard intuitiva per il controllo completo della tua fiscalità in tempo reale
            </p>

            {/* Key highlights */}
            <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto mb-8 sm:mb-12 ${visibleSections.has('benefici') ? 'animate-fade-in-up' : 'opacity-0'}`} style={visibleSections.has('benefici') ? {animationDelay: '0.3s'} : {}}>
              <div className="bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-100">
                <Laptop className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2 sm:mb-3" />
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">Dashboard Avanzata</h3>
                <p className="text-xs sm:text-sm text-gray-600">Cassetto fiscale e previdenziale con visione quotidiana del tuo andamento</p>
              </div>

              <div className="bg-green-50 rounded-xl p-4 sm:p-6 border border-green-100">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2 sm:mb-3" />
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">Formazione Continua</h3>
                <p className="text-xs sm:text-sm text-gray-600">Tutorial, video e guide pratiche per la tua crescita professionale</p>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 sm:p-6 border border-purple-100 sm:col-span-2 lg:col-span-1">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-2 sm:mb-3" />
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">Esperienza Bancaria</h3>
                <p className="text-xs sm:text-sm text-gray-600">25 anni di esperienza creditizia per ottimizzare il tuo rating</p>
              </div>
            </div>
          </div>

          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-8">Metodologie Applicate ai Nostri Servizi</h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div
                  key={index}
                  className={`text-center group ${visibleSections.has('benefici') ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={visibleSections.has('benefici') ? {animationDelay: `${0.4 + index * 0.15}s`} : {}}
                >
                  <div className="bg-white w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:shadow-xl transition-shadow border border-gray-100">
                    <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{benefit.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">{benefit.description}</p>
                  <a
                    href={benefit.learnMoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
                    title={benefit.learnMoreText}
                  >
                    Scopri di più
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section
        id="come-funziona"
        ref={setSectionRef('come-funziona')}
        className="py-12 sm:py-16 lg:py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 ${visibleSections.has('come-funziona') ? 'animate-fade-in-up' : 'opacity-0'}`}>
              Come funziona
            </h2>
            <p className={`text-base sm:text-lg lg:text-xl text-gray-600 ${visibleSections.has('come-funziona') ? 'animate-fade-in-up' : 'opacity-0'}`} style={visibleSections.has('come-funziona') ? {animationDelay: '0.2s'} : {}}>
              Semplice, veloce, professionale
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 bg-gray-200"></div>

            {process.map((step, index) => {
              const Icon = step.icon
              return (
                <div
                  key={index}
                  className={`text-center relative ${visibleSections.has('come-funziona') ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={visibleSections.has('come-funziona') ? {animationDelay: `${0.4 + index * 0.2}s`} : {}}
                >
                  <div className="bg-blue-600 text-white w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg relative">
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                    <div className="absolute -top-2 -right-2 bg-white text-blue-600 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{step.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Regulatory Info Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Normative di Riferimento
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              I nostri servizi si basano sulle più recenti normative bancarie e fiscali italiane ed europee
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 sm:mb-2">D.Lgs. 14/2019</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Codice della Crisi d'Impresa e dell'Insolvenza</p>
              <a
                href="https://www.gazzettaufficiale.it/eli/id/2019/02/14/19G00007/sg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm flex items-center font-medium hover:underline"
              >
                Leggi la normativa
                <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3 ml-1" />
              </a>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-gray-900 mb-2">Basel IV</h3>
              <p className="text-sm text-gray-600 mb-4">Accordi internazionali sulla regolamentazione bancaria</p>
              <a
                href="https://www.bis.org/basel_framework/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center font-medium hover:underline"
              >
                Framework BIS
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-gray-900 mb-2">Sistema ICAS</h3>
              <p className="text-sm text-gray-600 mb-4">In-house Credit Assessment System di Banca d'Italia</p>
              <a
                href="https://www.bancaditalia.it/compiti/polmon-garanzie/gestione-garanzie/qualita-crediti/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center font-medium hover:underline"
              >
                Scopri ICAS
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-gray-900 mb-2">Centrale Rischi</h3>
              <p className="text-sm text-gray-600 mb-4">Sistema informativo sui rapporti di credito</p>
              <a
                href="https://www.bancaditalia.it/statistiche/raccolta-dati/segnalazioni/centrale-rischi/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center font-medium hover:underline"
              >
                Info Centrale Rischi
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>

          <div className="mt-12 text-center bg-blue-50 rounded-2xl p-8 border border-blue-100">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-blue-900 mb-2">Trasparenza e Conformità</h3>
            <p className="text-blue-800">
              Tutti i nostri servizi sono progettati per essere pienamente conformi alle normative vigenti.
              I link sopra riportati conducono alle fonti ufficiali delle normative che applichiamo.
            </p>
          </div>
        </div>
      </section>

      {/* Professional Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Tecnologia al servizio <br />
                <span className="text-blue-600">del tuo business</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Dashboard avanzata, AI predittiva e reporting automatico per tenere sempre sotto controllo la tua situazione fiscale e creditizia.
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-blue-50 p-3 rounded-lg mr-4">
                    <Laptop className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Dashboard Web</h3>
                    <p className="text-gray-600">Interfaccia completa per analisi approfondite e reportistica</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-50 p-3 rounded-lg mr-4">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Formazione Continua</h3>
                    <p className="text-gray-600">Corsi e webinar per rimanere sempre aggiornato</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Tech/Dashboard Image Placeholder */}
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <PieChart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="h-2 w-16 bg-blue-200 rounded mx-auto"></div>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <LineChart className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="h-2 w-16 bg-green-200 rounded mx-auto"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-40 bg-gray-200 rounded mx-auto"></div>
                      <div className="h-3 w-32 bg-gray-200 rounded mx-auto"></div>
                      <div className="h-3 w-36 bg-gray-200 rounded mx-auto"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <Globe className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="cta"
        ref={setSectionRef('cta')}
        className="py-12 sm:py-16 lg:py-20 bg-blue-600"
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 ${visibleSections.has('cta') ? 'animate-fade-in-up' : 'opacity-0'}`}>
            Migliora il tuo rating creditizio oggi
          </h2>
          <p className={`text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 ${visibleSections.has('cta') ? 'animate-fade-in-up' : 'opacity-0'}`} style={visibleSections.has('cta') ? {animationDelay: '0.2s'} : {}}>
            Ottimizza le tue relazioni bancarie con la metodologia Banca d'Italia
          </p>
          <button
            onClick={onShowRegister}
            className={`bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-gray-50 transition-all duration-200 hover:shadow-lg w-full sm:w-auto ${visibleSections.has('cta') ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={visibleSections.has('cta') ? {animationDelay: '0.4s'} : {}}
          >
            Inizia ora
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Domande Frequenti
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Risposte alle domande più comuni sulla gestione fiscale e il rating creditizio
            </p>
          </div>

          <div className="space-y-6">
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
              <div key={index} className="group bg-gray-50 rounded-xl p-4 sm:p-6 hover:bg-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-blue-200">
                <details className="group/details">
                  <summary className="flex justify-between items-center cursor-pointer list-none select-none">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 pr-3 sm:pr-4 group-hover:text-blue-700 transition-colors duration-300">{faq.question}</h3>
                    <div className="text-blue-600 group-open/details:rotate-180 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-700 flex-shrink-0">
                      <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  </summary>
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 animate-fade-in-up">
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>

          {/* CTA finale */}
          <div className="text-center mt-8 sm:mt-12 p-6 sm:p-8 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors duration-300">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Altre domande?</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Il nostro team di esperti è pronto ad aiutarti</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={() => scrollToSection('footer')}
                className="group bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center hover:scale-105 hover:shadow-lg"
              >
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 group-hover:rotate-12 transition-transform duration-300" />
                <span>Contattaci</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button
                onClick={onShowRegister}
                className="group border-2 border-blue-600 text-blue-600 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center"
              >
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 group-hover:rotate-12 transition-transform duration-300" />
                <span>Inizia ora</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Servizi Extra Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Servizi Extra
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Servizi aggiuntivi disponibili per completare la gestione della tua attività
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
              <div className="divide-y divide-gray-200">
                {[
                  {
                    service: "Variazione da comunicare agli enti, compresa la SCIAA (artigiani e commercianti)",
                    note: "Non sono comprese le spese vive",
                    price: "150 €"
                  },
                  {
                    service: "Domanda riduzione contributi INPS",
                    price: "35 €"
                  },
                  {
                    service: "Variazione da comunicare agli enti",
                    note: "Non sono comprese le spese vive",
                    price: "100 €"
                  },
                  {
                    service: "Risoluzione comunicazione dinanzi alla Agenzia delle Entrate",
                    price: "75 €"
                  },
                  {
                    service: "Dichiarazione dei redditi anno precedente",
                    price: "200 €"
                  },
                  {
                    service: "Ravvedimento e DURC",
                    price: "20 €"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 pr-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.service}</h3>
                      {item.note && (
                        <p className="text-sm text-gray-600 italic">{item.note}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-bold text-blue-600">{item.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 italic">
                * Prezzi IVA esclusa
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-12">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="mb-4 sm:mb-6">
                <Logo className="h-10 sm:h-12" inverted={true} />
              </div>
              <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                La partita IVA forfettaria con metodologia Banca d'Italia per ottimizzare il tuo rating creditizio.
              </p>

              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center text-xs sm:text-sm text-gray-400">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 mr-1.5 sm:mr-2" />
                  <span>D.Lgs. 14/2019 Compliant</span>
                </div>
                <div className="flex items-center text-xs sm:text-sm text-gray-400">
                  <FileCheck className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 mr-1.5 sm:mr-2" />
                  <span>Basel IV Framework</span>
                </div>
                <div className="flex items-center text-xs sm:text-sm text-gray-400">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 mr-1.5 sm:mr-2" />
                  <span>Sistema ICAS</span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-white font-bold text-base sm:text-lg mb-4 sm:mb-6">Servizi</h3>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  "Credit Readiness Assessment",
                  "Forward-Looking Analysis",
                  "Banking Relationship Manager",
                  "Regulatory Compliance Hub",
                  "AI Risk Management",
                  "Rating Optimization"
                ].map((service, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-bold text-base sm:text-lg mb-4 sm:mb-6">Supporto</h3>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  "Consulenza Creditizia",
                  "Early Warning System",
                  "Compliance Monitoring",
                  "Banking Relations Support"
                ].map((support, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">
                      {support}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-bold text-base sm:text-lg mb-4 sm:mb-6">Contatti</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center">
                  <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-300">800 123 456</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-300">info@taxflow.it</span>
                </div>
              </div>

              <div className="mt-6 sm:mt-8">
                <button
                  onClick={onShowRegister}
                  className="group bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center w-full sm:w-auto justify-center"
                >
                  <span>Inizia ora</span>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-800 pt-6 sm:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
              <div className="text-gray-400 text-center md:text-left">
                <span className="text-xs sm:text-sm">&copy; 2025 TaxFlow. Tutti i diritti riservati.</span>
                <span className="block text-xs sm:text-sm mt-1">
                  Servizi conformi alle normative bancarie italiane ed europee
                </span>
              </div>

              <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                <button
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => setShowTermsModal(true)}
                  className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm"
                >
                  Termini di Servizio
                </button>
                <button
                  onClick={() => setShowCookieModal?.(true)}
                  className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm"
                >
                  Cookie Policy
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