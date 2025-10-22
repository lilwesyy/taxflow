import { Home, FileText, Settings, Brain, Calculator, MessageSquare, Receipt, Target, Star, FolderOpen, TrendingUp, GraduationCap } from 'lucide-react'
import { DashboardConfig, SidebarItem, HeaderInfo } from '../layouts/BaseDashboard'
import DashboardOverview from '../pages/business/DashboardOverview'
import SimulazioneImposte from '../pages/business/SimulazioneImposte'
import AnalisiAI from '../pages/business/AnalisiAI'
import Fatturazione from '../pages/business/Fatturazione'
import BusinessPlan from '../pages/business/BusinessPlan'
import Consulenza from '../pages/business/Consulenza'
import Documenti from '../pages/business/Documenti'
import Impostazioni from '../pages/business/Impostazioni'
import FeedbackConsulente from '../pages/business/FeedbackConsulente'
import CashFlow from '../pages/business/CashFlow'
import Synetich from '../pages/business/Synetich'
import PlaceholderPage from '../pages/shared/PlaceholderPage'

export const businessDashboardConfig: Omit<DashboardConfig, 'onLogout' | 'userRole' | 'userName' | 'userEmail'> = {
  role: 'business',

  sidebarItems: [
    // Overview e gestione operativa
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'fatture', name: 'Fatturazione', icon: Receipt },
    { id: 'cashflow', name: 'Cashflow', icon: TrendingUp },
    { id: 'documenti', name: 'Cassetto Fiscale', icon: FolderOpen },

    // Strumenti di analisi e pianificazione
    { id: 'simulazione-imposte', name: 'Simulazione Imposte', icon: Calculator },
    { id: 'analisi-ai', name: 'Analisi SWOT', icon: Brain },
    { id: 'business-plan', name: 'Business Plan', icon: Target },

    // Formazione e sicurezza
    { id: 'synetich', name: 'Synetich', icon: GraduationCap },

    // Consulenza e feedback
    { id: 'consulenza', name: 'Chat Consulente', icon: MessageSquare },
    { id: 'feedback-consulente', name: 'Feedback Consulente', icon: Star },

    // Configurazione
    { id: 'impostazioni', name: 'Impostazioni', icon: Settings }
  ],

  pages: {
    'dashboard': DashboardOverview,
    'simulazione-imposte': SimulazioneImposte,
    'analisi-ai': AnalisiAI,
    'fatture': Fatturazione,
    'cashflow': CashFlow,
    'business-plan': BusinessPlan,
    'synetich': Synetich,
    'consulenza': Consulenza,
    'feedback-consulente': FeedbackConsulente,
    'documenti': Documenti,
    'impostazioni': Impostazioni,
    'default': (props: any) => {
      const currentItem = businessDashboardConfig.sidebarItems.find((item: SidebarItem) => item.id === props.activeSection)
      return (
        <PlaceholderPage
          icon={currentItem?.icon ? <currentItem.icon className="h-8 w-8 text-primary-600" /> : <FileText className="h-8 w-8 text-primary-600" />}
          title={currentItem?.name || 'Sezione'}
          description="Questa sezione è in fase di sviluppo e sarà presto disponibile."
        />
      )
    }
  },

  getHeaderInfo: (activeSection: string, sidebarItems: SidebarItem[], _userName?: string): HeaderInfo => {
    const item = sidebarItems.find(item => item.id === activeSection)
    const descriptions: Record<string, string> = {
      'dashboard': 'Panoramica della tua attività forfettaria',
      'fatture': 'Gestisci la fatturazione elettronica',
      'cashflow': 'Monitora entrate e uscite della tua attività',
      'simulazione-imposte': 'Calcola le imposte con codice ATECO',
      'analisi-ai': 'Analisi aziendale powered by AI',
      'business-plan': 'Crea il tuo business plan con AI',
      'synetich': 'Corsi di formazione sulla sicurezza sul lavoro',
      'consulenza': 'Chat con il tuo consulente CFO',
      'feedback-consulente': 'Valuta e lascia feedback sui consulenti',
      'documenti': 'Documenti fiscali organizzati come Agenzia delle Entrate',
      'impostazioni': 'Configura il tuo account'
    }

    return {
      title: item?.name || 'Dashboard',
      description: descriptions[activeSection] || 'Gestisci la tua attività'
    }
  },

  defaultSection: 'dashboard'
}
