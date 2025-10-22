import { useState } from 'react'
import { Home, GraduationCap, Users, Calendar, FileText, Settings, TrendingUp, Award, Building, BarChart3 } from 'lucide-react'
import DashboardLayout from './layouts/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import SynetichOverview from './pages/synetich/SynetichOverview'
import GestioneCorsi from './pages/synetich/GestioneCorsi'
import GestioneIscrizioni from './pages/synetich/GestioneIscrizioni'
import CalendarioCorsi from './pages/synetich/CalendarioCorsi'
import Categorie from './pages/synetich/Categorie'
import Certificazioni from './pages/synetich/Certificazioni'
import Analytics from './pages/synetich/Analytics'
import Reports from './pages/synetich/Reports'
import Documenti from './pages/synetich/Documenti'
import Impostazioni from './pages/synetich/Impostazioni'

type UserRole = 'business' | 'admin' | 'synetich_admin'

interface SynetichDashboardProps {
  onLogout: () => void
  userRole: UserRole
  userName?: string
  userEmail?: string
}

export default function SynetichDashboard({ onLogout, userRole, userName, userEmail }: SynetichDashboardProps) {
  const { logout, user } = useAuth()
  const { showToast } = useToast()
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('synetich_active_section') || 'dashboard'
  })

  const handleLogout = () => {
    logout()
    localStorage.removeItem('synetich_active_section')
    showToast('Logout effettuato con successo', 'success')
    setTimeout(() => onLogout(), 500)
  }

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
    localStorage.setItem('synetich_active_section', section)
  }

  const sidebarItems = [
    // Overview
    { id: 'dashboard', name: 'Dashboard', icon: Home },

    // Gestione Corsi
    { id: 'corsi', name: 'Gestione Corsi', icon: GraduationCap },
    { id: 'calendario', name: 'Calendario Corsi', icon: Calendar },
    { id: 'categorie', name: 'Categorie', icon: Building },

    // Gestione Iscrizioni
    { id: 'iscrizioni', name: 'Iscrizioni', icon: Users },
    { id: 'certificazioni', name: 'Certificazioni', icon: Award },

    // Report e Analytics
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'reports', name: 'Report', icon: TrendingUp },
    { id: 'documenti', name: 'Documenti', icon: FileText },

    // Configurazione
    { id: 'impostazioni', name: 'Impostazioni', icon: Settings }
  ]

  const getHeaderInfo = () => {
    const titles: Record<string, string> = {
      'dashboard': `Benvenuto ${userName}!`,
      'corsi': 'Gestione Corsi',
      'calendario': 'Calendario Corsi',
      'categorie': 'Categorie Corsi',
      'iscrizioni': 'Gestione Iscrizioni',
      'certificazioni': 'Certificazioni',
      'analytics': 'Analytics',
      'reports': 'Report',
      'documenti': 'Documenti',
      'impostazioni': 'Impostazioni'
    }

    const descriptions: Record<string, string> = {
      'dashboard': 'Panoramica gestione corsi Synetich',
      'corsi': 'Crea, modifica ed elimina corsi di formazione',
      'calendario': 'Visualizza e gestisci il calendario dei corsi',
      'categorie': 'Gestisci le categorie dei corsi',
      'iscrizioni': 'Visualizza e gestisci le iscrizioni ai corsi',
      'certificazioni': 'Gestisci le certificazioni rilasciate',
      'analytics': 'Statistiche e metriche dei corsi',
      'reports': 'Report dettagliati su corsi e iscrizioni',
      'documenti': 'Documenti e materiali didattici',
      'impostazioni': 'Configura le impostazioni della piattaforma'
    }

    return {
      title: titles[activeSection] || 'Dashboard',
      description: descriptions[activeSection] || 'Gestione corsi Synetich'
    }
  }

  const renderMainContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <SynetichOverview />

      case 'corsi':
        return <GestioneCorsi />

      case 'calendario':
        return <CalendarioCorsi />

      case 'categorie':
        return <Categorie />

      case 'iscrizioni':
        return <GestioneIscrizioni />

      case 'certificazioni':
        return <Certificazioni />

      case 'analytics':
        return <Analytics />

      case 'reports':
        return <Reports />

      case 'documenti':
        return <Documenti />

      case 'impostazioni':
        return <Impostazioni />

      default:
        return <SynetichOverview />
    }
  }

  const headerInfo = getHeaderInfo()

  return (
    <DashboardLayout
      onLogout={handleLogout}
      userRole={userRole}
      userName={userName}
      userEmail={userEmail}
      userCompany={user?.company}
      sidebarItems={sidebarItems}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
      headerTitle={headerInfo.title}
      headerDescription={headerInfo.description}
    >
      {renderMainContent()}
    </DashboardLayout>
  )
}
