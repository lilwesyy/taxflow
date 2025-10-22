import { Bell, Settings, LogOut, User, Check, Clock, AlertTriangle, X, Menu } from 'lucide-react'
import { type ReactNode, useState, useRef, useEffect } from 'react'
import Logo from '../common/Logo'

type UserRole = 'business' | 'admin' | 'synetich_admin'

interface DashboardLayoutProps {
  onLogout: () => void
  userRole: UserRole
  userName?: string
  userEmail?: string
  userCompany?: string
  userProfessionalRole?: string
  children: ReactNode
  sidebarItems: Array<{
    id: string
    name: string
    icon: React.ComponentType<{ className?: string }>
  }>
  activeSection: string
  onSectionChange: (section: string) => void
  headerTitle: string
  headerDescription: string
}

export default function DashboardLayout({
  onLogout,
  userRole,
  userName = 'Dr. Francesco Alberti',
  userEmail = 'francesco.alberti@taxflow.it',
  userCompany,
  userProfessionalRole,
  children,
  sidebarItems,
  activeSection,
  onSectionChange,
  headerTitle,
  headerDescription
}: DashboardLayoutProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Notifiche mock
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Fattura Pagata',
      message: 'La fattura FAT-001 è stata pagata da Mario Rossi',
      time: '2 min fa',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Scadenza Imminente',
      message: 'La fattura FAT-003 scade tra 3 giorni',
      time: '1 ora fa',
      read: false
    },
    {
      id: 3,
      type: 'info',
      title: 'Nuovo Cliente',
      message: 'Anna Bianchi ha richiesto una consulenza',
      time: '3 ore fa',
      read: true
    },
    {
      id: 4,
      type: 'success',
      title: 'Documento Caricato',
      message: 'Giuseppe Verdi ha caricato i documenti richiesti',
      time: '1 giorno fa',
      read: true
    },
    {
      id: 5,
      type: 'warning',
      title: 'Promemoria',
      message: 'Controlla le richieste P.IVA in sospeso',
      time: '2 giorni fa',
      read: true
    }
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  // Chiudi dropdown quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'info':
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  // Chiudi la sidebar su mobile quando si cambia sezione
  const handleSectionChange = (section: string) => {
    onSectionChange(section)
    setSidebarOpen(false)
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <div className={`
        w-64 bg-white border-r border-gray-100 flex-shrink-0 fixed h-full z-50 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo with close button on mobile */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <Logo className="h-10" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <item.icon className={`h-5 w-5 mr-3 ${
                  activeSection === item.id ? 'text-white' : 'text-gray-400'
                }`} />
                {item.name}
              </button>
            ))}
          </nav>

          {/* User Profile & Logout */}
          <div className="border-t border-gray-100 p-4 flex-shrink-0">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-600 truncate">{userEmail}</p>
                <p className="text-xs text-blue-600 font-semibold capitalize truncate">
                  {userRole === 'admin' ? (userProfessionalRole || 'Consulente') : (userCompany || 'Cliente')}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Esci
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Responsive margin */}
      <div className="flex-1 flex flex-col lg:ml-64 h-full overflow-hidden">
        {/* Header - Responsive */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex-shrink-0 fixed top-0 left-0 lg:left-64 right-0 z-30">
          <div className="flex justify-between items-center">
            <div className="flex items-center min-w-0 flex-1">
              {/* Hamburger Menu - Mobile only */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 mr-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg flex-shrink-0 transition-colors duration-200"
              >
                <Menu className="h-6 w-6" />
              </button>

              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-gray-900 truncate">{headerTitle}</h1>
                <p className="hidden sm:block text-gray-600 text-xs sm:text-sm mt-1 truncate">{headerDescription}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              {/* Notifications Dropdown */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="fixed right-2 sm:right-6 top-16 w-[calc(100vw-1rem)] sm:w-80 max-w-md bg-white rounded-2xl shadow-sm border-2 border-gray-200 z-[99999]">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-900">Notifiche</h3>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          Nessuna notifica
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <p className="text-sm font-bold text-gray-900">
                                    {notification.title}
                                  </p>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-2"></div>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-2 font-medium">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-100">
                        <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-bold transition-colors duration-200">
                          Visualizza tutte le notifiche
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Settings Button */}
              <button
                onClick={() => onSectionChange('impostazioni')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content - Scrollable & Responsive */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pt-20 sm:pt-24 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}