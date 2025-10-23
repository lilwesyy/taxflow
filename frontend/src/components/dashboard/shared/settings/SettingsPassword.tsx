import { Shield, Save, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useFormValidation } from './hooks/useFormValidation'

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface SettingsPasswordProps {
  onUpdate: (data: PasswordData) => Promise<void>
  loading?: boolean
}

export default function SettingsPassword({ onUpdate, loading = false }: SettingsPasswordProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const { passwordStrength, validatePasswordStrength, isPasswordValid } = useFormValidation()

  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
    if (field === 'newPassword') {
      validatePasswordStrength(value)
    }
  }

  const handleSave = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return
    }

    await onUpdate(passwordData)

    // Reset form after successful save
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  const isFormValid = () => {
    return (
      passwordData.currentPassword &&
      passwordData.newPassword &&
      passwordData.confirmPassword &&
      passwordData.newPassword === passwordData.confirmPassword &&
      isPasswordValid()
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center mr-3">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Cambia Password</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password Attuale *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
              placeholder="Inserisci la password attuale"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nuova Password *
          </label>
          <input
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Inserisci la nuova password"
          />
          {passwordData.newPassword && (
            <div className="mt-2 space-y-1 text-sm">
              <div className={`flex items-center ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordStrength.hasMinLength ? '✓' : '○'}</span>
                Almeno 8 caratteri
              </div>
              <div className={`flex items-center ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordStrength.hasUpperCase ? '✓' : '○'}</span>
                Una lettera maiuscola
              </div>
              <div className={`flex items-center ${passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordStrength.hasLowerCase ? '✓' : '○'}</span>
                Una lettera minuscola
              </div>
              <div className={`flex items-center ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordStrength.hasNumber ? '✓' : '○'}</span>
                Un numero
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conferma Nuova Password *
          </label>
          <input
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Conferma la nuova password"
          />
          {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
            <p className="text-sm text-red-600 mt-2">Le password non corrispondono</p>
          )}
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading || !isFormValid()}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Aggiornamento...' : 'Aggiorna Password'}
          </button>
        </div>
      </div>
    </div>
  )
}
