import { Phone, MessageSquare, FileText, Clock, User, Building } from 'lucide-react'
import { useState } from 'react'
import Modal from '../../common/Modal'
import apiService from '../../../services/api'
import chatService from '../../../services/chat'
import { useToast } from '../../../context/ToastContext'
import ATECOAutocomplete from '../../common/ATECOAutocomplete'
import AddressAutocomplete from '../../common/AddressAutocomplete'
import type { User as UserType, ActivityLog } from '../../../types'

interface ClientDetailModalProps {
  client: UserType | null
  isOpen: boolean
  onClose: () => void
  onClientUpdated?: () => void
  onChatClick?: () => void
  onStartConsultation?: (conversationId: string) => void
  showEditButton?: boolean
}

export default function ClientDetailModal({
  client,
  isOpen,
  onClose,
  onClientUpdated,
  onChatClick,
  onStartConsultation,
  showEditButton = true
}: ClientDetailModalProps) {
  const { showToast } = useToast()
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedClient, setEditedClient] = useState<UserType | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isStartingConsultation, setIsStartingConsultation] = useState(false)

  const formatDate = (date: string | Date) => {
    if (!date) return 'Non impostata'
    const d = new Date(date)
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const handleEditClick = () => {
    setIsEditMode(true)
    if (client) {
      setEditedClient({ ...client } as UserType)
    }
    setValidationErrors({})
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setEditedClient(null)
    setValidationErrors({})
  }

  const validateFields = () => {
    const errors: Record<string, string> = {}

    if (!editedClient) return false

    if (editedClient.codiceFiscale && !/^[A-Z0-9]{16}$/i.test(editedClient.codiceFiscale)) {
      errors.codiceFiscale = 'Il codice fiscale deve essere di 16 caratteri alfanumerici'
    }

    if (editedClient.piva && editedClient.piva !== 'Non disponibile' && !/^\d{11}$/.test(editedClient.piva)) {
      errors.piva = 'La P.IVA deve essere di 11 cifre numeriche'
    }

    if (editedClient.codiceAteco && !/^\d{2}\.\d{2}\.\d{2}$/.test(editedClient.codiceAteco)) {
      errors.codiceAteco = 'Il codice ATECO deve essere nel formato XX.XX.XX'
    }

    if (editedClient.indirizzo && editedClient.indirizzo.trim().length < 5) {
      errors.indirizzo = "L'indirizzo deve contenere almeno 5 caratteri"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveEdit = async () => {
    if (!validateFields() || !editedClient) {
      return
    }

    try {
      await apiService.updateClient(editedClient.id, {
        name: editedClient.nome,
        email: editedClient.email,
        phone: editedClient.telefono,
        company: editedClient.company,
        piva: editedClient.piva,
        codiceAteco: editedClient.codiceAteco,
        regimeContabile: editedClient.regimeContabile,
        aliquotaIva: editedClient.aliquotaIva,
        fiscalCode: editedClient.codiceFiscale,
        address: editedClient.indirizzo,
        status: editedClient.status,
        note: editedClient.note
      })

      setIsEditMode(false)
      setEditedClient(null)
      setValidationErrors({})
      showToast('Cliente aggiornato con successo', 'success')

      if (onClientUpdated) {
        onClientUpdated()
      }
    } catch (error) {
      console.error('Error updating client:', error)
      const errorMessage = error instanceof Error ? error.message : 'Errore durante l\'aggiornamento del cliente'
      showToast(errorMessage, 'error')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (!editedClient) return
    setEditedClient({ ...editedClient, [field]: value })
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' })
    }
  }

  const handleStartConsultation = async () => {
    if (!client) return

    try {
      setIsStartingConsultation(true)

      // Create a new conversation with this client
      const conversation = await chatService.createConversation({
        argomento: `Consulenza per ${client.nome}`,
        tipo: 'consulenza',
        adminUserId: client.id
      })

      showToast('Nuova consulenza avviata con successo', 'success')

      // Close modal and navigate to consultation
      onClose()

      if (onStartConsultation) {
        onStartConsultation(conversation._id)
      }
    } catch (error) {
      console.error('Error starting consultation:', error)
      const errorMessage = error instanceof Error ? error.message : 'Errore nell\'avvio della consulenza'
      showToast(errorMessage, 'error')
    } finally {
      setIsStartingConsultation(false)
    }
  }

  if (!client) return null

  const displayClient = isEditMode ? editedClient : client

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose()
        setIsEditMode(false)
        setEditedClient(null)
        setValidationErrors({})
      }}
      title={`Dettagli Cliente - ${client.nome}`}
      maxWidth="6xl"
    >
      <div className="space-y-6">
        {/* Header with Client Info */}
        <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 sm:p-6 lg:p-8 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold truncate">{client.nome}</h2>
                  <p className="text-blue-100 mt-1 text-sm sm:text-base truncate">{client.email}</p>
                  {client.telefono && (
                    <p className="text-blue-100 text-xs sm:text-sm mt-0.5">+39 {client.telefono}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end space-y-2 w-full sm:w-auto">
                <span className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-xl ${
                  client.status === 'active'
                    ? 'bg-green-500/20 text-green-100 border border-green-400/30'
                    : client.status === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-100 border border-yellow-400/30'
                    : 'bg-red-500/20 text-red-100 border border-red-400/30'
                }`}>
                  <span className="ml-2">{client.status === 'active' ? 'Attivo' : client.status === 'pending' ? 'In Attesa' : 'Inattivo'}</span>
                </span>
                <div className="text-xs sm:text-sm text-blue-100">
                  <span>Cliente dal: {client.dataRegistrazione ? formatDate(client.dataRegistrazione) : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                <p className="text-blue-200 text-xs sm:text-sm">Consulenze</p>
                <p className="text-white font-semibold mt-1 text-sm sm:text-base">{client.consulenze || 0}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                <p className="text-blue-200 text-xs sm:text-sm">Fatturato Anno</p>
                <p className="text-white font-semibold mt-1 text-sm sm:text-base">€ {(client.fatturato || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                <p className="text-blue-200 text-xs sm:text-sm">Documenti</p>
                <p className="text-white font-semibold mt-1 text-sm sm:text-base">{client.documentiForniti || 0}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                <p className="text-blue-200 text-xs sm:text-sm">Richieste Aperte</p>
                <p className="text-white font-semibold mt-1 text-sm sm:text-base">{client.pendingRequests || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Dati Personali Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4 sm:mb-5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900">Dati Personali</h4>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Codice Fiscale</label>
                {isEditMode ? (
                  <div>
                    <input
                      type="text"
                      value={editedClient?.codiceFiscale || ''}
                      onChange={(e) => handleInputChange('codiceFiscale', e.target.value.toUpperCase())}
                      className={`mt-1 w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs sm:text-sm ${
                        validationErrors.codiceFiscale ? 'border-red-500' : 'border-gray-300'
                      }`}
                      maxLength={16}
                    />
                    {validationErrors.codiceFiscale && (
                      <p className="mt-1 text-xs text-red-600">{validationErrors.codiceFiscale}</p>
                    )}
                  </div>
                ) : (
                  <p className="mt-1 text-xs sm:text-sm font-medium text-gray-900">{displayClient?.codiceFiscale || 'Non disponibile'}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Indirizzo</label>
                {isEditMode ? (
                  <div className="mt-1">
                    <AddressAutocomplete
                      value={editedClient?.indirizzo || ''}
                      onChange={(value) => handleInputChange('indirizzo', value)}
                      onAddressSelect={(address) => {
                        if (editedClient) {
                          setEditedClient({
                            ...editedClient,
                            indirizzo: address.full
                          })
                        }
                      }}
                      placeholder="Inizia a digitare l'indirizzo..."
                    />
                    {validationErrors.indirizzo && (
                      <p className="mt-1 text-xs text-red-600">{validationErrors.indirizzo}</p>
                    )}
                  </div>
                ) : (
                  <p className="mt-1 text-xs sm:text-sm font-medium text-gray-900">{displayClient?.indirizzo || 'Non disponibile'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dati Aziendali Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4 sm:mb-5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900">Dati Aziendali</h4>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">P.IVA</label>
                  {isEditMode ? (
                    <div>
                      <input
                        type="text"
                        value={editedClient?.piva || ''}
                        onChange={(e) => handleInputChange('piva', e.target.value.replace(/\D/g, ''))}
                        className={`mt-1 w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs sm:text-sm ${
                          validationErrors.piva ? 'border-red-500' : 'border-gray-300'
                        }`}
                        maxLength={11}
                        placeholder="11 cifre"
                      />
                      {validationErrors.piva && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors.piva}</p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-xs sm:text-sm font-medium text-gray-900">{displayClient?.piva || 'Non disponibile'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Codice ATECO</label>
                  {isEditMode ? (
                    <div className="mt-1">
                      <ATECOAutocomplete
                        value={editedClient?.codiceAteco || ''}
                        onChange={(value) => {
                          handleInputChange('codiceAteco', value)
                        }}
                        error={validationErrors.codiceAteco}
                        placeholder="Cerca per codice o descrizione"
                      />
                      {validationErrors.codiceAteco && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors.codiceAteco}</p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-xs sm:text-sm font-medium text-gray-900">{displayClient?.codiceAteco || 'N/A'}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Regime Contabile</label>
                  {isEditMode ? (
                    <select
                      value={editedClient?.regimeContabile || 'Forfettario'}
                      onChange={(e) => handleInputChange('regimeContabile', e.target.value)}
                      className="mt-1 w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs sm:text-sm"
                    >
                      <option value="Forfettario">Forfettario</option>
                      <option value="Ordinario">Ordinario</option>
                      <option value="Semplificato">Semplificato</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-xs sm:text-sm font-medium text-gray-900">{displayClient?.regimeContabile || 'Forfettario'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Aliquota IVA</label>
                  {isEditMode ? (
                    <select
                      value={editedClient?.aliquotaIva || '5%'}
                      onChange={(e) => handleInputChange('aliquotaIva', e.target.value)}
                      className="mt-1 w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs sm:text-sm"
                    >
                      <option value="">Seleziona aliquota</option>
                      <option value="0%">0% - Esente</option>
                      <option value="4%">4% - Ridotta (alimentari, libri)</option>
                      <option value="5%">5% - Forfettario</option>
                      <option value="10%">10% - Ridotta (turismo, edilizia)</option>
                      <option value="22%">22% - Ordinaria</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-xs sm:text-sm font-medium text-gray-900">{displayClient?.aliquotaIva || '5%'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stato Fiscale Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4 sm:mb-5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900">Stato Fiscale</h4>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">{client.fatturePagate || 0}</p>
                  <p className="text-xs text-green-700">Fatture Pagate</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-lg font-bold text-yellow-600">{client.fattureInAttesa || 0}</p>
                  <p className="text-xs text-yellow-700">In Attesa</p>
                </div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <label className="text-xs font-medium text-red-700 uppercase tracking-wider">Prossima Scadenza Tasse</label>
                <p className="mt-1 text-sm font-bold text-red-800">{client.prossimaTasse ? formatDate(client.prossimaTasse) : 'Non impostata'}</p>
              </div>
            </div>
          </div>

          {/* Attività Recenti Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4 sm:mb-5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900">Attività Recenti</h4>
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {(client.attivitaRecenti && client.attivitaRecenti.length > 0) ? (
                client.attivitaRecenti.slice(0, 3).map((attivita: ActivityLog, index: number) => (
                  <div key={index} className="border-l-2 border-orange-200 pl-3 pb-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{attivita.action}</p>
                      <span className="text-xs text-gray-500">{formatDate(attivita.date)}</span>
                    </div>
                    <p className="text-xs text-gray-600">{attivita.detail}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Nessuna attività recente</p>
              )}
            </div>
          </div>
        </div>

        {/* Note Section */}
        {client.note && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="h-5 w-5 text-amber-600" />
              <h4 className="font-semibold text-gray-900">Note del Consulente</h4>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{client.note}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center pt-6 border-t border-gray-200 gap-4">
          {!isEditMode ? (
            <>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button className="px-4 py-2 border border-primary-200 text-primary-600 rounded-xl hover:bg-primary-50 transition-all text-sm sm:text-base">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 inline mr-2 flex-shrink-0" />
                  Chiama
                </button>
                {onChatClick && (
                  <button onClick={onChatClick} className="px-4 py-2 border border-green-200 text-green-600 rounded-xl hover:bg-green-50 transition-all text-sm sm:text-base">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 inline mr-2 flex-shrink-0" />
                    Messaggio
                  </button>
                )}
                <button className="px-4 py-2 border border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 transition-all text-sm sm:text-base">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 inline mr-2 flex-shrink-0" />
                  Fattura
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {showEditButton && (
                  <button onClick={handleEditClick} className="px-4 sm:px-6 py-2 sm:py-2.5 border border-primary-600 text-primary-600 font-medium rounded-xl hover:bg-primary-50 transition-all text-sm sm:text-base">
                    Modifica Cliente
                  </button>
                )}
                <button
                  onClick={handleStartConsultation}
                  disabled={isStartingConsultation}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isStartingConsultation ? 'Avvio in corso...' : 'Avvia Consulenza'}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 w-full">
              <button onClick={handleCancelEdit} className="px-4 sm:px-6 py-2 sm:py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all text-sm sm:text-base">
                Annulla
              </button>
              <button onClick={handleSaveEdit} className="px-4 sm:px-6 py-2 sm:py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-all shadow-sm hover:shadow-md text-sm sm:text-base">
                Salva Modifiche
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
