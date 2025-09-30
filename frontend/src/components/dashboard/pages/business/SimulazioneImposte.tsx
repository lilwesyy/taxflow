import { Calculator, TrendingUp, DollarSign, PieChart, AlertTriangle, Info } from 'lucide-react'
import { useState } from 'react'

export default function SimulazioneImposte() {
  const [formData, setFormData] = useState({
    fatturato: '',
    codiceAteco: '',
    anniAttivita: '0',
    speseDeducibili: ''
  })
  const [risultato, setRisultato] = useState<any>(null)

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
      isNeoAttivita
    })
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Inserisci i tuoi dati</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fatturato Annuo Previsto *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="fatturato"
                  value={formData.fatturato}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="50000"
                />
                <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Massimo € 65.000 per il regime forfettario</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Codice ATECO *
              </label>
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
              {/* Summary Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Risultato Simulazione</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Fatturato Annuo</span>
                    <span className="font-semibold text-gray-900">€ {risultato.fatturato.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Reddito Imponibile</span>
                    <span className="font-semibold text-gray-900">€ {risultato.redditoImponibile.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">IRPEF ({risultato.aliquotaIrpef}%)</span>
                    <span className="font-semibold text-red-600">€ {risultato.irpef.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Contributi INPS</span>
                    <span className="font-semibold text-red-600">€ {risultato.inps.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center py-4 bg-red-50 px-4 rounded-lg">
                    <span className="font-semibold text-gray-900">Totale Imposte</span>
                    <span className="font-bold text-red-600 text-lg">€ {risultato.totaleImposte.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center py-4 bg-green-50 px-4 rounded-lg">
                    <span className="font-semibold text-gray-900">Netto Finale</span>
                    <span className="font-bold text-green-600 text-lg">€ {risultato.nettoFinale.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow relative z-10">
                  <div className="flex items-center">
                    <PieChart className="h-8 w-8 text-primary-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">% Tasse</p>
                      <p className="text-xl font-bold text-gray-900">{risultato.percentualeTasse.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow relative z-10">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Coefficiente</p>
                      <p className="text-xl font-bold text-gray-900">{risultato.coefficiente}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits Card */}
              {risultato.isNeoAttivita && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">Agevolazione Neo-attività</h4>
                      <p className="text-sm text-green-800">
                        Stai usufruendo dell'aliquota agevolata del 5% per i primi 5 anni di attività!
                        Dal 6° anno l'aliquota diventerà del 15%.
                      </p>
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

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Nota Importante</h4>
            <p className="text-sm text-blue-800">
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