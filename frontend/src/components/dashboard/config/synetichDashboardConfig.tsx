import { Home, GraduationCap, Users, Calendar, FileText, Settings, TrendingUp, Award, Building, BarChart3 } from 'lucide-react'
import { DashboardConfig, HeaderInfo } from '../layouts/BaseDashboard'
import SynetichOverview from '../pages/synetich/SynetichOverview'
import GestioneCorsi from '../pages/synetich/GestioneCorsi'
import GestioneIscrizioni from '../pages/synetich/GestioneIscrizioni'
import CalendarioCorsi from '../pages/synetich/CalendarioCorsi'
import Categorie from '../pages/synetich/Categorie'
import Certificazioni from '../pages/synetich/Certificazioni'
import Analytics from '../pages/synetich/Analytics'
import Reports from '../pages/synetich/Reports'
import Documenti from '../pages/synetich/Documenti'
import Impostazioni from '../pages/synetich/Impostazioni'

export const synetichDashboardConfig: Omit<DashboardConfig, 'onLogout' | 'userRole' | 'userName' | 'userEmail'> = {
  role: 'synetich',

  sidebarItems: [
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
  ],

  pages: {
    'dashboard': SynetichOverview,
    'corsi': GestioneCorsi,
    'calendario': CalendarioCorsi,
    'categorie': Categorie,
    'iscrizioni': GestioneIscrizioni,
    'certificazioni': Certificazioni,
    'analytics': Analytics,
    'reports': Reports,
    'documenti': Documenti,
    'impostazioni': Impostazioni,
    'default': SynetichOverview
  },

  getHeaderInfo: (activeSection: string, _sidebarItems, userName?: string): HeaderInfo => {
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
  },

  defaultSection: 'dashboard'
}
