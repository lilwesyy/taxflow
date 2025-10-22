import { Home, Users, FileText, Brain, TrendingUp, MessageSquare, Settings, HelpCircle, Building2, Target, Receipt, Star, FolderOpen } from 'lucide-react'
import { DashboardConfig, SidebarItem, HeaderInfo } from '../layouts/BaseDashboard'
import AdminOverview from '../pages/admin/AdminOverview'
import GestioneClienti from '../pages/admin/GestioneClienti'
import RichiestePivaReal from '../pages/admin/RichiestePivaReal'
import AnalisiAI from '../pages/admin/AnalisiAI'
import BusinessPlans from '../pages/admin/BusinessPlans'
import Consulenze from '../pages/admin/Consulenze'
import DocumentiClienti from '../pages/admin/DocumentiClienti'
import Fatturazione from '../pages/admin/Fatturazione'
import ReportsAnalytics from '../pages/admin/ReportsAnalytics'
import FeedbackClienti from '../pages/admin/FeedbackClienti'
import Impostazioni from '../pages/admin/Impostazioni'
import Supporto from '../pages/admin/Supporto'
import PlaceholderPage from '../pages/shared/PlaceholderPage'

export const adminDashboardConfig: Omit<DashboardConfig, 'onLogout' | 'userRole' | 'userName' | 'userEmail'> = {
  role: 'admin',

  sidebarItems: [
    // Overview e gestione clienti
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'clienti', name: 'Gestione Clienti', icon: Users },
    { id: 'richieste-piva', name: 'Richieste P.IVA', icon: Building2 },

    // Strumenti di consulenza
    { id: 'consulenze', name: 'Chat Consulenze', icon: MessageSquare },
    { id: 'analisi-ai', name: 'Analisi SWOT', icon: Brain },
    { id: 'business-plans', name: 'Business Plans', icon: Target },

    // Gestione documenti e fatturazione
    { id: 'documenti', name: 'Cassetti Fiscali', icon: FolderOpen },
    { id: 'fatturazione', name: 'Fatturazione', icon: Receipt },

    // Analisi e feedback
    { id: 'reports', name: 'Report & Analytics', icon: TrendingUp },
    { id: 'feedback-clienti', name: 'Feedback Clienti', icon: Star },

    // Sistema e supporto
    { id: 'supporto', name: 'Supporto', icon: HelpCircle },
    { id: 'impostazioni', name: 'Impostazioni', icon: Settings }
  ],

  pages: {
    'dashboard': AdminOverview,
    'clienti': GestioneClienti,
    'richieste-piva': RichiestePivaReal,
    'analisi-ai': AnalisiAI,
    'business-plans': BusinessPlans,
    'consulenze': Consulenze,
    'documenti': DocumentiClienti,
    'fatturazione': Fatturazione,
    'reports': ReportsAnalytics,
    'feedback-clienti': FeedbackClienti,
    'impostazioni': Impostazioni,
    'supporto': Supporto,
    'default': (props: any) => {
      const currentItem = adminDashboardConfig.sidebarItems.find((item: SidebarItem) => item.id === props.activeSection)
      return (
        <PlaceholderPage
          icon={currentItem?.icon ? <currentItem.icon className="h-8 w-8 text-primary-600" /> : <FileText className="h-8 w-8 text-primary-600" />}
          title={currentItem?.name || 'Sezione'}
          description="Questa sezione è in fase di sviluppo e sarà presto disponibile per la gestione clienti."
        />
      )
    }
  },

  getHeaderInfo: (activeSection: string, _sidebarItems: SidebarItem[], userName?: string): HeaderInfo => {
    const titles: Record<string, string> = {
      'dashboard': `Benvenuto ${userName}!`,
      'clienti': 'Gestione Clienti',
      'richieste-piva': 'Gestione Richieste P.IVA',
      'analisi-ai': 'Analisi SWOT per Clienti',
      'business-plans': 'Gestione Business Plans',
      'consulenze': 'Centro Consulenze',
      'documenti': 'Cassetti Fiscali Clienti',
      'fatturazione': 'Fatturazione Consulenze',
      'reports': 'Report & Analytics',
      'feedback-clienti': 'Feedback Clienti',
      'impostazioni': 'Impostazioni',
      'supporto': 'Supporto'
    }

    const descriptions: Record<string, string> = {
      'dashboard': 'Gestisci i tuoi clienti e le consulenze forfettarie',
      'clienti': 'Visualizza e gestisci tutti i tuoi clienti',
      'richieste-piva': 'Gestisci tutte le richieste di apertura partita IVA forfettaria dei tuoi clienti',
      'analisi-ai': 'Strumenti avanzati di analisi SWOT per supportare le tue consulenze',
      'business-plans': 'Gestisci e revisiona i business plan dei tuoi clienti',
      'consulenze': 'Gestisci tutte le conversazioni e consulenze con i clienti',
      'documenti': 'Cassetti fiscali organizzati come Agenzia delle Entrate',
      'fatturazione': 'Gestione fatturazione delle tue consulenze',
      'reports': 'Report e analytics dettagliati sui tuoi clienti',
      'feedback-clienti': 'Visualizza e rispondi ai feedback ricevuti dai clienti',
      'impostazioni': 'Configura il tuo account e le preferenze',
      'supporto': 'Ottieni aiuto e assistenza tecnica'
    }

    return {
      title: titles[activeSection] || 'Dashboard',
      description: descriptions[activeSection] || 'Gestisci i tuoi clienti'
    }
  },

  defaultSection: 'dashboard'
}
