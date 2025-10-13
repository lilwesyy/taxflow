import { useState } from 'react'
import Modal from '../../common/Modal'
import { User, MapPin, Mail } from 'lucide-react'

interface ClientFormData {
  // Dati anagrafici
  denominazione: string
  codiceFiscale: string
  partitaIva: string

  // Indirizzo
  indirizzo: string
  cap: string
  comune: string
  provincia: string

  // Contatti
  email: string
  telefono: string
  pec: string
  codiceDestinatario: string

  // Note
  note: string
}

interface ClientCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: ClientFormData) => void
}

export default function ClientCreateModal({
  isOpen,
  onClose,
  onSubmit
}: ClientCreateModalProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    denominazione: '',
    codiceFiscale: '',
    partitaIva: '',
    indirizzo: '',
    cap: '',
    comune: '',
    provincia: '',
    email: '',
    telefono: '',
    pec: '',
    codiceDestinatario: '',
    note: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    handleReset()
  }

  const handleReset = () => {
    setFormData({
      denominazione: '',
      codiceFiscale: '',
      partitaIva: '',
      indirizzo: '',
      cap: '',
      comune: '',
      provincia: '',
      email: '',
      telefono: '',
      pec: '',
      codiceDestinatario: '',
      note: ''
    })
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const updateField = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nuovo Cliente"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dati Anagrafici */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <User className="h-5 w-5 text-white" />
            </div>
            Dati Anagrafici
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Denominazione/Nome Completo *
              </label>
              <input
                type="text"
                value={formData.denominazione}
                onChange={(e) => updateField('denominazione', e.target.value)}
                placeholder="Nome e Cognome / Ragione Sociale"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Codice Fiscale *
              </label>
              <input
                type="text"
                value={formData.codiceFiscale}
                onChange={(e) => updateField('codiceFiscale', e.target.value.toUpperCase())}
                placeholder="RSSMRA80A01H501U"
                maxLength={16}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Partita IVA
              </label>
              <input
                type="text"
                value={formData.partitaIva}
                onChange={(e) => updateField('partitaIva', e.target.value)}
                placeholder="12345678901"
                maxLength={11}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Opzionale per privati</p>
            </div>
          </div>
        </div>

        {/* Indirizzo */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            Indirizzo (Sede)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Indirizzo *
              </label>
              <input
                type="text"
                value={formData.indirizzo}
                onChange={(e) => updateField('indirizzo', e.target.value)}
                placeholder="Via Roma, 1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CAP *
              </label>
              <input
                type="text"
                value={formData.cap}
                onChange={(e) => updateField('cap', e.target.value)}
                placeholder="00100"
                maxLength={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comune *
              </label>
              <input
                type="text"
                value={formData.comune}
                onChange={(e) => updateField('comune', e.target.value)}
                placeholder="Roma"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provincia *
              </label>
              <input
                type="text"
                value={formData.provincia}
                onChange={(e) => updateField('provincia', e.target.value.toUpperCase())}
                placeholder="RM"
                maxLength={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase"
                required
              />
            </div>
          </div>
        </div>

        {/* Contatti */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
              <Mail className="h-5 w-5 text-white" />
            </div>
            Dati di Contatto
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="cliente@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefono
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => updateField('telefono', e.target.value)}
                placeholder="+39 123 456 7890"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PEC
              </label>
              <input
                type="email"
                value={formData.pec}
                onChange={(e) => updateField('pec', e.target.value)}
                placeholder="cliente@pec.it"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Per fatturazione elettronica</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Codice Destinatario SDI
              </label>
              <input
                type="text"
                value={formData.codiceDestinatario}
                onChange={(e) => updateField('codiceDestinatario', e.target.value.toUpperCase())}
                placeholder="KRRH6B9"
                maxLength={7}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
              />
              <p className="text-xs text-gray-500 mt-1">7 caratteri, alternativo a PEC</p>
            </div>
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note Aggiuntive
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => updateField('note', e.target.value)}
            rows={3}
            placeholder="Note aggiuntive sul cliente..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Bottoni Azione */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200 hover:scale-105"
          >
            Annulla
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            Crea Cliente
          </button>
        </div>
      </form>
    </Modal>
  )
}
