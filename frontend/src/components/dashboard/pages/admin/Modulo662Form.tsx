import { useState } from 'react'
import { FileText } from 'lucide-react'

export interface Modulo662Data {
  // Dati dichiarante
  cognomeNome: string
  natoA: string
  natoIl: string

  // Tipo soggetto beneficiario
  tipoSoggetto: 'impresa' | 'professionista' | 'studio_professionale' | 'ente_terzo_settore'

  // Dati beneficiario
  denominazione: string
  codiceFiscale: string
  dataCostituzione: string
  comuneSede: string
  indirizzo: string
  provincia: string
  pec: string
  emailOrdinaria: string
  telefono: string

  // Operazione finanziaria
  importoOperazione: string
  durataOperazione: string
  codiceAteco: string
  sedeAttivita: 'legale' | 'operativa'
  sedeOperativaComune: string
  sedeOperativaProvincia: string

  // Finalità operazione
  finalitaOperazione: 'liquidita' | 'investimento' | 'rinegoziazione'
  descrizioneLiquidita: string

  // Programma investimento
  importoProgramma: string
  statoPrograma: 'iniziato' | 'completato' | 'da_completare' | 'da_iniziare'
  dataInizio: string
  dataCompletamento: string
  dataPrevistaCompletamento: string

  // Finalità investimento (multiple)
  finalitaInnovazioneTecnologica: boolean
  finalitaEfficienzaEnergetica: boolean
  finalitaRicercaSviluppo: boolean
  finalitaCrescita: boolean
  finalitaSostenibilita: boolean
  finalitaRisorseUmane: boolean

  // Descrizione investimento
  descrizioneInvestimento: string

  // Dettaglio programma investimento
  importoTerreni: string
  importoFabbricati: string
  importoMacchinari: string
  importoInvestimentiImmateriali: string
  importoAttiviFinanziari: string
  importoAltro: string
  descrizioneAltro: string

  // Liquidità connessa
  hasLiquiditaConnessa: boolean
  importoLiquiditaConnessa: string

  // Piano copertura
  importoFinanziamento: string
  importoRisorseProprie: string
  importoAltreFonti: string

  // Altre agevolazioni
  hasAltreAgevolazioni: boolean
  altreAgevolazioni: Array<{
    riferimentoNormativo: string
    tipologiaContributo: string
    dataConcessione: string
    intensitaAiuto: string
  }>

  // Regolamentazione UE
  regolamentazioneUE: 'de_minimis' | 'investimenti_pmi' | 'imprese_avviamento' | 'finanziamento_rischio' | 'agricoltura' | 'pesca' | 'acquacoltura_innovativi' | 'acquacoltura_produttivi'

  // Dimensione aziendale
  periodoRiferimento: string
  tipoImpresa: 'autonoma' | 'associata' | 'collegata' | 'associata_collegata'

  // Dati dimensionali impresa richiedente
  fatturatoImpresa: string
  attivoImpresa: string
  occupatiImpresa: string

  // Imprese associate/collegate
  impreseAssociate: Array<{
    denominazione: string
    codiceFiscale: string
    fatturato: string
    attivo: string
    occupati: string
    relazione: string
    percentuale: string
  }>

  // Dimensione finale
  dimensioneImpresa: 'microimpresa' | 'piccola' | 'media' | 'mid_cap'

  // Dichiarazioni finali
  isStartupInnovativa: boolean
  isIncubatoreCertificato: boolean

  // DICHIARA - 12 dichiarazioni obbligatorie (pagine 1-2)
  dichiaraParametriDimensionali: boolean
  dichiaraNoAiutiSalvataggio: boolean
  dichiaraAccettaNormativaComunitaria: boolean
  dichiaraAccettaDisposizioniOperative: boolean
  dichiaraAccettaSurrogazioneLegale: boolean
  dichiaraComunicaVariazioni: boolean
  dichiaraTrasmetteDocumentazione: boolean
  dichiaraComunicaPortale: boolean
  dichiaraConsenteControlli: boolean
  dichiaraAccettaRevoca: boolean
  dichiaraPrendeAttoPubblicazione: boolean
  dichiaraConsapevoleComunicazioni: boolean

  // De minimis (punto 18, pagina 5-6)
  deMinimisRispettaLimite: boolean
  deMinimisAttuaSeparazione: boolean

  // Aiuti incompatibili (pagina 7)
  aiutiIncompatibili: 'non_ricevuti' | 'ricevuti_de_minimis' | 'rimborsati' | 'depositati'
  aiutiIncompatibiliImporto: string
  aiutiIncompatibiliDataRimborso: string
  aiutiIncompatibiliMezzoRimborso: string
  aiutiIncompatibiliLetteraRiferimento: string

  // CDP - Casse Professionali (pagina 8)
  cassaProfessionaleENPAB: boolean
  cassaProfessionaleENPACL: boolean
  cassaProfessionaleEPAP: boolean
  cassaProfessionaleENPAM: boolean
  cassaProfessionaleDottoriCommercialisti: boolean
  cassaProfessionaleCassaForense: boolean
  cassaProfessionaleINARCASSA: boolean
  cassaProfessionaleCIPAG: boolean

  // InvestEU (pagine 9-13)
  investEUNonAttivitaEscluse: boolean
  investEUImportoNonSuperiore: boolean
  investEUNoFocusSostanziale: boolean
  investEURiconosceAudit: boolean
  investEUConsapevoleCommissione: boolean
  investEUConservaDocumentazione: boolean
  investEUConsapevoleTrattamentoDati: boolean
  investEUNoAttivitaIllecite: boolean
  investEUNoCostruzioniArtificio: boolean
  investEURispettaStandards: boolean
  investEUSedeUE: boolean
  investEUMantieneFondi: boolean
  investEUDocumentazioneValida: boolean
  investEURispettaLeggi: boolean
  investEUComunicaTitolareEffettivo: boolean
  investEUNoGiurisdizioneNonConforme: boolean
  investEUNoSanzioniUE: boolean
  investEUComunicaEventi: boolean
  investEUNoContributoCapitale: boolean
  investEUNoPrefinanziamento: boolean
  investEUCombinazioneSupporto: boolean
  investEUUtilizzoScopo: boolean
  investEUNonAltroPortafoglio: boolean
  investEUInserisceLogo: boolean
  investEUConcordaPubblicazione: boolean
  investEUFornisceDocumentazione: boolean
  investEUNoFallimento: boolean
  investEUNoPagamentoImposte: boolean
  investEUNoElusioneFiscale: boolean
  investEUNoColgaGrave: boolean
  investEUNoCondannePenali: boolean
  investEUNoEDES: boolean
}

interface Modulo662FormProps {
  initialData?: Partial<Modulo662Data>
  onSave: (data: Modulo662Data) => void
  clientName: string
  clientEmail: string
}

export default function Modulo662Form({ initialData, onSave, clientName, clientEmail }: Modulo662FormProps) {
  const [formData, setFormData] = useState<Modulo662Data>({
    cognomeNome: initialData?.cognomeNome || clientName,
    natoA: initialData?.natoA || '',
    natoIl: initialData?.natoIl || '',

    tipoSoggetto: initialData?.tipoSoggetto || 'impresa',

    denominazione: initialData?.denominazione || '',
    codiceFiscale: initialData?.codiceFiscale || '',
    dataCostituzione: initialData?.dataCostituzione || '',
    comuneSede: initialData?.comuneSede || '',
    indirizzo: initialData?.indirizzo || '',
    provincia: initialData?.provincia || '',
    pec: initialData?.pec || clientEmail,
    emailOrdinaria: initialData?.emailOrdinaria || '',
    telefono: initialData?.telefono || '',

    importoOperazione: initialData?.importoOperazione || '',
    durataOperazione: initialData?.durataOperazione || '',
    codiceAteco: initialData?.codiceAteco || '',
    sedeAttivita: initialData?.sedeAttivita || 'legale',
    sedeOperativaComune: initialData?.sedeOperativaComune || '',
    sedeOperativaProvincia: initialData?.sedeOperativaProvincia || '',

    finalitaOperazione: initialData?.finalitaOperazione || 'investimento',
    descrizioneLiquidita: initialData?.descrizioneLiquidita || '',

    importoProgramma: initialData?.importoProgramma || '',
    statoPrograma: initialData?.statoPrograma || 'da_iniziare',
    dataInizio: initialData?.dataInizio || '',
    dataCompletamento: initialData?.dataCompletamento || '',
    dataPrevistaCompletamento: initialData?.dataPrevistaCompletamento || '',

    finalitaInnovazioneTecnologica: initialData?.finalitaInnovazioneTecnologica || false,
    finalitaEfficienzaEnergetica: initialData?.finalitaEfficienzaEnergetica || false,
    finalitaRicercaSviluppo: initialData?.finalitaRicercaSviluppo || false,
    finalitaCrescita: initialData?.finalitaCrescita || false,
    finalitaSostenibilita: initialData?.finalitaSostenibilita || false,
    finalitaRisorseUmane: initialData?.finalitaRisorseUmane || false,

    descrizioneInvestimento: initialData?.descrizioneInvestimento || '',

    importoTerreni: initialData?.importoTerreni || '',
    importoFabbricati: initialData?.importoFabbricati || '',
    importoMacchinari: initialData?.importoMacchinari || '',
    importoInvestimentiImmateriali: initialData?.importoInvestimentiImmateriali || '',
    importoAttiviFinanziari: initialData?.importoAttiviFinanziari || '',
    importoAltro: initialData?.importoAltro || '',
    descrizioneAltro: initialData?.descrizioneAltro || '',

    hasLiquiditaConnessa: initialData?.hasLiquiditaConnessa || false,
    importoLiquiditaConnessa: initialData?.importoLiquiditaConnessa || '',

    importoFinanziamento: initialData?.importoFinanziamento || '',
    importoRisorseProprie: initialData?.importoRisorseProprie || '',
    importoAltreFonti: initialData?.importoAltreFonti || '',

    hasAltreAgevolazioni: initialData?.hasAltreAgevolazioni || false,
    altreAgevolazioni: initialData?.altreAgevolazioni || [],

    regolamentazioneUE: initialData?.regolamentazioneUE || 'de_minimis',

    periodoRiferimento: initialData?.periodoRiferimento || '',
    tipoImpresa: initialData?.tipoImpresa || 'autonoma',

    fatturatoImpresa: initialData?.fatturatoImpresa || '',
    attivoImpresa: initialData?.attivoImpresa || '',
    occupatiImpresa: initialData?.occupatiImpresa || '',

    impreseAssociate: initialData?.impreseAssociate || [],

    dimensioneImpresa: initialData?.dimensioneImpresa || 'microimpresa',

    isStartupInnovativa: initialData?.isStartupInnovativa || false,
    isIncubatoreCertificato: initialData?.isIncubatoreCertificato || false,

    // DICHIARA - 12 dichiarazioni obbligatorie
    dichiaraParametriDimensionali: initialData?.dichiaraParametriDimensionali || false,
    dichiaraNoAiutiSalvataggio: initialData?.dichiaraNoAiutiSalvataggio || false,
    dichiaraAccettaNormativaComunitaria: initialData?.dichiaraAccettaNormativaComunitaria || false,
    dichiaraAccettaDisposizioniOperative: initialData?.dichiaraAccettaDisposizioniOperative || false,
    dichiaraAccettaSurrogazioneLegale: initialData?.dichiaraAccettaSurrogazioneLegale || false,
    dichiaraComunicaVariazioni: initialData?.dichiaraComunicaVariazioni || false,
    dichiaraTrasmetteDocumentazione: initialData?.dichiaraTrasmetteDocumentazione || false,
    dichiaraComunicaPortale: initialData?.dichiaraComunicaPortale || false,
    dichiaraConsenteControlli: initialData?.dichiaraConsenteControlli || false,
    dichiaraAccettaRevoca: initialData?.dichiaraAccettaRevoca || false,
    dichiaraPrendeAttoPubblicazione: initialData?.dichiaraPrendeAttoPubblicazione || false,
    dichiaraConsapevoleComunicazioni: initialData?.dichiaraConsapevoleComunicazioni || false,

    // De minimis
    deMinimisRispettaLimite: initialData?.deMinimisRispettaLimite || false,
    deMinimisAttuaSeparazione: initialData?.deMinimisAttuaSeparazione || false,

    // Aiuti incompatibili
    aiutiIncompatibili: initialData?.aiutiIncompatibili || 'non_ricevuti',
    aiutiIncompatibiliImporto: initialData?.aiutiIncompatibiliImporto || '',
    aiutiIncompatibiliDataRimborso: initialData?.aiutiIncompatibiliDataRimborso || '',
    aiutiIncompatibiliMezzoRimborso: initialData?.aiutiIncompatibiliMezzoRimborso || '',
    aiutiIncompatibiliLetteraRiferimento: initialData?.aiutiIncompatibiliLetteraRiferimento || '',

    // CDP - Casse Professionali
    cassaProfessionaleENPAB: initialData?.cassaProfessionaleENPAB || false,
    cassaProfessionaleENPACL: initialData?.cassaProfessionaleENPACL || false,
    cassaProfessionaleEPAP: initialData?.cassaProfessionaleEPAP || false,
    cassaProfessionaleENPAM: initialData?.cassaProfessionaleENPAM || false,
    cassaProfessionaleDottoriCommercialisti: initialData?.cassaProfessionaleDottoriCommercialisti || false,
    cassaProfessionaleCassaForense: initialData?.cassaProfessionaleCassaForense || false,
    cassaProfessionaleINARCASSA: initialData?.cassaProfessionaleINARCASSA || false,
    cassaProfessionaleCIPAG: initialData?.cassaProfessionaleCIPAG || false,

    // InvestEU
    investEUNonAttivitaEscluse: initialData?.investEUNonAttivitaEscluse || false,
    investEUImportoNonSuperiore: initialData?.investEUImportoNonSuperiore || false,
    investEUNoFocusSostanziale: initialData?.investEUNoFocusSostanziale || false,
    investEURiconosceAudit: initialData?.investEURiconosceAudit || false,
    investEUConsapevoleCommissione: initialData?.investEUConsapevoleCommissione || false,
    investEUConservaDocumentazione: initialData?.investEUConservaDocumentazione || false,
    investEUConsapevoleTrattamentoDati: initialData?.investEUConsapevoleTrattamentoDati || false,
    investEUNoAttivitaIllecite: initialData?.investEUNoAttivitaIllecite || false,
    investEUNoCostruzioniArtificio: initialData?.investEUNoCostruzioniArtificio || false,
    investEURispettaStandards: initialData?.investEURispettaStandards || false,
    investEUSedeUE: initialData?.investEUSedeUE || false,
    investEUMantieneFondi: initialData?.investEUMantieneFondi || false,
    investEUDocumentazioneValida: initialData?.investEUDocumentazioneValida || false,
    investEURispettaLeggi: initialData?.investEURispettaLeggi || false,
    investEUComunicaTitolareEffettivo: initialData?.investEUComunicaTitolareEffettivo || false,
    investEUNoGiurisdizioneNonConforme: initialData?.investEUNoGiurisdizioneNonConforme || false,
    investEUNoSanzioniUE: initialData?.investEUNoSanzioniUE || false,
    investEUComunicaEventi: initialData?.investEUComunicaEventi || false,
    investEUNoContributoCapitale: initialData?.investEUNoContributoCapitale || false,
    investEUNoPrefinanziamento: initialData?.investEUNoPrefinanziamento || false,
    investEUCombinazioneSupporto: initialData?.investEUCombinazioneSupporto || false,
    investEUUtilizzoScopo: initialData?.investEUUtilizzoScopo || false,
    investEUNonAltroPortafoglio: initialData?.investEUNonAltroPortafoglio || false,
    investEUInserisceLogo: initialData?.investEUInserisceLogo || false,
    investEUConcordaPubblicazione: initialData?.investEUConcordaPubblicazione || false,
    investEUFornisceDocumentazione: initialData?.investEUFornisceDocumentazione || false,
    investEUNoFallimento: initialData?.investEUNoFallimento || false,
    investEUNoPagamentoImposte: initialData?.investEUNoPagamentoImposte || false,
    investEUNoElusioneFiscale: initialData?.investEUNoElusioneFiscale || false,
    investEUNoColgaGrave: initialData?.investEUNoColgaGrave || false,
    investEUNoCondannePenali: initialData?.investEUNoCondannePenali || false,
    investEUNoEDES: initialData?.investEUNoEDES || false,
  })

  const updateField = (field: keyof Modulo662Data, value: any) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    // Auto-save on every field change
    onSave(newData)
  }

  const addAltreAgevolazioni = () => {
    const newData = {
      ...formData,
      altreAgevolazioni: [
        ...formData.altreAgevolazioni,
        { riferimentoNormativo: '', tipologiaContributo: '', dataConcessione: '', intensitaAiuto: '' }
      ]
    }
    setFormData(newData)
    onSave(newData)
  }

  const removeAltreAgevolazioni = (index: number) => {
    const newData = {
      ...formData,
      altreAgevolazioni: formData.altreAgevolazioni.filter((_, i) => i !== index)
    }
    setFormData(newData)
    onSave(newData)
  }

  const addImpresaAssociata = () => {
    const newData = {
      ...formData,
      impreseAssociate: [
        ...formData.impreseAssociate,
        { denominazione: '', codiceFiscale: '', fatturato: '', attivo: '', occupati: '', relazione: 'associata', percentuale: '' }
      ]
    }
    setFormData(newData)
    onSave(newData)
  }

  const removeImpresaAssociata = (index: number) => {
    const newData = {
      ...formData,
      impreseAssociate: formData.impreseAssociate.filter((_, i) => i !== index)
    }
    setFormData(newData)
    onSave(newData)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">Modulo 662/96 - Form Compilazione</h3>
            <p className="text-sm text-blue-700">Compila tutti i campi richiesti. Il salvataggio è automatico.</p>
          </div>
        </div>
      </div>

      {/* Sezione 1: Dati del Dichiarante */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">1. Dati del Dichiarante</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cognome e Nome</label>
            <input
              type="text"
              value={formData.cognomeNome}
              onChange={(e) => updateField('cognomeNome', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nato a</label>
            <input
              type="text"
              value={formData.natoA}
              onChange={(e) => updateField('natoA', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">il (data di nascita)</label>
            <input
              type="date"
              value={formData.natoIl}
              onChange={(e) => updateField('natoIl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Sezione 2: Tipo Soggetto Beneficiario */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">2. in qualità di:</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={formData.tipoSoggetto === 'impresa'}
              onChange={() => updateField('tipoSoggetto', 'impresa')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm">Legale rappresentante dell'impresa</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={formData.tipoSoggetto === 'professionista'}
              onChange={() => updateField('tipoSoggetto', 'professionista')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm">Professionista</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={formData.tipoSoggetto === 'studio_professionale'}
              onChange={() => updateField('tipoSoggetto', 'studio_professionale')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm">Legale rappresentante dello studio professionale</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={formData.tipoSoggetto === 'ente_terzo_settore'}
              onChange={() => updateField('tipoSoggetto', 'ente_terzo_settore')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm">Legale rappresentante dell'ente del terzo settore</span>
          </label>
        </div>
      </div>

      {/* Sezione 3: Dati Beneficiario Finale */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">3. Dati Soggetto Beneficiario Finale</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Denominazione / Ragione Sociale</label>
            <input
              type="text"
              value={formData.denominazione}
              onChange={(e) => updateField('denominazione', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Codice Fiscale / P.IVA</label>
            <input
              type="text"
              value={formData.codiceFiscale}
              onChange={(e) => updateField('codiceFiscale', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data di Costituzione</label>
            <input
              type="date"
              value={formData.dataCostituzione}
              onChange={(e) => updateField('dataCostituzione', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comune Sede Legale</label>
            <input
              type="text"
              value={formData.comuneSede}
              onChange={(e) => updateField('comuneSede', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo (Via/Piazza, N., CAP)</label>
            <input
              type="text"
              value={formData.indirizzo}
              onChange={(e) => updateField('indirizzo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
            <input
              type="text"
              value={formData.provincia}
              onChange={(e) => updateField('provincia', e.target.value)}
              maxLength={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="TO"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email PEC</label>
            <input
              type="email"
              value={formData.pec}
              onChange={(e) => updateField('pec', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Ordinaria</label>
            <input
              type="email"
              value={formData.emailOrdinaria}
              onChange={(e) => updateField('emailOrdinaria', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => updateField('telefono', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Sezione 4: Operazione Finanziaria */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">4. Operazione Finanziaria</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Importo Operazione (€)</label>
            <input
              type="number"
              value={formData.importoOperazione}
              onChange={(e) => updateField('importoOperazione', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durata (mesi)</label>
            <input
              type="number"
              value={formData.durataOperazione}
              onChange={(e) => updateField('durataOperazione', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Codice ATECO 2007</label>
            <input
              type="text"
              value={formData.codiceAteco}
              onChange={(e) => updateField('codiceAteco', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="47.26.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sede dell'attività</label>
            <select
              value={formData.sedeAttivita}
              onChange={(e) => updateField('sedeAttivita', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="legale">Sede Legale</option>
              <option value="operativa">Sede Operativa</option>
            </select>
          </div>
          {formData.sedeAttivita === 'operativa' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comune Sede Operativa</label>
                <input
                  type="text"
                  value={formData.sedeOperativaComune}
                  onChange={(e) => updateField('sedeOperativaComune', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provincia Sede Operativa</label>
                <input
                  type="text"
                  value={formData.sedeOperativaProvincia}
                  onChange={(e) => updateField('sedeOperativaProvincia', e.target.value)}
                  maxLength={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Finalità dell'operazione</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={formData.finalitaOperazione === 'liquidita'}
                onChange={() => updateField('finalitaOperazione', 'liquidita')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Liquidità</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={formData.finalitaOperazione === 'investimento'}
                onChange={() => updateField('finalitaOperazione', 'investimento')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Investimento</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={formData.finalitaOperazione === 'rinegoziazione'}
                onChange={() => updateField('finalitaOperazione', 'rinegoziazione')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Rinegoziazione/Consolidamento</span>
            </label>
          </div>
        </div>

        {formData.finalitaOperazione === 'liquidita' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione destinazione liquidità</label>
            <textarea
              value={formData.descrizioneLiquidita}
              onChange={(e) => updateField('descrizioneLiquidita', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Sezione 5: Programma di Investimento (se finalità = investimento) */}
      {formData.finalitaOperazione === 'investimento' && (
        <>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">5. Programma di Investimento</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Importo totale programma (€)</label>
                <input
                  type="number"
                  value={formData.importoProgramma}
                  onChange={(e) => updateField('importoProgramma', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stato del programma</label>
                <select
                  value={formData.statoPrograma}
                  onChange={(e) => updateField('statoPrograma', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="da_iniziare">Da iniziare</option>
                  <option value="iniziato">Iniziato</option>
                  <option value="da_completare">Da completare</option>
                  <option value="completato">Già completato</option>
                </select>
              </div>

              {(formData.statoPrograma === 'iniziato' || formData.statoPrograma === 'completato') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data inizio</label>
                  <input
                    type="date"
                    value={formData.dataInizio}
                    onChange={(e) => updateField('dataInizio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {formData.statoPrograma === 'completato' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data completamento</label>
                  <input
                    type="date"
                    value={formData.dataCompletamento}
                    onChange={(e) => updateField('dataCompletamento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {(formData.statoPrograma === 'da_iniziare' || formData.statoPrograma === 'da_completare') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data prevista completamento</label>
                  <input
                    type="date"
                    value={formData.dataPrevistaCompletamento}
                    onChange={(e) => updateField('dataPrevistaCompletamento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Finalità del programma di investimento (seleziona una o più):</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <label className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.finalitaInnovazioneTecnologica}
                    onChange={(e) => updateField('finalitaInnovazioneTecnologica', e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">
                    <strong>Innovazione Tecnologica e Digitale</strong><br/>
                    <span className="text-xs text-gray-600">digitalizzazione processi, customer experience, AI, IoT, cybersecurity</span>
                  </span>
                </label>
                <label className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.finalitaEfficienzaEnergetica}
                    onChange={(e) => updateField('finalitaEfficienzaEnergetica', e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">
                    <strong>Efficienza Energetica</strong><br/>
                    <span className="text-xs text-gray-600">riduzione consumi energetici, fonti rinnovabili</span>
                  </span>
                </label>
                <label className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.finalitaRicercaSviluppo}
                    onChange={(e) => updateField('finalitaRicercaSviluppo', e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">
                    <strong>Ricerca e Sviluppo</strong><br/>
                    <span className="text-xs text-gray-600">nuovi prodotti/servizi, brevetti, proprietà intellettuale</span>
                  </span>
                </label>
                <label className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.finalitaCrescita}
                    onChange={(e) => updateField('finalitaCrescita', e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">
                    <strong>Crescita</strong><br/>
                    <span className="text-xs text-gray-600">nuovi impianti, marketing, attrezzature, logistica</span>
                  </span>
                </label>
                <label className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.finalitaSostenibilita}
                    onChange={(e) => updateField('finalitaSostenibilita', e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">
                    <strong>Sostenibilità</strong><br/>
                    <span className="text-xs text-gray-600">riduzione impatto ambientale, economia circolare</span>
                  </span>
                </label>
                <label className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.finalitaRisorseUmane}
                    onChange={(e) => updateField('finalitaRisorseUmane', e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">
                    <strong>Risorse Umane</strong><br/>
                    <span className="text-xs text-gray-600">formazione, benessere lavoratori, sicurezza</span>
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione dettagliata del programma</label>
              <textarea
                value={formData.descrizioneInvestimento}
                onChange={(e) => updateField('descrizioneInvestimento', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Inserire una descrizione dettagliata del programma di investimento..."
              />
            </div>
          </div>

          {/* Dettaglio Programma Investimento */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">6. Dettaglio Programma d'Investimento</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Terreni (€)</label>
                <input
                  type="number"
                  value={formData.importoTerreni}
                  onChange={(e) => updateField('importoTerreni', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fabbricati, opere murarie (€)</label>
                <input
                  type="number"
                  value={formData.importoFabbricati}
                  onChange={(e) => updateField('importoFabbricati', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Macchinari, impianti, attrezzature (€)</label>
                <input
                  type="number"
                  value={formData.importoMacchinari}
                  onChange={(e) => updateField('importoMacchinari', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Investimenti immateriali (€)</label>
                <input
                  type="number"
                  value={formData.importoInvestimentiImmateriali}
                  onChange={(e) => updateField('importoInvestimentiImmateriali', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attivi finanziari (€)</label>
                <input
                  type="number"
                  value={formData.importoAttiviFinanziari}
                  onChange={(e) => updateField('importoAttiviFinanziari', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Altro - Descrizione</label>
                <input
                  type="text"
                  value={formData.descrizioneAltro}
                  onChange={(e) => updateField('descrizioneAltro', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Specificare altro..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Altro - Importo (€)</label>
                <input
                  type="number"
                  value={formData.importoAltro}
                  onChange={(e) => updateField('importoAltro', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">
                Totale programma: € {(
                  parseFloat(formData.importoTerreni || '0') +
                  parseFloat(formData.importoFabbricati || '0') +
                  parseFloat(formData.importoMacchinari || '0') +
                  parseFloat(formData.importoInvestimentiImmateriali || '0') +
                  parseFloat(formData.importoAttiviFinanziari || '0') +
                  parseFloat(formData.importoAltro || '0')
                ).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Liquidità Connessa e Piano Copertura */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">7. Liquidità e Piano di Copertura</h4>

            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasLiquiditaConnessa}
                  onChange={(e) => updateField('hasLiquiditaConnessa', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium">Quota destinata a liquidità connessa all'investimento</span>
              </label>
              {formData.hasLiquiditaConnessa && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Importo liquidità connessa (€)</label>
                  <input
                    type="number"
                    value={formData.importoLiquiditaConnessa}
                    onChange={(e) => updateField('importoLiquiditaConnessa', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            <h5 className="text-md font-semibold text-gray-900 mb-3">Piano di copertura finanziaria:</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Finanziamento oggetto domanda (€)</label>
                <input
                  type="number"
                  value={formData.importoFinanziamento}
                  onChange={(e) => updateField('importoFinanziamento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risorse proprie (€)</label>
                <input
                  type="number"
                  value={formData.importoRisorseProprie}
                  onChange={(e) => updateField('importoRisorseProprie', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Altre fonti di copertura (€)</label>
                <input
                  type="number"
                  value={formData.importoAltreFonti}
                  onChange={(e) => updateField('importoAltreFonti', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">
                Totale Fonti: € {(
                  parseFloat(formData.importoFinanziamento || '0') +
                  parseFloat(formData.importoRisorseProprie || '0') +
                  parseFloat(formData.importoAltreFonti || '0')
                ).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-600 mt-1">N.B. Il totale delle fonti deve essere pari al totale del programma di investimento</p>
            </div>
          </div>

          {/* Altre Agevolazioni */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">8. Altre Agevolazioni</h4>

            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasAltreAgevolazioni}
                  onChange={(e) => updateField('hasAltreAgevolazioni', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium">Il programma è agevolato da altre misure</span>
              </label>
            </div>

            {formData.hasAltreAgevolazioni && (
              <div className="space-y-4">
                {formData.altreAgevolazioni.map((agev, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Riferimento normativo e amministrazione concedente</label>
                        <input
                          type="text"
                          value={agev.riferimentoNormativo}
                          onChange={(e) => {
                            const newAgev = [...formData.altreAgevolazioni]
                            newAgev[index].riferimentoNormativo = e.target.value
                            updateField('altreAgevolazioni', newAgev)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipologia contributo</label>
                        <input
                          type="text"
                          value={agev.tipologiaContributo}
                          onChange={(e) => {
                            const newAgev = [...formData.altreAgevolazioni]
                            newAgev[index].tipologiaContributo = e.target.value
                            updateField('altreAgevolazioni', newAgev)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="c./interessi, c./capitale"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data concessione</label>
                        <input
                          type="date"
                          value={agev.dataConcessione}
                          onChange={(e) => {
                            const newAgev = [...formData.altreAgevolazioni]
                            newAgev[index].dataConcessione = e.target.value
                            updateField('altreAgevolazioni', newAgev)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Intensità di Aiuto</label>
                        <input
                          type="text"
                          value={agev.intensitaAiuto}
                          onChange={(e) => {
                            const newAgev = [...formData.altreAgevolazioni]
                            newAgev[index].intensitaAiuto = e.target.value
                            updateField('altreAgevolazioni', newAgev)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="€ importo, %"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => removeAltreAgevolazioni(index)}
                          className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                        >
                          Rimuovi
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addAltreAgevolazioni}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-sm text-gray-600 hover:text-blue-600"
                >
                  + Aggiungi Agevolazione
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Sezione 9: Regolamentazione UE */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">9. Regolamentazione Europea Applicabile</h4>
        <p className="text-sm text-gray-600 mb-4">
          Seleziona la regolamentazione europea sotto la quale si richiede la garanzia:
        </p>
        <div className="space-y-2">
          <label className="flex items-start space-x-2">
            <input
              type="radio"
              checked={formData.regolamentazioneUE === 'de_minimis'}
              onChange={() => updateField('regolamentazioneUE', 'de_minimis')}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              <strong>Regolamento (UE) n. 1407/2013</strong> - Aiuti de minimis
            </span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="radio"
              checked={formData.regolamentazioneUE === 'investimenti_pmi'}
              onChange={() => updateField('regolamentazioneUE', 'investimenti_pmi')}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              <strong>Art. 17 Regolamento (UE) n. 651/2014</strong> - Aiuti per investimenti alle PMI
            </span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="radio"
              checked={formData.regolamentazioneUE === 'imprese_avviamento'}
              onChange={() => updateField('regolamentazioneUE', 'imprese_avviamento')}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              <strong>Art. 22 Regolamento (UE) n. 651/2014</strong> - Aiuti a favore di imprese in fase di avviamento
            </span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="radio"
              checked={formData.regolamentazioneUE === 'finanziamento_rischio'}
              onChange={() => updateField('regolamentazioneUE', 'finanziamento_rischio')}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              <strong>Art. 21 Regolamento (UE) n. 651/2014</strong> - Aiuti al finanziamento del rischio
            </span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="radio"
              checked={formData.regolamentazioneUE === 'agricoltura'}
              onChange={() => updateField('regolamentazioneUE', 'agricoltura')}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              <strong>Regolamento (UE) n. 1408/2013</strong> - De minimis settore agricolo
            </span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="radio"
              checked={formData.regolamentazioneUE === 'pesca'}
              onChange={() => updateField('regolamentazioneUE', 'pesca')}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              <strong>Regolamento (UE) n. 717/2014</strong> - De minimis settore pesca e acquacoltura
            </span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="radio"
              checked={formData.regolamentazioneUE === 'acquacoltura_innovativi'}
              onChange={() => updateField('regolamentazioneUE', 'acquacoltura_innovativi')}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              <strong>Regolamento (UE) n. 1388/2014</strong> - Investimenti produttivi innovativi in acquacoltura
            </span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="radio"
              checked={formData.regolamentazioneUE === 'acquacoltura_produttivi'}
              onChange={() => updateField('regolamentazioneUE', 'acquacoltura_produttivi')}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              <strong>Regolamento (UE) n. 1388/2014</strong> - Investimenti produttivi in acquacoltura
            </span>
          </label>
        </div>
      </div>

      {/* Sezione 10: Dimensione Aziendale */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">10. Prospetto Determinazione Dimensione Aziendale</h4>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Periodo di Riferimento</label>
          <input
            type="text"
            value={formData.periodoRiferimento}
            onChange={(e) => updateField('periodoRiferimento', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="es. Esercizio 2023"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo di Impresa</label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={formData.tipoImpresa === 'autonoma'}
                onChange={() => updateField('tipoImpresa', 'autonoma')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Autonoma (non ha imprese associate o collegate)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={formData.tipoImpresa === 'associata'}
                onChange={() => updateField('tipoImpresa', 'associata')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Associata (ha imprese associate)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={formData.tipoImpresa === 'collegata'}
                onChange={() => updateField('tipoImpresa', 'collegata')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Collegata (ha imprese collegate)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={formData.tipoImpresa === 'associata_collegata'}
                onChange={() => updateField('tipoImpresa', 'associata_collegata')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Associata e Collegata</span>
            </label>
          </div>
        </div>

        <h5 className="text-md font-semibold text-gray-900 mb-3">Dati Dimensionali Impresa Richiedente</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fatturato (€)</label>
            <input
              type="number"
              value={formData.fatturatoImpresa}
              onChange={(e) => updateField('fatturatoImpresa', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Totale Attivo (€)</label>
            <input
              type="number"
              value={formData.attivoImpresa}
              onChange={(e) => updateField('attivoImpresa', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Occupati (ULA)</label>
            <input
              type="number"
              value={formData.occupatiImpresa}
              onChange={(e) => updateField('occupatiImpresa', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
          <p className="text-xs text-blue-800">
            <strong>Soglie dimensionali:</strong><br/>
            • Microimpresa: occupati {'<'} 10, fatturato o attivo ≤ 2 M€<br/>
            • Piccola impresa: occupati {'<'} 50, fatturato o attivo ≤ 10 M€<br/>
            • Media impresa: occupati {'<'} 250, fatturato ≤ 50 M€ o attivo ≤ 43 M€<br/>
            • Mid-cap: occupati {'<'} 3000
          </p>
        </div>
      </div>

      {/* Sezione 11: Imprese Associate/Collegate */}
      {(formData.tipoImpresa === 'associata' || formData.tipoImpresa === 'collegata' || formData.tipoImpresa === 'associata_collegata') && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">11. Imprese Associate e/o Collegate</h4>

          {formData.impreseAssociate.length > 0 ? (
            <div className="space-y-4 mb-4">
              {formData.impreseAssociate.map((impresa, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Denominazione</label>
                      <input
                        type="text"
                        value={impresa.denominazione}
                        onChange={(e) => {
                          const newImprese = [...formData.impreseAssociate]
                          newImprese[index].denominazione = e.target.value
                          updateField('impreseAssociate', newImprese)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Codice Fiscale / P.IVA</label>
                      <input
                        type="text"
                        value={impresa.codiceFiscale}
                        onChange={(e) => {
                          const newImprese = [...formData.impreseAssociate]
                          newImprese[index].codiceFiscale = e.target.value
                          updateField('impreseAssociate', newImprese)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Relazione</label>
                      <select
                        value={impresa.relazione}
                        onChange={(e) => {
                          const newImprese = [...formData.impreseAssociate]
                          newImprese[index].relazione = e.target.value
                          updateField('impreseAssociate', newImprese)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="associata">Associata</option>
                        <option value="collegata">Collegata</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Percentuale (%)</label>
                      <input
                        type="number"
                        value={impresa.percentuale}
                        onChange={(e) => {
                          const newImprese = [...formData.impreseAssociate]
                          newImprese[index].percentuale = e.target.value
                          updateField('impreseAssociate', newImprese)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="25.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fatturato (€)</label>
                      <input
                        type="number"
                        value={impresa.fatturato}
                        onChange={(e) => {
                          const newImprese = [...formData.impreseAssociate]
                          newImprese[index].fatturato = e.target.value
                          updateField('impreseAssociate', newImprese)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Totale Attivo (€)</label>
                      <input
                        type="number"
                        value={impresa.attivo}
                        onChange={(e) => {
                          const newImprese = [...formData.impreseAssociate]
                          newImprese[index].attivo = e.target.value
                          updateField('impreseAssociate', newImprese)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Occupati (ULA)</label>
                      <input
                        type="number"
                        value={impresa.occupati}
                        onChange={(e) => {
                          const newImprese = [...formData.impreseAssociate]
                          newImprese[index].occupati = e.target.value
                          updateField('impreseAssociate', newImprese)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => removeImpresaAssociata(index)}
                        className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        Rimuovi
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-4">Nessuna impresa associata/collegata inserita</p>
          )}

          <button
            onClick={addImpresaAssociata}
            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-sm text-gray-600 hover:text-blue-600"
          >
            + Aggiungi Impresa Associata/Collegata
          </button>

          {formData.impreseAssociate.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h6 className="text-sm font-semibold text-gray-700 mb-2">Totali Aggregati:</h6>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Fatturato Totale:</span>
                  <p className="font-medium">€ {(
                    parseFloat(formData.fatturatoImpresa || '0') +
                    formData.impreseAssociate.reduce((sum, imp) => sum + parseFloat(imp.fatturato || '0'), 0)
                  ).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <span className="text-gray-600">Attivo Totale:</span>
                  <p className="font-medium">€ {(
                    parseFloat(formData.attivoImpresa || '0') +
                    formData.impreseAssociate.reduce((sum, imp) => sum + parseFloat(imp.attivo || '0'), 0)
                  ).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <span className="text-gray-600">Occupati Totali:</span>
                  <p className="font-medium">{
                    parseFloat(formData.occupatiImpresa || '0') +
                    formData.impreseAssociate.reduce((sum, imp) => sum + parseFloat(imp.occupati || '0'), 0)
                  } ULA</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sezione 12: Dimensione Finale dell'Impresa */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">12. Dimensione Finale dell'Impresa</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={formData.dimensioneImpresa === 'microimpresa'}
              onChange={() => updateField('dimensioneImpresa', 'microimpresa')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium">Microimpresa</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={formData.dimensioneImpresa === 'piccola'}
              onChange={() => updateField('dimensioneImpresa', 'piccola')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium">Piccola impresa</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={formData.dimensioneImpresa === 'media'}
              onChange={() => updateField('dimensioneImpresa', 'media')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium">Media impresa</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={formData.dimensioneImpresa === 'mid_cap'}
              onChange={() => updateField('dimensioneImpresa', 'mid_cap')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium">Mid-cap (impresa a media capitalizzazione)</span>
          </label>
        </div>
      </div>

      {/* Sezione 13: Dichiarazioni Finali */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">13. Dichiarazioni Finali</h4>
        <div className="space-y-3">
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.isStartupInnovativa}
              onChange={(e) => updateField('isStartupInnovativa', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              L'impresa è una <strong>startup innovativa</strong> iscritta nella sezione speciale del Registro delle Imprese
            </span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.isIncubatoreCertificato}
              onChange={(e) => updateField('isIncubatoreCertificato', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              L'impresa è un <strong>incubatore certificato</strong> iscritto nella sezione speciale del Registro delle Imprese
            </span>
          </label>
        </div>
      </div>

      {/* Sezione 14: DICHIARA - 12 Dichiarazioni Obbligatorie */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">14. DICHIARA</h4>
        <p className="text-sm text-gray-600 mb-4">
          Ai sensi degli artt. 46 e 47 del D.P.R. n. 445/2000, consapevole delle responsabilità penali:
        </p>
        <div className="space-y-3">
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.dichiaraParametriDimensionali}
              onChange={(e) => updateField('dichiaraParametriDimensionali', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              1. Che il soggetto beneficiario finale rispetta i parametri dimensionali previsti dalla Raccomandazione CE 2003/361/CE o è classificata come Mid Cap
            </span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.dichiaraNoAiutiSalvataggio}
              onChange={(e) => updateField('dichiaraNoAiutiSalvataggio', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              2. Di non rientrare fra coloro che hanno ricevuto un aiuto per il salvataggio e non hanno ancora rimborsato il prestito o revocato la garanzia
            </span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.dichiaraAccettaNormativaComunitaria}
              onChange={(e) => updateField('dichiaraAccettaNormativaComunitaria', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              3. Di accettare che la concessione e la gestione della garanzia del Fondo sono regolate dalla normativa comunitaria, nazionale, primaria e secondaria
            </span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.dichiaraAccettaDisposizioniOperative}
              onChange={(e) => updateField('dichiaraAccettaDisposizioniOperative', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              4. Di accettare la normativa e le vigenti Disposizioni Operative riguardo all'impossibilità di opporre al Gestore le eccezioni derivanti dal rapporto originario
            </span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.dichiaraAccettaSurrogazioneLegale}
              onChange={(e) => updateField('dichiaraAccettaSurrogazioneLegale', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              5. Di accettare le Disposizioni Operative sulla surrogazione legale del Fondo di Garanzia
            </span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.dichiaraComunicaVariazioni}
              onChange={(e) => updateField('dichiaraComunicaVariazioni', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              6. Di impegnarsi a comunicare al soggetto richiedente eventuali variazioni societarie e ogni altro fatto rilevante sulla situazione aziendale
            </span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.dichiaraTrasmetteDocumentazione}
              onChange={(e) => updateField('dichiaraTrasmetteDocumentazione', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              7. Di impegnarsi a trasmettere al Gestore tutta la documentazione necessaria per i controlli sulla veridicità dei dati
            </span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.dichiaraComunicaPortale}
              onChange={(e) => updateField('dichiaraComunicaPortale', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              8. Di impegnarsi a comunicare con il Gestore tramite il portale telematico (Portale FdG)
            </span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.dichiaraConsenteControlli}
              onChange={(e) => updateField('dichiaraConsenteControlli', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              9. Di impegnarsi a consentire l'effettuazione di controlli, accertamenti documentali ed ispezioni in loco
            </span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.dichiaraAccettaRevoca}
              onChange={(e) => updateField('dichiaraAccettaRevoca', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              10. Di accettare che nei casi di revoca dell'agevolazione sarà tenuto al versamento dell'aiuto ottenuto e delle eventuali sanzioni
            </span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.dichiaraPrendeAttoPubblicazione}
              onChange={(e) => updateField('dichiaraPrendeAttoPubblicazione', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              11. Di prendere atto che i dati del beneficiario e l'importo della garanzia saranno resi pubblici sulla rete internet
            </span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.dichiaraConsapevoleComunicazioni}
              onChange={(e) => updateField('dichiaraConsapevoleComunicazioni', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              12. Di essere consapevole che il Gestore comunicherà tramite portale telematico e PEC
            </span>
          </label>
        </div>
      </div>

      {/* Sezione 15: De minimis (solo se applicabile) */}
      {formData.regolamentazioneUE === 'de_minimis' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">15. Dichiarazioni specifiche "de minimis"</h4>
          <div className="space-y-3">
            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                checked={formData.deMinimisRispettaLimite}
                onChange={(e) => updateField('deMinimisRispettaLimite', e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600"
              />
              <span className="text-sm">
                a) Di impegnarsi a rispettare il limite di cumulo previsto dalla Regolamentazione "de minimis"
              </span>
            </label>
            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                checked={formData.deMinimisAttuaSeparazione}
                onChange={(e) => updateField('deMinimisAttuaSeparazione', e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600"
              />
              <span className="text-sm">
                b) Di impegnarsi, in caso di più attività soggette a massimali diversi, ad attuare la separazione delle attività o la distinzione dei costi
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Sezione 16: Aiuti Incompatibili */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">16. Aiuti Incompatibili con Decisioni CE</h4>
        <p className="text-sm text-gray-600 mb-4">
          (Compilare solo nel caso in cui la garanzia è richiesta ai sensi del Regolamento "de minimis" o del Regolamento di esenzione)
        </p>
        <div className="space-y-3">
          <label className="flex items-start space-x-2">
            <input
              type="radio"
              checked={formData.aiutiIncompatibili === 'non_ricevuti'}
              onChange={() => updateField('aiutiIncompatibili', 'non_ricevuti')}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              Di non rientrare fra coloro che hanno ricevuto aiuti dichiarati incompatibili con le decisioni della Commissione Europea
            </span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="radio"
              checked={formData.aiutiIncompatibili === 'ricevuti_de_minimis'}
              onChange={() => updateField('aiutiIncompatibili', 'ricevuti_de_minimis')}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              Di rientrare fra i soggetti che hanno ricevuto aiuti "de minimis" dichiarati incompatibili e di non essere tenuto all'obbligo di restituzione
            </span>
          </label>
          {formData.aiutiIncompatibili === 'ricevuti_de_minimis' && (
            <div className="ml-6 mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ammontare totale (€)</label>
              <input
                type="number"
                value={formData.aiutiIncompatibiliImporto}
                onChange={(e) => updateField('aiutiIncompatibiliImporto', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
          <label className="flex items-start space-x-2">
            <input
              type="radio"
              checked={formData.aiutiIncompatibili === 'rimborsati'}
              onChange={() => updateField('aiutiIncompatibili', 'rimborsati')}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              Di aver rimborsato la somma relativa all'aiuto dichiarato incompatibile
            </span>
          </label>
          {formData.aiutiIncompatibili === 'rimborsati' && (
            <div className="ml-6 mt-2 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data rimborso</label>
                <input
                  type="date"
                  value={formData.aiutiIncompatibiliDataRimborso}
                  onChange={(e) => updateField('aiutiIncompatibiliDataRimborso', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mezzo utilizzato (F24, cartella di pagamento, ecc.)</label>
                <input
                  type="text"
                  value={formData.aiutiIncompatibiliMezzoRimborso}
                  onChange={(e) => updateField('aiutiIncompatibiliMezzoRimborso', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Importo (€)</label>
                <input
                  type="number"
                  value={formData.aiutiIncompatibiliImporto}
                  onChange={(e) => updateField('aiutiIncompatibiliImporto', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lettera di riferimento (a, b, c, o d)</label>
                <input
                  type="text"
                  value={formData.aiutiIncompatibiliLetteraRiferimento}
                  onChange={(e) => updateField('aiutiIncompatibiliLetteraRiferimento', e.target.value)}
                  maxLength={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
          <label className="flex items-start space-x-2">
            <input
              type="radio"
              checked={formData.aiutiIncompatibili === 'depositati'}
              onChange={() => updateField('aiutiIncompatibili', 'depositati')}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <span className="text-sm">
              Di aver depositato nel conto di contabilità speciale presso la Banca d'Italia la somma relativa all'aiuto
            </span>
          </label>
          {formData.aiutiIncompatibili === 'depositati' && (
            <div className="ml-6 mt-2 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Importo (€)</label>
                <input
                  type="number"
                  value={formData.aiutiIncompatibiliImporto}
                  onChange={(e) => updateField('aiutiIncompatibiliImporto', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lettera di riferimento (a, b, c, o d)</label>
                <input
                  type="text"
                  value={formData.aiutiIncompatibiliLetteraRiferimento}
                  onChange={(e) => updateField('aiutiIncompatibiliLetteraRiferimento', e.target.value)}
                  maxLength={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sezione 17: CDP - Casse Professionali */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">17. Scheda Sezione CDP – Casse Professionali</h4>
        <p className="text-sm text-gray-600 mb-4">
          Ai fini dell'ammissibilità alla Sezione CDP – Casse Professionali, dichiara di appartenere ad una delle seguenti Casse:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.cassaProfessionaleENPAB}
              onChange={(e) => updateField('cassaProfessionaleENPAB', e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm">ENPAB - Biologi</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.cassaProfessionaleENPACL}
              onChange={(e) => updateField('cassaProfessionaleENPACL', e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm">ENPACL - Consulenti del lavoro</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.cassaProfessionaleEPAP}
              onChange={(e) => updateField('cassaProfessionaleEPAP', e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm">EPAP – Pluricategoriale</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.cassaProfessionaleENPAM}
              onChange={(e) => updateField('cassaProfessionaleENPAM', e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm">Fondazione ENPAM - Medici e odontoiatri</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.cassaProfessionaleDottoriCommercialisti}
              onChange={(e) => updateField('cassaProfessionaleDottoriCommercialisti', e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm">Cassa Dottori Commercialisti</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.cassaProfessionaleCassaForense}
              onChange={(e) => updateField('cassaProfessionaleCassaForense', e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm">Cassa Forense - Avvocati</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.cassaProfessionaleINARCASSA}
              onChange={(e) => updateField('cassaProfessionaleINARCASSA', e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm">INARCASSA - Ingegneri e architetti</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.cassaProfessionaleCIPAG}
              onChange={(e) => updateField('cassaProfessionaleCIPAG', e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm">CIPAG - Geometri</span>
          </label>
        </div>
      </div>

      {/* Sezione 18: InvestEU */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">18. Scheda InvestEU</h4>
        <p className="text-sm text-gray-600 mb-4">
          Dichiarazioni ai fini dell'ammissibilità alla controgaranzia rilasciata da CDP a valere sul Programma InvestEU:
        </p>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUNonAttivitaEscluse}
              onChange={(e) => updateField('investEUNonAttivitaEscluse', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Il finanziamento non riguarda attività escluse dall'elenco pubblicato sul sito del Fondo di Garanzia</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUImportoNonSuperiore}
              onChange={(e) => updateField('investEUImportoNonSuperiore', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">L'importo garantito sommato ad altre operazioni InvestEU non supera € 7.500.000</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUNoFocusSostanziale}
              onChange={(e) => updateField('investEUNoFocusSostanziale', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Non ho un focus sostanziale in settori esclusi</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEURiconosceAudit}
              onChange={(e) => updateField('investEURiconosceAudit', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Riconosco il diritto di audit e controlli da parte delle Parti Rilevanti (CDP, ECA, OLAF, FEI, BEI, CE)</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUConsapevoleCommissione}
              onChange={(e) => updateField('investEUConsapevoleCommissione', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Sono consapevole che la Commissione Europea potrà richiedere ulteriori spiegazioni</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUConservaDocumentazione}
              onChange={(e) => updateField('investEUConservaDocumentazione', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Mi impegno a conservare la documentazione per 5 anni dalla scadenza del finanziamento</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUConsapevoleTrattamentoDati}
              onChange={(e) => updateField('investEUConsapevoleTrattamentoDati', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Sono consapevole del trattamento dati da parte di FEI e CDP secondo GDPR</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUNoAttivitaIllecite}
              onChange={(e) => updateField('investEUNoAttivitaIllecite', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Mi impegno a non commettere attività illecite (frode, corruzione, riciclaggio, terrorismo)</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUNoCostruzioniArtificio}
              onChange={(e) => updateField('investEUNoCostruzioniArtificio', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Non utilizzerò l'operazione in costruzioni di artificio finalizzate all'elusione fiscale</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEURispettaStandards}
              onChange={(e) => updateField('investEURispettaStandards', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Rispetto i principali standard in materia di prevenzione evasione fiscale, riciclaggio e lotta al terrorismo</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUSedeUE}
              onChange={(e) => updateField('investEUSedeUE', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Ho sede e sono operativo in uno Stato Membro UE o Territorio d'oltremare</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUMantieneFondi}
              onChange={(e) => updateField('investEUMantieneFondi', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Mi impegno a mantenere i fondi su conto corrente in uno Stato Membro UE</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUDocumentazioneValida}
              onChange={(e) => updateField('investEUDocumentazioneValida', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">La documentazione contrattuale è giuridicamente valida, vincolante ed opponibile</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEURispettaLeggi}
              onChange={(e) => updateField('investEURispettaLeggi', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Mi impegno a rispettare integralmente leggi e regolamenti nazionali e UE</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUComunicaTitolareEffettivo}
              onChange={(e) => updateField('investEUComunicaTitolareEffettivo', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Mi impegno a comunicare variazioni del titolare effettivo</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUNoGiurisdizioneNonConforme}
              onChange={(e) => updateField('investEUNoGiurisdizioneNonConforme', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Non sono stabilito in una Giurisdizione Non Conforme ai fini fiscali</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUNoSanzioniUE}
              onChange={(e) => updateField('investEUNoSanzioniUE', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Non sono designato da UE come soggetto di misure restrittive/sanzioni</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUComunicaEventi}
              onChange={(e) => updateField('investEUComunicaEventi', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Mi impegno a comunicare eventi che impattano sull'ammissibilità o modifiche alle dichiarazioni</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUNoContributoCapitale}
              onChange={(e) => updateField('investEUNoContributoCapitale', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Non utilizzerò contributo in conto capitale UE per rimborsare questo finanziamento</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUNoPrefinanziamento}
              onChange={(e) => updateField('investEUNoPrefinanziamento', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Non utilizzerò il finanziamento per prefinanziare un contributo UE</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUCombinazioneSupporto}
              onChange={(e) => updateField('investEUCombinazioneSupporto', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Garantisco che la combinazione InvestEU + altri programmi UE non superi il costo totale del progetto</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUUtilizzoScopo}
              onChange={(e) => updateField('investEUUtilizzoScopo', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Utilizzerò il finanziamento esclusivamente per lo scopo specifico per cui è concesso</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUNonAltroPortafoglio}
              onChange={(e) => updateField('investEUNonAltroPortafoglio', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">L'operazione non è inclusa in altro portafoglio supportato dal FEI nell'ambito InvestEU</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUInserisceLogo}
              onChange={(e) => updateField('investEUInserisceLogo', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Mi impegno a inserire logo UE e FEI nelle comunicazioni relative al finanziamento</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUConcordaPubblicazione}
              onChange={(e) => updateField('investEUConcordaPubblicazione', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Concordo che FEI/BEI/CE possano pubblicare informazioni sul beneficiario (se importo {'>'} 500k€)</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUFornisceDocumentazione}
              onChange={(e) => updateField('investEUFornisceDocumentazione', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Mi impegno a fornire documentazione pertinente su richiesta del Gestore</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUNoFallimento}
              onChange={(e) => updateField('investEUNoFallimento', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Non sono in stato di fallimento, insolvenza, liquidazione o amministrazione controllata</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUNoPagamentoImposte}
              onChange={(e) => updateField('investEUNoPagamentoImposte', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Negli ultimi 5 anni non sono stato oggetto di sentenza per violazione pagamento imposte/contributi (salvo accordo vincolante)</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUNoElusioneFiscale}
              onChange={(e) => updateField('investEUNoElusioneFiscale', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Negli ultimi 5 anni né io né persone con poteri non siamo stati condannati per elusione fiscale</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUNoColgaGrave}
              onChange={(e) => updateField('investEUNoColgaGrave', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Negli ultimi 5 anni né io né persone con poteri non siamo stati condannati per colpa grave professionale</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUNoCondannePenali}
              onChange={(e) => updateField('investEUNoCondannePenali', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Negli ultimi 5 anni né io né persone con poteri non siamo stati condannati per frode, corruzione, riciclaggio, terrorismo, lavoro minorile</span>
          </label>
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={formData.investEUNoEDES}
              onChange={(e) => updateField('investEUNoEDES', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm">Non sono incluso nell'elenco EDES (sistema di individuazione precoce e di esclusione UE)</span>
          </label>
        </div>
      </div>
    </div>
  )
}
