import { useState } from 'react'
import { Home, Users, FileText, Brain, TrendingUp, MessageSquare, Settings, HelpCircle, Building2, Target, Receipt, Star } from 'lucide-react'
import DashboardLayout from './DashboardLayout'
import AdminOverview from './pages/admin/AdminOverview'
import GestioneClienti from './pages/admin/GestioneClienti'
import RichiestePiva from './pages/admin/RichiestePiva'
import AnalisiAI from './pages/admin/AnalisiAI'
import BusinessPlans from './pages/admin/BusinessPlans'
import Consulenze from './pages/admin/Consulenze'
import DocumentiClienti from './pages/admin/DocumentiClienti'
import Fatturazione from './pages/admin/Fatturazione'
import ReportsAnalytics from './pages/admin/ReportsAnalytics'
import FeedbackClienti from './pages/admin/FeedbackClienti'
import Impostazioni from './pages/admin/Impostazioni'
import Supporto from './pages/admin/Supporto'
import PlaceholderPage from './pages/shared/PlaceholderPage'

type UserRole = 'business' | 'admin'

interface AdminDashboardProps {
  onLogout: () => void
  userRole: UserRole
  userName?: string
  userEmail?: string
}

export default function AdminDashboard({ onLogout, userRole, userName, userEmail }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState('dashboard')

  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'clienti', name: 'Gestione Clienti', icon: Users },
    { id: 'richieste-piva', name: 'Richieste P.IVA', icon: Building2 },
    { id: 'analisi-ai', name: 'Analisi AI Clienti', icon: Brain },
    { id: 'business-plans', name: 'Business Plans', icon: Target },
    { id: 'consulenze', name: 'Chat Consulenze', icon: MessageSquare },
    { id: 'documenti', name: 'Documenti Clienti', icon: Receipt },
    { id: 'fatturazione', name: 'Fatturazione', icon: FileText },
    { id: 'reports', name: 'Report & Analytics', icon: TrendingUp },
    { id: 'feedback-clienti', name: 'Feedback Clienti', icon: Star },
    { id: 'impostazioni', name: 'Impostazioni', icon: Settings },
    { id: 'supporto', name: 'Supporto', icon: HelpCircle }
  ]


  const getHeaderInfo = () => {
    const titles: Record<string, string> = {
      'dashboard': `Benvenuto ${userName}!`,
      'clienti': 'Gestione Clienti',
      'richieste-piva': 'Gestione Richieste P.IVA',
      'analisi-ai': 'Analisi AI per Clienti',
      'business-plans': 'Gestione Business Plans',
      'consulenze': 'Centro Consulenze',
      'documenti': 'Documenti Clienti',
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
      'analisi-ai': 'Strumenti avanzati di analisi AI per supportare le tue consulenze',
      'business-plans': 'Gestisci e revisiona i business plan dei tuoi clienti',
      'consulenze': 'Gestisci tutte le conversazioni e consulenze con i clienti',
      'documenti': 'Documenti e contratti dei tuoi clienti',
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
  }

  const renderMainContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminOverview onSectionChange={setActiveSection} />

      case 'clienti':
        return <GestioneClienti onSectionChange={setActiveSection} />

      case 'richieste-piva':
        return <RichiestePiva />

      case 'analisi-ai':
        return <AnalisiAI />

      case 'business-plans':
        return <BusinessPlans />

      case 'consulenze':
        return <Consulenze />

      case 'documenti':
        return <DocumentiClienti />

      case 'fatturazione':
        return <Fatturazione />

      case 'reports':
        return <ReportsAnalytics />

      case 'feedback-clienti':
        return <FeedbackClienti />

      case 'impostazioni':
        return <Impostazioni />

      case 'supporto':
        return <Supporto />

      default:
        const currentItem = sidebarItems.find(item => item.id === activeSection)
        return (
          <PlaceholderPage
            icon={currentItem?.icon ? <currentItem.icon className="h-8 w-8 text-primary-600" /> : <FileText className="h-8 w-8 text-primary-600" />}
            title={currentItem?.name || 'Sezione'}
            description="Questa sezione è in fase di sviluppo e sarà presto disponibile per la gestione clienti."
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