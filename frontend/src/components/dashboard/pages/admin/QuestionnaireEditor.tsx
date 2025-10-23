import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2, ClipboardList, AlertCircle } from 'lucide-react'
import { QuestionnaireData, QuestionnaireItem } from '../../../../types/businessPlan'

interface QuestionnaireEditorProps {
  data: QuestionnaireData
  onChange: (data: QuestionnaireData) => void
  isExpanded: boolean
  onToggle: () => void
  hideHeader?: boolean
}

// Predefined strategic questions for business plan validation
const DEFAULT_QUESTIONS: Omit<QuestionnaireItem, 'id' | 'answer'>[] = [
  // Problem & Solution
  { question: 'Quale problema specifico risolve il tuo prodotto/servizio?', category: 'problem', priority: 'high' },
  { question: 'Perché i clienti dovrebbero scegliere la tua soluzione rispetto alle alternative esistenti?', category: 'problem', priority: 'high' },
  { question: 'Qual è la tua proposta di valore unica (Unique Value Proposition)?', category: 'problem', priority: 'high' },

  // Market
  { question: 'Qual è la dimensione totale del mercato di riferimento (TAM)?', category: 'market', priority: 'high' },
  { question: 'Qual è il tuo mercato target (SAM) e quanta quota pensi di catturare (SOM)?', category: 'market', priority: 'high' },
  { question: 'Chi sono i tuoi clienti ideali e quali sono le loro caratteristiche demografiche?', category: 'market', priority: 'medium' },
  { question: 'Quali sono i principali trend di mercato che favoriscono il tuo business?', category: 'market', priority: 'medium' },

  // Competition
  { question: 'Chi sono i tuoi principali concorrenti diretti e indiretti?', category: 'competition', priority: 'high' },
  { question: 'Quali sono i tuoi vantaggi competitivi difendibili nel tempo?', category: 'competition', priority: 'high' },
  { question: 'Quali barriere all\'entrata proteggeranno il tuo business?', category: 'competition', priority: 'medium' },

  // Team
  { question: 'Il team ha le competenze necessarie per eseguire il piano?', category: 'team', priority: 'high' },
  { question: 'Quali competenze chiave mancano e come pensi di colmarle?', category: 'team', priority: 'medium' },

  // Financial
  { question: 'Qual è il tuo modello di pricing e la strategia di monetizzazione?', category: 'financial', priority: 'high' },
  { question: 'Quanto costa acquisire un cliente (CAC) e qual è il suo valore nel tempo (LTV)?', category: 'financial', priority: 'high' },
  { question: 'Quando raggiungerai il break-even point?', category: 'financial', priority: 'high' },
  { question: 'Quanti capitali ti servono per raggiungere i prossimi milestone e per cosa li userai?', category: 'financial', priority: 'high' },

  // Scalability
  { question: 'Il tuo modello di business è scalabile? Come crescerai senza aumentare i costi proporzionalmente?', category: 'scalability', priority: 'high' },
  { question: 'Quali sono i tuoi canali di acquisizione clienti e quanto sono scalabili?', category: 'scalability', priority: 'medium' },

  // Risks
  { question: 'Quali sono i principali rischi che potrebbero impedire il successo del business?', category: 'risks', priority: 'high' },
  { question: 'Quali sono le assunzioni critiche su cui si basa il piano e cosa succede se si rivelano false?', category: 'risks', priority: 'medium' },

  // Metrics
  { question: 'Quali sono i KPI principali che monitorerai per misurare il successo?', category: 'metrics', priority: 'high' },
  { question: 'Quali sono gli obiettivi specifici a 12, 24 e 36 mesi?', category: 'metrics', priority: 'medium' }
]

const CATEGORY_LABELS: Record<string, string> = {
  problem: 'Problema & Soluzione',
  market: 'Mercato',
  competition: 'Competizione',
  team: 'Team',
  financial: 'Aspetti Finanziari',
  scalability: 'Scalabilità',
  risks: 'Rischi',
  metrics: 'Metriche'
}

const CATEGORY_COLORS: Record<string, string> = {
  problem: 'bg-red-100 text-red-700',
  market: 'bg-blue-100 text-blue-700',
  competition: 'bg-purple-100 text-purple-700',
  team: 'bg-green-100 text-green-700',
  financial: 'bg-yellow-100 text-yellow-700',
  scalability: 'bg-indigo-100 text-indigo-700',
  risks: 'bg-orange-100 text-orange-700',
  metrics: 'bg-teal-100 text-teal-700'
}

export default function QuestionnaireEditor({
  data,
  onChange,
  isExpanded,
  onToggle,
  hideHeader = false
}: QuestionnaireEditorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showOnlyUnanswered, setShowOnlyUnanswered] = useState(false)

  // Calculate completion percentage
  const completionStats = useMemo(() => {
    const totalQuestions = data.items.length
    const answeredQuestions = data.items.filter(item => item.answer.trim() !== '').length
    const percentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0

    return { totalQuestions, answeredQuestions, percentage }
  }, [data.items])

  // Filter questions by category and answered status
  const filteredItems = useMemo(() => {
    let filtered = data.items

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    if (showOnlyUnanswered) {
      filtered = filtered.filter(item => item.answer.trim() === '')
    }

    return filtered
  }, [data.items, selectedCategory, showOnlyUnanswered])

  const addQuestion = (customQuestion?: Omit<QuestionnaireItem, 'id' | 'answer'>) => {
    const newQuestion: QuestionnaireItem = {
      id: `question_${Date.now()}`,
      question: customQuestion?.question || '',
      answer: '',
      category: customQuestion?.category || 'problem',
      priority: customQuestion?.priority
    }
    onChange({
      ...data,
      items: [...data.items, newQuestion]
    })
  }

  const addAllDefaultQuestions = () => {
    const existingQuestions = new Set(data.items.map(item => item.question))
    const newQuestions = DEFAULT_QUESTIONS
      .filter(q => !existingQuestions.has(q.question))
      .map((q, index) => ({
        id: `question_${Date.now()}_${index}`,
        answer: '',
        ...q
      }))

    onChange({
      ...data,
      items: [...data.items, ...newQuestions]
    })
  }

  const updateQuestion = (id: string, field: keyof QuestionnaireItem, value: any) => {
    onChange({
      ...data,
      items: data.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
      lastUpdated: new Date().toISOString()
    })
  }

  const removeQuestion = (id: string) => {
    onChange({
      ...data,
      items: data.items.filter(item => item.id !== id)
    })
  }

  const categories = Object.keys(CATEGORY_LABELS)

  // Render content function (shared between header and no-header versions)
  const renderContent = () => (
    <>
      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => addQuestion()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Aggiungi Domanda Custom</span>
              </button>

              {data.items.length === 0 && (
                <button
                  onClick={addAllDefaultQuestions}
                  className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <ClipboardList className="h-4 w-4" />
                  <span>Carica Domande Standard ({DEFAULT_QUESTIONS.length})</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={showOnlyUnanswered}
                  onChange={(e) => setShowOnlyUnanswered(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Solo non risposte</span>
              </label>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tutte le categorie
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : `${CATEGORY_COLORS[category]} hover:opacity-80`
                }`}
              >
                {CATEGORY_LABELS[category]}
              </button>
            ))}
          </div>

          {/* Questions List */}
          {data.items.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <ClipboardList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Nessuna domanda aggiunta</p>
              <button
                onClick={addAllDefaultQuestions}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <ClipboardList className="h-5 w-5" />
                <span>Carica {DEFAULT_QUESTIONS.length} Domande Standard</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    {showOnlyUnanswered
                      ? 'Nessuna domanda senza risposta'
                      : 'Nessuna domanda in questa categoria'}
                  </p>
                </div>
              ) : (
                filteredItems.map((item, index) => (
                  <div key={item.id} className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[item.category]}`}>
                              {CATEGORY_LABELS[item.category]}
                            </span>
                            {item.priority && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.priority === 'high' ? 'bg-red-100 text-red-700' :
                                item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {item.priority === 'high' ? 'Priorità Alta' :
                                 item.priority === 'medium' ? 'Priorità Media' : 'Priorità Bassa'}
                              </span>
                            )}
                          </div>
                          <textarea
                            value={item.question}
                            onChange={(e) => updateQuestion(item.id, 'question', e.target.value)}
                            className="w-full text-gray-900 font-medium mb-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Inserisci la domanda..."
                            rows={2}
                          />
                          <textarea
                            value={item.answer}
                            onChange={(e) => updateQuestion(item.id, 'answer', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Inserisci la risposta..."
                            rows={4}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeQuestion(item.id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors ml-2 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-gray-100">
                      <select
                        value={item.category}
                        onChange={(e) => updateQuestion(item.id, 'category', e.target.value)}
                        className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {CATEGORY_LABELS[cat]}
                          </option>
                        ))}
                      </select>
                      <select
                        value={item.priority || 'medium'}
                        onChange={(e) => updateQuestion(item.id, 'priority', e.target.value)}
                        className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="high">Priorità Alta</option>
                        <option value="medium">Priorità Media</option>
                        <option value="low">Priorità Bassa</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note Aggiuntive
            </label>
            <textarea
              value={data.notes || ''}
              onChange={(e) => onChange({ ...data, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Aggiungi note o commenti generali sul questionario..."
            />
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Suggerimento:</strong> Usa questo questionario per validare le assunzioni chiave del business plan.
              Risposte chiare e concrete a queste domande rafforzano la credibilità del piano e aiutano a identificare
              potenziali debolezze da affrontare.
            </p>
          </div>

          {/* Completion Summary */}
          {data.items.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Riepilogo Completamento</h4>
              <div className="space-y-2">
                {categories.map((category) => {
                  const categoryItems = data.items.filter(item => item.category === category)
                  const answeredItems = categoryItems.filter(item => item.answer.trim() !== '')
                  const percentage = categoryItems.length > 0
                    ? Math.round((answeredItems.length / categoryItems.length) * 100)
                    : 0

                  return categoryItems.length > 0 ? (
                    <div key={category} className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${CATEGORY_COLORS[category]} w-40`}>
                        {CATEGORY_LABELS[category]}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-20 text-right">
                        {answeredItems.length}/{categoryItems.length} ({percentage}%)
                      </span>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          )}
        </>
  )

  // If header is hidden, render content directly
  if (hideHeader) {
    return (
      <div className="p-6 bg-gray-50 space-y-6">
        {renderContent()}
      </div>
    )
  }

  // Otherwise render with full header
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                onToggle()
              }}
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            <ClipboardList className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Questionario Strategico</h3>
              <p className="text-sm text-gray-600 mt-1">
                Domande di validazione per il business plan
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {completionStats.answeredQuestions}/{completionStats.totalQuestions} completate
              </div>
              <div className="text-xs text-gray-500">{completionStats.percentage}% completato</div>
            </div>
            <div className="w-16 h-16">
              <svg className="transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray={`${completionStats.percentage}, 100`}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-6">
          {renderContent()}
        </div>
      )}
    </div>
  )
}
