import React from 'react'
import { FileText, Calendar, User, Mail, Phone } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import Logo from '../../../common/Logo'
import Modulo662Preview from './Modulo662Preview'
import { Modulo662Data } from './Modulo662Form'
import {
  BusinessPlanSectionType,
  BusinessPlanSectionData,
  ExecutiveSummaryData,
  IdeaData,
  BusinessModelData,
  MarketAnalysisData,
  TeamSectionData,
  RoadmapData,
  FinancialPlanData,
  RevenueProjectionsData,
  QuestionnaireData
} from '../../../../types/businessPlan'

interface CustomSection {
  id: string
  title: string
  content: string
  type?: BusinessPlanSectionType
  data?: BusinessPlanSectionData | Modulo662Data
}

interface BusinessPlanData {
  executiveSummary: string
  executiveSummaryData?: ExecutiveSummaryData
  idea: string
  ideaData?: IdeaData
  businessModel: string
  businessModelData?: BusinessModelData
  marketAnalysis: string
  marketAnalysisData?: MarketAnalysisData
  team: string
  teamData?: TeamSectionData
  roadmap: string
  roadmapData?: RoadmapData
  financialPlan: string
  financialPlanData?: FinancialPlanData
  revenueProjections: string
  revenueProjectionsData?: RevenueProjectionsData
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)
  }

  const renderSection = (title: string, content: string) => {
    if (!content) return null

    return (
      <div className="mb-8">
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

  // Executive Summary Preview
  const renderExecutiveSummary = () => {
    if (!data.executiveSummaryData) return renderSection('Executive Summary', data.executiveSummary)

    const summary = data.executiveSummaryData

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
          Executive Summary
        </h2>

        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            <strong>{summary.companyName}</strong> opera nel settore <strong>{summary.sector}</strong> con l'obiettivo di creare valore attraverso soluzioni innovative e un modello di business sostenibile.
          </p>

          {summary.mainObjective && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Obiettivo Principale</h3>
              <p className="text-gray-700 leading-relaxed">{summary.mainObjective}</p>
            </div>
          )}

          {summary.keyStrategy && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Strategia Chiave</h3>
              <p className="text-gray-700 leading-relaxed">{summary.keyStrategy}</p>
            </div>
          )}

          {summary.strengthPoints && summary.strengthPoints.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Punti di Forza Principali</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                {summary.strengthPoints.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {summary.financialProjections && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Proiezioni Finanziarie</h3>
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <tbody>
                  {summary.financialProjections.breakEvenMonths && (
                    <tr className="border-b border-gray-300">
                      <td className="p-2 bg-gray-50 font-medium w-1/3">Break-even Point</td>
                      <td className="p-2">{summary.financialProjections.breakEvenMonths} mesi</td>
                    </tr>
                  )}
                  {summary.financialProjections.revenueGrowthPercent && (
                    <tr className="border-b border-gray-300">
                      <td className="p-2 bg-gray-50 font-medium">Crescita Ricavi Prevista</td>
                      <td className="p-2">{summary.financialProjections.revenueGrowthPercent}%</td>
                    </tr>
                  )}
                  {summary.financialProjections.yearlyProjections && (
                    <tr>
                      <td className="p-2 bg-gray-50 font-medium">Proiezioni Annuali</td>
                      <td className="p-2">{summary.financialProjections.yearlyProjections}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {summary.generalSummary && (
            <div className="border-l-4 border-blue-600 pl-4 py-2 bg-blue-50">
              <p className="text-gray-700 leading-relaxed italic">{summary.generalSummary}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Idea Preview
  const renderIdea = () => {
    if (!data.ideaData) return renderSection("L'Idea", data.idea)

    const idea = data.ideaData

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
          L'Idea Imprenditoriale
        </h2>

        <div className="space-y-4">
          {idea.problem && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Il Problema</h3>
              <p className="text-gray-700 leading-relaxed">{idea.problem}</p>
            </div>
          )}

          {idea.solution && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">La Nostra Soluzione</h3>
              <p className="text-gray-700 leading-relaxed">{idea.solution}</p>
            </div>
          )}

          {idea.valueProposition && idea.valueProposition.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Proposta di Valore Differenziante</h3>
              <p className="text-gray-700 mb-2">I nostri principali elementi di differenziazione rispetto alla concorrenza sono:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                {idea.valueProposition.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {idea.vision && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Vision a Lungo Termine</h3>
              <div className="border-l-4 border-blue-600 pl-4 py-2 bg-blue-50">
                <p className="text-gray-700 leading-relaxed italic">{idea.vision}</p>
              </div>
            </div>
          )}

          {idea.targetMarket && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mercato Target</h3>
              <p className="text-gray-700 leading-relaxed">{idea.targetMarket}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Business Model Preview
  const renderBusinessModel = () => {
    if (!data.businessModelData) return renderSection('Business Model', data.businessModel)

    const model = data.businessModelData

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
          Modello di Business
        </h2>

        <div className="space-y-6">
          {model.revenueStreams && model.revenueStreams.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Flussi di Ricavi</h3>
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border border-gray-300 text-left">Nome Flusso</th>
                    <th className="p-2 border border-gray-300 text-left">Descrizione</th>
                    <th className="p-2 border border-gray-300 text-right">Margine %</th>
                  </tr>
                </thead>
                <tbody>
                  {model.revenueStreams.map((stream) => (
                    <tr key={stream.id} className="border-b border-gray-300">
                      <td className="p-2 border border-gray-300 font-medium">{stream.name}</td>
                      <td className="p-2 border border-gray-300">{stream.description}</td>
                      <td className="p-2 border border-gray-300 text-right">{stream.margin ? `${stream.margin}%` : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {model.customerSegments && model.customerSegments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Segmenti di Clientela</h3>
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border border-gray-300 text-left">Segmento</th>
                    <th className="p-2 border border-gray-300 text-left">Descrizione</th>
                    <th className="p-2 border border-gray-300 text-center">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {model.customerSegments.map((segment) => (
                    <tr key={segment.id} className="border-b border-gray-300">
                      <td className="p-2 border border-gray-300 font-medium">{segment.name}</td>
                      <td className="p-2 border border-gray-300">{segment.description}</td>
                      <td className="p-2 border border-gray-300 text-center">
                        {segment.type === 'primary' ? 'Primario' : 'Secondario'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {model.distributionChannels && model.distributionChannels.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Canali di Distribuzione</h3>
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border border-gray-300 text-left">Canale</th>
                    <th className="p-2 border border-gray-300 text-left">Descrizione</th>
                  </tr>
                </thead>
                <tbody>
                  {model.distributionChannels.map((channel) => (
                    <tr key={channel.id} className="border-b border-gray-300">
                      <td className="p-2 border border-gray-300 font-medium">{channel.name}</td>
                      <td className="p-2 border border-gray-300">{channel.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {model.costStructure && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Struttura dei Costi</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Costi Fissi</h4>
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 border border-gray-300 text-left">Voce</th>
                        <th className="p-2 border border-gray-300 text-left">Descrizione</th>
                      </tr>
                    </thead>
                    <tbody>
                      {model.costStructure.fixedCosts.map((cost, idx) => (
                        <tr key={idx} className="border-b border-gray-300">
                          <td className="p-2 border border-gray-300 font-medium">{cost.name}</td>
                          <td className="p-2 border border-gray-300">{cost.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Costi Variabili</h4>
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 border border-gray-300 text-left">Voce</th>
                        <th className="p-2 border border-gray-300 text-left">Descrizione</th>
                      </tr>
                    </thead>
                    <tbody>
                      {model.costStructure.variableCosts.map((cost, idx) => (
                        <tr key={idx} className="border-b border-gray-300">
                          <td className="p-2 border border-gray-300 font-medium">{cost.name}</td>
                          <td className="p-2 border border-gray-300">{cost.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {model.notes && (
            <div className="text-sm text-gray-600 italic">
              <strong>Note:</strong> {model.notes}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Market Analysis Preview
  const renderMarketAnalysis = () => {
    if (!data.marketAnalysisData) return renderSection('Analisi di Mercato e Concorrenza', data.marketAnalysis)

    const market = data.marketAnalysisData

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
          Analisi di Mercato e Concorrenza
        </h2>

        <div className="space-y-6">
          {(market.totalMarketSize || market.targetMarketSize || market.marketGrowthRate) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Dimensioni del Mercato</h3>
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <tbody>
                  {market.totalMarketSize && (
                    <tr className="border-b border-gray-300">
                      <td className="p-2 bg-gray-50 font-medium w-1/3">Mercato Totale Indirizzabile (TAM)</td>
                      <td className="p-2 font-semibold">{formatCurrency(market.totalMarketSize)}</td>
                    </tr>
                  )}
                  {market.targetMarketSize && (
                    <tr className="border-b border-gray-300">
                      <td className="p-2 bg-gray-50 font-medium">Mercato Target Obiettivo (SAM)</td>
                      <td className="p-2 font-semibold">{formatCurrency(market.targetMarketSize)}</td>
                    </tr>
                  )}
                  {market.marketGrowthRate && (
                    <tr>
                      <td className="p-2 bg-gray-50 font-medium">Tasso di Crescita Annuo (CAGR)</td>
                      <td className="p-2 font-semibold">{market.marketGrowthRate}%</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {market.segments && market.segments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Segmenti di Mercato</h3>

              {/* Market Segments Chart */}
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h4 className="font-semibold text-gray-900 mb-3">Dimensione dei Segmenti di Mercato</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={market.segments.map(s => ({ name: s.name, Dimensione: s.size, Crescita: s.growth }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `€${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value: number, name: string) => {
                      if (name === 'Dimensione') return formatCurrency(value)
                      return `${value}%`
                    }} />
                    <Legend />
                    <Bar dataKey="Dimensione" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border border-gray-300 text-left">Segmento</th>
                    <th className="p-2 border border-gray-300 text-left">Descrizione</th>
                    <th className="p-2 border border-gray-300 text-right">Dimensione</th>
                    <th className="p-2 border border-gray-300 text-right">Crescita %</th>
                  </tr>
                </thead>
                <tbody>
                  {market.segments.map((segment) => (
                    <tr key={segment.id} className="border-b border-gray-300">
                      <td className="p-2 border border-gray-300 font-medium">{segment.name}</td>
                      <td className="p-2 border border-gray-300">{segment.description}</td>
                      <td className="p-2 border border-gray-300 text-right font-semibold">{formatCurrency(segment.size)}</td>
                      <td className="p-2 border border-gray-300 text-right">{segment.growth}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {market.competitors && market.competitors.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Analisi della Concorrenza</h3>

              {/* Market Share Pie Chart */}
              {market.competitors.some(c => c.marketShare) && (
                <div className="mb-6 p-4 bg-gray-50 rounded">
                  <h4 className="font-semibold text-gray-900 mb-3">Distribuzione Quote di Mercato</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={market.competitors
                          .filter(c => c.marketShare)
                          .map(c => ({ name: c.name, value: c.marketShare }))}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {market.competitors.filter(c => c.marketShare).map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {market.competitors.map((competitor, idx) => (
                <div key={competitor.id} className="mb-4 border border-gray-300 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 text-lg">{idx + 1}. {competitor.name}</h4>
                    {competitor.marketShare && (
                      <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded font-semibold">
                        Quota di mercato: {competitor.marketShare}%
                      </span>
                    )}
                  </div>

                  {competitor.description && (
                    <p className="text-gray-700 mb-3">{competitor.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-sm text-gray-900 mb-1">Punti di Forza</p>
                      <p className="text-sm text-gray-700">{competitor.strengths}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 mb-1">Punti di Debolezza</p>
                      <p className="text-sm text-gray-700">{competitor.weaknesses}</p>
                    </div>
                  </div>

                  {(competitor.revenue || competitor.founded || competitor.website) && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                      {competitor.revenue && <span className="mr-4">Fatturato: {formatCurrency(competitor.revenue)}</span>}
                      {competitor.founded && <span className="mr-4">Fondazione: {competitor.founded}</span>}
                      {competitor.website && <span>Website: {competitor.website}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {market.notes && (
            <div className="text-sm text-gray-600 italic">
              <strong>Note:</strong> {market.notes}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Team Preview
  const renderTeam = () => {
    if (!data.teamData) return renderSection('Il Team', data.team)

    const team = data.teamData

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
          Il Team
        </h2>

        <div className="space-y-4">
          {team.description && (
            <p className="text-gray-700 leading-relaxed mb-4">{team.description}</p>
          )}

          {team.orgChartType && (
            <p className="text-sm text-gray-600 mb-3">
              <strong>Struttura organizzativa:</strong> {team.orgChartType === 'hierarchical' ? 'Gerarchica' : 'Piatta'}
            </p>
          )}

          {team.members && team.members.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Composizione del Team</h3>
              {team.members.map((member) => (
                <div key={member.id} className="mb-4 border border-gray-300 p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {member.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg">{member.name}</h4>
                      <p className="text-blue-600 font-medium">{member.role}</p>
                      {member.department && (
                        <p className="text-sm text-gray-600 mt-1">Dipartimento: {member.department}</p>
                      )}
                      <p className="text-gray-700 mt-2 leading-relaxed">{member.description}</p>

                      <div className="mt-3 flex flex-wrap gap-3 text-sm">
                        {member.email && (
                          <span className="text-gray-600">
                            <strong>Email:</strong> {member.email}
                          </span>
                        )}
                        {member.linkedIn && (
                          <span className="text-gray-600">
                            <strong>LinkedIn:</strong> {member.linkedIn}
                          </span>
                        )}
                      </div>

                      {member.parentId && (
                        <p className="text-xs text-gray-500 mt-2">
                          Riporta a: {team.members.find(m => m.id === member.parentId)?.name || 'N/A'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Roadmap Preview
  const renderRoadmap = () => {
    if (!data.roadmapData) return renderSection('Roadmap e Go-to-Market', data.roadmap)

    const roadmap = data.roadmapData

    const statusLabels = {
      planned: 'Pianificato',
      in_progress: 'In Corso',
      completed: 'Completato',
      delayed: 'In Ritardo'
    }

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
          Roadmap e Strategia di Go-to-Market
        </h2>

        <div className="space-y-6">
          {roadmap.visualizationType && (
            <p className="text-sm text-gray-600">
              <strong>Tipo di visualizzazione:</strong> {roadmap.visualizationType === 'timeline' ? 'Timeline' : roadmap.visualizationType === 'gantt' ? 'Gantt' : 'Fasi'}
            </p>
          )}

          {roadmap.phases && roadmap.phases.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Fasi del Progetto</h3>
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border border-gray-300 text-left">Fase</th>
                    <th className="p-2 border border-gray-300 text-left">Data Inizio</th>
                    <th className="p-2 border border-gray-300 text-left">Data Fine</th>
                    <th className="p-2 border border-gray-300 text-left">Durata</th>
                  </tr>
                </thead>
                <tbody>
                  {roadmap.phases.map((phase) => {
                    const start = new Date(phase.startDate)
                    const end = new Date(phase.endDate)
                    const diffTime = Math.abs(end.getTime() - start.getTime())
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                    return (
                      <tr key={phase.id} className="border-b border-gray-300">
                        <td className="p-2 border border-gray-300 font-medium">{phase.name}</td>
                        <td className="p-2 border border-gray-300">{start.toLocaleDateString('it-IT')}</td>
                        <td className="p-2 border border-gray-300">{end.toLocaleDateString('it-IT')}</td>
                        <td className="p-2 border border-gray-300">{diffDays} giorni</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {roadmap.milestones && roadmap.milestones.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Milestone Principali</h3>

              {/* Milestone Timeline Visualization */}
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h4 className="font-semibold text-gray-900 mb-3">Timeline Milestone</h4>
                <ResponsiveContainer width="100%" height={Math.max(300, roadmap.milestones.length * 50)}>
                  <BarChart
                    layout="vertical"
                    data={roadmap.milestones.map((milestone) => {
                      const start = new Date(milestone.startDate).getTime()
                      const end = milestone.endDate ? new Date(milestone.endDate).getTime() : start
                      return {
                        name: milestone.title,
                        start: start,
                        duration: end - start,
                        status: milestone.status
                      }
                    })}
                    margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      domain={['dataMin', 'dataMax']}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })}
                    />
                    <YAxis type="category" dataKey="name" width={140} />
                    <Tooltip
                      formatter={(value: any, name: string) => {
                        if (name === 'start') return new Date(value).toLocaleDateString('it-IT')
                        if (name === 'duration') return `${Math.ceil(value / (1000 * 60 * 60 * 24))} giorni`
                        return value
                      }}
                    />
                    <Bar dataKey="duration" stackId="a">
                      {roadmap.milestones.map((milestone, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            milestone.status === 'completed' ? '#10b981' :
                            milestone.status === 'in_progress' ? '#3b82f6' :
                            milestone.status === 'delayed' ? '#ef4444' : '#9ca3af'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                    <span>Completato</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
                    <span>In Corso</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-400 rounded mr-1"></div>
                    <span>Pianificato</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
                    <span>In Ritardo</span>
                  </div>
                </div>
              </div>

              {roadmap.milestones.map((milestone, idx) => (
                <div key={milestone.id} className="mb-4 border border-gray-300 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{idx + 1}. {milestone.title}</h4>
                    <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded font-medium">
                      {statusLabels[milestone.status]}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-3">{milestone.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <strong className="text-gray-900">Data Inizio:</strong>
                      <span className="text-gray-700 ml-2">{new Date(milestone.startDate).toLocaleDateString('it-IT')}</span>
                    </div>
                    {milestone.endDate && (
                      <div>
                        <strong className="text-gray-900">Data Fine:</strong>
                        <span className="text-gray-700 ml-2">{new Date(milestone.endDate).toLocaleDateString('it-IT')}</span>
                      </div>
                    )}
                    {milestone.phase && (
                      <div>
                        <strong className="text-gray-900">Fase:</strong>
                        <span className="text-gray-700 ml-2">{milestone.phase}</span>
                      </div>
                    )}
                  </div>

                  {milestone.deliverables && milestone.deliverables.length > 0 && (
                    <div className="mt-3">
                      <p className="font-semibold text-sm text-gray-900 mb-1">Deliverables:</p>
                      <ul className="list-disc list-inside text-sm text-gray-700 ml-4">
                        {milestone.deliverables.map((deliverable, idx) => (
                          <li key={idx}>{deliverable}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {milestone.team && milestone.team.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600">
                        <strong>Team assegnato:</strong> {milestone.team.join(', ')}
                      </p>
                    </div>
                  )}

                  {milestone.dependencies && milestone.dependencies.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600">
                        <strong>Dipendenze:</strong> {milestone.dependencies.length} milestone precedenti
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {roadmap.notes && (
            <div className="text-sm text-gray-600 italic">
              <strong>Note:</strong> {roadmap.notes}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Financial Plan Preview
  const renderFinancialPlan = () => {
    if (!data.financialPlanData) return renderSection('Piano Economico-Finanziario', data.financialPlan)

    const financial = data.financialPlanData

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
          Piano Economico-Finanziario
        </h2>

        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            <strong>Anni di proiezione:</strong> {financial.projectionYears.join(', ')} | <strong>Valuta:</strong> {financial.currency}
          </p>

          {financial.scenarios && financial.scenarios.length > 0 && financial.scenarios.map((scenario) => (
            <div key={scenario.id} className="border border-gray-300 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Scenario: {scenario.name}</h3>
              {scenario.description && (
                <p className="text-gray-700 text-sm mb-4">{scenario.description}</p>
              )}

              {scenario.costCategories && scenario.costCategories.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Categorie di Costo</h4>
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 border border-gray-300 text-left">Categoria</th>
                        <th className="p-2 border border-gray-300 text-center">Ricorrente</th>
                        {financial.projectionYears.map((year) => (
                          <th key={year} className="p-2 border border-gray-300 text-right">{year}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {scenario.costCategories.map((cost) => (
                        <tr key={cost.id} className="border-b border-gray-300">
                          <td className="p-2 border border-gray-300 font-medium">{cost.name}</td>
                          <td className="p-2 border border-gray-300 text-center">{cost.isRecurring ? 'Sì' : 'No'}</td>
                          {financial.projectionYears.map((year) => (
                            <td key={year} className="p-2 border border-gray-300 text-right">
                              {formatCurrency(cost.values[year] || 0)}
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-bold">
                        <td className="p-2 border border-gray-300" colSpan={2}>Totale Costi</td>
                        {financial.projectionYears.map((year) => {
                          const total = scenario.costCategories.reduce((sum, cost) => sum + (cost.values[year] || 0), 0)
                          return (
                            <td key={year} className="p-2 border border-gray-300 text-right">
                              {formatCurrency(total)}
                            </td>
                          )
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {scenario.revenueCategories && scenario.revenueCategories.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Categorie di Ricavo</h4>
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 border border-gray-300 text-left">Categoria</th>
                        <th className="p-2 border border-gray-300 text-center">Ricorrente</th>
                        {financial.projectionYears.map((year) => (
                          <th key={year} className="p-2 border border-gray-300 text-right">{year}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {scenario.revenueCategories.map((revenue) => (
                        <tr key={revenue.id} className="border-b border-gray-300">
                          <td className="p-2 border border-gray-300 font-medium">{revenue.name}</td>
                          <td className="p-2 border border-gray-300 text-center">{revenue.isRecurring ? 'Sì' : 'No'}</td>
                          {financial.projectionYears.map((year) => (
                            <td key={year} className="p-2 border border-gray-300 text-right">
                              {formatCurrency(revenue.values[year] || 0)}
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-bold">
                        <td className="p-2 border border-gray-300" colSpan={2}>Totale Ricavi</td>
                        {financial.projectionYears.map((year) => {
                          const total = scenario.revenueCategories.reduce((sum, rev) => sum + (rev.values[year] || 0), 0)
                          return (
                            <td key={year} className="p-2 border border-gray-300 text-right">
                              {formatCurrency(total)}
                            </td>
                          )
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {scenario.costCategories && scenario.revenueCategories && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Profitto Netto</h4>
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 border border-gray-300 text-left">Voce</th>
                        {financial.projectionYears.map((year) => (
                          <th key={year} className="p-2 border border-gray-300 text-right">{year}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="font-bold">
                        <td className="p-2 border border-gray-300">Profitto</td>
                        {financial.projectionYears.map((year) => {
                          const totalRevenue = scenario.revenueCategories.reduce((sum, rev) => sum + (rev.values[year] || 0), 0)
                          const totalCosts = scenario.costCategories.reduce((sum, cost) => sum + (cost.values[year] || 0), 0)
                          const profit = totalRevenue - totalCosts

                          return (
                            <td key={year} className={`p-2 border border-gray-300 text-right ${profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                              {formatCurrency(profit)}
                            </td>
                          )
                        })}
                      </tr>
                      <tr>
                        <td className="p-2 border border-gray-300">Margine %</td>
                        {financial.projectionYears.map((year) => {
                          const totalRevenue = scenario.revenueCategories.reduce((sum, rev) => sum + (rev.values[year] || 0), 0)
                          const totalCosts = scenario.costCategories.reduce((sum, cost) => sum + (cost.values[year] || 0), 0)
                          const profit = totalRevenue - totalCosts
                          const margin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0

                          return (
                            <td key={year} className="p-2 border border-gray-300 text-right">
                              {margin}%
                            </td>
                          )
                        })}
                      </tr>
                    </tbody>
                  </table>

                  {/* Financial Trend Chart */}
                  <div className="mt-6 p-4 bg-gray-50 rounded">
                    <h4 className="font-semibold text-gray-900 mb-3">Andamento Finanziario nel Tempo</h4>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart
                        data={financial.projectionYears.map((year) => {
                          const totalRevenue = scenario.revenueCategories.reduce((sum, rev) => sum + (rev.values[year] || 0), 0)
                          const totalCosts = scenario.costCategories.reduce((sum, cost) => sum + (cost.values[year] || 0), 0)
                          const profit = totalRevenue - totalCosts
                          return {
                            year,
                            Ricavi: totalRevenue,
                            Costi: totalCosts,
                            Profitto: profit
                          }
                        })}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Line type="monotone" dataKey="Ricavi" stroke="#10b981" strokeWidth={2} />
                        <Line type="monotone" dataKey="Costi" stroke="#ef4444" strokeWidth={2} />
                        <Line type="monotone" dataKey="Profitto" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          ))}

          {financial.notes && (
            <div className="text-sm text-gray-600 italic">
              <strong>Note e Assunzioni:</strong> {financial.notes}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Revenue Projections Preview
  const renderRevenueProjections = () => {
    if (!data.revenueProjectionsData) return renderSection('Proiezioni Ricavi', data.revenueProjections)

    const revenue = data.revenueProjectionsData

    // Calculate totals
    const totals: { [year: string]: number } = {}
    revenue.projectionYears.forEach(year => {
      totals[year] = revenue.streams.reduce((sum, stream) => {
        return sum + ((stream.projectedUnits[year] || 0) * stream.pricing)
      }, 0)
    })

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
          Proiezioni dei Ricavi
        </h2>

        <div className="space-y-6">
          {revenue.streams && revenue.streams.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Dettaglio Flussi di Ricavo per Anno</h3>
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border border-gray-300 text-left">Flusso di Ricavo</th>
                    <th className="p-2 border border-gray-300 text-left">Descrizione</th>
                    <th className="p-2 border border-gray-300 text-right">Prezzo Unitario</th>
                    {revenue.projectionYears.map((year) => (
                      <th key={year} className="p-2 border border-gray-300 text-right" colSpan={2}>{year}</th>
                    ))}
                  </tr>
                  <tr className="bg-gray-50 text-xs">
                    <th className="p-1 border border-gray-300"></th>
                    <th className="p-1 border border-gray-300"></th>
                    <th className="p-1 border border-gray-300"></th>
                    {revenue.projectionYears.map((year) => (
                      <React.Fragment key={`${year}-headers`}>
                        <th className="p-1 border border-gray-300 text-right">Unità</th>
                        <th className="p-1 border border-gray-300 text-right">Ricavo</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {revenue.streams.map((stream) => (
                    <tr key={stream.id} className="border-b border-gray-300">
                      <td className="p-2 border border-gray-300 font-medium">{stream.name}</td>
                      <td className="p-2 border border-gray-300 text-sm">{stream.description}</td>
                      <td className="p-2 border border-gray-300 text-right font-semibold">{formatCurrency(stream.pricing)}</td>
                      {revenue.projectionYears.map((year) => (
                        <React.Fragment key={`${stream.id}-${year}`}>
                          <td className="p-2 border border-gray-300 text-right">
                            {stream.projectedUnits[year] || 0}
                          </td>
                          <td className="p-2 border border-gray-300 text-right font-semibold">
                            {formatCurrency((stream.projectedUnits[year] || 0) * stream.pricing)}
                          </td>
                        </React.Fragment>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan={3} className="p-2 border border-gray-300 text-right">Totale Ricavi</td>
                    {revenue.projectionYears.map((year) => (
                      <td key={year} colSpan={2} className="p-2 border border-gray-300 text-right text-green-700 text-base">
                        {formatCurrency(totals[year])}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>

              {/* Revenue Projection Chart */}
              <div className="mt-6 p-4 bg-gray-50 rounded">
                <h4 className="font-semibold text-gray-900 mb-3">Andamento Ricavi Totali per Anno</h4>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={revenue.projectionYears.map((year) => ({
                      year,
                      Ricavi: totals[year]
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="Ricavi" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue by Stream Chart */}
              {revenue.streams.length > 1 && (
                <div className="mt-6 p-4 bg-gray-50 rounded">
                  <h4 className="font-semibold text-gray-900 mb-3">Ricavi per Flusso nel Tempo</h4>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={revenue.projectionYears.map((year) => {
                        const yearData: any = { year }
                        revenue.streams.forEach(stream => {
                          yearData[stream.name] = (stream.projectedUnits[year] || 0) * stream.pricing
                        })
                        return yearData
                      })}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      {revenue.streams.map((stream, idx) => (
                        <Bar
                          key={stream.id}
                          dataKey={stream.name}
                          stackId="a"
                          fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][idx % 6]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {revenue.scenarios && revenue.scenarios.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Analisi per Scenari</h3>
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border border-gray-300 text-left">Scenario</th>
                    <th className="p-2 border border-gray-300 text-center">Moltiplicatore</th>
                    {revenue.projectionYears.map((year) => (
                      <th key={year} className="p-2 border border-gray-300 text-right">{year}</th>
                    ))}
                    <th className="p-2 border border-gray-300 text-right">Media Annua</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-blue-50 font-semibold">
                    <td className="p-2 border border-gray-300">Scenario Base</td>
                    <td className="p-2 border border-gray-300 text-center">1.0x</td>
                    {revenue.projectionYears.map((year) => (
                      <td key={year} className="p-2 border border-gray-300 text-right">
                        {formatCurrency(totals[year])}
                      </td>
                    ))}
                    <td className="p-2 border border-gray-300 text-right">
                      {formatCurrency(Object.values(totals).reduce((a, b) => a + b, 0) / revenue.projectionYears.length)}
                    </td>
                  </tr>
                  {revenue.scenarios.map((scenario) => (
                    <tr key={scenario.id} className="border-b border-gray-300">
                      <td className="p-2 border border-gray-300 font-medium">{scenario.name}</td>
                      <td className="p-2 border border-gray-300 text-center">{scenario.multiplier}x</td>
                      {revenue.projectionYears.map((year) => (
                        <td key={year} className="p-2 border border-gray-300 text-right">
                          {formatCurrency(totals[year] * scenario.multiplier)}
                        </td>
                      ))}
                      <td className="p-2 border border-gray-300 text-right">
                        {formatCurrency((Object.values(totals).reduce((a, b) => a + b, 0) / revenue.projectionYears.length) * scenario.multiplier)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {revenue.notes && (
            <div className="text-sm text-gray-600 italic">
              <strong>Note e Assunzioni:</strong> {revenue.notes}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Questionnaire Preview
  const renderQuestionnaire = (questionnaireData: QuestionnaireData, title: string = 'Questionario Strategico') => {
    if (!questionnaireData || !questionnaireData.items || questionnaireData.items.length === 0) {
      return null
    }

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
      problem: '#ef4444',
      market: '#3b82f6',
      competition: '#a855f7',
      team: '#22c55e',
      financial: '#eab308',
      scalability: '#6366f1',
      risks: '#f97316',
      metrics: '#14b8a6'
    }

    // Group questions by category
    const questionsByCategory: Record<string, typeof questionnaireData.items> = {}
    questionnaireData.items.forEach(item => {
      if (!questionsByCategory[item.category]) {
        questionsByCategory[item.category] = []
      }
      questionsByCategory[item.category].push(item)
    })

    // Calculate statistics
    const totalQuestions = questionnaireData.items.length
    const answeredQuestions = questionnaireData.items.filter(item => item.answer.trim() !== '').length
    const completionPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
          {title}
        </h2>

        {/* Completion Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-900 font-medium">
                Completamento Questionario: {answeredQuestions}/{totalQuestions} domande risposte
              </p>
              <div className="mt-2 w-full bg-blue-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600 ml-4">
              {completionPercentage}%
            </div>
          </div>
        </div>

        {/* Questions by Category */}
        <div className="space-y-6">
          {Object.entries(questionsByCategory).map(([category, items]) => (
            <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
              <div
                className="px-4 py-3 font-semibold text-white"
                style={{ backgroundColor: CATEGORY_COLORS[category] || '#6b7280' }}
              >
                {CATEGORY_LABELS[category] || category}
              </div>
              <div className="p-4 bg-white">
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-7 h-7 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-2">
                            {item.question}
                            {item.priority && (
                              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                                item.priority === 'high' ? 'bg-red-100 text-red-700' :
                                item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {item.priority === 'high' ? 'Alta' :
                                 item.priority === 'medium' ? 'Media' : 'Bassa'}
                              </span>
                            )}
                          </p>
                          {item.answer.trim() !== '' ? (
                            <div className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded">
                              {item.answer}
                            </div>
                          ) : (
                            <div className="text-gray-400 text-sm italic">
                              Risposta non fornita
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Notes */}
        {questionnaireData.notes && questionnaireData.notes.trim() !== '' && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Note Aggiuntive</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{questionnaireData.notes}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Preview Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
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
      <div className="p-8">
        {renderExecutiveSummary()}
        {renderIdea()}
        {renderBusinessModel()}
        {renderMarketAnalysis()}
        {renderTeam()}
        {renderRoadmap()}
        {renderFinancialPlan()}
        {renderRevenueProjections()}

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

          // Special handling for Questionnaire sections
          if (section.type === 'questionnaire' && section.data) {
            return (
              <div key={section.id}>
                {renderQuestionnaire(section.data as QuestionnaireData, section.title)}
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
        <div className="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-500">
          <p className="font-semibold">Documento riservato e confidenziale</p>
          <p className="mt-1">Copyright {new Date().getFullYear()} TaxFlow - Tutti i diritti riservati</p>
        </div>
      </div>
    </div>
  )
}
