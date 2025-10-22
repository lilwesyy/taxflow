import { useState, ComponentType } from 'react'
import { LucideIcon } from 'lucide-react'
import DashboardLayout from './DashboardLayout'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'

export interface SidebarItem {
  id: string
  name: string
  icon: LucideIcon
}

export interface HeaderInfo {
  title: string
  description: string
}

export interface DashboardConfig {
  role: 'admin' | 'business' | 'synetich'
  sidebarItems: SidebarItem[]
  pages: Record<string, ComponentType<any>>
  getHeaderInfo: (activeSection: string, sidebarItems: SidebarItem[], userName?: string) => HeaderInfo
  defaultSection?: string
}

interface BaseDashboardProps extends DashboardConfig {
  onLogout: () => void
  userRole: 'business' | 'admin' | 'synetich_admin'
  userName?: string
  userEmail?: string
}

export default function BaseDashboard({
  role,
  sidebarItems,
  pages,
  getHeaderInfo,
  defaultSection = 'dashboard',
  onLogout,
  userRole,
  userName,
  userEmail
}: BaseDashboardProps) {
  const { logout, user } = useAuth()
  const { showToast } = useToast()

  const storageKey = `${role}_active_section`

  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem(storageKey) || defaultSection
  })

  const handleLogout = () => {
    logout()
    localStorage.removeItem(storageKey)
    showToast('Logout effettuato con successo', 'success')
    setTimeout(() => onLogout(), 500)
  }

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
    localStorage.setItem(storageKey, section)
  }

  const headerInfo = getHeaderInfo(activeSection, sidebarItems, userName)

  // Get the page component for the active section
  const PageComponent = pages[activeSection] || pages.dashboard

  // Prepare props to pass to page component
  const pageProps: any = {}

  // Some pages need onSectionChange callback
  if (activeSection === 'dashboard' || activeSection === 'clienti') {
    pageProps.onSectionChange = setActiveSection
  }

  // Get additional user props based on role
  const additionalProps: any = {}
  if (role === 'admin') {
    additionalProps.userProfessionalRole = user?.professionalRole
  } else if (role === 'business' || role === 'synetich') {
    additionalProps.userCompany = user?.company
  }

  return (
    <DashboardLayout
      onLogout={handleLogout}
      userRole={userRole}
      userName={userName}
      userEmail={userEmail}
      {...additionalProps}
      sidebarItems={sidebarItems}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
      headerTitle={headerInfo.title}
      headerDescription={headerInfo.description}
    >
      <PageComponent {...pageProps} />
    </DashboardLayout>
  )
}
