import { Clock, Mail, Phone, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function PendingApproval() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-yellow-100 p-4 rounded-full">
            <Clock className="w-12 h-12 text-yellow-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
          Richiesta in Elaborazione
        </h2>

        <div className="text-center text-gray-600 mb-8">
          <p className="mb-2">
            Grazie per aver inviato la tua richiesta di apertura Partita IVA!
          </p>
          <p className="text-sm">
            La tua richiesta è stata ricevuta e verrà esaminata da un nostro consulente.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">Cosa succede ora?</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2"></span>
              <span>Un nostro consulente esaminerà la tua richiesta entro 24-48 ore</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2"></span>
              <span>Riceverai una email di conferma all'indirizzo: <strong>{user?.email}</strong></span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2"></span>
              <span>Una volta approvata, potrai accedere alla dashboard completa</span>
            </li>
          </ul>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">Hai bisogno di assistenza?</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">supporto@taxflow.it</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-xs text-gray-500">Telefono</p>
                <p className="text-sm font-medium text-gray-900">+39 02 1234 5678</p>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Esci</span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Non hai ricevuto alcuna comunicazione? Controlla la cartella spam o contattaci direttamente.
          </p>
        </div>
      </div>
    </div>
  )
}
