import { useState } from 'react'
import Modal from '../../common/Modal'
import { calculateTotal, calculateIvaAmount } from '../../../utils/invoiceUtils'

interface InvoiceFormData {
  // Dati Cliente (CessionarioCommittente)
  cliente: string
  email: string
  codiceFiscaleCliente: string
  partitaIvaCliente: string
  indirizzoCliente: string
  capCliente: string
  comuneCliente: string
  provinciaCliente: string
  codiceDestinatario: string
  pecCliente: string

  // Dati Fattura
  servizio: string
  descrizione: string
  importo: string
  quantita: string
  unitaMisura: string
  iva: string
  dataEmissione: string
  dataScadenza: string
  metodoPagamento: string
  iban: string
  note: string
}

interface InvoiceCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: InvoiceFormData) => void
  title?: string
  userRole?: 'business' | 'admin'
}

export default function InvoiceCreateModal({
  isOpen,
  onClose,
  onSubmit,
  title = "Crea Nuova Fattura",
  userRole = 'business'
}: InvoiceCreateModalProps) {
  const [formData, setFormData] = useState<InvoiceFormData>({
    // Dati Cliente
    cliente: '',
    email: '',
    codiceFiscaleCliente: '',
    partitaIvaCliente: '',
    indirizzoCliente: '',
    capCliente: '',
    comuneCliente: '',
    provinciaCliente: '',
    codiceDestinatario: '',
    pecCliente: '',

    // Dati Fattura
    servizio: '',
    descrizione: '',
    importo: '',
    quantita: '1',
    unitaMisura: 'NR',
    iva: userRole === 'business' ? '0' : '22',
    dataEmissione: new Date().toISOString().split('T')[0],
    dataScadenza: '',
    metodoPagamento: 'MP05', // Bonifico bancario
    iban: '',
    note: userRole === 'business' ? 'Operazione effettuata ai sensi dell\'art. 1, commi 54-89, della Legge n. 190/2014 – Regime forfetario. Operazione senza applicazione dell\'IVA ai sensi dell\'art. 1, comma 58, della Legge n. 190/2014.' : ''
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
      codiceFiscaleCliente: '',
      partitaIvaCliente: '',
      indirizzoCliente: '',
      capCliente: '',
      comuneCliente: '',
      provinciaCliente: '',
      codiceDestinatario: '',
      pecCliente: '',
      servizio: '',
      descrizione: '',
      importo: '',
      quantita: '1',
      unitaMisura: 'NR',
      iva: userRole === 'business' ? '0' : '22',
      dataEmissione: new Date().toISOString().split('T')[0],
      dataScadenza: '',
      metodoPagamento: 'MP05',
      iban: '',
      note: userRole === 'business' ? 'Operazione effettuata ai sensi dell\'art. 1, commi 54-89, della Legge n. 190/2014 – Regime forfetario. Operazione senza applicazione dell\'IVA ai sensi dell\'art. 1, comma 58, della Legge n. 190/2014.' : ''
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
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Dati Cliente */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold flex-shrink-0">1</span>
            <span className="min-w-0">Dati Cliente (Cessionario/Committente)</span>
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Denominazione/Nome Completo *
              </label>
              <input
                type="text"
                value={formData.cliente}
                onChange={(e) => updateField('cliente', e.target.value)}
                placeholder="Nome e Cognome / Ragione Sociale"
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Email Cliente *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="cliente@email.com"
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Codice Fiscale *
              </label>
              <input
                type="text"
                value={formData.codiceFiscaleCliente}
                onChange={(e) => updateField('codiceFiscaleCliente', e.target.value.toUpperCase())}
                placeholder="RSSMRA80A01H501U"
                maxLength={16}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Partita IVA (se presente)
              </label>
              <input
                type="text"
                value={formData.partitaIvaCliente}
                onChange={(e) => updateField('partitaIvaCliente', e.target.value)}
                placeholder="12345678901"
                maxLength={11}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Indirizzo *
              </label>
              <input
                type="text"
                value={formData.indirizzoCliente}
                onChange={(e) => updateField('indirizzoCliente', e.target.value)}
                placeholder="Via Roma, 1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CAP *
              </label>
              <input
                type="text"
                value={formData.capCliente}
                onChange={(e) => updateField('capCliente', e.target.value)}
                placeholder="00100"
                maxLength={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comune *
              </label>
              <input
                type="text"
                value={formData.comuneCliente}
                onChange={(e) => updateField('comuneCliente', e.target.value)}
                placeholder="Roma"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provincia *
              </label>
              <input
                type="text"
                value={formData.provinciaCliente}
                onChange={(e) => updateField('provinciaCliente', e.target.value.toUpperCase())}
                placeholder="RM"
                maxLength={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Codice Destinatario (7 caratteri)
              </label>
              <input
                type="text"
                value={formData.codiceDestinatario}
                onChange={(e) => updateField('codiceDestinatario', e.target.value.toUpperCase())}
                placeholder="KRRH6B9 o 0000000"
                maxLength={7}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              />
              <p className="text-xs text-gray-500 mt-1">Lasciare vuoto per usare 0000000</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PEC Cliente (alternativa al codice destinatario)
              </label>
              <input
                type="email"
                value={formData.pecCliente}
                onChange={(e) => updateField('pecCliente', e.target.value)}
                placeholder="cliente@pec.it"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Dettagli Servizio */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">2</span>
            Dettagli Bene/Servizio (DettaglioLinee)
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo Servizio/Prodotto *
              </label>
              <input
                type="text"
                value={formData.servizio}
                onChange={(e) => updateField('servizio', e.target.value)}
                placeholder="Es: Consulenza commerciale, Sviluppo software, Vendita prodotto..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Inserisci il nome del servizio o prodotto fatturato</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrizione Dettagliata *
              </label>
              <textarea
                value={formData.descrizione}
                onChange={(e) => updateField('descrizione', e.target.value)}
                rows={3}
                placeholder="Descrizione dettagliata del servizio fornito..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantità *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.quantita}
                  onChange={(e) => updateField('quantita', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unità di Misura *
                </label>
                <select
                  value={formData.unitaMisura}
                  onChange={(e) => updateField('unitaMisura', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="NR">NR - Numero</option>
                  <option value="H">H - Ore</option>
                  <option value="D">D - Giorni</option>
                  <option value="KG">KG - Chilogrammi</option>
                  <option value="M">M - Metri</option>
                  <option value="L">L - Litri</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prezzo Unitario *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.importo}
                    onChange={(e) => updateField('importo', e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Importi e Date */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 bg-orange-600 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">3</span>
            Dati Generali Documento
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Emissione *
              </label>
              <input
                type="date"
                value={formData.dataEmissione}
                onChange={(e) => updateField('dataEmissione', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aliquota IVA (%)
              </label>
              <select
                value={formData.iva}
                onChange={(e) => updateField('iva', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={userRole === 'business'}
              >
                <option value="0">0% - {userRole === 'business' ? 'Regime Forfettario (N2.2)' : 'Esente'}</option>
                <option value="4">4% - Ridotta</option>
                <option value="5">5% - Ridotta</option>
                <option value="10">10% - Ridotta</option>
                <option value="22">22% - Ordinaria</option>
              </select>
              {userRole === 'business' && (
                <p className="text-xs text-orange-600 mt-1">Natura N2.2 - Operazioni non soggette</p>
              )}
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl text-white">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-orange-100 text-sm">Imponibile</p>
                <p className="text-2xl font-bold">€ {(parseFloat(formData.importo || '0') * parseFloat(formData.quantita || '1')).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-orange-100 text-sm">IVA</p>
                <p className="text-2xl font-bold">€ {calculateIvaAmountValue().toFixed(2)}</p>
              </div>
              <div>
                <p className="text-orange-100 text-sm">Totale</p>
                <p className="text-2xl font-bold">€ {calculateTotalAmount().toFixed(2)}</p>
              </div>
            </div>
            {userRole === 'business' && (
              <p className="text-xs text-orange-100 mt-3 text-center">
                Operazione effettuata ai sensi dell'art. 1, commi 54-89, L. 190/2014
              </p>
            )}
          </div>
        </div>

        {/* Condizioni di Pagamento */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">4</span>
            Dati Pagamento
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Scadenza Pagamento
              </label>
              <input
                type="date"
                value={formData.dataScadenza}
                onChange={(e) => updateField('dataScadenza', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modalità di Pagamento *
              </label>
              <select
                value={formData.metodoPagamento}
                onChange={(e) => updateField('metodoPagamento', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="MP05">MP05 - Bonifico Bancario</option>
                <option value="MP01">MP01 - Contanti</option>
                <option value="MP02">MP02 - Assegno</option>
                <option value="MP03">MP03 - Assegno Circolare</option>
                <option value="MP04">MP04 - Contanti Presso Tesoreria</option>
                <option value="MP08">MP08 - Carta di Debito</option>
                <option value="MP09">MP09 - RID</option>
                <option value="MP12">MP12 - RIBA</option>
              </select>
            </div>

            {formData.metodoPagamento === 'MP05' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IBAN Beneficiario
                </label>
                <input
                  type="text"
                  value={formData.iban}
                  onChange={(e) => updateField('iban', e.target.value.replace(/\s/g, '').toUpperCase())}
                  placeholder="IT60X0542811101000000123456"
                  maxLength={27}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                />
              </div>
            )}
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
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200 hover:scale-105 text-sm sm:text-base"
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
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 hover:shadow-lg transition-all duration-200 hover:scale-105 text-sm sm:text-base"
          >
            Salva come Bozza
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:shadow-lg transition-all duration-200 hover:scale-105 text-sm sm:text-base"
          >
            Crea e Invia
          </button>
        </div>
      </form>
    </Modal>
  )
}