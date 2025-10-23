import { FileText } from 'lucide-react'
import { Modulo662Data } from './Modulo662Form'

interface Modulo662PreviewProps {
  data: Modulo662Data
}

export default function Modulo662Preview({ data }: Modulo662PreviewProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('it-IT')
  }

  const formatCurrency = (value: string) => {
    if (!value) return '0,00'
    return parseFloat(value).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const getTipoSoggettoLabel = (tipo: string) => {
    const labels = {
      'impresa': 'Legale rappresentante dell\'impresa',
      'professionista': 'Professionista',
      'studio_professionale': 'Legale rappresentante dello studio professionale',
      'ente_terzo_settore': 'Legale rappresentante dell\'ente del terzo settore'
    }
    return labels[tipo as keyof typeof labels] || tipo
  }

  const getFinalitaLabel = (finalita: string) => {
    const labels = {
      'liquidita': 'Liquidità',
      'investimento': 'Investimento',
      'rinegoziazione': 'Rinegoziazione/Consolidamento'
    }
    return labels[finalita as keyof typeof labels] || finalita
  }

  const getRegolamentazioneLabel = (reg: string) => {
    const labels = {
      'de_minimis': 'Regolamento (UE) n. 1407/2013 - Aiuti de minimis',
      'investimenti_pmi': 'Art. 17 Regolamento (UE) n. 651/2014 - Aiuti per investimenti alle PMI',
      'imprese_avviamento': 'Art. 22 Regolamento (UE) n. 651/2014 - Aiuti a favore di imprese in fase di avviamento',
      'finanziamento_rischio': 'Art. 21 Regolamento (UE) n. 651/2014 - Aiuti al finanziamento del rischio',
      'agricoltura': 'Regolamento (UE) n. 1408/2013 - De minimis settore agricolo',
      'pesca': 'Regolamento (UE) n. 717/2014 - De minimis settore pesca e acquacoltura',
      'acquacoltura_innovativi': 'Regolamento (UE) n. 1388/2014 - Investimenti produttivi innovativi in acquacoltura',
      'acquacoltura_produttivi': 'Regolamento (UE) n. 1388/2014 - Investimenti produttivi in acquacoltura'
    }
    return labels[reg as keyof typeof labels] || reg
  }

  const getDimensioneLabel = (dim: string) => {
    const labels = {
      'microimpresa': 'Microimpresa',
      'piccola': 'Piccola impresa',
      'media': 'Media impresa',
      'mid_cap': 'Mid-cap (impresa a media capitalizzazione)'
    }
    return labels[dim as keyof typeof labels] || dim
  }

  return (
    <div className="bg-white" style={{ pageBreakBefore: 'always', breakBefore: 'always', pageBreakInside: 'avoid', breakInside: 'avoid', display: 'block', position: 'relative', paddingTop: '3rem' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4" style={{ pageBreakAfter: 'avoid', breakAfter: 'avoid', pageBreakInside: 'avoid', breakInside: 'avoid', display: 'block', marginTop: 0 }}>
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold">MODULO 662/96</h2>
            <p className="text-blue-100 text-sm">Domanda di Agevolazione - Fondo di Garanzia PMI</p>
          </div>
        </div>
        </div>

        {/* Content */}
      <div className="py-8">
        {/* Dati del Dichiarante */}
        <div className="px-8 py-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
            Il/La sottoscritto/a
          </h3>
        <div className="prose max-w-none">
          <p className="text-gray-800">
            <strong>{data.cognomeNome || '[Nome e Cognome]'}</strong>,
            nato/a a <strong>{data.natoA || '[Luogo di nascita]'}</strong> il{' '}
            <strong>{formatDate(data.natoIl) || '[Data di nascita]'}</strong>
          </p>
        </div>
        </div>

        {/* In qualità di */}
        <div className="px-8 py-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
            In qualità di
          </h3>
        <p className="text-gray-800">
          <strong>{getTipoSoggettoLabel(data.tipoSoggetto)}</strong>
        </p>
        </div>

        {/* Dati Soggetto Beneficiario */}
        <div className="px-8 py-8" style={{ pageBreakBefore: 'always', breakBefore: 'always' }}>
          <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
            Dati del Soggetto Beneficiario Finale
          </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Denominazione / Ragione Sociale</p>
            <p className="font-semibold text-gray-900">{data.denominazione || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Codice Fiscale / P.IVA</p>
            <p className="font-semibold text-gray-900">{data.codiceFiscale || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Data di Costituzione</p>
            <p className="font-semibold text-gray-900">{formatDate(data.dataCostituzione) || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Sede Legale</p>
            <p className="font-semibold text-gray-900">
              {data.comuneSede} ({data.provincia}) - {data.indirizzo}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email PEC</p>
            <p className="font-semibold text-gray-900">{data.pec || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email Ordinaria</p>
            <p className="font-semibold text-gray-900">{data.emailOrdinaria || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Telefono</p>
            <p className="font-semibold text-gray-900">{data.telefono || '-'}</p>
          </div>
        </div>
        </div>

        {/* Operazione Finanziaria */}
        <div className="px-8 py-8" style={{ pageBreakBefore: 'always', breakBefore: 'always' }}>
          <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
            Operazione Finanziaria
          </h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Importo Operazione</p>
            <p className="font-semibold text-gray-900 text-xl">€ {formatCurrency(data.importoOperazione)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Durata</p>
            <p className="font-semibold text-gray-900">{data.durataOperazione || '-'} mesi</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Codice ATECO 2007</p>
            <p className="font-semibold text-gray-900">{data.codiceAteco || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Sede dell'attività</p>
            <p className="font-semibold text-gray-900">
              {data.sedeAttivita === 'legale' ? 'Sede Legale' : `Sede Operativa: ${data.sedeOperativaComune} (${data.sedeOperativaProvincia})`}
            </p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Finalità dell'operazione:</strong> {getFinalitaLabel(data.finalitaOperazione)}
          </p>
          {data.finalitaOperazione === 'liquidita' && data.descrizioneLiquidita && (
            <p className="text-sm text-gray-700 mt-2">
              <strong>Descrizione:</strong> {data.descrizioneLiquidita}
            </p>
          )}
        </div>
        </div>

        {/* Programma di Investimento */}
      {data.finalitaOperazione === 'investimento' && (
        <>
            <div className="px-8 py-8" style={{ pageBreakBefore: 'always', breakBefore: 'always' }}>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
              Programma di Investimento
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Importo totale programma</p>
                <p className="font-semibold text-gray-900 text-xl">€ {formatCurrency(data.importoProgramma)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Stato del programma</p>
                <p className="font-semibold text-gray-900">
                  {data.statoPrograma === 'da_iniziare' && 'Da iniziare'}
                  {data.statoPrograma === 'iniziato' && 'Iniziato'}
                  {data.statoPrograma === 'da_completare' && 'Da completare'}
                  {data.statoPrograma === 'completato' && 'Già completato'}
                </p>
              </div>
              {data.dataInizio && (
                <div>
                  <p className="text-sm text-gray-600">Data inizio</p>
                  <p className="font-semibold text-gray-900">{formatDate(data.dataInizio)}</p>
                </div>
              )}
              {data.dataCompletamento && (
                <div>
                  <p className="text-sm text-gray-600">Data completamento</p>
                  <p className="font-semibold text-gray-900">{formatDate(data.dataCompletamento)}</p>
                </div>
              )}
              {data.dataPrevistaCompletamento && (
                <div>
                  <p className="text-sm text-gray-600">Data prevista completamento</p>
                  <p className="font-semibold text-gray-900">{formatDate(data.dataPrevistaCompletamento)}</p>
                </div>
              )}
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Finalità del programma:</p>
              <div className="flex flex-wrap gap-2">
                {data.finalitaInnovazioneTecnologica && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Innovazione Tecnologica e Digitale
                  </span>
                )}
                {data.finalitaEfficienzaEnergetica && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Efficienza Energetica
                  </span>
                )}
                {data.finalitaRicercaSviluppo && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    Ricerca e Sviluppo
                  </span>
                )}
                {data.finalitaCrescita && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                    Crescita
                  </span>
                )}
                {data.finalitaSostenibilita && (
                  <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
                    Sostenibilità
                  </span>
                )}
                {data.finalitaRisorseUmane && (
                  <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
                    Risorse Umane
                  </span>
                )}
              </div>
            </div>

            {data.descrizioneInvestimento && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Descrizione dettagliata:</p>
                <p className="text-gray-800 whitespace-pre-wrap">{data.descrizioneInvestimento}</p>
              </div>
            )}
          </div>

          {/* Dettaglio Programma */}
            <div className="px-8 py-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
              Dettaglio Programma d'Investimento
            </h3>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 text-sm font-semibold text-gray-700">Categoria</th>
                  <th className="text-right py-2 text-sm font-semibold text-gray-700">Importo (€)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {parseFloat(data.importoTerreni || '0') > 0 && (
                  <tr>
                    <td className="py-2 text-sm text-gray-700">Terreni</td>
                    <td className="py-2 text-sm text-gray-900 text-right font-medium">{formatCurrency(data.importoTerreni)}</td>
                  </tr>
                )}
                {parseFloat(data.importoFabbricati || '0') > 0 && (
                  <tr>
                    <td className="py-2 text-sm text-gray-700">Fabbricati, opere murarie</td>
                    <td className="py-2 text-sm text-gray-900 text-right font-medium">{formatCurrency(data.importoFabbricati)}</td>
                  </tr>
                )}
                {parseFloat(data.importoMacchinari || '0') > 0 && (
                  <tr>
                    <td className="py-2 text-sm text-gray-700">Macchinari, impianti, attrezzature</td>
                    <td className="py-2 text-sm text-gray-900 text-right font-medium">{formatCurrency(data.importoMacchinari)}</td>
                  </tr>
                )}
                {parseFloat(data.importoInvestimentiImmateriali || '0') > 0 && (
                  <tr>
                    <td className="py-2 text-sm text-gray-700">Investimenti immateriali</td>
                    <td className="py-2 text-sm text-gray-900 text-right font-medium">{formatCurrency(data.importoInvestimentiImmateriali)}</td>
                  </tr>
                )}
                {parseFloat(data.importoAttiviFinanziari || '0') > 0 && (
                  <tr>
                    <td className="py-2 text-sm text-gray-700">Attivi finanziari</td>
                    <td className="py-2 text-sm text-gray-900 text-right font-medium">{formatCurrency(data.importoAttiviFinanziari)}</td>
                  </tr>
                )}
                {parseFloat(data.importoAltro || '0') > 0 && (
                  <tr>
                    <td className="py-2 text-sm text-gray-700">Altro - {data.descrizioneAltro || 'Non specificato'}</td>
                    <td className="py-2 text-sm text-gray-900 text-right font-medium">{formatCurrency(data.importoAltro)}</td>
                  </tr>
                )}
                <tr className="border-t-2 border-gray-400 font-semibold bg-gray-50">
                  <td className="py-2 text-sm text-gray-900">TOTALE</td>
                  <td className="py-2 text-sm text-gray-900 text-right text-lg">€ {formatCurrency(
                    (parseFloat(data.importoTerreni || '0') +
                    parseFloat(data.importoFabbricati || '0') +
                    parseFloat(data.importoMacchinari || '0') +
                    parseFloat(data.importoInvestimentiImmateriali || '0') +
                    parseFloat(data.importoAttiviFinanziari || '0') +
                    parseFloat(data.importoAltro || '0')).toString()
                  )}</td>
                </tr>
              </tbody>
            </table>

            {data.hasLiquiditaConnessa && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Liquidità connessa all'investimento:</strong> € {formatCurrency(data.importoLiquiditaConnessa)}
                </p>
              </div>
            )}
          </div>

          {/* Piano di Copertura */}
            <div className="px-8 py-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
              Piano di Copertura Finanziaria
            </h3>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 text-sm font-semibold text-gray-700">Fonte</th>
                  <th className="text-right py-2 text-sm font-semibold text-gray-700">Importo (€)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2 text-sm text-gray-700">Finanziamento oggetto domanda</td>
                  <td className="py-2 text-sm text-gray-900 text-right font-medium">{formatCurrency(data.importoFinanziamento)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-sm text-gray-700">Risorse proprie</td>
                  <td className="py-2 text-sm text-gray-900 text-right font-medium">{formatCurrency(data.importoRisorseProprie)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-sm text-gray-700">Altre fonti di copertura</td>
                  <td className="py-2 text-sm text-gray-900 text-right font-medium">{formatCurrency(data.importoAltreFonti)}</td>
                </tr>
                <tr className="border-t-2 border-gray-400 font-semibold bg-gray-50">
                  <td className="py-2 text-sm text-gray-900">TOTALE FONTI</td>
                  <td className="py-2 text-sm text-gray-900 text-right text-lg">€ {formatCurrency(
                    (parseFloat(data.importoFinanziamento || '0') +
                    parseFloat(data.importoRisorseProprie || '0') +
                    parseFloat(data.importoAltreFonti || '0')).toString()
                  )}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Altre Agevolazioni */}
          {data.hasAltreAgevolazioni && data.altreAgevolazioni.length > 0 && (
              <div className="px-8 py-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                Altre Agevolazioni sul Programma
              </h3>
              <div className="space-y-3">
                {data.altreAgevolazioni.map((agev, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded border border-gray-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <p className="text-xs text-gray-600">Riferimento normativo</p>
                        <p className="text-sm font-medium text-gray-900">{agev.riferimentoNormativo || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Tipologia contributo</p>
                        <p className="text-sm font-medium text-gray-900">{agev.tipologiaContributo || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Data concessione</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(agev.dataConcessione) || '-'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-600">Intensità di Aiuto</p>
                        <p className="text-sm font-medium text-gray-900">{agev.intensitaAiuto || '-'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Regolamentazione UE */}
        <div className="px-8 py-8" style={{ pageBreakBefore: 'always', breakBefore: 'always' }}>
        <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
          Regolamentazione Europea Applicabile
        </h3>
        <p className="text-gray-800">
          <strong>{getRegolamentazioneLabel(data.regolamentazioneUE)}</strong>
        </p>
        </div>

        {/* Dimensione Aziendale */}
        <div className="px-8 py-8" style={{ pageBreakBefore: 'always', breakBefore: 'always' }}>
        <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
          Prospetto Determinazione Dimensione Aziendale
        </h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600">Periodo di riferimento</p>
          <p className="font-semibold text-gray-900">{data.periodoRiferimento || '-'}</p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Tipo di impresa</p>
          <p className="font-semibold text-gray-900">
            {data.tipoImpresa === 'autonoma' && 'Autonoma'}
            {data.tipoImpresa === 'associata' && 'Associata'}
            {data.tipoImpresa === 'collegata' && 'Collegata'}
            {data.tipoImpresa === 'associata_collegata' && 'Associata e Collegata'}
          </p>
        </div>

        <h4 className="text-md font-semibold text-gray-900 mb-3">Dati Impresa Richiedente</h4>
        <table className="w-full mb-4">
          <thead>
            <tr className="border-b-2 border-gray-300 bg-gray-50">
              <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Parametro</th>
              <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700">Valore</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="py-2 px-3 text-sm text-gray-700">Fatturato annuo</td>
              <td className="py-2 px-3 text-sm text-gray-900 text-right font-medium">€ {formatCurrency(data.fatturatoImpresa)}</td>
            </tr>
            <tr>
              <td className="py-2 px-3 text-sm text-gray-700">Totale Attivo di bilancio</td>
              <td className="py-2 px-3 text-sm text-gray-900 text-right font-medium">€ {formatCurrency(data.attivoImpresa)}</td>
            </tr>
            <tr>
              <td className="py-2 px-3 text-sm text-gray-700">Occupati (ULA)</td>
              <td className="py-2 px-3 text-sm text-gray-900 text-right font-medium">{data.occupatiImpresa || '0'}</td>
            </tr>
          </tbody>
        </table>

        {/* Imprese Associate/Collegate */}
        {data.impreseAssociate.length > 0 && (
          <div className="mt-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Imprese Associate/Collegate</h4>
            {data.impreseAssociate.map((impresa, index) => (
              <div key={index} className="mb-3 p-4 bg-gray-50 rounded border border-gray-200">
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <p className="text-xs text-gray-600">Denominazione</p>
                    <p className="text-sm font-medium text-gray-900">{impresa.denominazione}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Codice Fiscale</p>
                    <p className="text-sm font-medium text-gray-900">{impresa.codiceFiscale}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Relazione</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{impresa.relazione}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Percentuale</p>
                    <p className="text-sm font-medium text-gray-900">{impresa.percentuale}%</p>
                  </div>
                </div>
                <table className="w-full mt-2">
                  <tbody className="text-xs">
                    <tr>
                      <td className="py-1 text-gray-600">Fatturato:</td>
                      <td className="py-1 text-right font-medium">€ {formatCurrency(impresa.fatturato)}</td>
                      <td className="py-1 pl-4 text-gray-600">Attivo:</td>
                      <td className="py-1 text-right font-medium">€ {formatCurrency(impresa.attivo)}</td>
                      <td className="py-1 pl-4 text-gray-600">Occupati:</td>
                      <td className="py-1 text-right font-medium">{impresa.occupati} ULA</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="text-sm font-semibold text-gray-800 mb-2">Totali Aggregati</h5>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 text-gray-700">Fatturato Totale:</td>
                    <td className="py-1 text-right font-semibold">€ {formatCurrency(
                      (parseFloat(data.fatturatoImpresa || '0') +
                      data.impreseAssociate.reduce((sum, imp) => sum + parseFloat(imp.fatturato || '0'), 0)).toString()
                    )}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-700">Attivo Totale:</td>
                    <td className="py-1 text-right font-semibold">€ {formatCurrency(
                      (parseFloat(data.attivoImpresa || '0') +
                      data.impreseAssociate.reduce((sum, imp) => sum + parseFloat(imp.attivo || '0'), 0)).toString()
                    )}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-700">Occupati Totali:</td>
                    <td className="py-1 text-right font-semibold">{
                      parseFloat(data.occupatiImpresa || '0') +
                      data.impreseAssociate.reduce((sum, imp) => sum + parseFloat(imp.occupati || '0'), 0)
                    } ULA</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>

        {/* Dimensione Finale */}
        <div className="px-8 py-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
          Dimensione Finale dell'Impresa
        </h3>
        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300">
          <p className="text-2xl font-bold text-blue-900 text-center">
            {getDimensioneLabel(data.dimensioneImpresa).toUpperCase()}
          </p>
        </div>
        </div>

        {/* Dichiarazioni Finali */}
      {(data.isStartupInnovativa || data.isIncubatoreCertificato) && (
          <div className="px-8 py-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
            Dichiarazioni Finali
          </h3>
          <div className="space-y-2">
            {data.isStartupInnovativa && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 rounded border border-green-200">
                <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-gray-800">
                  L'impresa è una <strong>startup innovativa</strong> iscritta nella sezione speciale del Registro delle Imprese
                </p>
              </div>
            )}
            {data.isIncubatoreCertificato && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 rounded border border-green-200">
                <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-gray-800">
                  L'impresa è un <strong>incubatore certificato</strong> iscritto nella sezione speciale del Registro delle Imprese
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DICHIARA - 12 Dichiarazioni */}
        <div className="px-8 py-8" style={{ pageBreakBefore: 'always', breakBefore: 'always' }}>
        <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
          DICHIARA
        </h3>
        <p className="text-sm text-gray-700 mb-4 italic">
          Ai sensi degli artt. 46 e 47 del D.P.R. n. 445/2000, consapevole delle responsabilità penali:
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start space-x-2">
            <span className="font-semibold">1.</span>
            <div className={`flex-1 p-2 rounded ${data.dichiaraParametriDimensionali ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              Rispetta i parametri dimensionali previsti dalla Raccomandazione CE 2003/361/CE
              {data.dichiaraParametriDimensionali && <span className="ml-2 text-green-600 font-semibold">✓</span>}
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-semibold">2.</span>
            <div className={`flex-1 p-2 rounded ${data.dichiaraNoAiutiSalvataggio ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              Non rientra fra coloro che hanno ricevuto aiuti per salvataggio senza rimborso
              {data.dichiaraNoAiutiSalvataggio && <span className="ml-2 text-green-600 font-semibold">✓</span>}
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-semibold">3.</span>
            <div className={`flex-1 p-2 rounded ${data.dichiaraAccettaNormativaComunitaria ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              Accetta la normativa comunitaria, nazionale, primaria e secondaria
              {data.dichiaraAccettaNormativaComunitaria && <span className="ml-2 text-green-600 font-semibold">✓</span>}
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-semibold">4.</span>
            <div className={`flex-1 p-2 rounded ${data.dichiaraAccettaDisposizioniOperative ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              Accetta le vigenti Disposizioni Operative
              {data.dichiaraAccettaDisposizioniOperative && <span className="ml-2 text-green-600 font-semibold">✓</span>}
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-semibold">5.</span>
            <div className={`flex-1 p-2 rounded ${data.dichiaraAccettaSurrogazioneLegale ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              Accetta la surrogazione legale del Fondo di Garanzia
              {data.dichiaraAccettaSurrogazioneLegale && <span className="ml-2 text-green-600 font-semibold">✓</span>}
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-semibold">6.</span>
            <div className={`flex-1 p-2 rounded ${data.dichiaraComunicaVariazioni ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              Si impegna a comunicare variazioni societarie
              {data.dichiaraComunicaVariazioni && <span className="ml-2 text-green-600 font-semibold">✓</span>}
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-semibold">7.</span>
            <div className={`flex-1 p-2 rounded ${data.dichiaraTrasmetteDocumentazione ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              Si impegna a trasmettere tutta la documentazione necessaria
              {data.dichiaraTrasmetteDocumentazione && <span className="ml-2 text-green-600 font-semibold">✓</span>}
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-semibold">8.</span>
            <div className={`flex-1 p-2 rounded ${data.dichiaraComunicaPortale ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              Si impegna a comunicare tramite il portale telematico
              {data.dichiaraComunicaPortale && <span className="ml-2 text-green-600 font-semibold">✓</span>}
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-semibold">9.</span>
            <div className={`flex-1 p-2 rounded ${data.dichiaraConsenteControlli ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              Consente controlli, accertamenti ed ispezioni
              {data.dichiaraConsenteControlli && <span className="ml-2 text-green-600 font-semibold">✓</span>}
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-semibold">10.</span>
            <div className={`flex-1 p-2 rounded ${data.dichiaraAccettaRevoca ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              Accetta le condizioni di revoca dell'agevolazione
              {data.dichiaraAccettaRevoca && <span className="ml-2 text-green-600 font-semibold">✓</span>}
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-semibold">11.</span>
            <div className={`flex-1 p-2 rounded ${data.dichiaraPrendeAttoPubblicazione ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              Prende atto della pubblicazione dei dati su internet
              {data.dichiaraPrendeAttoPubblicazione && <span className="ml-2 text-green-600 font-semibold">✓</span>}
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-semibold">12.</span>
            <div className={`flex-1 p-2 rounded ${data.dichiaraConsapevoleComunicazioni ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              È consapevole delle comunicazioni tramite portale e PEC
              {data.dichiaraConsapevoleComunicazioni && <span className="ml-2 text-green-600 font-semibold">✓</span>}
            </div>
          </div>
        </div>
        </div>

        {/* De minimis (solo se regolamentazione de minimis) */}
        {data.regolamentazioneUE === 'de_minimis' && (
          <div className="px-8 py-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
            Dichiarazioni specifiche "de minimis"
          </h3>
          <div className="space-y-2">
            <div className={`p-3 rounded ${data.deMinimisRispettaLimite ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              <p className="text-sm">
                <strong>a)</strong> Si impegna a rispettare il limite di cumulo previsto
                {data.deMinimisRispettaLimite && <span className="ml-2 text-green-600 font-semibold">✓</span>}
              </p>
            </div>
            <div className={`p-3 rounded ${data.deMinimisAttuaSeparazione ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              <p className="text-sm">
                <strong>b)</strong> Si impegna ad attuare la separazione delle attività o la distinzione dei costi
                {data.deMinimisAttuaSeparazione && <span className="ml-2 text-green-600 font-semibold">✓</span>}
              </p>
            </div>
          </div>
          </div>
        )}

        {/* Aiuti Incompatibili */}
        <div className="px-8 py-8" style={{ pageBreakBefore: 'always', breakBefore: 'always' }}>
        <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
          Aiuti Incompatibili con Decisioni CE
        </h3>
        <div className="p-4 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm font-semibold mb-2">Situazione dichiarata:</p>
          {data.aiutiIncompatibili === 'non_ricevuti' && (
            <p className="text-sm">Non ha ricevuto aiuti dichiarati incompatibili</p>
          )}
          {data.aiutiIncompatibili === 'ricevuti_de_minimis' && (
            <div className="text-sm">
              <p>Ha ricevuto aiuti "de minimis" dichiarati incompatibili, non tenuto alla restituzione</p>
              {data.aiutiIncompatibiliImporto && (
                <p className="mt-1"><strong>Ammontare:</strong> € {formatCurrency(data.aiutiIncompatibiliImporto)}</p>
              )}
            </div>
          )}
          {data.aiutiIncompatibili === 'rimborsati' && (
            <div className="text-sm">
              <p>Ha rimborsato gli aiuti dichiarati incompatibili</p>
              {data.aiutiIncompatibiliDataRimborso && (
                <p className="mt-1"><strong>Data rimborso:</strong> {formatDate(data.aiutiIncompatibiliDataRimborso)}</p>
              )}
              {data.aiutiIncompatibiliMezzoRimborso && (
                <p className="mt-1"><strong>Mezzo utilizzato:</strong> {data.aiutiIncompatibiliMezzoRimborso}</p>
              )}
              {data.aiutiIncompatibiliImporto && (
                <p className="mt-1"><strong>Importo:</strong> € {formatCurrency(data.aiutiIncompatibiliImporto)}</p>
              )}
              {data.aiutiIncompatibiliLetteraRiferimento && (
                <p className="mt-1"><strong>Riferimento:</strong> lettera {data.aiutiIncompatibiliLetteraRiferimento}</p>
              )}
            </div>
          )}
          {data.aiutiIncompatibili === 'depositati' && (
            <div className="text-sm">
              <p>Ha depositato la somma nel conto di contabilità speciale presso Banca d'Italia</p>
              {data.aiutiIncompatibiliImporto && (
                <p className="mt-1"><strong>Importo:</strong> € {formatCurrency(data.aiutiIncompatibiliImporto)}</p>
              )}
              {data.aiutiIncompatibiliLetteraRiferimento && (
                <p className="mt-1"><strong>Riferimento:</strong> lettera {data.aiutiIncompatibiliLetteraRiferimento}</p>
              )}
            </div>
          )}
        </div>
        </div>

        {/* CDP - Casse Professionali */}
        {(data.cassaProfessionaleENPAB || data.cassaProfessionaleENPACL || data.cassaProfessionaleEPAP ||
          data.cassaProfessionaleENPAM || data.cassaProfessionaleDottoriCommercialisti ||
          data.cassaProfessionaleCassaForense || data.cassaProfessionaleINARCASSA || data.cassaProfessionaleCIPAG) && (
          <div className="px-8 py-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
            Sezione CDP – Casse Professionali
          </h3>
          <p className="text-sm text-gray-700 mb-3">Appartenenza alle seguenti Casse Professionali:</p>
          <div className="flex flex-wrap gap-2">
            {data.cassaProfessionaleENPAB && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">ENPAB - Biologi</span>
            )}
            {data.cassaProfessionaleENPACL && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">ENPACL - Consulenti del lavoro</span>
            )}
            {data.cassaProfessionaleEPAP && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">EPAP – Pluricategoriale</span>
            )}
            {data.cassaProfessionaleENPAM && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">ENPAM - Medici</span>
            )}
            {data.cassaProfessionaleDottoriCommercialisti && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Dottori Commercialisti</span>
            )}
            {data.cassaProfessionaleCassaForense && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Cassa Forense - Avvocati</span>
            )}
            {data.cassaProfessionaleINARCASSA && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">INARCASSA - Ingegneri/Architetti</span>
            )}
            {data.cassaProfessionaleCIPAG && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">CIPAG - Geometri</span>
            )}
          </div>
          </div>
        )}

        {/* InvestEU - Solo se almeno una dichiarazione è true */}
        {(data.investEUNonAttivitaEscluse || data.investEURiconosceAudit || data.investEUSedeUE) && (
          <div className="px-8 py-8" style={{ pageBreakBefore: 'always', breakBefore: 'always' }}>
          <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
            Scheda InvestEU
          </h3>
          <p className="text-sm text-gray-700 mb-3">
            Dichiarazioni per l'ammissibilità alla controgaranzia CDP – Programma InvestEU:
          </p>
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <p className="text-sm font-semibold text-green-900 mb-2">
              ✓ Tutte le dichiarazioni InvestEU richieste sono state confermate
            </p>
            <p className="text-xs text-green-700">
              Il beneficiario ha accettato tutte le condizioni relative al Programma InvestEU, inclusi i requisiti di audit,
              trattamento dati, conformità normativa e tutte le altre dichiarazioni richieste per l'ammissibilità alla controgaranzia CDP-FEI.
            </p>
          </div>
          </div>
        )}
      </div>
    </div>
  )
}
