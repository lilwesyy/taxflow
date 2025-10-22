import React from 'react';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Award
} from 'lucide-react';

const Reports: React.FC = () => {
  const reports = [
    {
      id: '1',
      title: 'Report Mensile Iscrizioni',
      description: 'Riepilogo completo delle iscrizioni del mese',
      period: 'Ottobre 2025',
      type: 'Iscrizioni',
      icon: Users,
      color: 'blue',
      size: '245 KB'
    },
    {
      id: '2',
      title: 'Report Fatturato',
      description: 'Analisi dettagliata del fatturato per categoria',
      period: 'Q3 2025',
      type: 'Finanziario',
      icon: DollarSign,
      color: 'green',
      size: '189 KB'
    },
    {
      id: '3',
      title: 'Report Certificazioni',
      description: 'Registro certificati emessi e scadenze',
      period: 'Anno 2025',
      type: 'Certificazioni',
      icon: Award,
      color: 'purple',
      size: '312 KB'
    },
    {
      id: '4',
      title: 'Report Performance Corsi',
      description: 'Statistiche di performance per ogni corso',
      period: 'Ottobre 2025',
      type: 'Performance',
      icon: TrendingUp,
      color: 'orange',
      size: '276 KB'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Report e Documenti</h2>
            <p className="text-gray-600 mt-1">Genera ed esporta report personalizzati</p>
          </div>
          <div className="flex gap-3">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
              <option>Ultimi 30 giorni</option>
              <option>Ultimi 3 mesi</option>
              <option>Quest'anno</option>
              <option>Personalizzato</option>
            </select>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Genera Report
            </button>
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          const colorClass = getColorClasses(report.color);

          return (
            <div
              key={report.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-gray-500">{report.size}</span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">{report.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{report.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{report.period}</span>
                  </div>
                  <div className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                    {report.type}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Scarica PDF</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Scarica Excel</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-900 mb-2">156</div>
          <div className="text-sm text-gray-600">Iscrizioni questo mese</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-900 mb-2">€42,500</div>
          <div className="text-sm text-gray-600">Fatturato YTD</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-900 mb-2">132</div>
          <div className="text-sm text-gray-600">Certificati emessi</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-900 mb-2">4.8/5</div>
          <div className="text-sm text-gray-600">Valutazione media</div>
        </div>
      </div>

      {/* Custom Report Builder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Report Personalizzato</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Report</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
              <option>Iscrizioni</option>
              <option>Fatturato</option>
              <option>Certificazioni</option>
              <option>Performance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Periodo</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
              <option>Ultimi 7 giorni</option>
              <option>Ultimi 30 giorni</option>
              <option>Ultimi 3 mesi</option>
              <option>Quest'anno</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
              <option>PDF</option>
              <option>Excel</option>
              <option>CSV</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
            <button className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Genera
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
