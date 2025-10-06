import { FileCheck, Receipt, BookOpen, DollarSign, Eye, FolderOpen, type LucideIcon } from 'lucide-react'

interface DocumentTab {
  id: string
  name: string
  icon: LucideIcon
  description: string
}

interface DocumentTabsProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export const tabs: DocumentTab[] = [
  { id: 'dichiarazioni', name: 'Dichiarazioni', icon: FileCheck, description: 'Modelli redditi, IVA, 730' },
  { id: 'fatturazione', name: 'Fatturazione', icon: Receipt, description: 'Fatture elettroniche, corrispettivi' },
  { id: 'comunicazioni', name: 'Comunicazioni', icon: BookOpen, description: 'LIPE, Esterometro, Spesometro' },
  { id: 'versamenti', name: 'Versamenti', icon: DollarSign, description: 'F24, tributi, ravvedimenti' },
  { id: 'consultazione', name: 'Consultazione', icon: Eye, description: 'Estratti conto, CU, visure' },
  { id: 'registri', name: 'Registri', icon: BookOpen, description: 'Registri IVA, incassi, cespiti' },
  { id: 'altri_documenti', name: 'Altri Documenti', icon: FolderOpen, description: 'Contratti, visure, assicurazioni' }
]

export default function DocumentTabs({ activeTab, onTabChange }: DocumentTabsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`p-3 rounded-lg text-left transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2 mb-1">
              <tab.icon className="h-4 w-4" />
              <span className="font-medium text-sm">{tab.name}</span>
            </div>
            <p className={`text-xs ${activeTab === tab.id ? 'text-blue-100' : 'text-gray-500'}`}>
              {tab.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
