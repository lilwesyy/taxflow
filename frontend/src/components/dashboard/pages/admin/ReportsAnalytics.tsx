import { BarChart3, Users, DollarSign, Download, ArrowUp, ArrowDown, Clock, Target, Activity, PieChart, LineChart } from 'lucide-react'
import { useState } from 'react'

export default function ReportsAnalytics() {
  const [timeRange, setTimeRange] = useState('month')
  const [reportType, setReportType] = useState('overview')

  const overviewStats = [
    {
      title: 'Fatturato Totale',
      value: '€ 47,380',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Clienti Attivi',
      value: '142',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Consulenze Completate',
      value: '89',
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

  const monthlyData = [
    { mese: 'Gen', fatturato: 3200, clienti: 28, consulenze: 15 },
    { mese: 'Feb', fatturato: 4100, clienti: 32, consulenze: 18 },
    { mese: 'Mar', fatturato: 3800, clienti: 29, consulenze: 16 },
    { mese: 'Apr', fatturato: 5200, clienti: 38, consulenze: 23 },
    { mese: 'Mag', fatturato: 4900, clienti: 35, consulenze: 21 },
    { mese: 'Giu', fatturato: 6300, clienti: 42, consulenze: 28 },
    { mese: 'Lug', fatturato: 5800, clienti: 39, consulenze: 25 },
    { mese: 'Ago', fatturato: 4600, clienti: 31, consulenze: 19 },
    { mese: 'Set', fatturato: 7100, clienti: 45, consulenze: 32 },
    { mese: 'Ott', fatturato: 6800, clienti: 43, consulenze: 29 },
    { mese: 'Nov', fatturato: 5900, clienti: 37, consulenze: 24 },
    { mese: 'Dic', fatturato: 8200, clienti: 48, consulenze: 35 }
  ]

  const topClienti = [
    { nome: 'Mario Rossi', azienda: 'Rossi Consulting', fatturato: 2850, consulenze: 8, crescita: '+23%' },
    { nome: 'Laura Bianchi', azienda: 'Bianchi Design', fatturato: 2340, consulenze: 6, crescita: '+18%' },
    { nome: 'Giuseppe Verdi', azienda: 'Verdi Solutions', fatturato: 1980, consulenze: 5, crescita: '+15%' },
    { nome: 'Francesco Greco', azienda: 'Greco Immobiliare', fatturato: 1750, consulenze: 4, crescita: '+12%' },
    { nome: 'Elena Ferretti', azienda: 'Ferretti Beauty', fatturato: 1620, consulenze: 4, crescita: '+8%' }
  ]

  const tipiConsulenza = [
    { tipo: 'Consulenza Fiscale', quantita: 35, percentuale: 39.3, colore: 'bg-blue-500' },
    { tipo: 'Business Plan', quantita: 18, percentuale: 20.2, colore: 'bg-green-500' },
    { tipo: 'Analisi Finanziaria', quantita: 12, percentuale: 13.5, colore: 'bg-purple-500' },
    { tipo: 'Adempimenti IVA', quantita: 10, percentuale: 11.2, colore: 'bg-orange-500' },
    { tipo: 'Consulenza Societaria', quantita: 8, percentuale: 9.0, colore: 'bg-red-500' },
    { tipo: 'Altri', quantita: 6, percentuale: 6.8, colore: 'bg-gray-500' }
  ]

  const performanceConsulenti = [
    { nome: 'Dr. Marco Bianchi', consulenze: 45, fatturato: 28500, rating: 4.8, clienti: 32 },
    { nome: 'Dr. Laura Verdi', consulenze: 38, fatturato: 23200, rating: 4.6, clienti: 28 },
    { nome: 'Dr. Antonio Rossi', consulenze: 32, fatturato: 19800, rating: 4.7, clienti: 24 },
    { nome: 'Dr. Sofia Neri', consulenze: 28, fatturato: 17600, rating: 4.5, clienti: 20 }
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
            {monthlyData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-primary-600 rounded-t-sm relative group cursor-pointer hover:bg-primary-700 transition-all duration-200 hover:scale-105"
                  style={{ height: `${(data.fatturato / 8200) * 200}px` }}
                  title={`${data.mese}: €${data.fatturato}`}
                />
                <span className="text-xs text-gray-600 mt-2">{data.mese}</span>
              </div>
            ))}
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
              {monthlyData.map((data, index) => {
                const ticketMedio = Math.round(data.fatturato / data.consulenze)
                const crescita = index > 0 ?
                  ((data.fatturato - monthlyData[index - 1].fatturato) / monthlyData[index - 1].fatturato * 100).toFixed(1) :
                  '0.0'

                return (
                  <tr key={index} className="hover:bg-gray-50 transition-all duration-200 hover:scale-[1.005]">
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">{data.mese} 2024</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">€ {data.fatturato.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-900">{data.clienti}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-900">{data.consulenze}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-900">€ {ticketMedio}</span>
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