import { useState } from 'react'
import { Home, FileText, Settings, HelpCircle, Brain, Calculator, MessageSquare, Receipt, Target, Star, FolderOpen } from 'lucide-react'
import DashboardLayout from './DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import DashboardOverview from './pages/business/DashboardOverview'
import SimulazioneImposte from './pages/business/SimulazioneImposte'
import AnalisiAI from './pages/business/AnalisiAI'
import Fatturazione from './pages/business/Fatturazione'
import BusinessPlan from './pages/business/BusinessPlan'
import Consulenza from './pages/business/Consulenza'
import Documenti from './pages/business/Documenti'
import Impostazioni from './pages/business/Impostazioni'
import FeedbackConsulente from './pages/business/FeedbackConsulente'
import PlaceholderPage from './pages/shared/PlaceholderPage'

type UserRole = 'business' | 'admin'

interface BusinessDashboardProps {
  onLogout: () => void
  userRole: UserRole
  userName?: string
  userEmail?: string
}

export default function BusinessDashboard({ onLogout, userRole, userName, userEmail }: BusinessDashboardProps) {
  const { logout } = useAuth()
  const { showToast } = useToast()
  const [activeSection, setActiveSection] = useState(() => {
    // Carica la sezione salvata o usa 'dashboard' come default
    return localStorage.getItem('business_active_section') || 'dashboard'
  })

  const handleLogout = () => {
    logout()
    localStorage.removeItem('business_active_section')
    showToast('Logout effettuato con successo', 'success')
    setTimeout(() => onLogout(), 500)
  }

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
    localStorage.setItem('business_active_section', section)
  }

  const sidebarItems = [
    // Overview e gestione operativa
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'fatture', name: 'Fatturazione', icon: Receipt },
    { id: 'documenti', name: 'Cassetto Fiscale', icon: FolderOpen },

    // Strumenti di analisi e pianificazione
    { id: 'simulazione-imposte', name: 'Simulazione Imposte', icon: Calculator },
    { id: 'analisi-ai', name: 'Analisi AI', icon: Brain },
    { id: 'business-plan', name: 'Business Plan', icon: Target },

    // Consulenza e supporto
    { id: 'consulenza', name: 'Chat Consulente', icon: MessageSquare },
    { id: 'feedback-consulente', name: 'Feedback Consulente', icon: Star },
    { id: 'supporto', name: 'Supporto', icon: HelpCircle },

    // Configurazione
    { id: 'impostazioni', name: 'Impostazioni', icon: Settings }
  ]


  const getHeaderInfo = () => {
    const item = sidebarItems.find(item => item.id === activeSection)
    const descriptions: Record<string, string> = {
      'dashboard': 'Panoramica della tua attività forfettaria',
      'fatture': 'Gestisci la fatturazione elettronica',
      'simulazione-imposte': 'Calcola le imposte con codice ATECO',
      'analisi-ai': 'Analisi aziendale powered by AI',
      'business-plan': 'Crea il tuo business plan con AI',
      'consulenza': 'Chat con il tuo consulente CFO',
      'feedback-consulente': 'Valuta e lascia feedback sui consulenti',
      'documenti': 'Documenti fiscali organizzati come Agenzia delle Entrate',
      'impostazioni': 'Configura il tuo account',
      'supporto': 'Ottieni aiuto e assistenza'
    }

    return {
      title: item?.name || 'Dashboard',
      description: descriptions[activeSection] || 'Gestisci la tua attività'
    }
  }

  const renderMainContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview onSectionChange={setActiveSection} />

      case 'simulazione-imposte':
        return <SimulazioneImposte />

      case 'analisi-ai':
        return <AnalisiAI />

      case 'fatture':
        return <Fatturazione />

      case 'business-plan':
        return <BusinessPlan />

      case 'consulenza':
        return <Consulenza />

      case 'feedback-consulente':
        return <FeedbackConsulente />

      case 'documenti':
        return <Documenti />

      case 'impostazioni':
        return <Impostazioni />

      default:
        const currentItem = sidebarItems.find(item => item.id === activeSection)
        return (
          <PlaceholderPage
            icon={currentItem?.icon ? <currentItem.icon className="h-8 w-8 text-primary-600" /> : <FileText className="h-8 w-8 text-primary-600" />}
            title={currentItem?.name || 'Sezione'}
            description="Questa sezione è in fase di sviluppo e sarà presto disponibile."
          />
        )
    }
  }

  const headerInfo = getHeaderInfo()

  return (
    <DashboardLayout
      onLogout={handleLogout}
      userRole={userRole}
      userName={userName}
      userEmail={userEmail}
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