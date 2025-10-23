import { Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import AddressAutocomplete from '../../../common/AddressAutocomplete'
import ATECOAutocomplete from '../../../common/ATECOAutocomplete'
import { useFormValidation } from './hooks/useFormValidation'

interface ProfileData {
  nome: string
  cognome: string
  email: string
  telefono?: string
  codiceFiscale?: string
  indirizzo?: string
  citta?: string
  cap?: string
  professione?: string
  settoreAttivita?: string
  company?: string
  partitaIva?: string
  codiceAteco?: string
  regimeFiscale?: string
  aliquotaIva?: string
  ruolo?: string
  bio?: string
  ordineIscrizione?: string
}

interface SettingsProfileProps {
  profileData: ProfileData
  onUpdate: (data: ProfileData) => void
  loading?: boolean
  showBusinessFields?: boolean
  showProfessionalFields?: boolean
}

export default function SettingsProfile({
  profileData: initialData,
  onUpdate,
  loading = false,
  showBusinessFields = false,
  showProfessionalFields = false
}: SettingsProfileProps) {
  const [profileData, setProfileData] = useState<ProfileData>(initialData)
  const {
    validationErrors,
    validateEmail,
    validatePhone,
    validateFiscalCode,
    validatePIVA,
    validateCAP,
    validateCodiceATECO,
    setErrors,
    clearError
  } = useFormValidation()

  // Sync with external profileData changes
  useEffect(() => {
    setProfileData(initialData)
  }, [initialData])

  // Format fiscal code (add spaces for readability)
  const formatFiscalCode = (cf: string): string => {
    const cleaned = cf.toUpperCase().replace(/\s/g, '')
    if (cleaned.length === 16) {
      return `${cleaned.slice(0, 6)} ${cleaned.slice(6, 11)} ${cleaned.slice(11)}`
    }
    return cleaned
  }

  // Format PIVA (add IT prefix if missing)
  const formatPIVA = (piva: string): string => {
    const cleaned = piva.replace(/\s/g, '').toUpperCase()
    if (cleaned.length === 11 && !cleaned.startsWith('IT')) {
      return `IT${cleaned}`
    }
    return cleaned
  }

  const validateProfile = (): boolean => {
    const errors: {[key: string]: string} = {}

    if (!profileData.nome?.trim()) {
      errors.nome = 'Il nome è obbligatorio'
    }

    if (!profileData.cognome?.trim()) {
      errors.cognome = 'Il cognome è obbligatorio'
    }

    if (!profileData.email?.trim()) {
      errors.email = 'L\'email è obbligatoria'
    } else if (!validateEmail(profileData.email)) {
      errors.email = 'Email non valida'
    }

    if (profileData.telefono && !validatePhone(profileData.telefono)) {
      errors.telefono = 'Numero di telefono non valido (formato: +39 XXX XXX XXXX o XXX XXX XXXX)'
    }

    if (profileData.codiceFiscale && !validateFiscalCode(profileData.codiceFiscale)) {
      errors.codiceFiscale = 'Codice fiscale non valido. Formato richiesto: 6 lettere, 2 cifre, 1 lettera, 2 cifre, 1 lettera, 3 cifre, 1 lettera (es: RSSMRA85M01H501Z)'
    }

    if (profileData.cap && !validateCAP(profileData.cap)) {
      errors.cap = 'CAP non valido (5 cifre)'
    }

    if (profileData.partitaIva && !validatePIVA(profileData.partitaIva)) {
      errors.partitaIva = 'Partita IVA non valida (11 cifre)'
    }

    if (profileData.codiceAteco && !validateCodiceATECO(profileData.codiceAteco)) {
      errors.codiceAteco = 'Codice ATECO non valido (formato: XX.XX.XX)'
    }

    setErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = () => {
    if (validateProfile()) {
      onUpdate(profileData)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Informazioni Personali</h3>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome *
          </label>
          <input
            type="text"
            value={profileData.nome || ''}
            onChange={(e) => {
              setProfileData(prev => ({ ...prev, nome: e.target.value }))
              if (validationErrors.nome) clearError('nome')
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              validationErrors.nome ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.nome ? (
            <p className="text-sm text-red-600 mt-1">{validationErrors.nome}</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">Il tuo nome</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cognome *
          </label>
          <input
            type="text"
            value={profileData.cognome || ''}
            onChange={(e) => {
              setProfileData(prev => ({ ...prev, cognome: e.target.value }))
              if (validationErrors.cognome) clearError('cognome')
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              validationErrors.cognome ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.cognome ? (
            <p className="text-sm text-red-600 mt-1">{validationErrors.cognome}</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">Il tuo cognome</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={profileData.email || ''}
            onChange={(e) => {
              setProfileData(prev => ({ ...prev, email: e.target.value }))
              if (validationErrors.email) clearError('email')
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              validationErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.email ? (
            <p className="text-sm text-red-600 mt-1">{validationErrors.email}</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">Email per accedere alla piattaforma</p>
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
              value={profileData.telefono?.replace('+39', '').replace(/^\s+/, '') || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d\s]/g, '')
                setProfileData(prev => ({ ...prev, telefono: `+39 ${value}` }))
                if (validationErrors.telefono) clearError('telefono')
              }}
              placeholder="XXX XXX XXXX"
              className={`w-full pl-12 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                validationErrors.telefono ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {validationErrors.telefono ? (
            <p className="text-sm text-red-600 mt-1">{validationErrors.telefono}</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">Numero di telefono italiano (10 cifre)</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Codice Fiscale
          </label>
          <input
            type="text"
            value={profileData.codiceFiscale || ''}
            onChange={(e) => {
              setProfileData(prev => ({ ...prev, codiceFiscale: e.target.value.toUpperCase() }))
              if (validationErrors.codiceFiscale) clearError('codiceFiscale')
            }}
            onBlur={(e) => {
              if (e.target.value) {
                setProfileData(prev => ({ ...prev, codiceFiscale: formatFiscalCode(e.target.value) }))
              }
            }}
            maxLength={16}
            placeholder="RSSMRA85M01H501Z"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              validationErrors.codiceFiscale ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.codiceFiscale ? (
            <p className="text-sm text-red-600 mt-1">{validationErrors.codiceFiscale}</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">Codice fiscale italiano di 16 caratteri</p>
          )}
        </div>

        {showBusinessFields && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Settore di Attività
            </label>
            <input
              type="text"
              value={profileData.settoreAttivita || ''}
              onChange={(e) => setProfileData(prev => ({ ...prev, settoreAttivita: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Il settore economico in cui operi (es: Servizi informatici, Consulenza fiscale)</p>
          </div>
        )}

        {showProfessionalFields && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ruolo Professionale
              </label>
              <input
                type="text"
                value={profileData.ruolo || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, ruolo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Il tuo ruolo professionale</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numero Iscrizione Ordine
              </label>
              <input
                type="text"
                value={profileData.ordineIscrizione || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, ordineIscrizione: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Numero iscrizione all'albo professionale</p>
            </div>
          </>
        )}
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Indirizzo Completo
        </label>
        <AddressAutocomplete
          value={profileData.indirizzo || ''}
          onChange={(value) => setProfileData(prev => ({ ...prev, indirizzo: value }))}
          onAddressSelect={(address) => {
            setProfileData(prev => ({
              ...prev,
              indirizzo: address.full,
              citta: address.city,
              cap: address.postcode
            }))
          }}
          placeholder="Inizia a digitare l'indirizzo (es. Via Milano 45, Milano)..."
        />
        <p className="text-xs text-gray-500 mt-1">L'indirizzo completo include via, CAP, città, provincia e paese</p>
      </div>

      {showProfessionalFields && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={profileData.bio || ''}
            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Descrivi brevemente la tua esperienza professionale..."
          />
          <p className="text-xs text-gray-500 mt-1">Una breve descrizione della tua esperienza</p>
        </div>
      )}

      {/* Business Information */}
      {showBusinessFields && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-4">Informazioni Aziendali</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ragione Sociale / Nome Azienda
              </label>
              <input
                type="text"
                value={profileData.company || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Nome azienda o tuo nome"
              />
              <p className="text-xs text-gray-500 mt-1">Nome della tua azienda o il tuo nome se lavori in proprio</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Partita IVA
              </label>
              <input
                type="text"
                value={profileData.partitaIva || ''}
                onChange={(e) => {
                  setProfileData(prev => ({ ...prev, partitaIva: e.target.value.toUpperCase() }))
                  if (validationErrors.partitaIva) clearError('partitaIva')
                }}
                onBlur={(e) => {
                  if (e.target.value) {
                    setProfileData(prev => ({ ...prev, partitaIva: formatPIVA(e.target.value) }))
                  }
                }}
                maxLength={13}
                placeholder="IT12345678901"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  validationErrors.partitaIva ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.partitaIva ? (
                <p className="text-sm text-red-600 mt-1">{validationErrors.partitaIva}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Partita IVA italiana (11 cifre con prefisso IT)</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Codice ATECO
              </label>
              <ATECOAutocomplete
                value={profileData.codiceAteco || ''}
                onChange={(value) => {
                  setProfileData(prev => ({ ...prev, codiceAteco: value }))
                  if (validationErrors.codiceAteco) clearError('codiceAteco')
                }}
                placeholder="Cerca codice ATECO..."
              />
              {validationErrors.codiceAteco ? (
                <p className="text-sm text-red-600 mt-1">{validationErrors.codiceAteco}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Codice ATECO della tua attività (formato: XX.XX.XX)</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regime Fiscale
              </label>
              <select
                value={profileData.regimeFiscale || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, regimeFiscale: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Seleziona regime</option>
                <option value="Forfettario">Regime Forfettario</option>
                <option value="Ordinario">Regime Ordinario</option>
                <option value="Semplificato">Regime Semplificato</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Il regime fiscale della tua attività</p>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Salvataggio...' : 'Salva Modifiche'}
        </button>
      </div>
    </div>
  )
}
