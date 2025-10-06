import { BarChart3, Users, DollarSign, Download, ArrowUp, ArrowDown, Clock, Target, Activity, PieChart, LineChart } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Invoice {
  dataEmissione: string
  status: string
  totale: number
  consulente?: string
  cliente: string
  email?: string
  clienteEmail?: string
  azienda?: string
}

interface ConsultantStat {
  nome: string
  consulenze: number
  fatturato: number
  clienti: Set<string>
}

interface ConsultantPerformance {
  nome: string
  consulenze: number
  fatturato: number
  rating: number
  clienti: number
}

interface ClientStat {
  nome: string
  azienda: string
  fatturato: number
  consulenze: number
  crescita: string
}

interface MonthlyData {
  mese: string
  fatturato: number
  clienti: number
  consulenze: number
}

interface ClientsResponse {
  success: boolean
  clients: Array<{ _id: string; name: string; email: string }>
}

export default function ReportsAnalytics() {
  const [timeRange, setTimeRange] = useState('month')
  const [reportType, setReportType] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [clientsCount, setClientsCount] = useState(0)
  const [consultationsCount, setConsultationsCount] = useState(0)
  const [consultantPerformance, setConsultantPerformance] = useState<ConsultantPerformance[]>([])
  const [topClients, setTopClients] = useState<ClientStat[]>([])
  const [monthlyChartData, setMonthlyChartData] = useState<MonthlyData[]>([])

  useEffect(() => {
    loadData()
  }, [timeRange])

  const loadData = async () => {
    try {
      setLoading(true)
      const [invoicesResponse, clientsResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/chat/conversations/paid/list`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }).then(res => res.ok ? res.json() as Promise<Invoice[]> : []),
        fetch(`${import.meta.env.VITE_API_URL}/clients/list`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }).then(res => res.ok ? res.json() as Promise<ClientsResponse> : { success: false, clients: [] })
      ])

      if (invoicesResponse) {

        // Calculate date range based on selected timeRange
        const now = new Date()
        let startDate = new Date()

        switch (timeRange) {
          case 'week':
            startDate.setDate(now.getDate() - 7)
            break
          case 'month':
            startDate.setMonth(now.getMonth() - 1)
            break
          case 'quarter':
            startDate.setMonth(now.getMonth() - 3)
            break
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1)
            break
        }

        // Filter invoices by date range
        const filteredInvoices = invoicesResponse.filter((inv: Invoice) => {
          if (!inv.dataEmissione) return false

          // Parse Italian date format (dd/mm/yyyy)
          const [day, month, year] = inv.dataEmissione.split('/')
          const invoiceDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))

          return invoiceDate >= startDate && invoiceDate <= now
        })

        // Total revenue from paid invoices in selected time range
        const total = filteredInvoices
          .filter((inv: Invoice) => inv.status === 'paid')
          .reduce((sum: number, inv: Invoice) => sum + (inv.totale || 0), 0)

        setTotalRevenue(total)

        // Count consultations (both paid and pending) in selected time range
        setConsultationsCount(filteredInvoices.length)

        // Calculate consultant performance
        const consultantStats = filteredInvoices.reduce((acc: Record<string, ConsultantStat>, inv: Invoice) => {
          const consultantName = inv.consulente || 'Non assegnato'

          if (!acc[consultantName]) {
            acc[consultantName] = {
              nome: consultantName,
              consulenze: 0,
              fatturato: 0,
              clienti: new Set()
            }
          }

          acc[consultantName].consulenze++
          if (inv.status === 'paid') {
            acc[consultantName].fatturato += inv.totale || 0
          }
          acc[consultantName].clienti.add(inv.cliente)

          return acc
        }, {} as Record<string, ConsultantStat>)

        const performanceArray = Object.values(consultantStats).map((stat: ConsultantStat): ConsultantPerformance => ({
          nome: stat.nome,
          consulenze: stat.consulenze,
          fatturato: stat.fatturato,
          rating: 4.7, // Mock rating for now
          clienti: stat.clienti.size
        })).sort((a: ConsultantPerformance, b: ConsultantPerformance) => b.fatturato - a.fatturato)

        setConsultantPerformance(performanceArray)

        // Calculate top clients by total spending
        const clientStats = filteredInvoices.reduce((acc: Record<string, ClientStat>, inv: Invoice) => {
          const clientName = inv.cliente || 'Cliente sconosciuto'
          const clientEmail = inv.email || inv.clienteEmail || ''
          const company = inv.azienda && inv.azienda !== 'Non specificata' ? inv.azienda : clientName

          if (!acc[clientEmail]) {
            acc[clientEmail] = {
              nome: clientName,
              azienda: company,
              fatturato: 0,
              consulenze: 0,
              crescita: '+0%' // Mock for now
            }
          }

          acc[clientEmail].consulenze++
          if (inv.status === 'paid') {
            acc[clientEmail].fatturato += inv.totale || 0
          }

          return acc
        }, {} as Record<string, ClientStat>)

        const topClientsArray = Object.values(clientStats)
          .sort((a: ClientStat, b: ClientStat) => b.fatturato - a.fatturato)
          .slice(0, 5) // Top 5 clients

        setTopClients(topClientsArray)

        // Calculate monthly data for chart
        const monthlyData: Record<string, { mese: string; fatturato: number; clienti: Set<string>; consulenze: number }> = {}
        const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

        filteredInvoices.forEach((inv: Invoice) => {
          if (inv.dataEmissione && inv.status === 'paid') {
            const [, month] = inv.dataEmissione.split('/')
            const monthKey = `${monthNames[parseInt(month) - 1]}`

            if (!monthlyData[monthKey]) {
              monthlyData[monthKey] = {
                mese: monthKey,
                fatturato: 0,
                clienti: new Set(),
                consulenze: 0
              }
            }

            monthlyData[monthKey].fatturato += inv.totale || 0
            monthlyData[monthKey].clienti.add(inv.cliente)
            monthlyData[monthKey].consulenze++
          }
        })

        // Convert to array and show all 12 months
        const chartDataArray: MonthlyData[] = monthNames.map(month => {
          if (monthlyData[month]) {
            return {
              mese: month,
              fatturato: monthlyData[month].fatturato,
              clienti: monthlyData[month].clienti.size,
              consulenze: monthlyData[month].consulenze
            }
          }
          return { mese: month, fatturato: 0, clienti: 0, consulenze: 0 }
        })

        setMonthlyChartData(chartDataArray)
      }

      if (clientsResponse && clientsResponse.success) {
        setClientsCount(clientsResponse.clients.length)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatRevenue = (amount: number) => {
    if (amount % 1 === 0) {
      return `€ ${Math.round(amount).toLocaleString('it-IT')}`
    }
    return `€ ${amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const overviewStats = [
    {
      title: 'Fatturato Totale',
      value: loading ? '...' : formatRevenue(totalRevenue),
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Clienti Attivi',
      value: loading ? '...' : clientsCount.toString(),
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Consulenze Completate',
      value: loading ? '...' : consultationsCount.toString(),
      change: '+15.3%',
      trend: 'up',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Tempo Medio Risposta',
      value: '2.4h',
      change: '-18.7%',
      trend: 'up',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  const monthlyData = monthlyChartData

  const topClienti = topClients.length > 0 ? topClients : [
    { nome: 'Nessun dato', azienda: '-', fatturato: 0, consulenze: 0, crescita: '+0%' }
  ]

  const tipiConsulenza = [
    { tipo: 'Consulenza Fiscale', quantita: 35, percentuale: 39.3, colore: 'bg-blue-500' },
    { tipo: 'Business Plan', quantita: 18, percentuale: 20.2, colore: 'bg-green-500' },
    { tipo: 'Analisi Finanziaria', quantita: 12, percentuale: 13.5, colore: 'bg-purple-500' },
    { tipo: 'Adempimenti IVA', quantita: 10, percentuale: 11.2, colore: 'bg-orange-500' },
    { tipo: 'Consulenza Societaria', quantita: 8, percentuale: 9.0, colore: 'bg-red-500' },
    { tipo: 'Altri', quantita: 6, percentuale: 6.8, colore: 'bg-gray-500' }
  ]

  const performanceConsulenti = consultantPerformance.length > 0 ? consultantPerformance : [
    { nome: 'Nessun dato', consulenze: 0, fatturato: 0, rating: 0, clienti: 0 }
  ]

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <ArrowUp className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-red-600" />
    )
  }

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-end gap-4">
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-gray-400 transition-all duration-200 hover:shadow-sm"
          >
            <option value="week">Ultima settimana</option>
            <option value="month">Ultimo mese</option>
            <option value="quarter">Ultimo trimestre</option>
            <option value="year">Ultimo anno</option>
          </select>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-gray-400 transition-all duration-200 hover:shadow-sm"
          >
            <option value="overview">Panoramica</option>
            <option value="financial">Finanziario</option>
            <option value="clients">Clienti</option>
            <option value="consultants">Consulenti</option>
          </select>
          <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all duration-200 flex items-center hover:scale-105 hover:shadow-lg">
            <Download className="h-4 w-4 mr-2" />
            Esporta
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
          <div key={index} className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="flex items-center group-hover:scale-105 transition-transform">
                {getTrendIcon(stat.trend)}
                <span className={`text-sm font-medium ml-1 ${getTrendColor(stat.trend)}`}>
                  {stat.change}
                </span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{stat.value}</h3>
            <p className="text-sm text-gray-600">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Andamento Fatturato</h3>
            <div className="flex items-center space-x-2 hover:scale-105 transition-transform">
              <LineChart className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Mensile</span>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between space-x-2">
            {monthlyData.length > 0 ? monthlyData.map((data: MonthlyData, index: number) => {
              const maxFatturato = Math.max(...monthlyData.map((d: MonthlyData) => d.fatturato), 1)
              const height = (data.fatturato / maxFatturato) * 200

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary-600 rounded-t-sm relative group cursor-pointer hover:bg-primary-700 transition-all duration-200 hover:scale-105"
                    style={{ height: `${height}px`, minHeight: data.fatturato > 0 ? '10px' : '0px' }}
                    title={`${data.mese}: €${data.fatturato.toFixed(2)}`}
                  />
                  <span className="text-xs text-gray-600 mt-2">{data.mese}</span>
                </div>
              )
            }) : (
              <div className="w-full text-center text-gray-500">Nessun dato disponibile</div>
            )}
          </div>
        </div>

        {/* Consultation Types */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Tipi di Consulenza</h3>
            <PieChart className="h-4 w-4 text-gray-400 hover:scale-110 transition-transform" />
          </div>
          <div className="space-y-4">
            {tipiConsulenza.map((tipo, index) => (
              <div key={index} className="flex items-center justify-between hover:bg-gray-50 transition-all duration-200 p-2 rounded-lg hover:scale-[1.02]">
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`w-3 h-3 rounded-full ${tipo.colore} transition-transform hover:scale-125`} />
                  <span className="text-sm text-gray-700">{tipo.tipo}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900">{tipo.quantita}</span>
                  <span className="text-sm text-gray-500 w-12 text-right">{tipo.percentuale}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Clients and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Clienti</h3>
            <Activity className="h-4 w-4 text-gray-400 hover:scale-110 transition-transform" />
          </div>
          <div className="space-y-4">
            {topClienti.map((cliente, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:scale-[1.02]">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-primary-200">
                    <span className="text-sm font-medium text-primary-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{cliente.nome}</p>
                    <p className="text-sm text-gray-500">{cliente.azienda}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">€ {cliente.fatturato.toLocaleString()}</p>
                  <p className="text-sm text-green-600">{cliente.crescita}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consultant Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Consulenti</h3>
            <BarChart3 className="h-4 w-4 text-gray-400 hover:scale-110 transition-transform" />
          </div>
          <div className="space-y-4">
            {performanceConsulenti.map((consulente, index) => (
              <div key={index} className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-sm hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{consulente.nome}</h4>
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm text-gray-600 ml-1">{consulente.rating}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Consulenze</p>
                    <p className="font-medium text-gray-900">{consulente.consulenze}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Fatturato</p>
                    <p className="font-medium text-gray-900">€ {consulente.fatturato.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Clienti</p>
                    <p className="font-medium text-gray-900">{consulente.clienti}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative z-10">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Performance Mensile Dettagliata</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Mese</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Fatturato</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Nuovi Clienti</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Consulenze</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Ticket Medio</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Crescita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {monthlyData.filter((data: MonthlyData) => data.fatturato > 0 || data.consulenze > 0).map((data: MonthlyData, index: number, filteredArray: MonthlyData[]) => {
                const ticketMedio = data.consulenze > 0 ? Math.round(data.fatturato / data.consulenze) : 0
                const crescita = index > 0 && filteredArray[index - 1].fatturato > 0 ?
                  ((data.fatturato - filteredArray[index - 1].fatturato) / filteredArray[index - 1].fatturato * 100).toFixed(1) :
                  '0.0'

                const currentYear = new Date().getFullYear()

                return (
                  <tr key={index} className="hover:bg-gray-50 transition-all duration-200 hover:scale-[1.005]">
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">{data.mese} {currentYear}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">€ {Math.round(data.fatturato).toLocaleString('it-IT')}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-900">{data.clienti}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-900">{data.consulenze}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-900">€ {ticketMedio.toLocaleString('it-IT')}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-medium ${parseFloat(crescita) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {parseFloat(crescita) >= 0 ? '+' : ''}{crescita}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}