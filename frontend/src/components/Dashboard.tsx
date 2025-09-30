import BusinessDashboard from './dashboard/BusinessDashboard'
import AdminDashboard from './dashboard/AdminDashboard'

type UserRole = 'business' | 'admin'

interface DashboardProps {
  onLogout: () => void
  userRole: UserRole
  userName?: string
  userEmail?: string
}

export default function Dashboard({ onLogout, userRole, userName, userEmail }: DashboardProps) {
  if (userRole === 'admin') {
    return (
      <AdminDashboard
        onLogout={onLogout}
        userRole={userRole}
        userName={userName}
        userEmail={userEmail}
      />
    )
  }

  return (
    <BusinessDashboard
      onLogout={onLogout}
      userRole={userRole}
      userName={userName}
      userEmail={userEmail}
    />
  )
}