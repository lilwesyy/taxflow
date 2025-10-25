import { X, ChevronUp } from 'lucide-react'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useCookieConsent } from '../../hooks/useCookieConsent'
import Navbar from './sections/Navbar'
import HeroSection from './sections/HeroSection'
import SocialProofSection from './sections/SocialProofSection'
import ServicesSection from './sections/ServicesSection'
import AboutSection from './sections/AboutSection'
import BenefitsSection from './sections/BenefitsSection'
import ProcessSection from './sections/ProcessSection'
import SynetichSection from './sections/SynetichSection'
import CTASection from './sections/CTASection'
import FAQSection from './sections/FAQSection'
import Footer from './sections/Footer'

interface LandingPageProps {
  onShowLogin: () => void
  onShowRegister: () => void
  onShowCareers: () => void
  showCookieModal?: boolean
  setShowCookieModal?: (show: boolean) => void
}

export default function LandingPage({ onShowLogin, onShowRegister, onShowCareers, showCookieModal = false, setShowCookieModal }: LandingPageProps) {
  useCookieConsent() // Keep hook call for side effects
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

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

  return (
    <div className="min-h-screen bg-white overflow-x-hidden sm:overflow-x-auto">
      {/* Navbar */}
      <Navbar
        onShowLogin={onShowLogin}
        onShowRegister={onShowRegister}
        onShowCareers={onShowCareers}
        onScrollToSection={scrollToSection}
        onScrollToTop={scrollToTop}
        showNavbar={showNavbar}
      />

      {/* Hero Section */}
      <HeroSection
        onShowRegister={onShowRegister}
        onScrollToSection={scrollToSection}
      />

      {/* Social Proof Section */}
      <SocialProofSection />

      {/* Services Section */}
      <ServicesSection setSectionRef={setSectionRef} />

      {/* About Section */}
      <AboutSection setSectionRef={setSectionRef} />

      {/* Benefits Section */}
      <BenefitsSection setSectionRef={setSectionRef} />

      {/* Process Section */}
      <ProcessSection
        setSectionRef={setSectionRef}
        onShowRegister={onShowRegister}
      />

      {/* Synetich Section */}
      <SynetichSection
        setSectionRef={setSectionRef}
        onShowLogin={onShowLogin}
      />

      {/* CTA Section */}
      <CTASection
        setSectionRef={setSectionRef}
        onShowRegister={onShowRegister}
      />

      {/* FAQ Section */}
      <FAQSection
        onShowRegister={onShowRegister}
        onScrollToSection={scrollToSection}
      />

      {/* Footer */}
      <Footer
        setSectionRef={setSectionRef}
        onShowRegister={onShowRegister}
        onShowPrivacy={() => setShowPrivacyModal(true)}
        onShowTerms={() => setShowTermsModal(true)}
        onShowCookie={() => setShowCookieModal?.(true)}
      />

      {/* Privacy Modal */}
      <Modal
        isOpen={showPrivacyModal}
        onClose={closePrivacyModal}
        title="Informativa sulla Privacy"
        isClosing={isClosingPrivacy}
      >
        <div className="prose prose-sm max-w-none text-gray-700">
          <p className="mb-4">
            <strong>Ultimo aggiornamento: 13 Ottobre 2025</strong>
          </p>

          <h5 className="font-semibold mb-2 mt-6">1. Titolare del Trattamento</h5>
          <p className="mb-4">
            <strong>TaxFlow S.r.l.</strong><br />
            Sede legale: [Indirizzo completo]<br />
            P.IVA: [Numero P.IVA]<br />
            Email: privacy@taxflow.it<br />
            PEC: taxflow@pec.it
          </p>

          <h5 className="font-semibold mb-2 mt-6">2. Finalità del Trattamento</h5>
          <p className="mb-2">I dati personali raccolti sono trattati per le seguenti finalità:</p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li><strong>Fornitura del servizio:</strong> Erogazione dei servizi di gestione fiscale, consulenza e business planning richiesti</li>
            <li><strong>Adempimenti contrattuali:</strong> Gestione del rapporto contrattuale e fatturazione</li>
            <li><strong>Obblighi di legge:</strong> Adempimento di obblighi fiscali, contabili e normativi (D.Lgs. 14/2019, Codice Privacy, normative AML)</li>
            <li><strong>Marketing diretto:</strong> Invio di comunicazioni commerciali, newsletter e offerte (previo consenso esplicito)</li>
            <li><strong>Miglioramento del servizio:</strong> Analisi statistiche e feedback per ottimizzare la piattaforma</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">3. Base Giuridica</h5>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li><strong>Esecuzione del contratto</strong> (art. 6.1.b GDPR)</li>
            <li><strong>Adempimento di obblighi legali</strong> (art. 6.1.c GDPR)</li>
            <li><strong>Consenso dell'interessato</strong> (art. 6.1.a GDPR) per attività di marketing</li>
            <li><strong>Interesse legittimo</strong> (art. 6.1.f GDPR) per il miglioramento dei servizi</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">4. Dati Raccolti</h5>
          <p className="mb-2">Le categorie di dati personali trattati includono:</p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li><strong>Dati identificativi:</strong> Nome, cognome, codice fiscale, partita IVA</li>
            <li><strong>Dati di contatto:</strong> Email, telefono, indirizzo</li>
            <li><strong>Dati fiscali e finanziari:</strong> Redditi, fatture, documenti contabili, informazioni bancarie</li>
            <li><strong>Dati di navigazione:</strong> Indirizzo IP, cookies, log di sistema</li>
            <li><strong>Dati aziendali:</strong> Informazioni sull'attività imprenditoriale, business plan, analisi SWOT</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">5. Modalità di Trattamento</h5>
          <p className="mb-4">
            I dati sono trattati con strumenti informatici e telematici, con logiche strettamente correlate alle finalità
            e mediante l'adozione di misure di sicurezza adeguate a garantire la riservatezza e l'integrità dei dati
            (crittografia SSL/TLS, backup regolari, controllo accessi).
          </p>

          <h5 className="font-semibold mb-2 mt-6">6. Destinatari dei Dati</h5>
          <p className="mb-2">I dati potranno essere comunicati a:</p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>Commercialisti e consulenti fiscali incaricati</li>
            <li>Enti pubblici (Agenzia delle Entrate, INPS, INAIL, ecc.) per adempimenti normativi</li>
            <li>Istituti bancari per operazioni di pagamento e finanziamento</li>
            <li>Fornitori di servizi tecnici (hosting, cloud, assistenza IT)</li>
            <li>Società di servizi informatici e di marketing (previo consenso)</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">7. Trasferimento Dati Extra-UE</h5>
          <p className="mb-4">
            I dati potrebbero essere trasferiti verso paesi extra-UE solo in presenza di adeguate garanzie
            (Standard Contractual Clauses, Privacy Shield, ecc.) in conformità al GDPR.
          </p>

          <h5 className="font-semibold mb-2 mt-6">8. Periodo di Conservazione</h5>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li><strong>Dati contrattuali:</strong> Per tutta la durata del rapporto e per 10 anni successivi alla cessazione (normativa fiscale e civilistica)</li>
            <li><strong>Dati di marketing:</strong> Fino alla revoca del consenso</li>
            <li><strong>Dati di navigazione:</strong> Massimo 24 mesi</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">9. Diritti dell'Interessato</h5>
          <p className="mb-2">
            Ai sensi degli artt. 15-22 del GDPR, l'interessato ha diritto di:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li><strong>Accesso:</strong> Ottenere conferma dell'esistenza di dati personali e riceverne copia</li>
            <li><strong>Rettifica:</strong> Correggere dati inesatti o incompleti</li>
            <li><strong>Cancellazione:</strong> Richiedere la cancellazione dei dati ("diritto all'oblio")</li>
            <li><strong>Limitazione:</strong> Limitare il trattamento in determinate circostanze</li>
            <li><strong>Portabilità:</strong> Ricevere i dati in formato strutturato e trasmetterli ad altro titolare</li>
            <li><strong>Opposizione:</strong> Opporsi al trattamento per motivi legittimi</li>
            <li><strong>Revoca del consenso:</strong> Revocare il consenso in qualsiasi momento</li>
            <li><strong>Reclamo:</strong> Proporre reclamo al Garante per la Protezione dei Dati Personali</li>
          </ul>

          <p className="mb-4">
            Per esercitare i propri diritti, contattare:<br />
            Email: <strong>privacy@taxflow.it</strong><br />
            PEC: <strong>taxflow@pec.it</strong>
          </p>

          <h5 className="font-semibold mb-2 mt-6">10. Modifiche alla Privacy Policy</h5>
          <p className="mb-4">
            Il Titolare si riserva il diritto di modificare o aggiornare la presente Informativa in qualsiasi momento.
            Le modifiche saranno pubblicate su questa pagina con indicazione della data di ultimo aggiornamento.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg mt-6">
            <p className="text-sm font-semibold mb-1">Ultimo aggiornamento: 13 Ottobre 2025</p>
            <p className="text-xs text-gray-600">Versione 1.0</p>
          </div>
        </div>
      </Modal>

      {/* Terms Modal */}
      <Modal
        isOpen={showTermsModal}
        onClose={closeTermsModal}
        title="Termini e Condizioni"
        isClosing={isClosingTerms}
      >
        <div className="prose prose-sm max-w-none text-gray-700">
          <p className="mb-4">
            <strong>Ultimo aggiornamento: 13 Ottobre 2025</strong>
          </p>

          <h5 className="font-semibold mb-2 mt-6">1. Accettazione dei Termini</h5>
          <p className="mb-4">
            Utilizzando TaxFlow, l'utente accetta integralmente i presenti Termini e Condizioni.
            Se non si accettano questi termini, non è possibile utilizzare il servizio.
          </p>

          <h5 className="font-semibold mb-2 mt-6">2. Descrizione del Servizio</h5>
          <p className="mb-4">
            TaxFlow è una piattaforma digitale che offre servizi di:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>Gestione fiscale e contabile per partite IVA in regime forfettario</li>
            <li>Consulenza commercialistica personalizzata</li>
            <li>Elaborazione business plan con metodologia predittiva (VisionFlow)</li>
            <li>Analisi strategica aziendale (SWOT Evolutio)</li>
            <li>Assistenza per l'accesso al credito bancario</li>
            <li>Fatturazione elettronica e gestione documentale</li>
            <li>Formazione sulla sicurezza sul lavoro (Synetich)</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">3. Registrazione e Account</h5>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>L'utente deve fornire informazioni accurate, complete e aggiornate durante la registrazione</li>
            <li>L'account è personale e non trasferibile. L'utente è responsabile della sicurezza delle proprie credenziali</li>
            <li>TaxFlow si riserva il diritto di sospendere o cancellare account che violino i presenti termini</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">4. Piani di Abbonamento</h5>
          <p className="mb-2">
            TaxFlow offre diversi piani di abbonamento con servizi differenziati:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li><strong>P.IVA Forfettari:</strong> €129,90/anno (offerta lancio fino al 31/12/2025, prezzo standard €169,90)</li>
            <li>Possibilità di pagamento mensile (€35/mese) o annuale (€368,90/anno)</li>
            <li>Servizi extra (Business Plan, SWOT Evolutio, Assistenza Credito) disponibili a listino separato</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">5. Pagamenti e Fatturazione</h5>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>I pagamenti sono gestiti tramite gateway sicuri (Stripe, PayPal)</li>
            <li>Gli abbonamenti si rinnovano automaticamente salvo disdetta</li>
            <li>Le fatture sono disponibili nell'area riservata dell'account</li>
            <li>TaxFlow si riserva il diritto di modificare i prezzi con preavviso di 30 giorni</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">6. Diritto di Recesso e Rimborsi</h5>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li><strong>Garanzia 30 giorni soddisfatti o rimborsati:</strong> L'utente può richiedere il rimborso completo entro 30 giorni dall'acquisto</li>
            <li>Per esercitare il diritto di recesso, contattare: info@taxflow.it</li>
            <li>I rimborsi vengono elaborati entro 14 giorni lavorativi</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">7. Responsabilità dell'Utente</h5>
          <p className="mb-2">L'utente si impegna a:</p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>Fornire informazioni e documentazione accurate e tempestive</li>
            <li>Rispettare le scadenze fiscali e normative comunicate dal consulente</li>
            <li>Non utilizzare il servizio per attività illecite o fraudolente</li>
            <li>Non violare diritti di terzi o leggi vigenti</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">8. Limitazioni di Responsabilità</h5>
          <p className="mb-4">
            TaxFlow fornisce servizi di consulenza e supporto, ma non può garantire risultati specifici.
            L'utente rimane responsabile delle proprie decisioni aziendali e finanziarie.
            TaxFlow non è responsabile per:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>Errori derivanti da informazioni incomplete o errate fornite dall'utente</li>
            <li>Modifiche normative successive alla prestazione del servizio</li>
            <li>Interruzioni del servizio per cause di forza maggiore</li>
            <li>Decisioni prese dall'utente sulla base delle analisi fornite</li>
          </ul>

          <h5 className="font-semibold mb-2 mt-6">9. Proprietà Intellettuale</h5>
          <p className="mb-4">
            Tutti i contenuti presenti su TaxFlow (testi, grafiche, loghi, software, metodologie proprietarie come VisionFlow e SWOT Evolutio)
            sono protetti da diritti d'autore e proprietà intellettuale. È vietata la riproduzione, distribuzione o modifica senza autorizzazione.
          </p>

          <h5 className="font-semibold mb-2 mt-6">10. Modifiche ai Termini</h5>
          <p className="mb-4">
            TaxFlow si riserva il diritto di modificare i presenti Termini e Condizioni in qualsiasi momento.
            Le modifiche saranno comunicate via email e pubblicate sulla piattaforma.
            L'uso continuato del servizio implica l'accettazione delle modifiche.
          </p>

          <h5 className="font-semibold mb-2 mt-6">11. Legge Applicabile e Foro Competente</h5>
          <p className="mb-4">
            I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente
            esclusivamente il Foro di [Città], salvo diversa disposizione di legge a tutela del consumatore.
          </p>

          <h5 className="font-semibold mb-2 mt-6">12. Contatti</h5>
          <p className="mb-4">
            Per domande o chiarimenti sui Termini e Condizioni:<br />
            Email: <strong>info@taxflow.it</strong><br />
            Telefono: <strong>800 123 456</strong><br />
            PEC: <strong>taxflow@pec.it</strong>
          </p>

          <div className="bg-gray-50 p-4 rounded-lg mt-6">
            <p className="text-sm font-semibold mb-1">Ultimo aggiornamento: 13 Ottobre 2025</p>
            <p className="text-xs text-gray-600">Versione 1.0</p>
          </div>
        </div>
      </Modal>

      {/* Cookie Modal */}
      <Modal
        isOpen={showCookieModal}
        onClose={closeCookieModal}
        title="Cookie Policy"
        isClosing={isClosingCookie}
      >
        <div className="prose prose-sm max-w-none text-gray-700">
          <p className="mb-4">
            <strong>Ultimo aggiornamento: 13 Ottobre 2025</strong>
          </p>

          <h5 className="font-semibold mb-2 mt-6">1. Titolare del Trattamento</h5>
          <p className="mb-4">
            <strong>TaxFlow S.r.l.</strong><br />
            Sede legale: [Indirizzo completo]<br />
            P.IVA: [Numero P.IVA]<br />
            Email: privacy@taxflow.it
          </p>

          <h5 className="font-semibold mb-2 mt-6">2. Cosa sono i Cookie</h5>
          <p className="mb-4 text-sm">
            I cookie sono piccoli file di testo che i siti web visitati inviano al browser dell'utente,
            dove vengono memorizzati per essere ritrasmessi agli stessi siti in occasione di visite successive.
          </p>

          <h5 className="font-semibold mb-2 mt-6">3. Tipologie di Cookie Utilizzati</h5>

          <h6 className="font-semibold text-sm mb-2 mt-4">3.1 Cookie Tecnici (Necessari)</h6>
          <p className="mb-2 text-sm">
            Essenziali per il corretto funzionamento del sito. Non richiedono consenso.
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 px-2 py-1 text-left">Nome</th>
                  <th className="border border-gray-200 px-2 py-1 text-left">Finalità</th>
                  <th className="border border-gray-200 px-2 py-1 text-left">Durata</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-2 py-1">taxflow_session</td>
                  <td className="border border-gray-200 px-2 py-1">Gestione autenticazione utente</td>
                  <td className="border border-gray-200 px-2 py-1">Sessione</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-2 py-1">taxflow_token</td>
                  <td className="border border-gray-200 px-2 py-1">Token di sicurezza JWT</td>
                  <td className="border border-gray-200 px-2 py-1">7 giorni</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h6 className="font-semibold text-sm mb-2 mt-4">3.2 Cookie Analitici</h6>
          <p className="mb-2 text-sm">
            Utilizzati per raccogliere informazioni aggregate sull'utilizzo del sito (Google Analytics).
            Richiedono il consenso dell'utente.
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-200 text-xs">
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
