import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpCircle, ArrowDownCircle, Calendar, Download, Plus, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../../../../services/api'
import { useToast } from '../../../../context/ToastContext'

interface Transaction {
  id: string
  tipo: 'entrata' | 'uscita'
  descrizione: string
  importo: number
  data: string
  categoria: string
  stato: 'completato' | 'previsto'
}

interface MonthlyFlow {
  mese: string
  entrate: number
  uscite: number
  saldo: number
}

export default function CashFlow() {
  const { showToast } = useToast()
  const [periodo, setPeriodo] = useState<'month' | 'quarter' | 'year'>('month')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState<MonthlyFlow[]>([])

  // Stats
  const [saldoAttuale, setSaldoAttuale] = useState(0)
  const [entrateCorrente, setEntrateCorrente] = useState(0)
  const [usciteCorrente, setUsciteCorrente] = useState(0)
  const [cashflowNetto, setCashflowNetto] = useState(0)

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [savingExpense, setSavingExpense] = useState(false)
  const [formData, setFormData] = useState({
    descrizione: '',
    importo: '',
    data: new Date().toISOString().split('T')[0],
    categoria: 'altro',
    stato: 'pagato',
    metodoPagamento: 'bonifico',
    note: ''
  })

  useEffect(() => {
    loadCashFlowData()
  }, [periodo])

  const getCategoriaLabel = (categoria: string): string => {
    const labels: Record<string, string> = {
      'inps': 'Contributi INPS',
      'imposte': 'Imposte',
      'affitto': 'Affitto',
      'utilities': 'Utilities',
      'fornitori': 'Fornitori',
      'attrezzature': 'Attrezzature',
      'marketing': 'Marketing',
      'formazione': 'Formazione',
      'trasporti': 'Trasporti',
      'consulenze': 'Consulenze',
      'altro': 'Altro'
    }
    return labels[categoria] || categoria
  }

  const loadCashFlowData = async () => {
    try {
      setLoading(true)

      const now = new Date()
      const startDate = getStartDate(now, periodo)
      const startDateStr = startDate.toISOString().split('T')[0]

      // Carica fatture per le entrate
      const invoicesResponse = await api.getInvoices({ page: 1, per_page: 100 })

      // Carica spese dall'API
      const expensesResponse = await api.getExpenses({
        startDate: startDateStr
      })

      if (invoicesResponse.success) {
        // Processa fatture come entrate
        const entrateFromInvoices: Transaction[] = (invoicesResponse.sent || [])
          .filter((inv: any) => {
            const invDate = new Date(inv.data || inv.dataEmissione)
            return invDate >= startDate
          })
          .map((inv: any) => ({
            id: inv.id?.toString() || inv._id?.toString() || '',
            tipo: 'entrata' as const,
            descrizione: `Fattura ${inv.numero} - ${inv.cliente || 'Cliente'}`,
            importo: inv.totale || 0,
            data: inv.data || inv.dataEmissione || new Date().toISOString().split('T')[0],
            categoria: 'Fatturazione',
            stato: (inv.status === 'accettata' || inv.status === 'consegnata' || inv.status === 'paid') ? 'completato' as const : 'previsto' as const
          }))

        // Processa spese reali dall'API
        const usciteFromExpenses: Transaction[] = expensesResponse.success
          ? (expensesResponse.expenses || []).map((exp: any) => ({
              id: exp.id,
              tipo: 'uscita' as const,
              descrizione: exp.descrizione,
              importo: exp.importo,
              data: exp.data,
              categoria: getCategoriaLabel(exp.categoria),
              stato: exp.stato === 'pagato' ? 'completato' as const : 'previsto' as const
            }))
          : []

        const allTransactions = [...entrateFromInvoices, ...usciteFromExpenses]
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

        setTransactions(allTransactions)

        // Calcola stats
        const entrate = allTransactions
          .filter(t => t.tipo === 'entrata' && t.stato === 'completato')
          .reduce((sum, t) => sum + t.importo, 0)

        const uscite = allTransactions
          .filter(t => t.tipo === 'uscita' && t.stato === 'completato')
          .reduce((sum, t) => sum + t.importo, 0)

        setEntrateCorrente(entrate)
        setUsciteCorrente(uscite)
        setCashflowNetto(entrate - uscite)
        setSaldoAttuale(entrate - uscite)

        // Genera dati mensili per il grafico
        generateMonthlyData(allTransactions)
      }
    } catch (error) {
      console.error('Error loading cashflow:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStartDate = (now: Date, period: 'month' | 'quarter' | 'year') => {
    const start = new Date(now)
    if (period === 'month') {
      start.setMonth(now.getMonth() - 1)
    } else if (period === 'quarter') {
      start.setMonth(now.getMonth() - 3)
    } else {
      start.setFullYear(now.getFullYear() - 1)
    }
    return start
  }

  const generateMonthlyData = (transactions: Transaction[]) => {
    const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
    const data: Record<string, { entrate: number; uscite: number }> = {}

    // Inizializza ultimi 6 mesi
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = monthNames[date.getMonth()]
      data[key] = { entrate: 0, uscite: 0 }
    }

    // Popola con dati reali
    transactions.forEach(t => {
      if (t.stato === 'completato') {
        const date = new Date(t.data)
        const key = monthNames[date.getMonth()]
        if (data[key]) {
          if (t.tipo === 'entrata') {
            data[key].entrate += t.importo
          } else {
            data[key].uscite += t.importo
          }
        }
      }
    })

    const chartData: MonthlyFlow[] = Object.entries(data).map(([mese, values]) => ({
      mese,
      entrate: values.entrate,
      uscite: values.uscite,
      saldo: values.entrate - values.uscite
    }))

    setMonthlyData(chartData)
  }

  const formatCurrency = (amount: number) => {
    return `€ ${amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const exportCashFlow = () => {
    const content = `
REPORT CASHFLOW
===============

Periodo: ${periodo === 'month' ? 'Ultimo mese' : periodo === 'quarter' ? 'Ultimo trimestre' : 'Ultimo anno'}
Data: ${new Date().toLocaleDateString('it-IT')}

RIEPILOGO:
- Saldo attuale: ${formatCurrency(saldoAttuale)}
- Entrate: ${formatCurrency(entrateCorrente)}
- Uscite: ${formatCurrency(usciteCorrente)}
- Cashflow netto: ${formatCurrency(cashflowNetto)}

TRANSAZIONI:
${transactions.map(t => `${t.data} | ${t.tipo.toUpperCase()} | ${t.descrizione} | ${formatCurrency(t.importo)} | ${t.stato}`).join('\n')}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cashflow-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.descrizione || !formData.importo) {
      showToast('Inserisci descrizione e importo', 'error')
      return
    }

    try {
      setSavingExpense(true)

      await api.createExpense({
        descrizione: formData.descrizione,
        importo: parseFloat(formData.importo),
        data: formData.data,
        categoria: formData.categoria,
        stato: formData.stato,
        metodoPagamento: formData.metodoPagamento || undefined,
        note: formData.note || undefined
      })

      showToast('Spesa aggiunta con successo', 'success')
      setShowModal(false)
      setFormData({
        descrizione: '',
        importo: '',
        data: new Date().toISOString().split('T')[0],
        categoria: 'altro',
        stato: 'pagato',
        metodoPagamento: 'bonifico',
        note: ''
      })

      // Ricarica i dati
      loadCashFlowData()
    } catch (error: any) {
      console.error('Error creating expense:', error)
      showToast(error.message || 'Errore durante il salvataggio della spesa', 'error')
    } finally {
      setSavingExpense(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento dati cashflow...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con filtri */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Cashflow</h2>
        <div className="flex items-center gap-3">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="month">Ultimo mese</option>
            <option value="quarter">Ultimo trimestre</option>
            <option value="year">Ultimo anno</option>
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Aggiungi Spesa
          </button>
          <button
            onClick={exportCashFlow}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Esporta
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Saldo</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(saldoAttuale)}</p>
          <p className="text-sm text-gray-600 mt-1">Disponibile</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <ArrowUpCircle className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Entrate</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(entrateCorrente)}</p>
          <p className="text-sm text-gray-600 mt-1">Periodo corrente</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <ArrowDownCircle className="h-6 w-6 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">Uscite</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(usciteCorrente)}</p>
          <p className="text-sm text-gray-600 mt-1">Periodo corrente</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className={`${cashflowNetto >= 0 ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-lg`}>
              {cashflowNetto >= 0 ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
            <span className="text-sm text-gray-500">Netto</span>
          </div>
          <p className={`text-2xl font-bold ${cashflowNetto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(cashflowNetto)}
          </p>
          <p className="text-sm text-gray-600 mt-1">Cashflow netto</p>
        </div>
      </div>

      {/* Grafico Cashflow */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-primary-600" />
          Andamento Mensile
        </h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {monthlyData.map((data, index) => {
            const maxValue = Math.max(...monthlyData.map(d => Math.max(d.entrate, d.uscite)), 1)
            const entrateHeight = (data.entrate / maxValue) * 200
            const usciteHeight = (data.uscite / maxValue) * 200

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex gap-1 mb-2" style={{ height: '200px', alignItems: 'flex-end' }}>
                  <div
                    className="flex-1 bg-green-500 rounded-t hover:bg-green-600 transition-all cursor-pointer"
                    style={{ height: `${entrateHeight}px`, minHeight: data.entrate > 0 ? '4px' : '0' }}
                    title={`Entrate: ${formatCurrency(data.entrate)}`}
                  />
                  <div
                    className="flex-1 bg-red-500 rounded-t hover:bg-red-600 transition-all cursor-pointer"
                    style={{ height: `${usciteHeight}px`, minHeight: data.uscite > 0 ? '4px' : '0' }}
                    title={`Uscite: ${formatCurrency(data.uscite)}`}
                  />
                </div>
                <span className="text-xs text-gray-600 mt-2">{data.mese}</span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Entrate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Uscite</span>
          </div>
        </div>
      </div>

      {/* Lista Transazioni */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transazioni Recenti</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Data</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Descrizione</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Categoria</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Tipo</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-gray-600">Importo</th>
                <th className="text-center py-3 px-6 text-sm font-medium text-gray-600">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.slice(0, 10).map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-sm text-gray-900">
                    {new Date(transaction.data).toLocaleDateString('it-IT')}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">{transaction.descrizione}</td>
                  <td className="py-4 px-6">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      {transaction.categoria}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {transaction.tipo === 'entrata' ? (
                      <span className="flex items-center text-sm text-green-600">
                        <ArrowUpCircle className="h-4 w-4 mr-1" />
                        Entrata
                      </span>
                    ) : (
                      <span className="flex items-center text-sm text-red-600">
                        <ArrowDownCircle className="h-4 w-4 mr-1" />
                        Uscita
                      </span>
                    )}
                  </td>
                  <td className={`py-4 px-6 text-sm text-right font-semibold ${
                    transaction.tipo === 'entrata' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.tipo === 'entrata' ? '+' : '-'}{formatCurrency(transaction.importo)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      transaction.stato === 'completato'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {transaction.stato === 'completato' ? 'Completato' : 'Previsto'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {transactions.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <DollarSign className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Nessuna transazione trovata</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <DollarSign className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">Cos'è il Cashflow?</h4>
            <p className="text-xs sm:text-sm text-blue-800">
              Il cashflow (flusso di cassa) rappresenta il movimento di denaro in entrata e in uscita dalla tua attività.
              Monitorarlo ti aiuta a pianificare le spese, evitare problemi di liquidità e prendere decisioni finanziarie informate.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Aggiungi Spesa */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-semibold text-gray-900">Aggiungi Nuova Spesa</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione *
                </label>
                <input
                  type="text"
                  required
                  value={formData.descrizione}
                  onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="es. Contributi INPS Q1 2024"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Importo (€) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.importo}
                    onChange={(e) => setFormData({ ...formData, importo: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="inps">Contributi INPS</option>
                    <option value="imposte">Imposte</option>
                    <option value="affitto">Affitto</option>
                    <option value="utilities">Utilities</option>
                    <option value="fornitori">Fornitori</option>
                    <option value="attrezzature">Attrezzature</option>
                    <option value="marketing">Marketing</option>
                    <option value="formazione">Formazione</option>
                    <option value="trasporti">Trasporti</option>
                    <option value="consulenze">Consulenze</option>
                    <option value="altro">Altro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stato *
                  </label>
                  <select
                    value={formData.stato}
                    onChange={(e) => setFormData({ ...formData, stato: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="pagato">Pagato</option>
                    <option value="da_pagare">Da Pagare</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Metodo di Pagamento
                </label>
                <select
                  value={formData.metodoPagamento}
                  onChange={(e) => setFormData({ ...formData, metodoPagamento: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="bonifico">Bonifico</option>
                  <option value="carta">Carta</option>
                  <option value="contanti">Contanti</option>
                  <option value="rid">RID</option>
                  <option value="altro">Altro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="Aggiungi note opzionali..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={savingExpense}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingExpense ? 'Salvataggio...' : 'Salva Spesa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
