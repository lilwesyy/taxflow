import React, { useState } from 'react';
import {
  Building,
  Shield,
  Users,
  Target,
  Plus,
  Edit,
  Trash2,
  GraduationCap,
  TrendingUp
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  courseCount: number;
  activeStudents: number;
  totalRevenue: number;
}

const Categorie: React.FC = () => {
  const [, _setSelectedCategory] = useState<Category | null>(null);
  const [, _setShowModal] = useState(false);

  // Mock data
  const categories: Category[] = [
    {
      id: '1',
      name: 'Attrezzature',
      slug: 'equipment',
      description: 'Corsi per l\'utilizzo sicuro di attrezzature di lavoro: gru, piattaforme elevabili, carrelli elevatori e macchine movimento terra.',
      icon: 'building',
      color: 'blue',
      courseCount: 10,
      activeStudents: 45,
      totalRevenue: 11250
    },
    {
      id: '2',
      name: 'Sicurezza',
      slug: 'safety',
      description: 'Formazione sulla sicurezza sul lavoro: DPI, primo soccorso, prevenzione incendi, ambienti confinati e procedure di emergenza.',
      icon: 'shield',
      color: 'green',
      courseCount: 5,
      activeStudents: 38,
      totalRevenue: 7600
    },
    {
      id: '3',
      name: 'Management',
      slug: 'management',
      description: 'Corsi per figure di responsabilità: RSPP, ASPP, RLS, dirigenti e preposti per la sicurezza in azienda.',
      icon: 'users',
      color: 'purple',
      courseCount: 4,
      activeStudents: 28,
      totalRevenue: 12600
    },
    {
      id: '4',
      name: 'Specializzato',
      slug: 'specialized',
      description: 'Corsi specialistici: segnaletica stradale, perforazioni, lavori in quota e altre attività a rischio specifico.',
      icon: 'target',
      color: 'orange',
      courseCount: 3,
      activeStudents: 15,
      totalRevenue: 4500
    }
  ];

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      building: Building,
      shield: Shield,
      users: Users,
      target: Target
    };
    return icons[iconName] || Building;
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; hover: string }> = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        hover: 'hover:bg-blue-200'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        hover: 'hover:bg-green-200'
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        hover: 'hover:bg-purple-200'
      },
      orange: {
        bg: 'bg-orange-100',
        text: 'text-orange-600',
        hover: 'hover:bg-orange-200'
      }
    };
    return colors[color] || colors.blue;
  };

  const totalStats = {
    categories: categories.length,
    totalCourses: categories.reduce((sum, cat) => sum + cat.courseCount, 0),
    totalStudents: categories.reduce((sum, cat) => sum + cat.activeStudents, 0),
    totalRevenue: categories.reduce((sum, cat) => sum + cat.totalRevenue, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestione Categorie</h2>
          <p className="text-gray-600 mt-1">Organizza i corsi per categoria</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuova Categoria
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalStats.categories}</div>
              <div className="text-sm text-gray-600">Categorie</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalStats.totalCourses}</div>
              <div className="text-sm text-gray-600">Corsi Totali</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalStats.totalStudents}</div>
              <div className="text-sm text-gray-600">Studenti Attivi</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">€{totalStats.totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Fatturato</div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => {
          const Icon = getIconComponent(category.icon);
          const colors = getColorClasses(category.color);

          return (
            <div
              key={category.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
            >
              {/* Header */}
              <div className={`p-6 ${colors.bg}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 bg-white rounded-lg shadow-sm`}>
                      <Icon className={`w-8 h-8 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">Slug: {category.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                      <Edit className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {category.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{category.courseCount}</div>
                    <div className="text-xs text-gray-600 mt-1">Corsi</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{category.activeStudents}</div>
                    <div className="text-xs text-gray-600 mt-1">Studenti</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">€{category.totalRevenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-600 mt-1">Fatturato</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Utilizzo capacità</span>
                    <span>{Math.round((category.activeStudents / (category.courseCount * 20)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${colors.text.replace('text-', 'bg-')}`}
                      style={{ width: `${Math.min((category.activeStudents / (category.courseCount * 20)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button className={`w-full py-2 rounded-lg font-medium transition-colors ${colors.bg} ${colors.text} ${colors.hover}`}>
                  Visualizza Corsi
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Distribution Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Distribuzione Corsi per Categoria</h3>
        <div className="space-y-4">
          {categories.map((category) => {
            const percentage = (category.courseCount / totalStats.totalCourses) * 100;
            const colors = getColorClasses(category.color);

            return (
              <div key={category.id}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">{category.name}</span>
                  <span className="text-gray-600">
                    {category.courseCount} corsi ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${colors.text.replace('text-', 'bg-')}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Categorie;
