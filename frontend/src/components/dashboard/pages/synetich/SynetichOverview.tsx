import React from 'react';
import {
  GraduationCap,
  Users,
  Award,
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react';

const SynetichOverview: React.FC = () => {
  // Mock data - verrà sostituito con chiamate API reali
  const stats = {
    totalCourses: 19,
    activeCourses: 15,
    totalEnrollments: 156,
    completedCourses: 45,
    totalRevenue: 42500,
    averageRating: 4.8,
    certificatesIssued: 132,
    upcomingCourses: 8
  };

  const recentEnrollments = [
    { id: 1, studentName: 'Mario Rossi', courseName: 'Gru a Torre', date: '2025-10-15', status: 'confirmed' },
    { id: 2, studentName: 'Laura Bianchi', courseName: 'Primo Soccorso', date: '2025-10-14', status: 'pending' },
    { id: 3, studentName: 'Giuseppe Verdi', courseName: 'RSPP/ASPP', date: '2025-10-13', status: 'confirmed' },
    { id: 4, studentName: 'Anna Neri', courseName: 'DPI III Categoria', date: '2025-10-12', status: 'confirmed' },
  ];

  const upcomingCourses = [
    { id: 1, title: 'Gru a Torre', date: '2025-10-22', participants: 12, maxParticipants: 15 },
    { id: 2, title: 'Primo Soccorso', date: '2025-10-25', participants: 8, maxParticipants: 20 },
    { id: 3, title: 'Prevenzione Incendi', date: '2025-10-28', participants: 15, maxParticipants: 18 },
  ];

  const statCards = [
    { label: 'Corsi Totali', value: stats.totalCourses, icon: GraduationCap, color: 'blue', change: '+3' },
    { label: 'Corsi Attivi', value: stats.activeCourses, icon: Clock, color: 'green', change: '+2' },
    { label: 'Iscrizioni Totali', value: stats.totalEnrollments, icon: Users, color: 'purple', change: '+12' },
    { label: 'Certificazioni', value: stats.certificatesIssued, icon: Award, color: 'orange', change: '+8' },
    { label: 'Entrate Totali', value: `€${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'green', change: '+€4,200' },
    { label: 'Corsi Completati', value: stats.completedCourses, icon: CheckCircle, color: 'blue', change: '+5' },
    { label: 'Prossimi Corsi', value: stats.upcomingCourses, icon: Calendar, color: 'purple', change: '' },
    { label: 'Rating Medio', value: stats.averageRating, icon: TrendingUp, color: 'green', change: '+0.2' },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'canceled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confermata';
      case 'pending': return 'In attesa';
      case 'canceled': return 'Annullata';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Dashboard Synetich</h2>
        <p className="text-blue-100">Gestione completa dei corsi di formazione sulla sicurezza</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                {stat.change && (
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enrollments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Iscrizioni Recenti</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Vedi tutte
            </button>
          </div>
          <div className="space-y-4">
            {recentEnrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{enrollment.studentName}</div>
                  <div className="text-sm text-gray-600">{enrollment.courseName}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(enrollment.date).toLocaleDateString('it-IT')}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                  {getStatusLabel(enrollment.status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Courses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Prossimi Corsi</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Calendario
            </button>
          </div>
          <div className="space-y-4">
            {upcomingCourses.map((course) => (
              <div
                key={course.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{course.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {new Date(course.date).toLocaleDateString('it-IT', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {course.participants}/{course.maxParticipants} iscritti
                    </span>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(course.participants / course.maxParticipants) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Azioni Rapide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 text-left">
            <div className="p-2 bg-blue-600 rounded-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Nuovo Corso</div>
              <div className="text-sm text-gray-600">Crea un corso</div>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 text-left">
            <div className="p-2 bg-green-600 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Nuova Iscrizione</div>
              <div className="text-sm text-gray-600">Registra studente</div>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 text-left">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Emetti Certificato</div>
              <div className="text-sm text-gray-600">Genera certificazione</div>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200 text-left">
            <div className="p-2 bg-orange-600 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Pianifica Corso</div>
              <div className="text-sm text-gray-600">Aggiungi al calendario</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SynetichOverview;
