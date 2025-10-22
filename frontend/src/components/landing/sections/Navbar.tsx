import { Menu } from 'lucide-react'
import { useState } from 'react'
import logoSvg from '../../../assets/logo.svg'

interface NavbarProps {
  onShowLogin: () => void
  onShowRegister: () => void
  onScrollToSection: (section: string) => void
  onScrollToTop: () => void
  showNavbar: boolean
}

export default function Navbar({ onShowLogin, onShowRegister, onScrollToSection, onScrollToTop, showNavbar }: NavbarProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <header className={`bg-white border-b border-gray-100 sticky top-0 z-50 transition-transform duration-300 ${
      showNavbar ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <button
            onClick={onScrollToTop}
            className="flex items-center hover:opacity-80 transition-opacity duration-200"
            aria-label="Torna alla home"
          >
            <img src={logoSvg} alt="TaxFlow" className="h-10 sm:h-12 w-auto" />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onScrollToSection('servizi')}
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
            >
              Servizi
            </button>
            <button
              onClick={() => onScrollToSection('benefici')}
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
            >
              Vantaggi
            </button>
            <button
              onClick={() => onScrollToSection('come-funziona')}
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
            >
              Come Funziona
            </button>
            <button
              onClick={() => onScrollToSection('synetich')}
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
            >
              Formazione
            </button>
            <button
              onClick={() => onScrollToSection('footer')}
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
            >
              Contatti
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onShowLogin}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 text-sm px-4 py-2"
            >
              Accedi
            </button>
            <button
              onClick={onShowRegister}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-sm"
            >
              Inizia ora
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-4 space-y-1">
            <button
              onClick={() => { onScrollToSection('servizi'); setShowMobileMenu(false); }}
              className="block w-full text-left px-4 py-3 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
            >
              Servizi
            </button>
            <button
              onClick={() => { onScrollToSection('benefici'); setShowMobileMenu(false); }}
              className="block w-full text-left px-4 py-3 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
            >
              Vantaggi
            </button>
            <button
              onClick={() => { onScrollToSection('come-funziona'); setShowMobileMenu(false); }}
              className="block w-full text-left px-4 py-3 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
            >
              Come Funziona
            </button>
            <button
              onClick={() => { onScrollToSection('synetich'); setShowMobileMenu(false); }}
              className="block w-full text-left px-4 py-3 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
            >
              Formazione
            </button>
            <button
              onClick={() => { onScrollToSection('footer'); setShowMobileMenu(false); }}
              className="block w-full text-left px-4 py-3 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
            >
              Contatti
            </button>
            <div className="border-t border-gray-100 pt-3 mt-3 space-y-2">
              <button
                onClick={onShowLogin}
                className="block w-full text-center px-4 py-3 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
              >
                Accedi
              </button>
              <button
                onClick={onShowRegister}
                className="block w-full text-center px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 font-semibold"
              >
                Inizia ora
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
