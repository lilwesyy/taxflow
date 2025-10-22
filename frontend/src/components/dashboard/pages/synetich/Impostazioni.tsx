import React, { useState } from 'react';
import {
  Settings,
  Building,
  Mail,
  Phone,
  MapPin,
  Bell,
  Save
} from 'lucide-react';

const Impostazioni: React.FC = () => {
  const [settings, setSettings] = useState({
    // Company Info
    companyName: 'Synetich',
    email: 'info@synetich.com',
    phone: '+39 011 0263780',
    address: 'Via Vincenzo Lancia 26',
    city: 'Torino',
    cap: '10141',
    piva: 'IT12345678901',

    // Notifications
    emailNotifications: true,
    courseReminders: true,
    certificateAlerts: true,
    paymentNotifications: true,

    // Course Settings
    defaultCourseDuration: '8',
    maxParticipants: '20',
    reminderDaysBefore: '7',
    certificateValidityYears: '5'
  });

  const handleChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Company Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Informazioni Aziendali</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Azienda
            </label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Partita IVA
            </label>
            <input
              type="text"
              value={settings.piva}
              onChange={(e) => handleChange('piva', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefono
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Indirizzo
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Città
            </label>
            <input
              type="text"
              value={settings.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CAP
            </label>
            <input
              type="text"
              value={settings.cap}
              onChange={(e) => handleChange('cap', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Notifiche</h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <div className="font-medium text-gray-900">Notifiche Email</div>
              <div className="text-sm text-gray-600">Ricevi notifiche via email</div>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleChange('emailNotifications', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <div className="font-medium text-gray-900">Promemoria Corsi</div>
              <div className="text-sm text-gray-600">Notifica prima dell'inizio dei corsi</div>
            </div>
            <input
              type="checkbox"
              checked={settings.courseReminders}
              onChange={(e) => handleChange('courseReminders', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <div className="font-medium text-gray-900">Alert Certificati</div>
              <div className="text-sm text-gray-600">Notifica scadenza certificati</div>
            </div>
            <input
              type="checkbox"
              checked={settings.certificateAlerts}
              onChange={(e) => handleChange('certificateAlerts', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <div className="font-medium text-gray-900">Notifiche Pagamenti</div>
              <div className="text-sm text-gray-600">Ricevi conferme di pagamento</div>
            </div>
            <input
              type="checkbox"
              checked={settings.paymentNotifications}
              onChange={(e) => handleChange('paymentNotifications', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Course Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Impostazioni Corsi</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durata Default Corso (ore)
            </label>
            <input
              type="number"
              value={settings.defaultCourseDuration}
              onChange={(e) => handleChange('defaultCourseDuration', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Partecipanti Massimi
            </label>
            <input
              type="number"
              value={settings.maxParticipants}
              onChange={(e) => handleChange('maxParticipants', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giorni Promemoria Prima Corso
            </label>
            <input
              type="number"
              value={settings.reminderDaysBefore}
              onChange={(e) => handleChange('reminderDaysBefore', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Validità Certificati (anni)
            </label>
            <input
              type="number"
              value={settings.certificateValidityYears}
              onChange={(e) => handleChange('certificateValidityYears', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Save className="w-5 h-5" />
          Salva Modifiche
        </button>
      </div>
    </div>
  );
};

export default Impostazioni;
