import { FileText, CheckCircle, AlertCircle, User, Briefcase, Eye, Calendar, Clock, Phone } from 'lucide-react'
import { useState } from 'react'
import Modal from '../../../common/Modal'

interface AperturaPivaProps {
  onNavigateToDocuments?: (tab: string) => void
}

interface PivaRequest {
  id: string
  status: string
  date: string
  consultant: string
  datiPersonali: {
    nome: string
    cognome: string
    email: string
    telefono: string
    codiceFiscale: string
    indirizzo: string
    citta: string
    cap: string
  }
  datiAttivita: {
    attivita: string
    codiceAteco: string
    descrizioneAteco: string
    fatturatoPrevisto: string
    regimeFiscale: string
  }
  timeline: Array<{
    data: string
    evento: string
    status: string
    note: string
  }>
  note: string
  costoServizio: string
  tempiPrevisti: string
  documentiRichiesti: string[]
  partitaIvaAssegnata?: string
  dataAttivazione?: string
}

export default function AperturaPiva({ onNavigateToDocuments }: AperturaPivaProps) {
  const [step, setStep] = useState(1)
  const [selectedRequest, setSelectedRequest] = useState<PivaRequest | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    codiceFiscale: '',
    indirizzo: '',
    citta: '',
    cap: '',
    attivita: '',
    codiceAteco: '',
    fatturatoPrevisto: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const steps = [
    { id: 1, title: 'Dati Personali', icon: User, status: step > 1 ? 'completed' : step === 1 ? 'active' : 'pending' },
    { id: 2, title: 'Attività', icon: Briefcase, status: step > 2 ? 'completed' : step === 2 ? 'active' : 'pending' },
    { id: 3, title: 'Revisione', icon: FileText, status: step > 3 ? 'completed' : step === 3 ? 'active' : 'pending' },
    { id: 4, title: 'Invio', icon: CheckCircle, status: step === 4 ? 'active' : 'pending' }
  ]

  const currentRequests = [
    {
      id: '#REQ-2024-001',
      status: 'In elaborazione',
      date: '15/01/2024',
      consultant: 'Dr. Mario Bianchi',
      datiPersonali: {
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'mario.rossi@gmail.com',
        telefono: '+39 338 987 6543',
        codiceFiscale: 'RSSMRA85M15F205Z',
        indirizzo: 'Via Milano 45',
        citta: 'Milano',
        cap: '20121'
      },
      datiAttivita: {
        attivita: 'Consulenza informatica e sviluppo software',
        codiceAteco: '62.02.00',
        descrizioneAteco: 'Consulenza nel settore delle tecnologie dell\'informatica',
        fatturatoPrevisto: '25000-50000',
        regimeFiscale: 'Forfettario'
      },
      timeline: [
        { data: '15/01/2024', evento: 'Richiesta inviata', status: 'completed', note: 'Richiesta di apertura P.IVA forfettaria inviata al consulente' },
        { data: '16/01/2024', evento: 'Documenti ricevuti', status: 'completed', note: 'Il consulente ha ricevuto tutta la documentazione necessaria' },
        { data: '17/01/2024', evento: 'Verifica in corso', status: 'active', note: 'Verifica dei dati e preparazione documentazione per Agenzia delle Entrate' },
        { data: '20/01/2024', evento: 'Invio ad Agenzia Entrate', status: 'pending', note: 'Invio della richiesta all\'Agenzia delle Entrate' },
        { data: '25/01/2024', evento: 'Completamento', status: 'pending', note: 'Ricezione P.IVA e completamento pratica' }
      ],
      note: 'Richiesta di apertura P.IVA in regime forfettario per attività di consulenza informatica. Documentazione completa ricevuta.',
      costoServizio: '€ 250,00',
      tempiPrevisti: '7-10 giorni lavorativi',
      documentiRichiesti: [
        'Copia documento identità',
        'Copia codice fiscale',
        'Visura camerale (se esistente)',
        'Autocertificazione attività'
      ]
    },
    {
      id: '#REQ-2024-002',
      status: 'Completata',
      date: '10/01/2024',
      consultant: 'Dr. Laura Rossi',
      datiPersonali: {
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'mario.rossi@gmail.com',
        telefono: '+39 338 987 6543',
        codiceFiscale: 'RSSMRA85M15F205Z',
        indirizzo: 'Via Milano 45',
        citta: 'Milano',
        cap: '20121'
      },
      datiAttivita: {
        attivita: 'Consulenza freelance marketing digitale',
        codiceAteco: '73.11.00',
        descrizioneAteco: 'Agenzie di pubblicità',
        fatturatoPrevisto: '0-25000',
        regimeFiscale: 'Forfettario'
      },
      timeline: [
        { data: '10/01/2024', evento: 'Richiesta inviata', status: 'completed', note: 'Richiesta di apertura P.IVA forfettaria per attività di marketing' },
        { data: '11/01/2024', evento: 'Documenti ricevuti', status: 'completed', note: 'Documentazione completa ricevuta e verificata' },
        { data: '12/01/2024', evento: 'Verifica completata', status: 'completed', note: 'Dati verificati e documentazione preparata' },
        { data: '13/01/2024', evento: 'Invio ad Agenzia Entrate', status: 'completed', note: 'Richiesta inviata telematicamente all\'Agenzia delle Entrate' },
        { data: '15/01/2024', evento: 'P.IVA assegnata', status: 'completed', note: 'P.IVA IT12345678901 assegnata con successo - Pratica completata' }
      ],
      note: 'Pratica completata con successo. P.IVA IT12345678901 assegnata per regime forfettario.',
      costoServizio: '€ 200,00',
      tempiPrevisti: '5-7 giorni lavorativi',
      partitaIvaAssegnata: 'IT12345678901',
      dataAttivazione: '15/01/2024',
      documentiRichiesti: [
        'Copia documento identità',
        'Copia codice fiscale',
        'Autocertificazione attività',
        'Dichiarazione inizio attività'
      ]
    }
  ]

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dati Personali</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Mario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cognome *</label>
                <input
                  type="text"
                  name="cognome"
                  value={formData.cognome}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Rossi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="mario.rossi@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefono *</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="+39 123 456 7890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Codice Fiscale *</label>
                <input
                  type="text"
                  name="codiceFiscale"
                  value={formData.codiceFiscale}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="RSSMRA80A01H501Z"
                />
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informazioni Attività</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione Attività *</label>
                <input
                  type="text"
                  name="attivita"
                  value={formData.attivita}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Consulenza informatica"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Codice ATECO *</label>
                <select
                  name="codiceAteco"
                  value={formData.codiceAteco}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Seleziona codice ATECO</option>
                  <option value="62.01.00">62.01.00 - Produzione di software non connesso all'edizione</option>
                  <option value="62.02.00">62.02.00 - Consulenza nel settore delle tecnologie dell'informatica</option>
                  <option value="73.11.00">73.11.00 - Agenzie di pubblicità</option>
                  <option value="74.10.10">74.10.10 - Attività di design specializzate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fatturato Previsto Annuo *</label>
                <select
                  name="fatturatoPrevisto"
                  value={formData.fatturatoPrevisto}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Seleziona range</option>
                  <option value="0-25000">€ 0 - € 25.000</option>
                  <option value="25000-50000">€ 25.001 - € 50.000</option>
                  <option value="50000-65000">€ 50.001 - € 65.000</option>
                </select>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Richiesta Inviata!</h3>
            <p className="text-gray-600">La tua richiesta è stata inviata al consulente. Riceverai una risposta entro 24 ore.</p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-8">
      {/* Current Requests */}
      {currentRequests.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Le tue richieste</h3>
          <div className="space-y-4">
            {currentRequests.map((request, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer group"
                   onClick={() => setSelectedRequest(request)}>
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${request.status === 'Completata' ? 'bg-green-500' :
                    request.status === 'In elaborazione' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}></div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{request.id}</p>
                    <p className="text-sm text-gray-600">Consulente: {request.consultant}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className={`text-sm font-medium ${request.status === 'Completata' ? 'text-green-600' :
                      request.status === 'In elaborazione' ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                      {request.status}
                    </p>
                    <p className="text-xs text-gray-500">{request.date}</p>
                  </div>
                  <Eye className="h-4 w-4 text-gray-400 group-hover:text-primary-600 group-hover:scale-110 transition-all duration-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10">
        <div className="flex items-center justify-between mb-8">
          {steps.map((stepItem, index) => (
            <div key={stepItem.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${stepItem.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                stepItem.status === 'active' ? 'bg-primary-500 border-primary-500 text-white' :
                  'bg-gray-100 border-gray-300 text-gray-500'
                }`}>
                <stepItem.icon className="h-5 w-5" />
              </div>
              <span className={`ml-2 text-sm font-medium ${stepItem.status === 'active' ? 'text-primary-600' : 'text-gray-600'
                }`}>
                {stepItem.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 ml-4 ${stepItem.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        {step < 4 && (
          <div className="flex justify-between">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Indietro
            </button>
            <button
              onClick={() => setStep(Math.min(4, step + 1))}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              {step === 3 ? 'Invia Richiesta' : 'Avanti'}
            </button>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Regime Forfettario - Vantaggi</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Tassazione agevolata al 15% (5% per i primi 5 anni)</li>
              <li>• Nessun obbligo di fatturazione elettronica sotto i € 25.000</li>
              <li>• Contabilità semplificata</li>
              <li>• Esenzione IVA</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <Modal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title={`Dettagli Richiesta ${selectedRequest.id}`}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            {/* Header Status */}
            <div className={`p-4 rounded-lg border-2 ${
              selectedRequest.status === 'Completata' ? 'bg-green-50 border-green-200' :
              selectedRequest.status === 'In elaborazione' ? 'bg-yellow-50 border-yellow-200' :
              'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    selectedRequest.status === 'Completata' ? 'bg-green-500' :
                    selectedRequest.status === 'In elaborazione' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}></div>
                  <div>
                    <h3 className={`font-semibold ${
                      selectedRequest.status === 'Completata' ? 'text-green-900' :
                      selectedRequest.status === 'In elaborazione' ? 'text-yellow-900' : 'text-gray-900'
                    }`}>
                      Stato: {selectedRequest.status}
                    </h3>
                    <p className={`text-sm ${
                      selectedRequest.status === 'Completata' ? 'text-green-700' :
                      selectedRequest.status === 'In elaborazione' ? 'text-yellow-700' : 'text-gray-700'
                    }`}>
                      Richiesta del {selectedRequest.date} - Consulente: {selectedRequest.consultant}
                    </p>
                  </div>
                </div>
                {selectedRequest.partitaIvaAssegnata && (
                  <div className="text-right">
                    <p className="font-semibold text-green-900">P.IVA Assegnata</p>
                    <p className="text-lg font-bold text-green-700">{selectedRequest.partitaIvaAssegnata}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informazioni Servizio */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Informazioni Servizio
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Costo:</span>
                    <span className="font-medium text-blue-900">{selectedRequest.costoServizio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Tempi previsti:</span>
                    <span className="font-medium text-blue-900">{selectedRequest.tempiPrevisti}</span>
                  </div>
                  {selectedRequest.dataAttivazione && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Data attivazione:</span>
                      <span className="font-medium text-blue-900">{selectedRequest.dataAttivazione}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dati Personali */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Dati Personali
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nome:</span>
                    <span className="font-medium text-gray-900">{selectedRequest.datiPersonali.nome} {selectedRequest.datiPersonali.cognome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CF:</span>
                    <span className="font-medium text-gray-900">{selectedRequest.datiPersonali.codiceFiscale}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">{selectedRequest.datiPersonali.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Telefono:</span>
                    <span className="font-medium text-gray-900">{selectedRequest.datiPersonali.telefono}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dati Attività */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Dati Attività
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-purple-700 mb-1">Descrizione Attività:</p>
                  <p className="font-medium text-purple-900">{selectedRequest.datiAttivita.attivita}</p>
                </div>
                <div>
                  <p className="text-purple-700 mb-1">Codice ATECO:</p>
                  <p className="font-medium text-purple-900">{selectedRequest.datiAttivita.codiceAteco}</p>
                  <p className="text-xs text-purple-600">{selectedRequest.datiAttivita.descrizioneAteco}</p>
                </div>
                <div>
                  <p className="text-purple-700 mb-1">Fatturato Previsto:</p>
                  <p className="font-medium text-purple-900">€ {selectedRequest.datiAttivita.fatturatoPrevisto.replace('-', ' - € ')}</p>
                </div>
                <div>
                  <p className="text-purple-700 mb-1">Regime Fiscale:</p>
                  <p className="font-medium text-purple-900">{selectedRequest.datiAttivita.regimeFiscale}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Cronologia Pratica
              </h4>
              <div className="space-y-4">
                {selectedRequest.timeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full mt-1.5 ${
                        event.status === 'completed' ? 'bg-green-500' :
                        event.status === 'active' ? 'bg-yellow-500' : 'bg-gray-300'
                      }`}></div>
                      {index < selectedRequest.timeline.length - 1 && (
                        <div className={`w-0.5 h-8 mt-2 ${
                          event.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className={`font-medium ${
                          event.status === 'completed' ? 'text-green-900' :
                          event.status === 'active' ? 'text-yellow-900' : 'text-gray-700'
                        }`}>
                          {event.evento}
                        </p>
                        <span className="text-xs text-gray-500">{event.data}</span>
                      </div>
                      <p className="text-sm text-gray-600">{event.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documenti Richiesti */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-orange-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Documenti Richiesti
                </h4>
                {onNavigateToDocuments && (
                  <button
                    onClick={() => {
                      onNavigateToDocuments('apertura-piva')
                      setSelectedRequest(null)
                    }}
                    className="text-orange-700 hover:text-orange-800 text-sm font-medium border border-orange-300 px-3 py-1 rounded-lg hover:bg-orange-100 transition-all duration-200"
                  >
                    Gestisci Documenti
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedRequest.documentiRichiesti.map((doc: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-orange-800">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Note */}
            {selectedRequest.note && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Note</h4>
                <p className="text-sm text-gray-700">{selectedRequest.note}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Richiesta del {selectedRequest.date}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{selectedRequest.consultant}</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Chiudi
                </button>
                {selectedRequest.status === 'In elaborazione' && (
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Contatta Consulente
                  </button>
                )}
                {selectedRequest.status === 'Completata' && (
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Scarica Documenti
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}