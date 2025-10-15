import { useState } from 'react'
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react'

export interface AIQuestionnaireData {
  industry: string
  customIndustry?: string
  businessIdea: string
  targetMarket: string
  businessStage: string
  estimatedBudget: string
  teamSize: string
  mainObjectives: string
  timeline: string
  businessModel: string
  competitors: string
}

interface AIQuestionnaireFormProps {
  clientName: string
  onSubmit: (data: AIQuestionnaireData) => void
  onBack: () => void
  isGenerating: boolean
}

const INDUSTRIES = [
  'Tecnologia e Software',
  'E-commerce e Retail',
  'Servizi Professionali',
  'Salute e Benessere',
  'Alimentare e Ristorazione',
  'Educazione e Formazione',
  'Immobiliare',
  'Turismo e Ospitalità',
  'Manifatturiero',
  'Fintech',
  'Marketing e Comunicazione',
  'Altro (specificare)'
]

const BUSINESS_STAGES = [
  { value: 'idea', label: 'Solo Idea - Non ancora avviata' },
  { value: 'mvp', label: 'MVP/Prototipo - In fase di sviluppo' },
  { value: 'startup', label: 'Startup - Appena lanciata' },
  { value: 'growing', label: 'In Crescita - Clienti attivi' },
  { value: 'established', label: 'Consolidata - Fatturato stabile' }
]

const TIMELINES = [
  { value: '6months', label: '6 mesi' },
  { value: '1year', label: '1 anno' },
  { value: '2years', label: '2 anni' },
  { value: '3years', label: '3 anni' },
  { value: '5years', label: '5+ anni' }
]

const BUSINESS_MODELS = [
  'B2B (Business to Business)',
  'B2C (Business to Consumer)',
  'B2B2C (Business to Business to Consumer)',
  'SaaS (Software as a Service)',
  'Marketplace/Piattaforma',
  'E-commerce',
  'Subscription/Abbonamento',
  'Freemium',
  'Licensing',
  'Altro'
]

export default function AIQuestionnaireForm({
  clientName,
  onSubmit,
  onBack,
  isGenerating
}: AIQuestionnaireFormProps) {
  const [formData, setFormData] = useState<AIQuestionnaireData>({
    industry: '',
    customIndustry: '',
    businessIdea: '',
    targetMarket: '',
    businessStage: '',
    estimatedBudget: '',
    teamSize: '',
    mainObjectives: '',
    timeline: '',
    businessModel: '',
    competitors: ''
  })

  const handleChange = (field: keyof AIQuestionnaireData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const isFormValid =
    formData.industry &&
    (formData.industry !== 'Altro (specificare)' || formData.customIndustry) &&
    formData.businessIdea &&
    formData.targetMarket &&
    formData.businessStage &&
    formData.mainObjectives &&
    formData.timeline &&
    formData.businessModel

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center space-x-3 mb-2">
          <Sparkles className="h-6 w-6" />
          <h3 className="text-2xl font-bold">Generazione Business Plan con AI</h3>
        </div>
        <p className="text-blue-100">
          Rispondi ad alcune domande per aiutare l'AI a creare un business plan personalizzato per {clientName}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Industry */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Settore / Industria *
          </label>
          <select
            value={formData.industry}
            onChange={(e) => handleChange('industry', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Seleziona il settore...</option>
            {INDUSTRIES.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>

        {/* Custom Industry (if "Altro" selected) */}
        {formData.industry === 'Altro (specificare)' && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Specifica il settore *
            </label>
            <input
              type="text"
              value={formData.customIndustry}
              onChange={(e) => handleChange('customIndustry', e.target.value)}
              placeholder="Es: Biotecnologie, Gaming, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        )}

        {/* Business Idea */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Descrivi brevemente l'idea imprenditoriale *
          </label>
          <textarea
            value={formData.businessIdea}
            onChange={(e) => handleChange('businessIdea', e.target.value)}
            placeholder="Es: Una piattaforma SaaS che aiuta le PMI a gestire la fatturazione elettronica in modo semplice e automatizzato..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Descrivi il problema che risolvi e la tua soluzione
          </p>
        </div>

        {/* Target Market */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Mercato target / Clientela *
          </label>
          <input
            type="text"
            value={formData.targetMarket}
            onChange={(e) => handleChange('targetMarket', e.target.value)}
            placeholder="Es: PMI italiane con regime forfettario, professionisti, startup, etc."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Business Stage */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Fase dell'azienda *
          </label>
          <select
            value={formData.businessStage}
            onChange={(e) => handleChange('businessStage', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Seleziona la fase...</option>
            {BUSINESS_STAGES.map(stage => (
              <option key={stage.value} value={stage.value}>{stage.label}</option>
            ))}
          </select>
        </div>

        {/* Business Model */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Modello di Business *
          </label>
          <select
            value={formData.businessModel}
            onChange={(e) => handleChange('businessModel', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Seleziona il modello...</option>
            {BUSINESS_MODELS.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        {/* Grid layout for smaller fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Estimated Budget */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Budget / Investimento stimato
            </label>
            <input
              type="text"
              value={formData.estimatedBudget}
              onChange={(e) => handleChange('estimatedBudget', e.target.value)}
              placeholder="Es: €50.000, €100.000, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Opzionale</p>
          </div>

          {/* Team Size */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Dimensione del team
            </label>
            <input
              type="text"
              value={formData.teamSize}
              onChange={(e) => handleChange('teamSize', e.target.value)}
              placeholder="Es: 1 founder, 3 persone, 5+ membri"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Opzionale</p>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Timeline / Orizzonte temporale *
          </label>
          <select
            value={formData.timeline}
            onChange={(e) => handleChange('timeline', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Seleziona la timeline...</option>
            {TIMELINES.map(timeline => (
              <option key={timeline.value} value={timeline.value}>{timeline.label}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Per quale orizzonte temporale vuoi le proiezioni?
          </p>
        </div>

        {/* Main Objectives */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Obiettivi principali *
          </label>
          <textarea
            value={formData.mainObjectives}
            onChange={(e) => handleChange('mainObjectives', e.target.value)}
            placeholder="Es: Raggiungere 1000 clienti nel primo anno, break-even entro 12 mesi, espansione nazionale entro 2 anni..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
          />
        </div>

        {/* Competitors */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Concorrenti principali (se conosciuti)
          </label>
          <textarea
            value={formData.competitors}
            onChange={(e) => handleChange('competitors', e.target.value)}
            placeholder="Es: Azienda A (leader di mercato), Azienda B (competitor diretto), etc."
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">Opzionale - aiuta l'AI a fare un'analisi competitiva migliore</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onBack}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Indietro</span>
          </button>

          <button
            type="submit"
            disabled={!isFormValid || isGenerating}
            className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            <Sparkles className="h-5 w-5" />
            <span>{isGenerating ? 'Generazione in corso...' : 'Genera Business Plan'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Info message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Più informazioni fornisci, più il business plan generato dall'AI sarà preciso e personalizzato.
            I campi contrassegnati con * sono obbligatori.
          </p>
        </div>
      </form>
    </div>
  )
}
