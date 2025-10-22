import BusinessDashboard from './BusinessDashboard'
import AdminDashboard from './AdminDashboard'
import SynetichDashboard from './SynetichDashboard'
import PendingApproval from '../auth/PendingApproval'
import RegistrationSuccess from '../auth/RegistrationSuccess'
import PivaRequestForm from '../forms/PivaRequestForm'
import PaymentPending from '../payment/PaymentPending'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'

type UserRole = 'business' | 'admin' | 'synetich_admin'

interface DashboardProps {
  onLogout: () => void
  userRole: UserRole
  userName?: string
  userEmail?: string
}

export default function Dashboard({ onLogout, userRole, userName, userEmail }: DashboardProps) {
  const { user, updateUser } = useAuth()
  const [showPivaForm, setShowPivaForm] = useState(false)

  // Business user flow
  if (userRole === 'business') {
    // Step 1: Registration not approved yet - show registration success page
    if (!user?.registrationApprovalStatus || user?.registrationApprovalStatus === 'pending') {
      return (
        <RegistrationSuccess
          userEmail={user?.email || ''}
          onBackToLogin={onLogout}
        />
      )
    }

    // Step 2: Registration approved but P.IVA form not submitted
    if (user?.registrationApprovalStatus === 'approved' && !user?.pivaFormSubmitted) {
      if (!showPivaForm) {
        setShowPivaForm(true)
      }
      return (
        <PivaRequestForm
          onSubmit={async (data) => {
            const apiService = (await import('../../services/api')).default
            const response = await apiService.updateUserProfile({
              pivaRequestData: { ...data, submittedAt: new Date() },
              pivaFormSubmitted: true,
              pivaApprovalStatus: 'pending'
            })

            // Update local user state with API response
            if (response.user) {
              updateUser(response.user)
            } else {
              // Fallback to partial update
              updateUser({
                pivaFormSubmitted: true,
                pivaApprovalStatus: 'pending',
                pivaRequestData: { ...data, submittedAt: new Date() }
              })
            }
          }}
          onCancel={onLogout}
          userName={user?.name}
        />
      )
    }

    // Step 3: P.IVA form submitted, waiting for final approval
    if (user?.pivaFormSubmitted && user?.pivaApprovalStatus === 'pending') {
      return <PendingApproval />
    }

    // Step 3.5: P.IVA approved but subscription not active (payment pending or expired)
    // This includes users whose subscription expired/canceled - they need to re-subscribe
    if (user?.pivaApprovalStatus === 'approved' && user?.subscriptionStatus !== 'active') {
      return <PaymentPending onLogout={onLogout} />
    }

    // Step 4: Rejected
    if (user?.pivaApprovalStatus === 'rejected' || user?.registrationApprovalStatus === 'rejected') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Richiesta Respinta</h2>
            <p className="text-gray-600">La tua richiesta è stata respinta. Contatta il supporto per maggiori informazioni.</p>
          </div>
        </div>
      )
    }
  }

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

  if (userRole === 'synetich_admin') {
    return (
      <SynetichDashboard
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