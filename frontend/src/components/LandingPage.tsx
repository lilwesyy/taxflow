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
  ChevronDown
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Logo from './common/Logo'

interface LandingPageProps {
  onShowLogin: () => void
  onShowRegister: () => void
}

export default function LandingPage({ onShowLogin, onShowRegister }: LandingPageProps) {
  const [visibleSections, setVisibleSections] = useState(new Set<string>())
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showCookieModal, setShowCookieModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // States for closing animations
  const [isClosingPrivacy, setIsClosingPrivacy] = useState(false)
  const [isClosingTerms, setIsClosingTerms] = useState(false)
  const [isClosingCookie, setIsClosingCookie] = useState(false)

  // Carousel states
  const [currentBanner, setCurrentBanner] = useState(0)
  const [currentService, setCurrentService] = useState(0)

  const sectionRefs = useRef<Record<string, Element | null>>({})

  // Banner data for carousel
  const banners = [
    {
      badge: { text: "Valutazione Inquadramento Fiscale", icon: FileCheck },
      title: "Partita IVA Forfettaria",
      subtitle: "il tuo fisco con un click",
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

  // Carousel auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 10000) // Change every 10 seconds

    return () => clearInterval(interval)
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

  // Modal closing functions with animation
  const closePrivacyModal = () => {
    setIsClosingPrivacy(true)
    setTimeout(() => {
      setShowPrivacyModal(false)
      setIsClosingPrivacy(false)
    }, 300)
  }

  const closeTermsModal = () => {
    setIsClosingTerms(true)
    setTimeout(() => {
      setShowTermsModal(false)
      setIsClosingTerms(false)
    }, 300)
  }

  const closeCookieModal = () => {
    setIsClosingCookie(true)
    setTimeout(() => {
      setShowCookieModal(false)
      setIsClosingCookie(false)
    }, 300)
  }

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
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div
            className={`fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50 ${
              isClosing ? 'animate-fade-out' : 'animate-fade-in'
            }`}
            onClick={onClose}
          ></div>
          <div className={`relative w-full max-w-4xl h-full max-h-screen bg-white shadow-2xl rounded-2xl flex flex-col ${
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
            <div className="flex-1 overflow-y-auto p-6">
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
      description: "Apertura e gestione partita IVA forfettaria ottimizzata per massimizzare i vantaggi fiscali e prepararti all'accesso al credito bancario.",
      price: "€199",
      features: ["Setup creditizio", "Regime forfettario", "Rating optimization", "Adempimenti fiscali"],
      learnMoreUrl: "https://www.agenziaentrate.gov.it/portale/web/guest/schede/dichiarazioni/dichiarazione-di-inizio-attivita-iva/infogen-dichiarazione-inizio-attivita",
      learnMoreText: "Guida Agenzia Entrate P.IVA forfettaria"
    },
    {
      icon: TrendingUp,
      title: "Business Plan Predittivo VisionFlow",
      description: "Sistema di pianificazione strategica con analisi predittiva conforme al D.Lgs. 14/2019 per anticipare le dinamiche di mercato e garantire la crescita sostenibile.",
      price: "€299",
      features: ["Analisi predittiva", "Cash flow forecasting", "Scenario planning", "Alert automatici"],
      learnMoreUrl: "https://www.gazzettaufficiale.it/eli/id/2019/02/14/19G00007/sg",
      learnMoreText: "Leggi il D.Lgs. 14/2019 - Codice della Crisi"
    },
    {
      icon: Target,
      title: "Analisi SWOT Evolution",
      description: "Matrice strategica avanzata per valutare punti di forza, debolezze, opportunità e minacce. Minimizza i rischi e definisci strategie vincenti sul lungo periodo.",
      price: "€149",
      features: ["Analisi interna/esterna", "Riduzione rischi", "Obiettivi strategici", "Roadmap evolutiva"],
      learnMoreUrl: "https://www.bancaditalia.it/compiti/polmon-garanzie/gestione-garanzie/qualita-crediti/index.html",
      learnMoreText: "Sistema ICAS Banca d'Italia"
    },
    {
      icon: Brain,
      title: "Consulenza Proattiva e Strategica",
      description: "Supporto continuo con metodologia proattiva per anticipare sfide fiscali, ottimizzare la gestione aziendale e migliorare le performance.",
      price: "€99/mese",
      features: ["Monitoraggio continuo", "Ottimizzazione fiscale", "Supporto strategico", "Consulenza dedicata"],
      learnMoreUrl: "https://www.bancaditalia.it/compiti/polmon-garanzie/gestione-garanzie/",
      learnMoreText: "Sistema gestione garanzie Banca d'Italia"
    },
    {
      icon: Banknote,
      title: "Assistenza Accesso al Credito Bancario",
      description: "Supporto completo per l'accesso al credito bancario con garanzia MCC L.662/96 e calcolo scoring creditizio secondo metodologia Banca d'Italia.",
      price: "€249",
      features: ["Garanzia MCC L.662/96", "Calcolo scoring", "Valutazione ICAS", "Preparazione documenti"],
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
      title: "Basel III Compliant",
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Logo className="h-12" />
            </div>

            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => scrollToSection('servizi')}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium relative group"
              >
                Servizi
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button
                onClick={() => scrollToSection('benefici')}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium relative group"
              >
                Vantaggi
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button
                onClick={() => scrollToSection('come-funziona')}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium relative group"
              >
                Come Funziona
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button
                onClick={() => scrollToSection('footer')}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium relative group"
              >
                Contatti
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
            </nav>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={onShowLogin}
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Accedi
              </button>
              <button
                onClick={onShowRegister}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium hover:shadow-lg"
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Dynamic Content Carousel */}
            <div className="text-center lg:text-left relative">
              <div className="relative h-[500px] flex flex-col">
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
                        <div className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium mb-6 w-fit">
                          <BadgeIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="whitespace-nowrap">{banner.badge.text}</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                          {banner.title}
                          <br />
                          <span className="text-blue-600">{banner.subtitle.split(' ')[0]}</span>
                          <br />
                          <span className="text-gray-600 text-2xl md:text-3xl lg:text-4xl">
                            {banner.subtitle.split(' ').slice(1).join(' ')}
                          </span>
                        </h1>

                        <p className="text-lg text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                          {banner.description}
                        </p>

                        {/* Key Points */}
                        <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-3">
                          {banner.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-100">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                              <span className="text-sm font-medium text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* Carousel navigation - Inside banner content */}
                        {index === currentBanner && (
                          <div className="flex justify-center lg:justify-start items-center mb-3 space-x-4">
                            <button
                              onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
                              className="p-2 rounded-full bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                              type="button"
                            >
                              <ChevronLeft className="h-4 w-4 text-gray-600" />
                            </button>

                            <div className="flex space-x-2">
                              {banners.map((_, dotIndex) => (
                                <button
                                  key={dotIndex}
                                  onClick={() => setCurrentBanner(dotIndex)}
                                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    dotIndex === currentBanner
                                      ? 'bg-blue-600 scale-110 shadow-md'
                                      : 'bg-gray-300 hover:bg-gray-400 hover:scale-105'
                                  }`}
                                  type="button"
                                />
                              ))}
                            </div>

                            <button
                              onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
                              className="p-2 rounded-full bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                              type="button"
                            >
                              <ChevronRight className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-2">
                <button
                  onClick={onShowRegister}
                  className="group bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center"
                >
                  <CheckCircle className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Inizia Valutazione Gratuita</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                <button
                  onClick={() => scrollToSection('servizi')}
                  className="group border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-300 hover:shadow-md hover:scale-105 flex items-center justify-center"
                >
                  <span className="group-hover:-translate-x-1 transition-transform duration-300">Vedi tutti i servizi</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>

              {/* Social Proof */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8 text-sm text-gray-600">
                  <div className="flex items-center group cursor-default">
                    <div className="flex -space-x-2 mr-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animation-delay-100">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animation-delay-200">
                        <User className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animation-delay-300">
                        <User className="h-4 w-4 text-purple-600" />
                      </div>
                    </div>
                    <span className="group-hover:text-gray-900 transition-colors duration-300"><strong>+250</strong> imprenditori</span>
                  </div>
                  <div className="flex items-center group cursor-default">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-2 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="group-hover:text-gray-900 transition-colors duration-300"><strong>+15%</strong> rating medio</span>
                  </div>
                  <div className="flex items-center group cursor-default">
                    <Shield className="h-4 w-4 text-blue-500 mr-2 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300" />
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
                    <div className="absolute -top-6 -right-12 bg-white rounded-lg shadow-lg p-4 border border-gray-100 z-10">
                      <div className="flex items-center">
                        <TopIcon className={`h-6 w-6 ${topColorClass} mr-2`} />
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{banner.floatingCards.top.title}</div>
                          <div className="text-xs text-gray-500">{banner.floatingCards.top.subtitle}</div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute -bottom-6 -left-12 bg-white rounded-lg shadow-lg p-4 border border-gray-100 z-10">
                      <div className="flex items-center">
                        <BottomIcon className={`h-6 w-6 ${bottomColorClass} mr-2`} />
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{banner.floatingCards.bottom.title}</div>
                          <div className="text-xs text-gray-500">{banner.floatingCards.bottom.subtitle}</div>
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
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trusted by professionals, certified by institutions</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            {/* Loghi partner simulati */}
            <div className="flex items-center justify-center h-16 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2">
                <Building className="h-6 w-6 text-blue-600" />
                <span className="font-semibold text-gray-700">Banca d'Italia</span>
              </div>
            </div>

            <div className="flex items-center justify-center h-16 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-green-600" />
                <span className="font-semibold text-gray-700">Basel III</span>
              </div>
            </div>

            <div className="flex items-center justify-center h-16 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2">
                <FileCheck className="h-6 w-6 text-purple-600" />
                <span className="font-semibold text-gray-700">GDPR</span>
              </div>
            </div>

            <div className="flex items-center justify-center h-16 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2">
                <Award className="h-6 w-6 text-orange-600" />
                <span className="font-semibold text-gray-700">ISO 27001</span>
              </div>
            </div>
          </div>

          {/* Testimonial veloce */}
          <div className="mt-12 text-center">
            <div className="max-w-3xl mx-auto">
              <blockquote className="text-lg text-gray-600 italic mb-4">
                "Grazie a TaxFlow il mio rating creditizio è migliorato del 18% in soli 6 mesi.
                Ora ottengo finanziamenti a condizioni molto più vantaggiose."
              </blockquote>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Marco Bianchi</p>
                  <p className="text-sm text-gray-600">CEO, Innovazione SRL</p>
                </div>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
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
        className="py-20 bg-white overflow-hidden"
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold text-gray-900 mb-4 ${visibleSections.has('servizi') ? 'animate-fade-in-up' : 'opacity-0'}`}>
              I nostri servizi
            </h2>
            <p className={`text-xl text-gray-600 max-w-3xl mx-auto ${visibleSections.has('servizi') ? 'animate-fade-in-up' : 'opacity-0'}`} style={visibleSections.has('servizi') ? {animationDelay: '0.2s'} : {}}>
              Tutto quello che ti serve per gestire la tua partita IVA forfettaria con standard bancari professionali
            </p>
          </div>

          {/* Infinite Carousel Container */}
          <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
            {/* Navigation Buttons */}
            <button
              onClick={() => setCurrentService((prev) => prev - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border border-gray-200"
              aria-label="Scorri a sinistra"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>

            <button
              onClick={() => setCurrentService((prev) => prev + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border border-gray-200"
              aria-label="Scorri a destra"
            >
              <ChevronRight className="h-6 w-6 text-gray-700" />
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
                        className={`group bg-white border-2 ${isPopular ? 'border-primary-300 ring-2 ring-primary-100' : 'border-gray-100'} rounded-2xl p-6 hover:border-primary-200 hover:shadow-xl transition-all duration-300 relative h-full`}
                      >
                        {/* Popular Badge */}
                        {isPopular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <div className="bg-gradient-to-r from-primary-600 to-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                              <Star className="h-3 w-3 inline mr-1" />
                              Più Popolare
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-4">
                          <div className={`${isPopular ? 'bg-primary-100' : 'bg-primary-50'} w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors`}>
                            <Icon className="h-6 w-6 text-primary-600" />
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-bold ${isPopular ? 'text-primary-700' : 'text-primary-600'}`}>{service.price}</div>
                            {isPopular && (
                              <div className="text-xs text-green-600 font-medium">Best Value</div>
                            )}
                          </div>
                        </div>

                        <h3 className={`text-lg font-bold ${isPopular ? 'text-primary-900' : 'text-gray-900'} mb-3`}>{service.title}</h3>
                        <p className="text-gray-600 mb-4 leading-relaxed text-sm">{service.description}</p>

                        <div className="space-y-2 mb-4">
                          {service.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center text-gray-700">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* Guarantee Badge */}
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-green-800 font-medium text-xs">
                              {isPopular ? '60gg soddisfatto o rimborsato' : 'Garanzia qualità'}
                            </span>
                          </div>
                        </div>

                        <a
                          href={service.learnMoreUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center ${isPopular ? 'text-primary-700 hover:text-primary-800' : 'text-primary-600 hover:text-primary-700'} font-medium text-sm group-hover:underline`}
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

      {/* Benefits Section */}
      <section
        id="benefici"
        ref={setSectionRef('benefici')}
        className="py-20 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold text-gray-900 mb-4 ${visibleSections.has('benefici') ? 'animate-fade-in-up' : 'opacity-0'}`}>
              Perché scegliere TaxFlow
            </h2>
            <p className={`text-xl text-gray-600 max-w-3xl mx-auto ${visibleSections.has('benefici') ? 'animate-fade-in-up' : 'opacity-0'}`} style={visibleSections.has('benefici') ? {animationDelay: '0.2s'} : {}}>
              Metodologie bancarie professionali per ottimizzare il tuo rating creditizio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div
                  key={index}
                  className={`text-center group ${visibleSections.has('benefici') ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={visibleSections.has('benefici') ? {animationDelay: `${0.4 + index * 0.15}s`} : {}}
                >
                  <div className="bg-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow border border-gray-100">
                    <Icon className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{benefit.description}</p>
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
        className="py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold text-gray-900 mb-4 ${visibleSections.has('come-funziona') ? 'animate-fade-in-up' : 'opacity-0'}`}>
              Come funziona
            </h2>
            <p className={`text-xl text-gray-600 ${visibleSections.has('come-funziona') ? 'animate-fade-in-up' : 'opacity-0'}`} style={visibleSections.has('come-funziona') ? {animationDelay: '0.2s'} : {}}>
              Semplice, veloce, professionale
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
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
                  <div className="bg-blue-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg relative">
                    <Icon className="h-8 w-8" />
                    <div className="absolute -top-2 -right-2 bg-white text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Regulatory Info Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Normative di Riferimento
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              I nostri servizi si basano sulle più recenti normative bancarie e fiscali italiane ed europee
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-gray-900 mb-2">D.Lgs. 14/2019</h3>
              <p className="text-sm text-gray-600 mb-4">Codice della Crisi d'Impresa e dell'Insolvenza</p>
              <a
                href="https://www.gazzettaufficiale.it/eli/id/2019/02/14/19G00007/sg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center font-medium hover:underline"
              >
                Leggi la normativa
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-gray-900 mb-2">Basel III</h3>
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

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-shadow">
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

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-shadow">
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
        className="py-20 bg-blue-600"
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl md:text-4xl font-bold text-white mb-6 ${visibleSections.has('cta') ? 'animate-fade-in-up' : 'opacity-0'}`}>
            Migliora il tuo rating creditizio oggi
          </h2>
          <p className={`text-xl text-blue-100 mb-8 ${visibleSections.has('cta') ? 'animate-fade-in-up' : 'opacity-0'}`} style={visibleSections.has('cta') ? {animationDelay: '0.2s'} : {}}>
            Ottimizza le tue relazioni bancarie con la metodologia Banca d'Italia
          </p>
          <button
            onClick={onShowRegister}
            className={`bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all duration-200 hover:shadow-lg ${visibleSections.has('cta') ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={visibleSections.has('cta') ? {animationDelay: '0.4s'} : {}}
          >
            Inizia ora
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Domande Frequenti
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Risposte alle domande più comuni sulla gestione fiscale e il rating creditizio
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "Cos'è il rating creditizio e perché è importante?",
                answer: "Il rating creditizio è una valutazione della tua affidabilità finanziaria secondo i criteri di Banca d'Italia (ICAS). Un buon rating ti permette di ottenere finanziamenti a tassi più vantaggiosi e condizioni migliori."
              },
              {
                question: "Come migliora TaxFlow il mio rating creditizio?",
                answer: "TaxFlow organizza la tua documentazione fiscale secondo gli standard Basel III, implementa sistemi di early warning conformi al D.Lgs. 14/2019 e ottimizza la tua posizione nella Centrale Rischi di Banca d'Italia."
              },
              {
                question: "Quanto tempo serve per vedere miglioramenti?",
                answer: "I primi miglioramenti sono visibili entro 3-6 mesi dall'implementazione. Il rating creditizio viene aggiornato trimestralmente dalle banche, quindi i benefici completi si vedono nel medio termine."
              },
              {
                question: "È compatibile con il regime forfettario?",
                answer: "Assolutamente sì. TaxFlow è stato progettato specificamente per ottimizzare la gestione fiscale forfettaria mantenendo la conformità normativa e preparando al meglio per relazioni bancarie future."
              },
              {
                question: "Quali documenti devo fornire?",
                answer: "Ti serviranno: visure camerali, bilanci/dichiarazioni degli ultimi 3 anni, estratti conto bancari e la documentazione fiscale corrente. Il nostro team ti guiderà passo dopo passo."
              },
              {
                question: "C'è una garanzia sui risultati?",
                answer: "Sì, garantiamo la conformità normativa al 100%. Se non sei soddisfatto dei risultati entro i primi 6 mesi, ti rimborsiamo integralmente il servizio."
              }
            ].map((faq, index) => (
              <div key={index} className="group bg-gray-50 rounded-xl p-6 hover:bg-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-blue-200">
                <details className="group/details">
                  <summary className="flex justify-between items-center cursor-pointer list-none select-none">
                    <h3 className="text-lg font-semibold text-gray-900 pr-4 group-hover:text-blue-700 transition-colors duration-300">{faq.question}</h3>
                    <div className="text-blue-600 group-open/details:rotate-180 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-700">
                      <ChevronDown className="h-5 w-5" />
                    </div>
                  </summary>
                  <div className="mt-4 pt-4 border-t border-gray-200 animate-fade-in-up">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>

          {/* CTA finale */}
          <div className="text-center mt-12 p-8 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Altre domande?</h3>
            <p className="text-gray-600 mb-6">Il nostro team di esperti è pronto ad aiutarti</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => scrollToSection('footer')}
                className="group bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center hover:scale-105 hover:shadow-lg"
              >
                <Phone className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                <span>Contattaci</span>
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button
                onClick={onShowRegister}
                className="group border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center"
              >
                <CheckCircle className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                <span>Inizia ora</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="mb-6">
                <Logo className="h-12" inverted={true} />
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                La partita IVA forfettaria con metodologia Banca d'Italia per ottimizzare il tuo rating creditizio.
              </p>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-400">
                  <Shield className="h-4 w-4 text-blue-400 mr-2" />
                  <span>D.Lgs. 14/2019 Compliant</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <FileCheck className="h-4 w-4 text-blue-400 mr-2" />
                  <span>Basel III Framework</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <TrendingUp className="h-4 w-4 text-blue-400 mr-2" />
                  <span>Sistema ICAS</span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Servizi</h3>
              <ul className="space-y-3">
                {[
                  "Credit Readiness Assessment",
                  "Forward-Looking Analysis",
                  "Banking Relationship Manager",
                  "Regulatory Compliance Hub",
                  "AI Risk Management",
                  "Rating Optimization"
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
                  "Consulenza Creditizia",
                  "Early Warning System",
                  "Compliance Monitoring",
                  "Banking Relations Support"
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
                  <div className="bg-blue-600 p-2 rounded-lg mr-3">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-300">800 123 456</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-600 p-2 rounded-lg mr-3">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-300">info@taxflow.it</span>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={onShowRegister}
                  className="group bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center"
                >
                  <span>Inizia ora</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 mb-4 md:mb-0">
                <span>&copy; 2025 TaxFlow. Tutti i diritti riservati.</span>
                <span className="block text-sm mt-1">
                  Servizi conformi alle normative bancarie italiane ed europee
                </span>
              </div>

              <div className="flex flex-wrap justify-center gap-6">
                <button
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => setShowTermsModal(true)}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Termini di Servizio
                </button>
                <button
                  onClick={() => setShowCookieModal(true)}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
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
          <p className="mb-4">
            TaxFlow rispetta la tua privacy e si impegna a proteggere i tuoi dati personali.
            Questa informativa descrive come raccogliamo, utilizziamo e proteggiamo le tue informazioni.
          </p>

          <h5 className="font-semibold mb-2">Dati che raccogliamo:</h5>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>Informazioni di contatto (nome, email, telefono)</li>
            <li>Dati fiscali necessari per i servizi</li>
            <li>Informazioni sull'utilizzo del sito</li>
            <li>Cookie tecnici e di preferenze</li>
          </ul>

          <h5 className="font-semibold mb-2">Come utilizziamo i tuoi dati:</h5>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>Fornitura dei servizi di consulenza fiscale</li>
            <li>Comunicazioni relative al servizio</li>
            <li>Miglioramento dell'esperienza utente</li>
            <li>Adempimenti legali e fiscali</li>
          </ul>

          <h5 className="font-semibold mb-2">I tuoi diritti:</h5>
          <p className="mb-4">
            Hai il diritto di accedere, modificare, cancellare i tuoi dati e limitarne il trattamento.
            Puoi contattarci all'indirizzo privacy@taxflow.it per esercitare i tuoi diritti.
          </p>

          <p className="text-sm text-gray-600">
            Ultimo aggiornamento: Gennaio 2025
          </p>
        </div>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal isOpen={showTermsModal} onClose={closeTermsModal} title="Termini di Servizio" isClosing={isClosingTerms}>
        <div className="prose prose-sm max-w-none">
          <h4 className="text-lg font-semibold mb-3">Termini e Condizioni di Servizio</h4>
          <p className="mb-4">
            Benvenuto su TaxFlow. Utilizzando i nostri servizi, accetti i seguenti termini e condizioni.
          </p>

          <h5 className="font-semibold mb-2">1. Servizi Offerti</h5>
          <p className="mb-4">
            TaxFlow fornisce servizi di consulenza fiscale, apertura partita IVA forfettaria,
            gestione contabilità e supporto per adempimenti fiscali.
          </p>

          <h5 className="font-semibold mb-2">2. Responsabilità del Cliente</h5>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>Fornire informazioni accurate e complete</li>
            <li>Rispettare i termini di pagamento</li>
            <li>Collaborare per la corretta erogazione dei servizi</li>
            <li>Comunicare tempestivamente eventuali variazioni</li>
          </ul>

          <h5 className="font-semibold mb-2">3. Tariffe e Pagamenti</h5>
          <p className="mb-4">
            Le tariffe sono indicate sul sito e possono variare in base ai servizi richiesti.
            I pagamenti sono dovuti secondo le modalità concordate.
          </p>

          <h5 className="font-semibold mb-2">4. Limitazioni di Responsabilità</h5>
          <p className="mb-4">
            TaxFlow si impegna a fornire servizi professionali ma non può garantire
            risultati specifici. La responsabilità è limitata all'importo pagato per i servizi.
          </p>

          <h5 className="font-semibold mb-2">5. Risoluzione Controversie</h5>
          <p className="mb-4">
            Eventuali controversie saranno risolte secondo la legge italiana.
            Foro competente: Tribunale di Milano.
          </p>

          <p className="text-sm text-gray-600">
            Ultimo aggiornamento: Gennaio 2025
          </p>
        </div>
      </Modal>

      {/* Cookie Policy Modal */}
      <Modal isOpen={showCookieModal} onClose={closeCookieModal} title="Cookie Policy" isClosing={isClosingCookie}>
        <div className="prose prose-sm max-w-none">
          <h4 className="text-lg font-semibold mb-3">Informativa sui Cookie</h4>
          <p className="mb-4">
            Questo sito utilizza cookie per migliorare l'esperienza di navigazione e fornire servizi personalizzati.
          </p>

          <h5 className="font-semibold mb-2">Cosa sono i Cookie</h5>
          <p className="mb-4">
            I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo
            quando visiti un sito web per ricordare le tue preferenze.
          </p>

          <h5 className="font-semibold mb-2">Tipi di Cookie utilizzati:</h5>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>
              <strong>Cookie Tecnici:</strong> Necessari per il funzionamento del sito
            </li>
            <li>
              <strong>Cookie di Preferenze:</strong> Memorizzano le tue scelte (lingua, tema)
            </li>
            <li>
              <strong>Cookie Analitici:</strong> Ci aiutano a capire come viene utilizzato il sito
            </li>
            <li>
              <strong>Cookie di Marketing:</strong> Per mostrare contenuti personalizzati
            </li>
          </ul>

          <h5 className="font-semibold mb-2">Gestione dei Cookie</h5>
          <p className="mb-4">
            Puoi gestire le preferenze dei cookie attraverso le impostazioni del tuo browser.
            Disabilitare alcuni cookie potrebbe limitare alcune funzionalità del sito.
          </p>

          <h5 className="font-semibold mb-2">Cookie di Terze Parti</h5>
          <p className="mb-4">
            Utilizziamo servizi di terze parti come Google Analytics per analizzare il traffico
            e migliorare i nostri servizi.
          </p>

          <p className="text-sm text-gray-600">
            Ultimo aggiornamento: Gennaio 2025
          </p>
        </div>
      </Modal>
    </div>
  )
}