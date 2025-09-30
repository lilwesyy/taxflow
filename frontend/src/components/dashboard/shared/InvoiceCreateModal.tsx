import { useState } from 'react'
import Modal from '../../common/Modal'
import { calculateTotal, calculateIvaAmount } from '../../../utils/invoiceUtils'

interface InvoiceFormData {
  cliente: string
  email: string
  servizio: string
  descrizione: string
  importo: string
  iva: string
  dataScadenza: string
  metodoPagamento: string
  note: string
}

interface InvoiceCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: InvoiceFormData) => void
  title?: string
  userRole?: 'business' | 'admin'
}

const defaultServices = [
  'Consulenza Apertura P.IVA',
  'Business Plan Completo',
  'Consulenza Fiscale',
  'Analisi Regime Forfettario',
  'Gestione Pratiche Burocratiche',
  'Consulenza Annuale Completa',
  'Dichiarazione Redditi',
  'Consulenza Societaria',
  'Registrazione Contratti',
  'Pianificazione Fiscale',
  'Consulenza Startup',
  'Audit Finanziario'
]

export default function InvoiceCreateModal({
  isOpen,
  onClose,
  onSubmit,
  title = "Crea Nuova Fattura",
  userRole = 'business'
}: InvoiceCreateModalProps) {
  const [formData, setFormData] = useState<InvoiceFormData>({
    cliente: '',
    email: '',
    servizio: '',
    descrizione: '',
    importo: '',
    iva: userRole === 'business' ? '0' : '22', // Business forfettario = 0%, Admin = 22%
    dataScadenza: '',
    metodoPagamento: 'bonifico',
    note: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    handleReset()
  }

  const handleReset = () => {
    setFormData({
      cliente: '',
      email: '',
      servizio: '',
      descrizione: '',
      importo: '',
      iva: userRole === 'business' ? '0' : '22',
      dataScadenza: '',
      metodoPagamento: 'bonifico',
      note: ''
    })
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const updateField = (field: keyof InvoiceFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const calculateTotalAmount = () => {
    const importo = parseFloat(formData.importo) || 0
    const ivaPercentage = parseFloat(formData.iva) || 0
    return calculateTotal(importo, ivaPercentage)
  }

  const calculateIvaAmountValue = () => {
    const importo = parseFloat(formData.importo) || 0
    const ivaPercentage = parseFloat(formData.iva) || 0
    return calculateIvaAmount(importo, ivaPercentage)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dati Cliente */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Dati Cliente</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Cliente *
              </label>
              <input
                type="text"
                value={formData.cliente}
                onChange={(e) => updateField('cliente', e.target.value)}
                placeholder="Nome e Cognome / Ragione Sociale"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Cliente *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="cliente@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Dettagli Servizio */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Dettagli Servizio</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo Servizio *
              </label>
              <select
                value={formData.servizio}
                onChange={(e) => updateField('servizio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Seleziona un servizio</option>
                {defaultServices.map((service) => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrizione Dettagliata
              </label>
              <textarea
                value={formData.descrizione}
                onChange={(e) => updateField('descrizione', e.target.value)}
                rows={3}
                placeholder="Descrizione dettagliata del servizio fornito..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Importi */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Importi</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Importo Imponibile *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={formData.importo}
                  onChange={(e) => updateField('importo', e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aliquota IVA (%)
              </label>
              <select
                value={formData.iva}
                onChange={(e) => updateField('iva', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={userRole === 'business'} // Forfettario fisso a 0%
              >
                <option value="0">0% - {userRole === 'business' ? 'Regime Forfettario' : 'Esente'}</option>
                <option value="4">4% - Ridotta</option>
                <option value="5">5% - Ridotta</option>
                <option value="10">10% - Ridotta</option>
                <option value="22">22% - Ordinaria</option>
              </select>
              {userRole === 'business' && (
                <p className="text-xs text-blue-600 mt-1">Regime forfettario - IVA non dovuta</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Importo IVA
              </label>
              <div className="bg-gray-50 px-3 py-2 border border-gray-300 rounded-lg">
                <span className="text-gray-700">€ {calculateIvaAmountValue().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-primary-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Totale Fattura:</span>
              <span className="text-2xl font-bold text-primary-600">
                € {calculateTotalAmount().toFixed(2)}
              </span>
            </div>
            {userRole === 'business' && (
              <p className="text-xs text-blue-600 mt-2">
                Fattura emessa in regime forfettario - IVA non dovuta ai sensi dell'art. 1, commi 54-89, L. 190/2014
              </p>
            )}
          </div>
        </div>

        {/* Scadenza e Pagamento */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Condizioni di Pagamento</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Scadenza *
              </label>
              <input
                type="date"
                value={formData.dataScadenza}
                onChange={(e) => updateField('dataScadenza', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metodo di Pagamento
              </label>
              <select
                value={formData.metodoPagamento}
                onChange={(e) => updateField('metodoPagamento', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="bonifico">Bonifico Bancario</option>
                <option value="carta">Carta di Credito</option>
                <option value="contanti">Contanti</option>
                <option value="assegno">Assegno</option>
              </select>
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
            placeholder="Note aggiuntive per la fattura..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            type="button"
            onClick={() => {
              const formDataWithStatus = { ...formData, status: 'draft' }
              onSubmit(formDataWithStatus as any)
              handleReset()
            }}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            Salva come Bozza
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            Crea e Invia
          </button>
        </div>
      </form>
    </Modal>
  )
}