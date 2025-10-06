import React, { useState } from 'react'
import { FileText, AlertCircle } from 'lucide-react'

interface PivaRequestFormProps {
  onSubmit: (data: PivaRequestData) => Promise<void>
  onCancel?: () => void
  userName?: string
}

export interface PivaRequestData {
  hasExistingPiva: boolean
  existingPivaNumber?: string
  firstName: string
  lastName: string
  dateOfBirth: string
  placeOfBirth: string
  fiscalCode: string
  residenceAddress: string
  residenceCity: string
  residenceCAP: string
  residenceProvince: string
  businessActivity: string
  codiceAteco: string
  businessName?: string
  businessAddress?: string
  businessCity?: string
  businessCAP?: string
  businessProvince?: string
  expectedRevenue: number
  hasOtherIncome: boolean
  otherIncomeDetails?: string
  hasIdentityDocument: boolean
  hasFiscalCode: boolean
  additionalNotes?: string
}

export default function PivaRequestForm({ onSubmit, onCancel, userName }: PivaRequestFormProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Precompila firstName e lastName dal userName se disponibile
  const getInitialNames = () => {
    if (userName) {
      const parts = userName.trim().split(' ')
      if (parts.length >= 2) {
        return {
          firstName: parts[0],
          lastName: parts.slice(1).join(' ')
        }
      } else if (parts.length === 1) {
        return {
          firstName: parts[0],
          lastName: ''
        }
      }
    }
    return { firstName: '', lastName: '' }
  }

  const initialNames = getInitialNames()

  const [formData, setFormData] = useState<PivaRequestData>({
    hasExistingPiva: false,
    existingPivaNumber: '',
    firstName: initialNames.firstName,
    lastName: initialNames.lastName,
    dateOfBirth: '',
    placeOfBirth: '',
    fiscalCode: '',
    residenceAddress: '',
    residenceCity: '',
    residenceCAP: '',
    residenceProvince: '',
    businessActivity: '',
    codiceAteco: '',
    businessName: '',
    businessAddress: '',
    businessCity: '',
    businessCAP: '',
    businessProvince: '',
    expectedRevenue: 0,
    hasOtherIncome: false,
    otherIncomeDetails: '',
    hasIdentityDocument: false,
    hasFiscalCode: false,
    additionalNotes: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const validateStep = (stepNumber: number): boolean => {
    setError('')

    switch (stepNumber) {
      case 1:
        // Step 1: Domanda iniziale sulla P.IVA esistente
        if (formData.hasExistingPiva && !formData.existingPivaNumber) {
          setError('Inserisci il numero di Partita IVA')
          return false
        }
        break
      case 2:
        if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.placeOfBirth || !formData.fiscalCode) {
          setError('Compila tutti i campi obbligatori')
          return false
        }
        break
      case 3:
        if (!formData.residenceAddress || !formData.residenceCity || !formData.residenceCAP || !formData.residenceProvince) {
          setError('Compila tutti i campi di residenza')
          return false
        }
        break
      case 4:
        if (!formData.businessActivity || !formData.codiceAteco) {
          setError('Specifica l\'attività che vuoi svolgere')
          return false
        }
        break
      case 5:
        if (formData.expectedRevenue <= 0) {
          setError('Inserisci un fatturato previsto valido')
          return false
        }
        break
      case 6:
        if (!formData.hasExistingPiva) {
          // Solo per chi NON ha P.IVA, chiediamo i documenti
          if (!formData.hasIdentityDocument || !formData.hasFiscalCode) {
            setError('Devi confermare di avere i documenti necessari')
            return false
          }
        }
        break
    }

    return true
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handlePrev = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep(step)) return

    setLoading(true)
    setError('')

    try {
      await onSubmit(formData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante l\'invio della richiesta'
      setError(errorMessage)
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Partita IVA</h3>
            <p className="text-gray-600">Prima di procedere, vogliamo sapere se hai già una Partita IVA</p>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasExistingPiva"
                    checked={!formData.hasExistingPiva}
                    onChange={() => setFormData(prev => ({ ...prev, hasExistingPiva: false, existingPivaNumber: '' }))}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-gray-700">No, devo aprirne una</span>
                </label>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasExistingPiva"
                    checked={formData.hasExistingPiva}
                    onChange={() => setFormData(prev => ({ ...prev, hasExistingPiva: true }))}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-gray-700">Sì, ho già una Partita IVA</span>
                </label>
              </div>

              {formData.hasExistingPiva && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numero Partita IVA *
                  </label>
                  <input
                    type="text"
                    name="existingPivaNumber"
                    value={formData.existingPivaNumber || ''}
                    onChange={handleChange}
                    placeholder="IT12345678901"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    maxLength={13}
                  />
                  <p className="text-xs text-gray-500 mt-1">Inserisci la tua Partita IVA (11 cifre precedute da IT)</p>
                </div>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Dati Anagrafici</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data di Nascita *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Luogo di Nascita *</label>
                <input
                  type="text"
                  name="placeOfBirth"
                  value={formData.placeOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Codice Fiscale *</label>
              <input
                type="text"
                name="fiscalCode"
                value={formData.fiscalCode}
                onChange={handleChange}
                maxLength={16}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 uppercase"
                required
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Residenza</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo *</label>
              <input
                type="text"
                name="residenceAddress"
                value={formData.residenceAddress}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Città *</label>
                <input
                  type="text"
                  name="residenceCity"
                  value={formData.residenceCity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CAP *</label>
                <input
                  type="text"
                  name="residenceCAP"
                  value={formData.residenceCAP}
                  onChange={handleChange}
                  maxLength={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provincia *</label>
              <input
                type="text"
                name="residenceProvince"
                value={formData.residenceProvince}
                onChange={handleChange}
                maxLength={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 uppercase"
                placeholder="Es: RM, MI, TO..."
                required
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Attività</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione Attività *</label>
              <textarea
                name="businessActivity"
                value={formData.businessActivity}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Descrivi l'attività che intendi svolgere..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Codice ATECO *</label>
              <input
                type="text"
                name="codiceAteco"
                value={formData.codiceAteco}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Es: 62.01.00"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Se non conosci il codice ATECO, il consulente ti aiuterà a trovarlo
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome dell'attività (opzionale)</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Se hai già scelto un nome..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo sede (opzionale)</label>
              <input
                type="text"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Città sede</label>
                <input
                  type="text"
                  name="businessCity"
                  value={formData.businessCity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CAP</label>
                <input
                  type="text"
                  name="businessCAP"
                  value={formData.businessCAP}
                  onChange={handleChange}
                  maxLength={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provincia sede</label>
              <input
                type="text"
                name="businessProvince"
                value={formData.businessProvince}
                onChange={handleChange}
                maxLength={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 uppercase"
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informazioni Fiscali</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fatturato Annuo Previsto (€) *</label>
              <input
                type="number"
                name="expectedRevenue"
                value={formData.expectedRevenue}
                onChange={handleChange}
                min="0"
                step="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Es: 25000"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Per il regime forfettario il limite è di €85.000
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="hasOtherIncome"
                  checked={formData.hasOtherIncome}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Ho altri redditi</span>
              </label>

              {formData.hasOtherIncome && (
                <textarea
                  name="otherIncomeDetails"
                  value={formData.otherIncomeDetails}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Specifica quali altri redditi percepisci..."
                />
              )}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {formData.hasExistingPiva ? 'Note Aggiuntive' : 'Documenti e Note'}
            </h3>

            {!formData.hasExistingPiva && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 mb-3">Conferma di essere in possesso dei seguenti documenti:</p>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="hasIdentityDocument"
                    checked={formData.hasIdentityDocument}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    required
                  />
                  <span className="text-sm text-gray-700">Documento d'identità valido *</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="hasFiscalCode"
                    checked={formData.hasFiscalCode}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    required
                  />
                  <span className="text-sm text-gray-700">Codice fiscale *</span>
                </label>
              </div>
            </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note aggiuntive (opzionale)</label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Aggiungi qualsiasi informazione che ritieni utile..."
              />
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                {formData.hasExistingPiva
                  ? 'Un nostro consulente esaminerà i tuoi dati e ti contatterà entro 24-48 ore.'
                  : 'Un nostro consulente esaminerà la tua richiesta e ti contatterà entro 24-48 ore per procedere con l\'apertura della Partita IVA.'}
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-primary-100 p-3 rounded-full">
            <FileText className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Richiesta Apertura P.IVA
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Compila il questionario per richiedere l'apertura della Partita IVA
        </p>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                  s <= step
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all duration-300"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {renderStep()}

          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Indietro
              </button>
            ) : onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Torna al Login
              </button>
            ) : null}

            {step < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="ml-auto px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                disabled={loading}
              >
                Avanti
              </button>
            ) : (
              <button
                type="submit"
                className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Invio in corso...' : 'Invia Richiesta'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
