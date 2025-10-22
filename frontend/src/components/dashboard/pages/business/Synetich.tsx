import React, { useState } from 'react';
import {
  GraduationCap,
  Shield,
  Calendar,
  Clock,
  Award,
  Filter,
  Search,
  MapPin,
  Phone,
  Mail,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface Course {
  id: number;
  title: string;
  category: string;
  startDate: string;
  duration?: string;
  type: 'equipment' | 'safety' | 'management' | 'specialized';
  icon: string;
  description: string;
}

const Synetich: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const courses: Course[] = [
    {
      id: 1,
      title: 'Gru a Torre',
      category: 'Attrezzature',
      startDate: '2025-10-01',
      type: 'equipment',
      icon: '🏗️',
      description: 'Formazione continua per operatori di gru a torre'
    },
    {
      id: 2,
      title: 'Gru per Autocarro',
      category: 'Attrezzature',
      startDate: '2025-10-01',
      type: 'equipment',
      icon: '🚚',
      description: 'Corso per operatori di gru montate su autocarro'
    },
    {
      id: 3,
      title: 'Gru Mobili',
      category: 'Attrezzature',
      startDate: '2025-10-01',
      type: 'equipment',
      icon: '🏗️',
      description: 'Formazione per operatori di gru mobili'
    },
    {
      id: 4,
      title: 'Gru Carroponte',
      category: 'Attrezzature',
      startDate: '2025-10-01',
      type: 'equipment',
      icon: '⚙️',
      description: 'Corso per operatori di gru a ponte'
    },
    {
      id: 5,
      title: 'Piattaforme di Lavoro Elevabili (PLE)',
      category: 'Attrezzature',
      startDate: '2025-10-01',
      type: 'equipment',
      icon: '📐',
      description: 'Formazione per l\'utilizzo di piattaforme elevabili'
    },
    {
      id: 6,
      title: 'DPI III Categoria - Lavori in Quota',
      category: 'Sicurezza',
      startDate: '2025-10-08',
      type: 'safety',
      icon: '🦺',
      description: 'Dispositivi di protezione individuale per lavori in altezza'
    },
    {
      id: 7,
      title: 'Operatore Segnaletica Stradale',
      category: 'Specializzato',
      startDate: '2025-10-08',
      type: 'specialized',
      icon: '🚧',
      description: 'Corso per operatori di segnaletica stradale'
    },
    {
      id: 8,
      title: 'Preposto Segnaletica Stradale',
      category: 'Specializzato',
      startDate: '2025-10-08',
      type: 'specialized',
      icon: '🚧',
      description: 'Formazione per preposti alla segnaletica stradale'
    },
    {
      id: 9,
      title: 'Macchine Movimento Terra',
      category: 'Attrezzature',
      startDate: '2025-10-11',
      type: 'equipment',
      icon: '🚜',
      description: 'Corso per operatori di macchine movimento terra'
    },
    {
      id: 10,
      title: 'Trattore Agricolo',
      category: 'Attrezzature',
      startDate: '2025-10-14',
      type: 'equipment',
      icon: '🚜',
      description: 'Formazione per operatori di trattori agricoli'
    },
    {
      id: 11,
      title: 'Ambienti Confinati',
      category: 'Sicurezza',
      startDate: '2025-10-16',
      duration: '2 giorni',
      type: 'safety',
      icon: '⚠️',
      description: 'Sicurezza e procedure per lavori in ambienti confinati'
    },
    {
      id: 12,
      title: 'Primo Soccorso',
      category: 'Sicurezza',
      startDate: '2025-10-20',
      type: 'safety',
      icon: '🏥',
      description: 'Corso di primo soccorso aziendale'
    },
    {
      id: 13,
      title: 'Sicurezza Lavoratori',
      category: 'Sicurezza',
      startDate: '2025-10-21',
      duration: '2 giorni',
      type: 'safety',
      icon: '👷',
      description: 'Formazione obbligatoria sulla sicurezza per lavoratori'
    },
    {
      id: 14,
      title: 'Sicurezza Dirigenti',
      category: 'Management',
      startDate: '2025-10-21',
      duration: '2 giorni',
      type: 'management',
      icon: '👔',
      description: 'Corso di sicurezza per dirigenti aziendali'
    },
    {
      id: 15,
      title: 'RLS - Rappresentante Lavoratori Sicurezza',
      category: 'Management',
      startDate: '2025-10-21',
      type: 'management',
      icon: '🛡️',
      description: 'Formazione per rappresentanti dei lavoratori per la sicurezza'
    },
    {
      id: 16,
      title: 'RSPP/ASPP',
      category: 'Management',
      startDate: '2025-10-21',
      type: 'management',
      icon: '🎯',
      description: 'Responsabile e Addetto Servizio Prevenzione e Protezione'
    },
    {
      id: 17,
      title: 'Sicurezza Preposti',
      category: 'Management',
      startDate: '2025-10-22',
      type: 'management',
      icon: '👨‍💼',
      description: 'Formazione sulla sicurezza per preposti'
    },
    {
      id: 18,
      title: 'Perforazioni Piccolo/Grande Diametro',
      category: 'Specializzato',
      startDate: '2025-10-24',
      duration: '2 giorni',
      type: 'specialized',
      icon: '⛏️',
      description: 'Corso per operatori di attrezzature di perforazione'
    },
    {
      id: 19,
      title: 'Prevenzione Incendi',
      category: 'Sicurezza',
      startDate: '2025-10-28',
      type: 'safety',
      icon: '🔥',
      description: 'Corso di prevenzione incendi e gestione emergenze'
    }
  ];

  const categories = [
    { id: 'all', label: 'Tutti i Corsi', count: courses.length },
    { id: 'equipment', label: 'Attrezzature', count: courses.filter(c => c.type === 'equipment').length },
    { id: 'safety', label: 'Sicurezza', count: courses.filter(c => c.type === 'safety').length },
    { id: 'management', label: 'Management', count: courses.filter(c => c.type === 'management').length },
    { id: 'specialized', label: 'Specializzato', count: courses.filter(c => c.type === 'specialized').length }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'equipment': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'safety': return 'bg-red-100 text-red-700 border-red-200';
      case 'management': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'specialized': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <Shield className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-bold">Synetich</h1>
              </div>
              <p className="text-xl text-blue-100 max-w-2xl">
                Formazione Continua sulla Sicurezza e Attrezzature di Lavoro
              </p>
              <p className="text-blue-200 mt-2">
                Corsi certificati per la sicurezza sul lavoro e l'utilizzo di attrezzature professionali
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <div className="text-center">
                  <div className="text-5xl font-bold">{courses.length}</div>
                  <div className="text-blue-100 mt-1">Corsi Disponibili</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 -mt-16">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{courses.length}</div>
                <div className="text-sm text-gray-600">Corsi Totali</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">100%</div>
                <div className="text-sm text-gray-600">Certificati</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">1000+</div>
                <div className="text-sm text-gray-600">Studenti</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">15+</div>
                <div className="text-sm text-gray-600">Anni Esperienza</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca corsi per nome o descrizione..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label} ({cat.count})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category Badges */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              {cat.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                selectedCategory === cat.id ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredCourses.map(course => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className={`h-2 ${getTypeColor(course.type).split(' ')[0]}`} />

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{course.icon}</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(course.type)}`}>
                    {course.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>{formatDate(course.startDate)}</span>
                  </div>
                  {course.duration && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span>{course.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Certificazione rilasciata</span>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group">
                  Maggiori Informazioni
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessun corso trovato</h3>
            <p className="text-gray-600">Prova a modificare i filtri o la ricerca</p>
          </div>
        )}

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white mt-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">Hai bisogno di maggiori informazioni?</h2>
              <p className="text-blue-100 mb-6">
                Contatta il team Synetich per ricevere assistenza personalizzata sui corsi di formazione
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Sede Torino</div>
                    <div className="text-sm text-blue-100">Via Vincenzo Lancia 26, Torino</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Telefono</div>
                    <div className="text-sm text-blue-100">+39 011 0263780</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Email</div>
                    <div className="text-sm text-blue-100">contatti@synetich.com</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-4">Perché scegliere Synetich?</h3>
              <ul className="space-y-3">
                {[
                  'Formazione continua certificata',
                  'Docenti esperti e qualificati',
                  'Corsi conformi alle normative vigenti',
                  'Certificazioni riconosciute',
                  'Sedi a Torino e Aosta',
                  'Supporto post-corso'
                ].map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Synetich;
