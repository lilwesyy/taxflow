import { useState } from 'react'
import { Home, FileText, Settings, HelpCircle, Brain, Calculator, Building, MessageSquare, Receipt, Target, Star } from 'lucide-react'
import DashboardLayout from './DashboardLayout'
import DashboardOverview from './pages/business/DashboardOverview'
import AperturaPiva from './pages/business/AperturaPiva'
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
  const [activeSection, setActiveSection] = useState('dashboard')

  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'apertura-piva', name: 'Apertura P.IVA', icon: Building },
    { id: 'fatture', name: 'Fatturazione', icon: FileText },
    { id: 'simulazione-imposte', name: 'Simulazione Imposte', icon: Calculator },
    { id: 'analisi-ai', name: 'Analisi AI', icon: Brain },
    { id: 'business-plan', name: 'Business Plan', icon: Target },
    { id: 'consulenza', name: 'Chat Consulente', icon: MessageSquare },
    { id: 'documenti', name: 'Documenti', icon: Receipt },
    { id: 'impostazioni', name: 'Impostazioni', icon: Settings },
    { id: 'supporto', name: 'Supporto', icon: HelpCircle },
    { id: 'feedback-consulente', name: 'Feedback Consulente', icon: Star }
  ]


  const getHeaderInfo = () => {
    const item = sidebarItems.find(item => item.id === activeSection)
    const descriptions: Record<string, string> = {
      'dashboard': 'Panoramica della tua attività forfettaria',
      'apertura-piva': 'Richiedi apertura partita IVA forfettaria',
      'fatture': 'Gestisci la fatturazione elettronica',
      'simulazione-imposte': 'Calcola le imposte con codice ATECO',
      'analisi-ai': 'Analisi aziendale powered by AI',
      'business-plan': 'Crea il tuo business plan con AI',
      'consulenza': 'Chat con il tuo consulente CFO',
      'feedback-consulente': 'Valuta e lascia feedback sui consulenti',
      'documenti': 'Condividi documenti con i consulenti',
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

      case 'apertura-piva':
        return <AperturaPiva onNavigateToDocuments={(tab) => {
          setActiveSection('documenti')
          // Pass the tab to Documenti component via URL hash or state
          window.location.hash = `#${tab}`
        }} />

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
      onLogout={onLogout}
      userRole={userRole}
      userName={userName}
      userEmail={userEmail}
      sidebarItems={sidebarItems}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      headerTitle={headerInfo.title}
      headerDescription={headerInfo.description}
    >
      {renderMainContent()}
    </DashboardLayout>
  )
}