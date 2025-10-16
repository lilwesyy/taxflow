import { Calculator, TrendingUp, DollarSign, PieChart, AlertTriangle, Info, Download, Calendar, HelpCircle, Zap } from 'lucide-react'
import { useState, useRef } from 'react'

export default function SimulazioneImposte() {
  const [formData, setFormData] = useState({
    fatturato: '',
    codiceAteco: '',
    anniAttivita: '0',
    speseDeducibili: ''
  })
  const [risultato, setRisultato] = useState<any>(null)
  const [showComparison, setShowComparison] = useState(false)
  const [timelineView, setTimelineView] = useState<'monthly' | 'quarterly' | 'yearly'>('yearly')
  const comparisonRef = useRef<HTMLDivElement>(null)

  const codiciAteco = [
    { code: '62.01.00', description: 'Produzione di software', coefficiente: 0.67 },
    { code: '62.02.00', description: 'Consulenza informatica', coefficiente: 0.78 },
    { code: '73.11.00', description: 'Agenzie di pubblicità', coefficiente: 0.75 },
    { code: '74.10.10', description: 'Attività di design', coefficiente: 0.78 },
    { code: '69.20.10', description: 'Consulenza contabile', coefficiente: 0.78 },
    { code: '82.99.99', description: 'Altri servizi di supporto', coefficiente: 0.86 }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const calcolaImposte = () => {
    const fatturato = parseFloat(formData.fatturato) || 0
    const atecoSelezionato = codiciAteco.find(c => c.code === formData.codiceAteco)
    const coefficiente = atecoSelezionato?.coefficiente || 0.78
    const isNeoAttivita = parseInt(formData.anniAttivita) < 5

    // Calcoli
    const redditoImponibile = fatturato * coefficiente
    const aliquotaIrpef = isNeoAttivita ? 0.05 : 0.15 // 5% primi 5 anni, 15% dopo
    const irpef = redditoImponibile * aliquotaIrpef

    // INPS (calcolato su fatturato)
    const inpsPercentuale = formData.codiceAteco.startsWith('62') || formData.codiceAteco.startsWith('74') ? 0.2535 : 0.26
    const inps = Math.min(fatturato * inpsPercentuale, 4800) // Massimale INPS

    const totaleImposte = irpef + inps
    const nettoFinale = fatturato - totaleImposte
    const percentualeTasse = (totaleImposte / fatturato) * 100

    // Calcolo scenario alternativo (per confronto)
    const aliquotaAlternativa = isNeoAttivita ? 0.15 : 0.05
    const irpefAlternativa = redditoImponibile * aliquotaAlternativa
    const totaleImposteAlternative = irpefAlternativa + inps
    const nettoFinaleAlternativo = fatturato - totaleImposteAlternative

    setRisultato({
      fatturato,
      redditoImponibile,
      irpef,
      inps,
      totaleImposte,
      nettoFinale,
      percentualeTasse,
      aliquotaIrpef: aliquotaIrpef * 100,
      coefficiente,
      isNeoAttivita,
      // Scenario alternativo
      irpefAlternativa,
      totaleImposteAlternative,
      nettoFinaleAlternativo,
      differenzaRisparmio: isNeoAttivita ? (totaleImposteAlternative - totaleImposte) : 0
    })
  }

  const quickScenarios = [
    { name: 'Freelancer Junior', fatturato: '25000', codiceAteco: '62.02.00' },
    { name: 'Consulente IT', fatturato: '45000', codiceAteco: '62.02.00' },
    { name: 'Designer', fatturato: '35000', codiceAteco: '74.10.10' },
    { name: 'Massimo Forfettario', fatturato: '85000', codiceAteco: '62.01.00' }
  ]

  const applyQuickScenario = (scenario: typeof quickScenarios[0]) => {
    setFormData({
      ...formData,
      fatturato: scenario.fatturato,
      codiceAteco: scenario.codiceAteco
    })
  }

  const exportResults = () => {
    if (!risultato) return
    const content = `
SIMULAZIONE IMPOSTE - REGIME FORFETTARIO
=========================================

Fatturato Annuo: € ${risultato.fatturato.toLocaleString()}
Reddito Imponibile: € ${risultato.redditoImponibile.toLocaleString()}
Coefficiente Redditività: ${risultato.coefficiente}

IMPOSTE:
- IRPEF (${risultato.aliquotaIrpef}%): € ${risultato.irpef.toLocaleString()}
- Contributi INPS: € ${risultato.inps.toLocaleString()}
- Totale Imposte: € ${risultato.totaleImposte.toLocaleString()}

NETTO FINALE: € ${risultato.nettoFinale.toLocaleString()}
Percentuale Tasse: ${risultato.percentualeTasse.toFixed(1)}%

${risultato.isNeoAttivita ? '\nAgevolazione neo-attività attiva (5% per primi 5 anni)' : ''}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'simulazione-imposte.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getTimelineBreakdown = () => {
    if (!risultato) return []

    if (timelineView === 'monthly') {
      return Array.from({ length: 12 }, (_, i) => ({
        periodo: new Date(2024, i).toLocaleDateString('it-IT', { month: 'short' }),
        importo: risultato.nettoFinale / 12,
        imposte: risultato.totaleImposte / 12
      }))
    } else if (timelineView === 'quarterly') {
      return Array.from({ length: 4 }, (_, i) => ({
        periodo: `Q${i + 1}`,
        importo: risultato.nettoFinale / 4,
        imposte: risultato.totaleImposte / 4
      }))
    }
    return []
  }

  return (
    <div className="space-y-8">
      {/* Quick Scenarios */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex items-center mb-4">
          <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 mr-2" />
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">Scenari Rapidi</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickScenarios.map((scenario) => (
            <button
              key={scenario.name}
              onClick={() => applyQuickScenario(scenario)}
              className="bg-gray-50 p-3 rounded-lg hover:bg-primary-50 hover:border-primary-300 border border-gray-200 hover:shadow-md transition-all duration-200 text-left group"
            >
              <p className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{scenario.name}</p>
              <p className="text-xs text-gray-600 mt-1">€ {parseInt(scenario.fatturato).toLocaleString()}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow relative z-10">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Inserisci i tuoi dati</h3>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Fatturato Annuo Previsto *
                </label>
                <div className="group relative">
                  <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                    Il fatturato massimo per il regime forfettario è di € 65.000 annui
                  </div>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  name="fatturato"
                  value={formData.fatturato}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pl-8 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    formData.fatturato && parseFloat(formData.fatturato) > 65000
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="50000"
                  max="65000"
                />
                <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {formData.fatturato && parseFloat(formData.fatturato) > 65000 ? (
                <p className="text-xs text-red-600 mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Oltre il limite di € 65.000 per il regime forfettario
                </p>
              ) : (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>€ 0</span>
                    <span>€ 65.000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((parseFloat(formData.fatturato || '0') / 65000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Codice ATECO *
                </label>
                <div className="group relative">
                  <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                    Il coefficiente di redditività varia in base al codice ATECO e determina il reddito imponibile
                  </div>
                </div>
              </div>
              <select
                name="codiceAteco"
                value={formData.codiceAteco}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Seleziona il tuo codice ATECO</option>
                {codiciAteco.map((ateco) => (
                  <option key={ateco.code} value={ateco.code}>
                    {ateco.code} - {ateco.description} (Coeff. {ateco.coefficiente})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anni di attività
              </label>
              <select
                name="anniAttivita"
                value={formData.anniAttivita}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="0">Prima apertura (0 anni)</option>
                <option value="1">1 anno</option>
                <option value="2">2 anni</option>
                <option value="3">3 anni</option>
                <option value="4">4 anni</option>
                <option value="5">5 anni o più</option>
              </select>
            </div>

            <button
              onClick={calcolaImposte}
              disabled={!formData.fatturato || !formData.codiceAteco}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              <Calculator className="h-5 w-5 inline mr-2" />
              Calcola Imposte
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {risultato ? (
            <>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={exportResults}
                  className="flex-1 bg-primary-100 border border-primary-300 text-primary-700 py-2 px-3 sm:px-4 rounded-lg hover:bg-primary-200 hover:border-primary-400 transition-all duration-200 flex items-center justify-center font-medium text-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Esporta
                </button>
                <button
                  onClick={() => {
                    setShowComparison(!showComparison)
                    if (!showComparison) {
                      setTimeout(() => {
                        comparisonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }, 100)
                    }
                  }}
                  className={`flex-1 py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 flex items-center justify-center font-medium text-sm ${
                    showComparison
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-300'
                      : 'bg-primary-100 border border-primary-300 text-primary-700 hover:bg-primary-200 hover:border-primary-400'
                  }`}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Confronta
                </button>
              </div>

              {/* Visual Tax Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all duration-300">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                  <PieChart className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary-600" />
                  Ripartizione Imposte
                </h3>

                {/* Visual Bar */}
                <div className="mb-6">
                  <div className="flex h-14 rounded-lg overflow-hidden shadow-sm border border-gray-300">
                    <div
                      className="bg-green-500 flex items-center justify-center text-white text-sm font-bold transition-all duration-500"
                      style={{ width: `${(risultato.nettoFinale / risultato.fatturato) * 100}%` }}
                    >
                      {((risultato.nettoFinale / risultato.fatturato) * 100).toFixed(0)}%
                    </div>
                    <div
                      className="bg-red-500 flex items-center justify-center text-white text-sm font-bold transition-all duration-500"
                      style={{ width: `${(risultato.irpef / risultato.fatturato) * 100}%` }}
                    >
                      {((risultato.irpef / risultato.fatturato) * 100).toFixed(0)}%
                    </div>
                    <div
                      className="bg-orange-500 flex items-center justify-center text-white text-sm font-bold transition-all duration-500"
                      style={{ width: `${(risultato.inps / risultato.fatturato) * 100}%` }}
                    >
                      {((risultato.inps / risultato.fatturato) * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="flex justify-between mt-3 text-xs font-medium">
                    <span className="flex items-center text-green-700">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-1 shadow"></span>
                      Netto
                    </span>
                    <span className="flex items-center text-red-700">
                      <span className="w-3 h-3 bg-red-500 rounded-full mr-1 shadow"></span>
                      IRPEF
                    </span>
                    <span className="flex items-center text-orange-700">
                      <span className="w-3 h-3 bg-orange-500 rounded-full mr-1 shadow"></span>
                      INPS
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Fatturato Annuo</span>
                    <span className="font-semibold text-gray-900">€ {risultato.fatturato.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center">
                      Reddito Imponibile
                      <div className="group relative ml-1">
                        <HelpCircle className="h-3 w-3 text-gray-400 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                          Fatturato × Coefficiente {risultato.coefficiente}
                        </div>
                      </div>
                    </span>
                    <span className="font-semibold text-gray-900">€ {risultato.redditoImponibile.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">IRPEF ({risultato.aliquotaIrpef}%)</span>
                    <span className="font-semibold text-red-600">€ {risultato.irpef.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Contributi INPS</span>
                    <span className="font-semibold text-orange-600">€ {risultato.inps.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center py-4 bg-red-50 px-4 rounded-lg mt-2 border border-red-200">
                    <span className="font-semibold text-gray-900">Totale Imposte</span>
                    <span className="font-bold text-red-600 text-lg">€ {risultato.totaleImposte.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center py-4 bg-green-50 px-4 rounded-lg border border-green-200">
                    <span className="font-semibold text-gray-900">Netto Finale</span>
                    <span className="font-bold text-green-600 text-xl">€ {risultato.nettoFinale.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-5 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center">
                    <div className="bg-primary-100 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                      <PieChart className="h-5 w-5 sm:h-7 sm:w-7 text-primary-600" />
                    </div>
                    <div className="ml-2 sm:ml-3">
                      <p className="text-xs text-gray-600 font-medium">% Tasse</p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">{risultato.percentualeTasse.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-5 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                      <TrendingUp className="h-5 w-5 sm:h-7 sm:w-7 text-green-600" />
                    </div>
                    <div className="ml-2 sm:ml-3">
                      <p className="text-xs text-gray-600 font-medium">Coefficiente</p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">{risultato.coefficiente}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits Card */}
              {risultato.isNeoAttivita && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6 animate-fade-in">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-green-900 mb-2">Agevolazione Neo-attività</h4>
                      <p className="text-xs sm:text-sm text-green-800 mb-2">
                        Stai usufruendo dell'aliquota agevolata del 5% per i primi 5 anni di attività!
                        Dal 6° anno l'aliquota diventerà del 15%.
                      </p>
                      {risultato.differenzaRisparmio > 0 && (
                        <p className="text-xs sm:text-sm font-semibold text-green-900">
                          Risparmio annuo: € {risultato.differenzaRisparmio.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-md transition-shadow relative z-10">
              <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Inserisci i dati</h3>
              <p className="text-gray-600">Compila il form per visualizzare il calcolo delle imposte</p>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Section */}
      {risultato && showComparison && (
        <div ref={comparisonRef} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 animate-fade-in">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary-600" />
            Confronto Aliquote
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Current Scenario */}
            <div className="p-6 rounded-lg border-2 border-green-300 shadow-sm bg-green-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">
                  {risultato.isNeoAttivita ? 'Aliquota Agevolata (5%)' : 'Aliquota Standard (15%)'}
                </h4>
                <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full font-bold shadow">Attuale</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IRPEF ({risultato.aliquotaIrpef}%)</span>
                  <span className="font-semibold text-gray-900">€ {risultato.irpef.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">INPS</span>
                  <span className="font-semibold text-gray-900">€ {risultato.inps.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-green-300">
                  <span className="font-semibold text-gray-900">Totale Imposte</span>
                  <span className="font-bold text-red-600">€ {risultato.totaleImposte.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-green-300">
                  <span className="font-semibold text-gray-900">Netto Finale</span>
                  <span className="font-bold text-green-600 text-lg">€ {risultato.nettoFinale.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Alternative Scenario */}
            <div className="p-6 rounded-lg border-2 border-gray-300 bg-white shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">
                  {risultato.isNeoAttivita ? 'Aliquota Standard (15%)' : 'Aliquota Agevolata (5%)'}
                </h4>
                <span className="text-xs bg-gray-200 px-3 py-1 rounded-full font-medium text-gray-700">Alternativa</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IRPEF ({risultato.isNeoAttivita ? '15' : '5'}%)</span>
                  <span className="font-semibold text-gray-900">€ {risultato.irpefAlternativa.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">INPS</span>
                  <span className="font-semibold text-gray-900">€ {risultato.inps.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-300">
                  <span className="font-semibold text-gray-900">Totale Imposte</span>
                  <span className="font-bold text-red-600">€ {risultato.totaleImposteAlternative.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-300">
                  <span className="font-semibold text-gray-900">Netto Finale</span>
                  <span className="font-bold text-gray-700">€ {risultato.nettoFinaleAlternativo.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {risultato.isNeoAttivita && risultato.differenzaRisparmio > 0 && (
            <div className="mt-6 p-5 bg-green-100 border-2 border-green-300 rounded-lg">
              <p className="text-sm text-green-900 flex items-center">
                <span className="bg-green-600 p-2 rounded-full mr-3">
                  <DollarSign className="h-5 w-5 text-white" />
                </span>
                <span>
                  <span className="font-bold">Risparmio annuo con agevolazione:</span> € {risultato.differenzaRisparmio.toLocaleString()}
                  <span className="text-green-700 ml-2 font-semibold">({((risultato.differenzaRisparmio / risultato.totaleImposteAlternative) * 100).toFixed(1)}% in meno)</span>
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Timeline Breakdown */}
      {risultato && timelineView !== 'yearly' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Distribuzione Temporale</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setTimelineView('yearly')}
                className="px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Annuale
              </button>
              <button
                onClick={() => setTimelineView('quarterly')}
                className={`px-3 py-1 text-sm rounded-lg ${
                  timelineView === 'quarterly'
                    ? 'bg-primary-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Trimestrale
              </button>
              <button
                onClick={() => setTimelineView('monthly')}
                className={`px-3 py-1 text-sm rounded-lg ${
                  timelineView === 'monthly'
                    ? 'bg-primary-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Mensile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {getTimelineBreakdown().map((item, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">{item.periodo}</p>
                <p className="text-lg font-bold text-green-600">€ {item.importo.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-red-600">-€ {item.imposte.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-center">
            <button
              onClick={() => setTimelineView('yearly')}
              className="text-sm text-gray-600 hover:text-primary-600 flex items-center"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Torna alla vista annuale
            </button>
          </div>
        </div>
      )}

      {risultato && timelineView === 'yearly' && (
        <div className="flex justify-center">
          <button
            onClick={() => setTimelineView('quarterly')}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Visualizza distribuzione temporale
          </button>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
        <div className="flex items-start space-x-2 sm:space-x-3">
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="text-sm sm:text-base font-semibold text-blue-900 mb-2">Nota Importante</h4>
            <p className="text-xs sm:text-sm text-blue-800">
              Questa simulazione è indicativa e basata sui parametri attuali del regime forfettario.
              I calcoli effettivi possono variare in base a deduzioni specifiche e aggiornamenti normativi.
              Consulta sempre il tuo consulente per una valutazione precisa.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}