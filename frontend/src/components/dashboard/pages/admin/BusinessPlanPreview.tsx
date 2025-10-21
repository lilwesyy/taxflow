import { FileText, Calendar, User, Mail, Phone } from 'lucide-react'
import Logo from '../../../common/Logo'
import Modulo662Preview from './Modulo662Preview'
import { Modulo662Data } from './Modulo662Form'

interface CustomSection {
  id: string
  title: string
  content: string
  type?: 'modulo662' | 'regular'
  data?: Modulo662Data
}

interface BusinessPlanData {
  executiveSummary: string
  idea: string
  businessModel: string
  marketAnalysis: string
  team: string
  roadmap: string
  financialPlan: string
  revenueProjections: string
  customSections: CustomSection[]
}

interface BusinessPlanPreviewProps {
  data: BusinessPlanData
  clientName: string
  clientEmail?: string
  clientPhone?: string
}

export default function BusinessPlanPreview({ data, clientName, clientEmail, clientPhone }: BusinessPlanPreviewProps) {
  const currentDate = new Date().toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const renderSection = (title: string, content: string) => {
    if (!content) return null

    return (
      <div className="px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
          {title}
        </h2>
        <div
          className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    )
  }

  return (
    <div className="bg-white overflow-hidden">
      {/* Preview Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 -mx-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8" />
            <span className="text-sm font-medium uppercase tracking-wider">Business Plan</span>
          </div>
          <div style={{ filter: 'brightness(0) invert(1)' }}>
            <Logo className="h-12" />
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-2">
          {clientName}
        </h1>
        <div className="space-y-1">
          {clientEmail && (
            <div className="flex items-center justify-start space-x-2 text-lg text-blue-100">
              <Mail className="h-5 w-5" />
              <span>{clientEmail}</span>
            </div>
          )}
          {clientPhone && (
            <div className="flex items-center justify-start space-x-2 text-lg text-blue-100">
              <Phone className="h-5 w-5" />
              <span>{clientPhone}</span>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-blue-500 flex items-center space-x-6 text-sm text-blue-100">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{currentDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>TaxFlow Consulting</span>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="py-8">
        {renderSection('Executive Summary', data.executiveSummary)}
        {renderSection("L'Idea", data.idea)}
        {renderSection('Business Model', data.businessModel)}
        {renderSection('Analisi di Mercato e Concorrenza', data.marketAnalysis)}
        {renderSection('Il Team', data.team)}
        {renderSection('Roadmap e Go-to-Market', data.roadmap)}
        {renderSection('Piano Economico-Finanziario', data.financialPlan)}
        {renderSection('Proiezioni Ricavi', data.revenueProjections)}

        {/* Custom Sections */}
        {data.customSections.map((section) => {
          // Special handling for Modulo 662 sections
          if (section.type === 'modulo662' && section.data) {
            return (
              <div key={section.id} className="mb-8">
                <Modulo662Preview data={section.data} />
              </div>
            )
          }

          // Regular custom sections
          return (
            <div key={section.id}>
              {renderSection(section.title, section.content)}
            </div>
          )
        })}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-500 px-8">
          <p className="font-semibold">Documento riservato e confidenziale</p>
          <p className="mt-1">© {new Date().getFullYear()} TaxFlow - Tutti i diritti riservati</p>
        </div>
      </div>
    </div>
  )
}
