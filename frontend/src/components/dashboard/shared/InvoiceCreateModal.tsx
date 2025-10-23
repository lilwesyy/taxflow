import { useState, useRef, useEffect } from 'react'
import Modal from '../../common/Modal'
import { calculateTotal, calculateIvaAmount } from '../../../utils/invoiceUtils'
import { Users, Search, X } from 'lucide-react'
import type { Client } from '../../../types/dashboard'
import AddressAutocomplete from '../../common/AddressAutocomplete'
import { logger } from '../../../utils/logger'

interface InvoiceFormData {
  // Dati Cliente (CessionarioCommittente)
  cliente: string
  email: string
  codiceFiscaleCliente: string
  partitaIvaCliente: string
  indirizzoCliente: string
  numeroCivicoCliente: string
  capCliente: string
  comuneCliente: string
  provinciaCliente: string
  codiceDestinatario: string
  pecCliente: string

  // Dati Fattura
  numeroFattura: string
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
  clients?: Client[]
  userIvaRate?: string // Aliquota IVA dell'utente dalle impostazioni (es: '5%', '22%')
}

export default function InvoiceCreateModal({
  isOpen,
  onClose,
  onSubmit,
  title = "Crea Nuova Fattura",
  userRole = 'business',
  clients = [],
  userIvaRate
}: InvoiceCreateModalProps) {
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [errors, setErrors] = useState<Partial<Record<keyof InvoiceFormData | 'api', string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Searchable select states
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Generate automatic invoice number
  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear()
    const timestamp = Date.now().toString().slice(-6)
    return `${year}/${timestamp}`
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  // Extract numeric IVA rate from user settings (es: '5%' -> '5', '22%' -> '22')
  const getIvaRateNumber = (): string => {
    if (userRole === 'business' && userIvaRate) {
      // Remove '%' sign and return the number
      return userIvaRate.replace('%', '').trim()
    }
    // Default fallback
    return userRole === 'business' ? '0' : '22'
  }

  // Filter clients based on search query
  const filteredClients = clients.filter(client => {
    if (!searchQuery.trim()) return true

    const query = searchQuery.toLowerCase()
    const ragioneSociale = (client.ragioneSociale || client.nome || '').toLowerCase()
    const codiceFiscale = (client.codiceFiscale || '').toLowerCase()
    const partitaIva = (client.partitaIva || client.piva || '').toLowerCase()

    return ragioneSociale.includes(query) ||
           codiceFiscale.includes(query) ||
           partitaIva.includes(query)
  })

  // Get the selected client name for display
  const getSelectedClientName = (): string => {
    if (!selectedClientId) return ''
    const client = clients.find(c => String(c.id || c._id) === selectedClientId)
    if (!client) return ''
    return `${client.ragioneSociale || client.nome} - ${client.codiceFiscale}`
  }

  // Handle clear selection
  const handleClearSelection = () => {
    setSelectedClientId('')
    setSearchQuery('')
    handleClientSelect('')
  }

  const [formData, setFormData] = useState<InvoiceFormData>({
    // Dati Cliente
    cliente: '',
    email: '',
    codiceFiscaleCliente: '',
    partitaIvaCliente: '',
    indirizzoCliente: '',
    numeroCivicoCliente: '',
    capCliente: '',
    comuneCliente: '',
    provinciaCliente: '',
    codiceDestinatario: '',
    pecCliente: '',

    // Dati Fattura
    numeroFattura: generateInvoiceNumber(),
    servizio: '',
    descrizione: '',
    importo: '',
    quantita: '1',
    unitaMisura: 'NR',
    iva: getIvaRateNumber(),
    dataEmissione: new Date().toISOString().split('T')[0],
    dataScadenza: '',
    metodoPagamento: 'MP05', // Bonifico bancario
    iban: '',
    note: userRole === 'business' ? 'Operazione effettuata ai sensi dell\'art. 1, commi 54-89, della Legge n. 190/2014 – Regime forfetario. Operazione senza applicazione dell\'IVA ai sensi dell\'art. 1, comma 58, della Legge n. 190/2014.' : ''
  })

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof InvoiceFormData, string>> = {}

    // Dati Cliente
    if (!formData.cliente.trim()) {
      newErrors.cliente = 'La denominazione è obbligatoria'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email è obbligatoria'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato email non valido'
    }

    if (!formData.codiceFiscaleCliente.trim()) {
      newErrors.codiceFiscaleCliente = 'Il codice fiscale è obbligatorio'
    } else if (formData.codiceFiscaleCliente.length !== 16) {
      newErrors.codiceFiscaleCliente = `Il codice fiscale deve essere di 16 caratteri (attualmente ${formData.codiceFiscaleCliente.length})`
    }

    if (!formData.indirizzoCliente.trim()) {
      newErrors.indirizzoCliente = 'L\'indirizzo è obbligatorio'
    }

    if (!formData.numeroCivicoCliente.trim()) {
      newErrors.numeroCivicoCliente = 'Il numero civico è obbligatorio'
    }

    if (!formData.capCliente.trim()) {
      newErrors.capCliente = 'Il CAP è obbligatorio'
    } else if (!/^[0-9]{5}$/.test(formData.capCliente)) {
      newErrors.capCliente = 'Il CAP deve contenere 5 cifre'
    }

    if (!formData.comuneCliente.trim()) {
      newErrors.comuneCliente = 'Il comune è obbligatorio'
    }

    if (!formData.provinciaCliente.trim()) {
      newErrors.provinciaCliente = 'La provincia è obbligatoria'
    } else if (formData.provinciaCliente.length !== 2) {
      newErrors.provinciaCliente = 'La provincia deve essere di 2 caratteri (es. RM, MI)'
    }

    // Dati Fattura
    if (!formData.numeroFattura.trim()) {
      newErrors.numeroFattura = 'Il numero fattura è obbligatorio'
    }

    if (!formData.servizio.trim()) {
      newErrors.servizio = 'Il tipo servizio/prodotto è obbligatorio'
    }

    if (!formData.descrizione.trim()) {
      newErrors.descrizione = 'La descrizione è obbligatoria'
    }

    if (!formData.importo || parseFloat(formData.importo) <= 0) {
      newErrors.importo = 'Il prezzo unitario deve essere maggiore di zero'
    }

    if (!formData.quantita || parseFloat(formData.quantita) <= 0) {
      newErrors.quantita = 'La quantità deve essere maggiore di zero'
    }

    if (!formData.dataEmissione) {
      newErrors.dataEmissione = 'La data di emissione è obbligatoria'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return // Stop if validation fails
    }

    try {
      setIsSubmitting(true)
      await onSubmit(formData)
      handleReset()
    } catch (error: any) {
      logger.error('Error submitting invoice:', error)
      // Show API error in the banner
      setErrors({ api: error.message || 'Errore nell\'invio della fattura' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      cliente: '',
      email: '',
      codiceFiscaleCliente: '',
      partitaIvaCliente: '',
      indirizzoCliente: '',
      numeroCivicoCliente: '',
      capCliente: '',
      comuneCliente: '',
      provinciaCliente: '',
      codiceDestinatario: '',
      pecCliente: '',
      numeroFattura: generateInvoiceNumber(),
      servizio: '',
      descrizione: '',
      importo: '',
      quantita: '1',
      unitaMisura: 'NR',
      iva: getIvaRateNumber(),
      dataEmissione: new Date().toISOString().split('T')[0],
      dataScadenza: '',
      metodoPagamento: 'MP05',
      iban: '',
      note: userRole === 'business' ? 'Operazione effettuata ai sensi dell\'art. 1, commi 54-89, della Legge n. 190/2014 – Regime forfetario. Operazione senza applicazione dell\'IVA ai sensi dell\'art. 1, comma 58, della Legge n. 190/2014.' : ''
    })
    setSelectedClientId('')
    setSearchQuery('')
    setIsDropdownOpen(false)
    setErrors({})
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId)
    setIsDropdownOpen(false)
    setSearchQuery('')

    if (!clientId) {
      // Clear client fields if "Seleziona cliente" is chosen
      setFormData(prev => ({
        ...prev,
        cliente: '',
        email: '',
        codiceFiscaleCliente: '',
        partitaIvaCliente: '',
        indirizzoCliente: '',
        numeroCivicoCliente: '',
        capCliente: '',
        comuneCliente: '',
        provinciaCliente: '',
        codiceDestinatario: '',
        pecCliente: ''
      }))
      return
    }

    const selectedClient = clients.find(c => String(c.id || c._id) === clientId)
    if (selectedClient) {
      setFormData(prev => ({
        ...prev,
        cliente: selectedClient.ragioneSociale || selectedClient.nome || '',
        email: selectedClient.email || '',
        codiceFiscaleCliente: selectedClient.codiceFiscale || '',
        partitaIvaCliente: selectedClient.partitaIva || selectedClient.piva || '',
        indirizzoCliente: selectedClient.indirizzo || '',
        numeroCivicoCliente: selectedClient.numeroCivico || '',
        capCliente: selectedClient.cap || '',
        comuneCliente: selectedClient.comune || '',
        provinciaCliente: selectedClient.provincia || '',
        codiceDestinatario: selectedClient.codiceDestinatario || '0000000',
        pecCliente: selectedClient.pec || ''
      }))
    }
  }

  const updateField = (field: keyof InvoiceFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
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

          {/* Client Selector - Searchable */}
          {clients && clients.length > 0 && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white rounded-lg border-2 border-blue-300">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <label className="text-xs sm:text-sm font-medium text-gray-900">
                  Seleziona Cliente Esistente
                </label>
              </div>

              {/* Searchable Select Dropdown */}
              <div ref={dropdownRef} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={selectedClientId ? getSelectedClientName() : searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setIsDropdownOpen(true)
                      if (selectedClientId) {
                        setSelectedClientId('')
                        handleClientSelect('')
                      }
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Cerca cliente per nome, codice fiscale o P.IVA..."
                    className="w-full pl-10 pr-10 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  {selectedClientId && (
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Dropdown List */}
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredClients.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        {searchQuery ? 'Nessun cliente trovato' : 'Nessun cliente disponibile'}
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleClientSelect('')}
                          className="w-full text-left px-4 py-2 text-xs sm:text-sm text-gray-500 hover:bg-gray-50 border-b border-gray-200"
                        >
                          -- Inserisci manualmente --
                        </button>
                        {filteredClients.map((client) => (
                          <button
                            key={client.id || client._id}
                            type="button"
                            onClick={() => handleClientSelect(String(client.id || client._id || ''))}
                            className={`w-full text-left px-4 py-2 text-xs sm:text-sm hover:bg-blue-50 transition-colors ${
                              selectedClientId === String(client.id || client._id)
                                ? 'bg-blue-100 text-blue-900 font-medium'
                                : 'text-gray-900'
                            }`}
                          >
                            <div className="font-medium">{client.ragioneSociale || client.nome}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              CF: {client.codiceFiscale}
                              {(client.partitaIva || client.piva) && ` • P.IVA: ${client.partitaIva || client.piva}`}
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs text-blue-600 mt-2">
                Cerca e seleziona un cliente esistente oppure inserisci manualmente i dati. Se il cliente non esiste, verrà creato automaticamente.
              </p>
            </div>
          )}

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
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:ring-2 text-xs sm:text-sm ${
                  errors.cliente
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                }`}
              />
              {errors.cliente && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.cliente}
                </p>
              )}
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
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:ring-2 text-xs sm:text-sm ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.email}
                </p>
              )}
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 uppercase ${
                  errors.codiceFiscaleCliente
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                }`}
              />
              {errors.codiceFiscaleCliente && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.codiceFiscaleCliente}
                </p>
              )}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Indirizzo *
              </label>
              <AddressAutocomplete
                value={formData.indirizzoCliente}
                onChange={(value) => updateField('indirizzoCliente', value)}
                onAddressSelect={(address) => {
                  setFormData(prev => ({
                    ...prev,
                    indirizzoCliente: address.full,
                    numeroCivicoCliente: address.housenumber || '',
                    capCliente: address.postcode,
                    comuneCliente: address.city,
                    provinciaCliente: address.state_code || ''
                  }))
                }}
                placeholder="Via Roma"
              />
              <p className="text-xs text-gray-500 mt-1">Inizia a digitare per cercare l'indirizzo</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numero Civico *
              </label>
              <input
                type="text"
                value={formData.numeroCivicoCliente}
                onChange={(e) => updateField('numeroCivicoCliente', e.target.value)}
                placeholder="1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                  errors.numeroCivicoCliente
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                }`}
              />
              {errors.numeroCivicoCliente && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.numeroCivicoCliente}
                </p>
              )}
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                  errors.capCliente
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                }`}
              />
              {errors.capCliente && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.capCliente}
                </p>
              )}
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                  errors.comuneCliente
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                }`}
              />
              {errors.comuneCliente && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.comuneCliente}
                </p>
              )}
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 uppercase ${
                  errors.provinciaCliente
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                }`}
              />
              {errors.provinciaCliente && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.provinciaCliente}
                </p>
              )}
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                  errors.servizio
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                }`}
              />
              {errors.servizio ? (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.servizio}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Inserisci il nome del servizio o prodotto fatturato</p>
              )}
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                  errors.descrizione
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                }`}
              />
              {errors.descrizione && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.descrizione}
                </p>
              )}
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                    errors.quantita
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                  }`}
                />
                {errors.quantita && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <span className="mr-1">⚠</span> {errors.quantita}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unità di Misura *
                </label>
                <select
                  value={formData.unitaMisura}
                  onChange={(e) => updateField('unitaMisura', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 ${
                      errors.importo
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                    }`}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                </div>
                {errors.importo && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <span className="mr-1">⚠</span> {errors.importo}
                  </p>
                )}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numero Fattura *
              </label>
              <input
                type="text"
                value={formData.numeroFattura}
                onChange={(e) => updateField('numeroFattura', e.target.value)}
                placeholder="2025/123456"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                  errors.numeroFattura
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-orange-500 focus:border-transparent'
                }`}
              />
              {errors.numeroFattura ? (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.numeroFattura}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Generato automaticamente, modificabile</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Emissione *
              </label>
              <input
                type="date"
                value={formData.dataEmissione}
                onChange={(e) => updateField('dataEmissione', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                  errors.dataEmissione
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-orange-500 focus:border-transparent'
                }`}
              />
              {errors.dataEmissione && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.dataEmissione}
                </p>
              )}
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

        {/* Error Summary Banner */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold text-lg">!</span>
            </div>
            <div className="flex-1">
              <h4 className="text-red-900 font-semibold mb-1">Errori di validazione</h4>
              <p className="text-sm text-red-700">
                {Object.keys(errors).length === 1
                  ? 'C\'è 1 campo da correggere'
                  : `Ci sono ${Object.keys(errors).length} campi da correggere`}
              </p>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  {Object.entries(errors).slice(0, 5).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                  {Object.keys(errors).length > 5 && (
                    <li>... e altri {Object.keys(errors).length - 5} errori</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

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
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 hover:shadow-lg transition-all duration-200 hover:scale-105 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Salva come Bozza
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:shadow-lg transition-all duration-200 hover:scale-105 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Invio in corso...
              </span>
            ) : (
              'Crea e Invia'
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}