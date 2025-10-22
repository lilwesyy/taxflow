import { Shield, FileCheck, Phone, Mail, ArrowRight } from 'lucide-react'
import Logo from '../../common/Logo'

interface FooterProps {
  setSectionRef: (id: string) => (el: Element | null) => void
  onShowRegister: () => void
  onShowPrivacy: () => void
  onShowTerms: () => void
  onShowCookie: () => void
}

export default function Footer({ setSectionRef, onShowRegister, onShowPrivacy, onShowTerms, onShowCookie }: FooterProps) {
  return (
    <footer id="footer" ref={setSectionRef('footer')} className="bg-gray-900 text-white">
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
                onClick={onShowPrivacy}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Privacy
              </button>
              <button
                onClick={onShowTerms}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Termini
              </button>
              <button
                onClick={onShowCookie}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Cookie
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
