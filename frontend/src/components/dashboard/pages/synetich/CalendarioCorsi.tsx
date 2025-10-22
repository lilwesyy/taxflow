import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Filter,
  Plus
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  participants: number;
  maxParticipants: number;
  category: string;
  instructor?: string;
}

const CalendarioCorsi: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [view, setView] = useState<'month' | 'week'>('month');

  // Mock events
  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'Gru a Torre',
      date: '2025-10-22',
      startTime: '09:00',
      endTime: '17:00',
      location: 'Torino - Sede Principale',
      participants: 12,
      maxParticipants: 15,
      category: 'equipment',
      instructor: 'Ing. Marco Rossi'
    },
    {
      id: '2',
      title: 'Primo Soccorso',
      date: '2025-10-25',
      startTime: '09:00',
      endTime: '18:00',
      location: 'Torino - Aula A',
      participants: 8,
      maxParticipants: 20,
      category: 'safety',
      instructor: 'Dott. Laura Bianchi'
    },
    {
      id: '3',
      title: 'Prevenzione Incendi',
      date: '2025-10-28',
      startTime: '09:00',
      endTime: '13:00',
      location: 'Torino - Aula B',
      participants: 15,
      maxParticipants: 18,
      category: 'safety',
      instructor: 'Ing. Paolo Verdi'
    },
    {
      id: '4',
      title: 'RSPP/ASPP',
      date: '2025-10-29',
      startTime: '09:00',
      endTime: '18:00',
      location: 'Aosta - Sede',
      participants: 18,
      maxParticipants: 25,
      category: 'management',
      instructor: 'Avv. Maria Neri'
    },
    {
      id: '5',
      title: 'DPI III Categoria',
      date: '2025-11-02',
      startTime: '09:00',
      endTime: '17:00',
      location: 'Torino - Area Pratica',
      participants: 5,
      maxParticipants: 12,
      category: 'safety',
      instructor: 'Ing. Giuseppe Gialli'
    }
  ];

  const categories = [
    { value: 'all', label: 'Tutte le categorie', color: 'gray' },
    { value: 'equipment', label: 'Attrezzature', color: 'blue' },
    { value: 'safety', label: 'Sicurezza', color: 'green' },
    { value: 'management', label: 'Management', color: 'purple' },
    { value: 'specialized', label: 'Specializzato', color: 'orange' }
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      equipment: 'bg-blue-100 text-blue-700 border-blue-300',
      safety: 'bg-green-100 text-green-700 border-green-300',
      management: 'bg-purple-100 text-purple-700 border-purple-300',
      specialized: 'bg-orange-100 text-orange-700 border-orange-300'
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => {
      const eventDate = event.date;
      const matchesDate = eventDate === dateStr;
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      return matchesDate && matchesCategory;
    });
  };

  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

  const filteredEvents = events.filter(event =>
    selectedCategory === 'all' || event.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Oggi
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('month')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  view === 'month'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mese
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  view === 'week'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Settimana
              </button>
            </div>

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nuovo Evento
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Day Names */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map(day => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dayEvents = getEventsForDay(day);
              const isToday =
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();

              return (
                <div
                  key={day}
                  className={`aspect-square border rounded-lg p-2 hover:bg-gray-50 transition-colors cursor-pointer ${
                    isToday ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                  }`}
                >
                  <div className="flex flex-col h-full">
                    <div
                      className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      {day}
                    </div>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={`text-xs px-1 py-0.5 rounded truncate ${getCategoryColor(event.category)}`}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500 px-1">
                          +{dayEvents.length - 2} altri
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Prossimi Corsi ({filteredEvents.length})
          </h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {filteredEvents.map(event => (
              <div
                key={event.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{event.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(event.category)}`}>
                    {categories.find(c => c.value === event.category)?.label}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                      {new Date(event.date).toLocaleDateString('it-IT', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{event.location}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{event.participants}/{event.maxParticipants} iscritti</span>
                  </div>

                  {event.instructor && (
                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                      Docente: {event.instructor}
                    </div>
                  )}
                </div>

                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
                  />
                </div>
              </div>
            ))}

            {filteredEvents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Nessun corso programmato</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarioCorsi;
