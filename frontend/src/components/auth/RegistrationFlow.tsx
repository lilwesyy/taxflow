import { useState } from 'react'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Logo from '../common/Logo'
import Modal from '../common/Modal'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import PivaRequestForm, { type PivaRequestData } from '../forms/PivaRequestForm'
import { getApiUrl } from '../../config/api'

interface RegistrationFlowProps {
  onBack: () => void
  onComplete: () => void
}

export default function RegistrationFlow({ onBack, onComplete }: RegistrationFlowProps) {
  const { login } = useAuth()
  const { showToast } = useToast()
  const [step, setStep] = useState<'register' | 'questionnaire'>('register')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      showToast('Le password non coincidono', 'error')
      return
    }

    if (formData.password.length < 6) {
      showToast('La password deve essere di almeno 6 caratteri', 'error')
      return
    }

    try {      const response = await fetch(getApiUrl('/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          role: 'business'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Registrazione fallita')
      }

      // Salva le credenziali e passa al questionario
      setCredentials({ email: formData.email, password: formData.password })
      setStep('questionnaire')
      showToast('Account creato! Compila il questionario per continuare', 'success')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Si è verificato un errore'
      showToast(errorMessage, 'error')
    }
  }

  const handleQuestionnaireSubmit = async (pivaData: PivaRequestData) => {
    try {
      // Prima effettua il login per ottenere il token
      await login(credentials.email, credentials.password)

      // Ottieni il token dal localStorage
      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Token non trovato')
      }

      // Invia i dati del questionario al backend usando apiService
      const apiService = (await import('../../services/api')).default
      await apiService.updateUserProfile({
        pivaRequestData: {
          ...pivaData,
          submittedAt: new Date()
        },
        approvalStatus: 'pending_approval'
      })

      showToast('Questionario inviato con successo!', 'success')

      // Aggiorna l'utente nel localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      userData.approvalStatus = 'pending_approval'
      userData.pivaRequestData = { ...pivaData, submittedAt: new Date() }
      localStorage.setItem('user', JSON.stringify(userData))

      // Completa il flusso
      setTimeout(() => {
        onComplete()
      }, 1000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore durante l\'invio'
      showToast(errorMessage, 'error')
      throw error
    }
  }

  if (step === 'questionnaire') {
    return <PivaRequestForm onSubmit={handleQuestionnaireSubmit} />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center relative py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-primary-600 transition-colors duration-300 group z-10"
      >
        <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
        Torna alla home
      </button>

      <div className="max-w-md w-full space-y-6 px-4">
        <div className="text-center animate-fade-in-up">
          <div className="flex items-center justify-center mb-4">
            <Logo className="h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Crea il tuo account
          </h2>
          <p className="text-gray-600 text-sm">
            Inizia a gestire la tua partita IVA forfettaria
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Registration fields */}
            <div className="grid grid-cols-2 gap-3 animate-fade-in-up" style={{animationDelay: '0s'}}>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  placeholder="Mario"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Cognome
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  placeholder="Rossi"
                />
              </div>
            </div>

            {/* Email field */}
            <div className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                placeholder="mario.rossi@email.com"
              />
            </div>

            {/* Password field */}
            <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password field */}
            <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Conferma Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-2.5 px-4 rounded-md font-medium hover:bg-primary-700 hover:shadow-lg hover:scale-105 transition-all duration-300 transform animate-fade-in-up"
              style={{animationDelay: '0.4s'}}
            >
              Continua con il Questionario
            </button>

            {/* Terms and conditions */}
            <p className="text-xs text-gray-600 text-center animate-fade-in-up" style={{animationDelay: '0.5s'}}>
              Creando un account accetti i nostri{' '}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-primary-600 hover:text-primary-700 transition-colors duration-300 underline"
              >
                Termini di Servizio
              </button>{' '}
              e la{' '}
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="text-primary-600 hover:text-primary-700 transition-colors duration-300 underline"
              >
                Privacy Policy
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <Modal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} title="Privacy Policy">
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
      <Modal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} title="Termini di Servizio">
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
    </div>
  )
}
