import React from 'react';
import {
  TrendingUp,
  Users,
  GraduationCap,
  DollarSign,
  Award,
  BarChart3,
  PieChart
} from 'lucide-react';

const Analytics: React.FC = () => {
  // Mock data
  const monthlyData = [
    { month: 'Gen', enrollments: 12, revenue: 2400, courses: 3 },
    { month: 'Feb', enrollments: 15, revenue: 3200, courses: 4 },
    { month: 'Mar', enrollments: 18, revenue: 3800, courses: 4 },
    { month: 'Apr', enrollments: 22, revenue: 4600, courses: 5 },
    { month: 'Mag', enrollments: 25, revenue: 5200, courses: 5 },
    { month: 'Giu', enrollments: 20, revenue: 4200, courses: 4 },
    { month: 'Lug', enrollments: 10, revenue: 2000, courses: 2 },
    { month: 'Ago', enrollments: 8, revenue: 1600, courses: 2 },
    { month: 'Set', enrollments: 28, revenue: 5800, courses: 6 },
    { month: 'Ott', enrollments: 32, revenue: 6800, courses: 7 }
  ];

  const categoryStats = [
    { name: 'Attrezzature', value: 45, color: 'bg-blue-500' },
    { name: 'Sicurezza', value: 30, color: 'bg-green-500' },
    { name: 'Management', value: 20, color: 'bg-purple-500' },
    { name: 'Specializzato', value: 5, color: 'bg-orange-500' }
  ];

  const maxEnrollments = Math.max(...monthlyData.map(d => d.enrollments));
  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-green-600">+12%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">156</div>
          <div className="text-sm text-gray-600">Iscrizioni Totali</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600">+18%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">€42,500</div>
          <div className="text-sm text-gray-600">Fatturato</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-green-600">+5%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">19</div>
          <div className="text-sm text-gray-600">Corsi Attivi</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-green-600">+25%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">132</div>
          <div className="text-sm text-gray-600">Certificati Emessi</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollments Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Trend Iscrizioni</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">{data.month}</span>
                  <span className="font-medium text-gray-900">{data.enrollments} iscrizioni</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(data.enrollments / maxEnrollments) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Trend Fatturato</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">{data.month}</span>
                  <span className="font-medium text-gray-900">€{data.revenue.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Distribuzione per Categoria</h3>
          <PieChart className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-6">
          {categoryStats.map((category, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-900">{category.name}</span>
                <span className="text-gray-600">{category.value}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`${category.color} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${category.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Tasso di Completamento</h3>
          <div className="text-3xl font-bold text-gray-900 mb-2">92%</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Soddisfazione Media</h3>
          <div className="text-3xl font-bold text-gray-900 mb-2">4.8/5</div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="text-yellow-400 text-2xl">★</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Ticket Medio</h3>
          <div className="text-3xl font-bold text-gray-900 mb-2">€272</div>
          <div className="text-sm text-green-600">+€15 vs mese scorso</div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
