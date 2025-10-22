import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Users,
  Calendar,
  MapPin,
  Clock,
  Award,
  DollarSign
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  category: string;
  startDate: string;
  duration: string;
  maxParticipants: number;
  currentParticipants: number;
  location: string;
  price: number;
  status: 'active' | 'draft' | 'archived';
  certification: boolean;
}

const GestioneCorsi: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock data
  const courses: Course[] = [
    {
      id: '1',
      title: 'Gru a Torre',
      category: 'equipment',
      startDate: '2025-10-22',
      duration: '1 giorno',
      maxParticipants: 15,
      currentParticipants: 12,
      location: 'Torino',
      price: 250,
      status: 'active',
      certification: true
    },
    {
      id: '2',
      title: 'Primo Soccorso',
      category: 'safety',
      startDate: '2025-10-25',
      duration: '2 giorni',
      maxParticipants: 20,
      currentParticipants: 8,
      location: 'Torino',
      price: 180,
      status: 'active',
      certification: true
    },
    {
      id: '3',
      title: 'RSPP/ASPP',
      category: 'management',
      startDate: '2025-10-28',
      duration: '3 giorni',
      maxParticipants: 25,
      currentParticipants: 18,
      location: 'Aosta',
      price: 450,
      status: 'active',
      certification: true
    },
    {
      id: '4',
      title: 'DPI III Categoria',
      category: 'safety',
      startDate: '2025-11-02',
      duration: '1 giorno',
      maxParticipants: 12,
      currentParticipants: 5,
      location: 'Torino',
      price: 200,
      status: 'active',
      certification: true
    },
    {
      id: '5',
      title: 'Prevenzione Incendi',
      category: 'safety',
      startDate: '2025-11-05',
      duration: '1 giorno',
      maxParticipants: 18,
      currentParticipants: 15,
      location: 'Torino',
      price: 220,
      status: 'active',
      certification: true
    }
  ];

  const categories = [
    { value: 'all', label: 'Tutte le categorie' },
    { value: 'equipment', label: 'Attrezzature' },
    { value: 'safety', label: 'Sicurezza' },
    { value: 'management', label: 'Management' },
    { value: 'specialized', label: 'Specializzato' }
  ];

  const statuses = [
    { value: 'all', label: 'Tutti gli stati' },
    { value: 'active', label: 'Attivi' },
    { value: 'draft', label: 'Bozze' },
    { value: 'archived', label: 'Archiviati' }
  ];

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.label || category;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-yellow-100 text-yellow-700';
      case 'archived': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Attivo';
      case 'draft': return 'Bozza';
      case 'archived': return 'Archiviato';
      default: return status;
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || course.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestione Corsi</h2>
          <p className="text-gray-600 mt-1">{filteredCourses.length} corsi trovati</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 shadow-sm">
          <Plus className="w-5 h-5" />
          Nuovo Corso
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca corsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            {/* Header */}
            <div className="bg-blue-600 p-4 text-white">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold flex-1">{course.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                  {getStatusLabel(course.status)}
                </span>
              </div>
              <div className="text-sm text-blue-100">{getCategoryLabel(course.category)}</div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Date */}
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {new Date(course.startDate).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{course.duration}</span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{course.location}</span>
              </div>

              {/* Participants */}
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span className="text-sm">
                  {course.currentParticipants}/{course.maxParticipants} iscritti
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(course.currentParticipants / course.maxParticipants) * 100}%` }}
                ></div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <DollarSign className="w-4 h-4" />
                <span>€{course.price}</span>
              </div>

              {/* Certification Badge */}
              {course.certification && (
                <div className="flex items-center gap-2 text-green-600">
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-medium">Certificazione inclusa</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 p-4 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                <Edit className="w-4 h-4" />
                <span className="text-sm font-medium">Modifica</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200">
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Elimina</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun corso trovato</h3>
          <p className="text-gray-600 mb-6">
            Non ci sono corsi che corrispondono ai filtri selezionati.
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Crea Nuovo Corso
          </button>
        </div>
      )}
    </div>
  );
};

export default GestioneCorsi;
