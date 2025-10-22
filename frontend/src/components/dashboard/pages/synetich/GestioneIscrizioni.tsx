import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Mail,
  Phone,
  Calendar,
  Download
} from 'lucide-react';

interface Enrollment {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  company?: string;
  courseName: string;
  courseDate: string;
  enrollmentDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentAmount: number;
  certificateIssued: boolean;
}

const GestioneIscrizioni: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');

  // Mock data
  const enrollments: Enrollment[] = [
    {
      id: '1',
      studentName: 'Mario Rossi',
      studentEmail: 'mario.rossi@email.com',
      studentPhone: '+39 333 1234567',
      company: 'Edilizia Rossi SRL',
      courseName: 'Gru a Torre',
      courseDate: '2025-10-22',
      enrollmentDate: '2025-10-15',
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentAmount: 250,
      certificateIssued: false
    },
    {
      id: '2',
      studentName: 'Laura Bianchi',
      studentEmail: 'laura.bianchi@email.com',
      studentPhone: '+39 333 2345678',
      courseName: 'Primo Soccorso',
      courseDate: '2025-10-25',
      enrollmentDate: '2025-10-14',
      status: 'pending',
      paymentStatus: 'pending',
      paymentAmount: 180,
      certificateIssued: false
    },
    {
      id: '3',
      studentName: 'Giuseppe Verdi',
      studentEmail: 'giuseppe.verdi@email.com',
      studentPhone: '+39 333 3456789',
      company: 'Costruzioni Verdi',
      courseName: 'RSPP/ASPP',
      courseDate: '2025-10-28',
      enrollmentDate: '2025-10-13',
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentAmount: 450,
      certificateIssued: false
    },
    {
      id: '4',
      studentName: 'Anna Neri',
      studentEmail: 'anna.neri@email.com',
      studentPhone: '+39 333 4567890',
      courseName: 'DPI III Categoria',
      courseDate: '2025-09-15',
      enrollmentDate: '2025-09-01',
      status: 'completed',
      paymentStatus: 'paid',
      paymentAmount: 200,
      certificateIssued: true
    },
    {
      id: '5',
      studentName: 'Paolo Gialli',
      studentEmail: 'paolo.gialli@email.com',
      studentPhone: '+39 333 5678901',
      company: 'Sicurezza Plus SRL',
      courseName: 'Prevenzione Incendi',
      courseDate: '2025-11-05',
      enrollmentDate: '2025-10-20',
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentAmount: 220,
      certificateIssued: false
    }
  ];

  const statuses = [
    { value: 'all', label: 'Tutti gli stati' },
    { value: 'pending', label: 'In attesa' },
    { value: 'confirmed', label: 'Confermata' },
    { value: 'completed', label: 'Completata' },
    { value: 'canceled', label: 'Annullata' }
  ];

  const paymentStatuses = [
    { value: 'all', label: 'Tutti i pagamenti' },
    { value: 'pending', label: 'In attesa' },
    { value: 'paid', label: 'Pagato' },
    { value: 'refunded', label: 'Rimborsato' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'canceled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confermata';
      case 'pending': return 'In attesa';
      case 'completed': return 'Completata';
      case 'canceled': return 'Annullata';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'refunded': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagato';
      case 'pending': return 'In attesa';
      case 'refunded': return 'Rimborsato';
      default: return status;
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch =
      enrollment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || enrollment.status === selectedStatus;
    const matchesPayment = selectedPaymentStatus === 'all' || enrollment.paymentStatus === selectedPaymentStatus;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Stats
  const stats = {
    total: enrollments.length,
    pending: enrollments.filter(e => e.status === 'pending').length,
    confirmed: enrollments.filter(e => e.status === 'confirmed').length,
    completed: enrollments.filter(e => e.status === 'completed').length,
    certificatesIssued: enrollments.filter(e => e.certificateIssued).length
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Iscrizioni Totali</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
              <div className="text-sm text-gray-600">In Attesa</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.confirmed}</div>
              <div className="text-sm text-gray-600">Confermate</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completate</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.certificatesIssued}</div>
              <div className="text-sm text-gray-600">Certificati</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca studenti o corsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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

          {/* Payment Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              {paymentStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Studente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Corso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Corso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificato
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEnrollments.map((enrollment) => (
                <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{enrollment.studentName}</div>
                      {enrollment.company && (
                        <div className="text-sm text-gray-500">{enrollment.company}</div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{enrollment.studentEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{enrollment.studentPhone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{enrollment.courseName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(enrollment.courseDate).toLocaleDateString('it-IT')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                      {getStatusLabel(enrollment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(enrollment.paymentStatus)}`}>
                        {getPaymentStatusLabel(enrollment.paymentStatus)}
                      </span>
                      <div className="text-sm text-gray-900 font-medium mt-1">
                        €{enrollment.paymentAmount}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {enrollment.certificateIssued ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <Award className="w-4 h-4" />
                        <span className="text-sm font-medium">Emesso</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Non emesso</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {enrollment.status === 'pending' && (
                        <>
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {enrollment.certificateIssued && (
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                          <Download className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEnrollments.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessuna iscrizione trovata</h3>
            <p className="text-gray-600">
              Non ci sono iscrizioni che corrispondono ai filtri selezionati.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestioneIscrizioni;
