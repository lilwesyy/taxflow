import { CheckCircle, Mail, Phone, Clock, ArrowLeft } from 'lucide-react'
import Logo from '../common/Logo'

interface RegistrationSuccessProps {
  userEmail: string
  onBackToLogin: () => void
}

export default function RegistrationSuccess({ userEmail, onBackToLogin }: RegistrationSuccessProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <div className="flex items-center justify-center mb-4">
            <Logo className="h-10" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Registrazione Completata!
          </h1>
          <p className="text-lg text-gray-600">
            Il tuo account è stato creato con successo
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-3">
                Cosa succede ora?
              </h2>
              <p className="text-green-800 leading-relaxed">
                La tua richiesta è stata ricevuta correttamente. Un nostro consulente esperto esaminerà il tuo profilo e ti contatterà entro <strong>24-48 ore</strong> per procedere con l'attivazione del tuo account.
              </p>
            </div>

            {/* Email Confirmation */}
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">Email di Conferma</h3>
                  <p className="text-blue-800 text-sm mb-2">
                    Riceverai una email di conferma all'indirizzo:
                  </p>
                  <p className="font-medium text-blue-900 bg-white px-4 py-2 rounded-lg">
                    {userEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="border-l-2 border-gray-200 ml-6 space-y-6 py-2">
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-green-500 rounded-full border-4 border-white"></div>
                <div className="flex items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Registrazione completata</h4>
                    <p className="text-sm text-gray-600">Il tuo account è stato creato</p>
                  </div>
                  <span className="text-xs text-green-600 font-medium">✓ Completato</span>
                </div>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-yellow-400 rounded-full border-4 border-white animate-pulse"></div>
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Revisione del profilo</h4>
                    <p className="text-sm text-gray-600">Il nostro team sta esaminando la tua richiesta</p>
                  </div>
                  <span className="text-xs text-yellow-600 font-medium">In corso...</span>
                </div>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-gray-300 rounded-full border-4 border-white"></div>
                <div className="flex items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-700">Contatto del consulente</h4>
                    <p className="text-sm text-gray-500">Riceverai un'email o una chiamata entro 24-48 ore</p>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">In attesa</span>
                </div>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-gray-300 rounded-full border-4 border-white"></div>
                <div className="flex items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-700">Attivazione account</h4>
                    <p className="text-sm text-gray-500">Potrai accedere e completare il questionario P.IVA</p>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">In attesa</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-center">
                Hai bisogno di assistenza immediata?
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200">
                  <Mail className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900 truncate">supporto@taxflow.it</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200">
                  <Phone className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Telefono</p>
                    <p className="text-sm font-medium text-gray-900">+39 02 1234 5678</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                Disponibili dal lunedì al venerdì, 9:00 - 18:00
              </p>
            </div>

            {/* Important Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800 flex items-start">
                <span className="mr-2">⚠️</span>
                <span>
                  <strong>Importante:</strong> Controlla anche la cartella spam/posta indesiderata per assicurarti di non perdere le nostre comunicazioni.
                </span>
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onBackToLogin}
              className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Torna al Login</span>
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Una volta approvato, potrai accedere con le credenziali che hai appena creato
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <p className="text-sm text-gray-600">
            Grazie per aver scelto <strong className="text-primary-600">TaxFlow</strong>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Il tuo partner per la gestione del regime forfettario
          </p>
        </div>
      </div>
    </div>
  )
}
