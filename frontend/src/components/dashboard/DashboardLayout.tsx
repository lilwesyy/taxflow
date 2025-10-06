import { Bell, Settings, LogOut, User, Check, Clock, AlertTriangle, X } from 'lucide-react'
import { type ReactNode, useState, useRef, useEffect } from 'react'
import Logo from '../common/Logo'

type UserRole = 'business' | 'admin'

interface DashboardLayoutProps {
  onLogout: () => void
  userRole: UserRole
  userName?: string
  userEmail?: string
  userCompany?: string
  children: ReactNode
  sidebarItems: Array<{
    id: string
    name: string
    icon: any
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
  children,
  sidebarItems,
  activeSection,
  onSectionChange,
  headerTitle,
  headerDescription
}: DashboardLayoutProps) {
  const [showNotifications, setShowNotifications] = useState(false)
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

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar - Fixed */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 fixed h-full z-40">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <Logo className="h-10" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`h-5 w-5 mr-3 ${
                  activeSection === item.id ? 'text-primary-600' : 'text-gray-400'
                }`} />
                {item.name}
              </button>
            ))}
          </nav>

          {/* User Profile & Logout */}
          <div className="border-t border-gray-200 p-4 flex-shrink-0">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
                <p className="text-xs text-primary-600 capitalize">
                  {userRole === 'admin' ? 'Consulente' : (userCompany || 'Cliente')}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3 text-gray-400" />
              Esci
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Offset by sidebar width */}
      <div className="flex-1 flex flex-col ml-64 h-full overflow-hidden">
        {/* Header - Fixed */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 fixed top-0 left-64 right-0 z-50">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{headerTitle}</h1>
              <p className="text-gray-600 text-sm mt-1">{headerDescription}</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications Dropdown */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="fixed right-6 top-16 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-[99999]">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Notifiche</h3>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          Nessuna notifica
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                  </p>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-2"></div>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-200">
                        <button className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium">
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
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-6 pt-24">
          {children}
        </main>
      </div>
    </div>
  )
}