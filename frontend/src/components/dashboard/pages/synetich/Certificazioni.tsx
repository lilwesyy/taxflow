import React, { useState } from 'react';
import {
  Award,
  Search,
  Filter,
  Download,
  Send,
  CheckCircle,
  Clock,
  FileText,
  Mail,
  Calendar,
  User
} from 'lucide-react';

interface Certificate {
  id: string;
  certificateNumber: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  courseDate: string;
  issueDate: string;
  expiryDate?: string;
  status: 'issued' | 'pending' | 'expired';
  downloadUrl?: string;
  sentToStudent: boolean;
}

const Certificazioni: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock data
  const certificates: Certificate[] = [
    {
      id: '1',
      certificateNumber: 'SYN-2025-001',
      studentName: 'Mario Rossi',
      studentEmail: 'mario.rossi@email.com',
      courseName: 'Gru a Torre',
      courseDate: '2025-09-15',
      issueDate: '2025-09-16',
      expiryDate: '2030-09-16',
      status: 'issued',
      downloadUrl: '/certificates/SYN-2025-001.pdf',
      sentToStudent: true
    },
    {
      id: '2',
      certificateNumber: 'SYN-2025-002',
      studentName: 'Laura Bianchi',
      studentEmail: 'laura.bianchi@email.com',
      courseName: 'Primo Soccorso',
      courseDate: '2025-09-18',
      issueDate: '2025-09-19',
      expiryDate: '2028-09-19',
      status: 'issued',
      downloadUrl: '/certificates/SYN-2025-002.pdf',
      sentToStudent: true
    },
    {
      id: '3',
      certificateNumber: 'SYN-2025-003',
      studentName: 'Giuseppe Verdi',
      studentEmail: 'giuseppe.verdi@email.com',
      courseName: 'RSPP/ASPP',
      courseDate: '2025-09-20',
      issueDate: '2025-09-21',
      status: 'issued',
      downloadUrl: '/certificates/SYN-2025-003.pdf',
      sentToStudent: false
    },
    {
      id: '4',
      certificateNumber: 'PENDING',
      studentName: 'Anna Neri',
      studentEmail: 'anna.neri@email.com',
      courseName: 'DPI III Categoria',
      courseDate: '2025-10-20',
      issueDate: '2025-10-21',
      status: 'pending',
      sentToStudent: false
    },
    {
      id: '5',
      certificateNumber: 'SYN-2020-045',
      studentName: 'Paolo Gialli',
      studentEmail: 'paolo.gialli@email.com',
      courseName: 'Prevenzione Incendi',
      courseDate: '2020-09-10',
      issueDate: '2020-09-11',
      expiryDate: '2023-09-11',
      status: 'expired',
      downloadUrl: '/certificates/SYN-2020-045.pdf',
      sentToStudent: true
    }
  ];

  const statuses = [
    { value: 'all', label: 'Tutti gli stati' },
    { value: 'issued', label: 'Emessi' },
    { value: 'pending', label: 'In attesa' },
    { value: 'expired', label: 'Scaduti' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'expired': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'issued': return 'Emesso';
      case 'pending': return 'In attesa';
      case 'expired': return 'Scaduto';
      default: return status;
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch =
      cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || cert.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: certificates.length,
    issued: certificates.filter(c => c.status === 'issued').length,
    pending: certificates.filter(c => c.status === 'pending').length,
    expired: certificates.filter(c => c.status === 'expired').length,
    sent: certificates.filter(c => c.sentToStudent).length
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Certificati Totali</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.issued}</div>
              <div className="text-sm text-gray-600">Emessi</div>
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
            <div className="p-3 bg-red-100 rounded-lg">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.expired}</div>
              <div className="text-sm text-gray-600">Scaduti</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Send className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.sent}</div>
              <div className="text-sm text-gray-600">Inviati</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca per nome, email, corso o numero certificato..."
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
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N. Certificato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Studente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Corso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Emissione
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scadenza
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCertificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{cert.certificateNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="font-medium text-gray-900">{cert.studentName}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{cert.studentEmail}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cert.courseName}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(cert.courseDate).toLocaleDateString('it-IT')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(cert.issueDate).toLocaleDateString('it-IT')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {cert.expiryDate ? (
                      <div className="text-sm text-gray-600">
                        {new Date(cert.expiryDate).toLocaleDateString('it-IT')}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(cert.status)}`}>
                        {getStatusLabel(cert.status)}
                      </span>
                      {cert.sentToStudent && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          Inviato
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {cert.status === 'issued' && cert.downloadUrl && (
                        <>
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Scarica certificato"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          {!cert.sentToStudent && (
                            <button
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Invia via email"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          )}
                        </>
                      )}
                      {cert.status === 'pending' && (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                          Genera
                        </button>
                      )}
                      {cert.status === 'expired' && (
                        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                          Rinnova
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCertificates.length === 0 && (
          <div className="p-12 text-center">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun certificato trovato</h3>
            <p className="text-gray-600">
              Non ci sono certificati che corrispondono ai filtri selezionati.
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Azioni Rapide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Genera Certificati in Blocco</div>
              <div className="text-sm text-gray-600">Per corsi completati</div>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
            <div className="p-2 bg-green-600 rounded-lg">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Invia Certificati</div>
              <div className="text-sm text-gray-600">Via email agli studenti</div>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Esporta Registro</div>
              <div className="text-sm text-gray-600">Scarica Excel/PDF</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Certificazioni;
