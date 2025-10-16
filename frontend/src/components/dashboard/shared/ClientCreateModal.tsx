import { useState, useEffect } from 'react'
import Modal from '../../common/Modal'
import { User, MapPin, Mail } from 'lucide-react'
import AddressAutocomplete from '../../common/AddressAutocomplete'

interface ClientFormData {
  // Dati anagrafici
  denominazione: string
  codiceFiscale: string
  partitaIva: string

  // Indirizzo
  indirizzo: string
  numeroCivico: string
  cap: string
  comune: string
  provincia: string
  nazione: string

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
  onSubmit: (formData: ClientFormData) => Promise<void>
  initialData?: Partial<ClientFormData>
  isEditMode?: boolean
}

export default function ClientCreateModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditMode = false
}: ClientCreateModalProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    denominazione: initialData?.denominazione || '',
    codiceFiscale: initialData?.codiceFiscale || '',
    partitaIva: initialData?.partitaIva || '',
    indirizzo: initialData?.indirizzo || '',
    numeroCivico: initialData?.numeroCivico || '',
    cap: initialData?.cap || '',
    comune: initialData?.comune || '',
    provincia: initialData?.provincia || '',
    nazione: initialData?.nazione || 'IT',
    email: initialData?.email || '',
    telefono: initialData?.telefono || '',
    pec: initialData?.pec || '',
    codiceDestinatario: initialData?.codiceDestinatario || '',
    note: initialData?.note || ''
  })

  const [errors, setErrors] = useState<Partial<Record<keyof ClientFormData, string>>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form data when initialData changes (edit mode)
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        denominazione: initialData.denominazione || '',
        codiceFiscale: initialData.codiceFiscale || '',
        partitaIva: initialData.partitaIva || '',
        indirizzo: initialData.indirizzo || '',
        numeroCivico: initialData.numeroCivico || '',
        cap: initialData.cap || '',
        comune: initialData.comune || '',
        provincia: initialData.provincia || '',
        nazione: initialData.nazione || 'IT',
        email: initialData.email || '',
        telefono: initialData.telefono || '',
        pec: initialData.pec || '',
        codiceDestinatario: initialData.codiceDestinatario || '',
        note: initialData.note || ''
      })
      setErrors({})
      setServerError(null)
    }
  }, [initialData, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ClientFormData, string>> = {}

    // Denominazione
    if (!formData.denominazione.trim()) {
      newErrors.denominazione = 'La denominazione è obbligatoria'
    }

    // Codice Fiscale
    if (!formData.codiceFiscale.trim()) {
      newErrors.codiceFiscale = 'Il codice fiscale è obbligatorio'
    } else if (formData.codiceFiscale.length !== 16) {
      newErrors.codiceFiscale = `Il codice fiscale deve essere di 16 caratteri (attualmente ${formData.codiceFiscale.length})`
    } else if (!/^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/.test(formData.codiceFiscale)) {
      newErrors.codiceFiscale = 'Formato non valido - Esempio: RSSMRA80A01H501U'
    }

    // Partita IVA (opzionale, ma se presente deve essere valida)
    if (formData.partitaIva) {
      const pivaClean = formData.partitaIva.replace(/^IT/i, '').replace(/\s/g, '')
      if (!/^[0-9]{11}$/.test(pivaClean)) {
        newErrors.partitaIva = 'La partita IVA deve contenere 11 cifre (con o senza IT)'
      }
    }

    // Indirizzo
    if (!formData.indirizzo.trim()) {
      newErrors.indirizzo = 'L\'indirizzo è obbligatorio'
    }

    // Numero Civico
    if (!formData.numeroCivico.trim()) {
      newErrors.numeroCivico = 'Il numero civico è obbligatorio'
    }

    // CAP
    if (!formData.cap.trim()) {
      newErrors.cap = 'Il CAP è obbligatorio'
    } else if (!/^[0-9]{5}$/.test(formData.cap)) {
      newErrors.cap = 'Il CAP deve contenere 5 cifre'
    }

    // Comune
    if (!formData.comune.trim()) {
      newErrors.comune = 'Il comune è obbligatorio'
    }

    // Provincia
    if (!formData.provincia.trim()) {
      newErrors.provincia = 'La provincia è obbligatoria'
    } else if (formData.provincia.length !== 2) {
      newErrors.provincia = 'La provincia deve essere di 2 caratteri (es. TO, MI, RM)'
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email è obbligatoria'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato email non valido'
    }

    // PEC (opzionale, ma se presente deve essere valida)
    if (formData.pec && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.pec)) {
      newErrors.pec = 'Formato PEC non valido'
    }

    // Codice Destinatario (opzionale, ma se presente deve essere valido)
    if (formData.codiceDestinatario && formData.codiceDestinatario.length !== 7) {
      newErrors.codiceDestinatario = 'Il codice destinatario deve essere di 7 caratteri'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous server error
    setServerError(null)

    if (!validateForm()) {
      return // Stop if validation fails
    }

    try {
      setIsSubmitting(true)
      await onSubmit(formData)
      handleReset()
    } catch (error: any) {
      // Show server error in the banner
      setServerError(error.message || 'Errore durante il salvataggio del cliente')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      denominazione: '',
      codiceFiscale: '',
      partitaIva: '',
      indirizzo: '',
      numeroCivico: '',
      cap: '',
      comune: '',
      provincia: '',
      nazione: 'IT',
      email: '',
      telefono: '',
      pec: '',
      codiceDestinatario: '',
      note: ''
    })
    setErrors({})
    setServerError(null)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const updateField = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear server error when user starts typing
    if (serverError) {
      setServerError(null)
    }
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? "Modifica Cliente" : "Nuovo Cliente"}
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Dati Anagrafici */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            Dati Anagrafici
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Denominazione/Nome Completo *
              </label>
              <input
                type="text"
                value={formData.denominazione}
                onChange={(e) => updateField('denominazione', e.target.value)}
                placeholder="Nome e Cognome / Ragione Sociale"
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:ring-2 text-xs sm:text-sm ${
                  errors.denominazione
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                }`}
              />
              {errors.denominazione && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.denominazione}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Codice Fiscale *
              </label>
              <input
                type="text"
                value={formData.codiceFiscale}
                onChange={(e) => updateField('codiceFiscale', e.target.value.toUpperCase())}
                placeholder="RSSMRA80A01H501U"
                maxLength={16}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:ring-2 uppercase text-xs sm:text-sm ${
                  errors.codiceFiscale
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                }`}
              />
              {errors.codiceFiscale && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.codiceFiscale}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Partita IVA
              </label>
              <input
                type="text"
                value={formData.partitaIva}
                onChange={(e) => updateField('partitaIva', e.target.value.toUpperCase())}
                placeholder="IT01234567890"
                maxLength={13}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                  errors.partitaIva
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                }`}
              />
              {errors.partitaIva ? (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.partitaIva}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Opzionale per privati - 11 cifre con o senza IT</p>
              )}
            </div>
          </div>
        </div>

        {/* Indirizzo */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            Indirizzo (Sede)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Indirizzo *
              </label>
              <AddressAutocomplete
                value={formData.indirizzo}
                onChange={(value) => updateField('indirizzo', value)}
                onAddressSelect={(address) => {
                  setFormData(prev => ({
                    ...prev,
                    indirizzo: address.full,
                    numeroCivico: address.housenumber || '',
                    comune: address.city,
                    cap: address.postcode,
                    provincia: address.state_code || ''
                  }))
                  // Clear errors for auto-filled fields
                  setErrors(prev => {
                    const newErrors = { ...prev }
                    delete newErrors.indirizzo
                    delete newErrors.numeroCivico
                    delete newErrors.cap
                    delete newErrors.comune
                    delete newErrors.provincia
                    return newErrors
                  })
                }}
                placeholder="Via Roma"
                error={errors.indirizzo}
              />
              {errors.indirizzo ? (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.indirizzo}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Inizia a digitare per cercare</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numero Civico *
              </label>
              <input
                type="text"
                value={formData.numeroCivico}
                onChange={(e) => updateField('numeroCivico', e.target.value)}
                placeholder="1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                  errors.numeroCivico
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                }`}
              />
              {errors.numeroCivico && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.numeroCivico}
                </p>
              )}
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                  errors.cap
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                }`}
              />
              {errors.cap && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.cap}
                </p>
              )}
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                  errors.comune
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                }`}
              />
              {errors.comune && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.comune}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provincia *
              </label>
              <input
                type="text"
                value={formData.provincia}
                onChange={(e) => updateField('provincia', e.target.value.toUpperCase())}
                placeholder="RM"
                maxLength={2}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 uppercase ${
                  errors.provincia
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                }`}
              />
              {errors.provincia && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.provincia}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nazione *
              </label>
              <select
                value={formData.nazione}
                onChange={(e) => updateField('nazione', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="IT">Italia</option>
                <option value="SM">San Marino</option>
                <option value="VA">Città del Vaticano</option>
                <option value="CH">Svizzera</option>
                <option value="FR">Francia</option>
                <option value="DE">Germania</option>
                <option value="ES">Spagna</option>
                <option value="AT">Austria</option>
                <option value="GB">Regno Unito</option>
                <option value="US">Stati Uniti</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Codice ISO a 2 lettere</p>
            </div>
          </div>
        </div>

        {/* Contatti */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-purple-500 focus:border-transparent'
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
                Telefono
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 font-medium">+39</span>
                <input
                  type="tel"
                  value={formData.telefono.replace('+39', '').replace(/^\s+/, '')}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d\s]/g, '')
                    updateField('telefono', value ? `+39 ${value}` : '')
                  }}
                  placeholder="123 456 7890"
                  className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Opzionale - numero italiano</p>
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                  errors.pec
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-purple-500 focus:border-transparent'
                }`}
              />
              {errors.pec ? (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.pec}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Per fatturazione elettronica</p>
              )}
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 uppercase ${
                  errors.codiceDestinatario
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-purple-500 focus:border-transparent'
                }`}
              />
              {errors.codiceDestinatario ? (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.codiceDestinatario}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">7 caratteri, alternativo a PEC</p>
              )}
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

        {/* Error Summary Banner */}
        {(Object.keys(errors).length > 0 || serverError) && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold text-lg">!</span>
            </div>
            <div className="flex-1">
              {serverError ? (
                <>
                  <h4 className="text-red-900 font-semibold mb-1">Errore dal server</h4>
                  <p className="text-sm text-red-700">{serverError}</p>
                </>
              ) : (
                <>
                  <h4 className="text-red-900 font-semibold mb-1">Errore: ricontrolla i campi e riprova</h4>
                  <p className="text-sm text-red-700">
                    {Object.keys(errors).length === 1
                      ? 'C\'è 1 campo da correggere'
                      : `Ci sono ${Object.keys(errors).length} campi da correggere`}
                  </p>
                </>
              )}
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
                {isEditMode ? "Salvataggio..." : "Creazione..."}
              </span>
            ) : (
              isEditMode ? "Salva Modifiche" : "Crea Cliente"
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}
