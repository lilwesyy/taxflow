import { ChevronRight } from 'lucide-react'
import React from 'react'

export interface QuickAction {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  section: string
}

interface QuickActionsProps {
  actions: QuickAction[]
  onSectionChange: (section: string) => void
  title?: string
}

export default function QuickActions({ actions, onSectionChange, title = "Azioni Rapide" }: QuickActionsProps) {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => onSectionChange(action.section)}
            className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10 text-left"
          >
            <div className={`inline-flex p-3 rounded-lg ${action.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
              <action.icon className="h-6 w-6" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">{action.title}</h4>
            <p className="text-sm text-gray-600">{action.description}</p>
            <ChevronRight className="h-4 w-4 text-gray-400 mt-2 group-hover:text-gray-600 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  )
}