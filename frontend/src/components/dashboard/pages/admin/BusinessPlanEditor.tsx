import { useState, useEffect } from 'react'
import {
  Sparkles, FileText, Edit3, Save, Eye, Download, Clock,
  Plus, Loader2, RotateCcw, ChevronDown, ChevronUp, Trash2
} from 'lucide-react'
import { useToast } from '../../../../context/ToastContext'
import BusinessPlanSection from './BusinessPlanSection'
import BusinessPlanPreview from './BusinessPlanPreview'
import AIQuestionnaireForm, { AIQuestionnaireData } from './AIQuestionnaireForm'
import Modulo662Form, { Modulo662Data } from './Modulo662Form'
import TeamSectionEditor from './TeamSectionEditor'
import FinancialPlanEditor from './FinancialPlanEditor'
import MarketAnalysisEditor from './MarketAnalysisEditor'
import SWOTEditor from './SWOTEditor'
import BusinessModelCanvasEditor from './BusinessModelCanvasEditor'
import ExecutiveSummaryEditor from './ExecutiveSummaryEditor'
import IdeaEditor from './IdeaEditor'
import BusinessModelEditor from './BusinessModelEditor'
import RoadmapEditor from './RoadmapEditor'
import RevenueProjectionsEditor from './RevenueProjectionsEditor'
import QuestionnaireEditor from './QuestionnaireEditor'
import Modal from '../../../common/Modal'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import api from '../../../../services/api'
// logoImage import removed - not needed anymore since we use BusinessPlanPreview component
import {
  TeamSectionData,
  FinancialPlanData,
  MarketAnalysisData,
  SWOTData,
  BusinessModelCanvasData,
  ExecutiveSummaryData,
  IdeaData,
  BusinessModelData,
  RoadmapData,
  RevenueProjectionsData,
  QuestionnaireData,
  BusinessPlanSectionType,
  BusinessPlanSectionData
} from '../../../../types/businessPlan'

interface PurchasedService {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
    phone?: string
  }
  serviceType: string
  status: 'pending' | 'in_progress' | 'completed'
  amountPaid: number
  purchasedAt: string
}

interface CustomSection {
  id: string
  title: string
  content: string
  type?: BusinessPlanSectionType
  data?: BusinessPlanSectionData | Modulo662Data
}

interface LocalBusinessPlanData {
  executiveSummary: string // Legacy: kept for backward compatibility
  executiveSummaryData?: ExecutiveSummaryData // New: structured executive summary data
  idea: string // Legacy: kept for backward compatibility
  ideaData?: IdeaData // New: structured idea data
  businessModel: string // Legacy: kept for backward compatibility
  businessModelData?: BusinessModelData // New: structured business model data
  marketAnalysis: string // Legacy: kept for backward compatibility
  marketAnalysisData?: MarketAnalysisData // New: structured market analysis data
  team: string // Legacy: kept for backward compatibility
  teamData?: TeamSectionData // New: structured team data
  roadmap: string // Legacy: kept for backward compatibility
  roadmapData?: RoadmapData // New: structured roadmap data
  financialPlan: string // Legacy: kept for backward compatibility
  financialPlanData?: FinancialPlanData // New: structured financial plan data
  revenueProjections: string // Legacy: kept for backward compatibility
  revenueProjectionsData?: RevenueProjectionsData // New: structured revenue projections data
  customSections: CustomSection[]
}

interface BusinessPlanEditorProps {
  service: PurchasedService
  initialData?: Partial<LocalBusinessPlanData> & { creationMode?: 'ai' | 'template' | 'scratch' }
  onSave: (data: LocalBusinessPlanData & { creationMode?: 'ai' | 'template' | 'scratch' }) => void
  onComplete: (data: LocalBusinessPlanData & { creationMode?: 'ai' | 'template' | 'scratch' }) => void
  onSuspend: () => void
  isUpdating: boolean
}

type CreationMode = 'ai' | 'template' | 'scratch'
type ViewMode = 'edit' | 'preview'

const SECTION_TEMPLATES = {
  executiveSummary: {
    title: 'Executive Summary',
    description: 'Sintesi esecutiva del business plan',
    placeholder: 'Riassunto generale del progetto, obiettivi principali e punti di forza...',
    template: `<p><strong>[Nome Azienda]</strong> è un'azienda innovativa che opera nel settore <strong>[settore]</strong>.</p>
<p>Il nostro obiettivo principale è <strong>[obiettivo principale]</strong> attraverso <strong>[strategia chiave]</strong>.</p>
<h3>Punti di Forza</h3>
<ul>
<li>Proposta di valore unica e differenziante</li>
<li>Team esperto e competente con track record comprovato</li>
<li>Modello di business scalabile e sostenibile</li>
<li>Opportunità di mercato significativa in crescita</li>
</ul>
<p>Proiezioni finanziarie: si prevede di raggiungere il break-even entro <strong>[X mesi]</strong> e una crescita del fatturato del <strong>[Y%]</strong> nei primi tre anni.</p>`
  },
  idea: {
    title: "L'Idea",
    description: 'Descrizione dettagliata dell\'idea di business',
    placeholder: 'Descrivi l\'idea imprenditoriale, il problema che risolve e la proposta di valore...',
    template: `<h3>Il Problema</h3>
<p>Il mercato attuale presenta diverse criticità che richiedono una soluzione innovativa: <strong>[descrivere il problema principale]</strong>.</p>
<p>I clienti target affrontano quotidianamente sfide legate a <strong>[specificare pain point]</strong>, con conseguente perdita di tempo, risorse ed efficienza.</p>

<h3>La Soluzione</h3>
<p><strong>[Nome Azienda]</strong> offre una soluzione innovativa che risolve questi problemi attraverso <strong>[descrivere l'approccio]</strong>.</p>
<p>La nostra piattaforma/prodotto/servizio permette ai clienti di <strong>[beneficio principale]</strong>, migliorando significativamente <strong>[metriche chiave]</strong>.</p>

<h3>Proposta di Valore Unica</h3>
<p>Ci differenziamo dalla concorrenza grazie a:</p>
<ul>
<li>Innovazione tecnologica e approccio data-driven</li>
<li>Qualità superiore del servizio e attenzione al cliente</li>
<li>Focus sull'esperienza utente e semplicità d'uso</li>
<li>Modello di pricing trasparente e competitivo</li>
</ul>

<h3>Vision</h3>
<p>La nostra visione è diventare il punto di riferimento nel settore <strong>[settore]</strong>, espandendoci a livello nazionale nei prossimi 5 anni e costruendo un ecosistema di valore per clienti e partner.</p>`
  },
  businessModel: {
    title: 'Business Model',
    description: 'Come l\'azienda genera valore e ricavi',
    placeholder: 'Descrivi il modello di business, flussi di ricavi, struttura dei costi...',
    template: `<h3>Flussi di Ricavi</h3>
<p>L'azienda genera ricavi attraverso diversi canali complementari:</p>
<ul>
<li>Vendita diretta di prodotti/servizi con margini del <strong>[X%]</strong></li>
<li>Modello a sottoscrizione con ricavi ricorrenti mensili/annuali</li>
<li>Servizi premium e personalizzati per clienti enterprise</li>
<li>Partnership strategiche e modelli di revenue sharing</li>
</ul>

<h3>Segmenti di Clientela</h3>
<p><strong>Target Principale:</strong> <strong>[descrivere il target primario]</strong> - aziende/professionisti nel settore <strong>[settore]</strong> con dimensioni <strong>[small/medium/large]</strong>.</p>
<p><strong>Target Secondario:</strong> <strong>[descrivere target secondario]</strong> con esigenze specifiche di <strong>[bisogno]</strong>.</p>

<h3>Canali di Distribuzione</h3>
<ul>
<li>Vendita diretta online attraverso piattaforma proprietaria</li>
<li>Partnership strategiche con distributori e rivenditori</li>
<li>Canali di marketing digitale (SEO, SEM, Social Media)</li>
<li>Rete di consulenti e ambassador sul territorio</li>
</ul>

<h3>Struttura dei Costi</h3>
<p><strong>Costi Fissi:</strong> personale, affitto uffici, infrastruttura tecnologica, marketing di brand</p>
<p><strong>Costi Variabili:</strong> produzione, acquisizione clienti, commissioni vendita, supporto clienti</p>`
  },
  marketAnalysis: {
    title: 'Analisi di Mercato e Concorrenza',
    description: 'Analisi del mercato target e panorama competitivo',
    placeholder: 'Analizza il mercato di riferimento, dimensioni, trend e concorrenza...',
    template: `<h3>Dimensione del Mercato</h3>
<ul>
<li><strong>TAM (Total Addressable Market):</strong> €<strong>[X]</strong> milioni - mercato totale potenziale</li>
<li><strong>SAM (Serviceable Addressable Market):</strong> €<strong>[Y]</strong> milioni - mercato raggiungibile</li>
<li><strong>SOM (Serviceable Obtainable Market):</strong> €<strong>[Z]</strong> milioni - quota obiettivo a 3 anni</li>
</ul>

<h3>Trend di Mercato</h3>
<p>Il mercato sta crescendo a un tasso annuo del <strong>[X%]</strong> (CAGR) grazie a diversi fattori trainanti:</p>
<ul>
<li>Digitalizzazione crescente e trasformazione digitale delle imprese</li>
<li>Cambiamento delle abitudini dei consumatori verso soluzioni online</li>
<li>Innovazione tecnologica e accessibilità di nuove tecnologie</li>
<li>Normative favorevoli e incentivi governativi</li>
</ul>

<h3>Analisi Competitiva</h3>
<p><strong>Concorrenti Principali:</strong></p>
<ul>
<li><strong>[Concorrente A]:</strong> leader di mercato ma con servizio costoso e complesso</li>
<li><strong>[Concorrente B]:</strong> soluzione economica ma limitata in funzionalità</li>
<li><strong>[Concorrente C]:</strong> focus su segmento diverso con overlap parziale</li>
</ul>

<p><strong>Vantaggi Competitivi:</strong></p>
<ul>
<li>Innovazione di prodotto e tecnologia proprietaria</li>
<li>Qualità superiore e attenzione al dettaglio</li>
<li>Servizio clienti eccellente e supporto dedicato</li>
<li>Prezzi competitivi con ottimo rapporto qualità-prezzo</li>
</ul>

<h3>Barriere all'Ingresso</h3>
<p>Il mercato presenta moderate barriere all'ingresso: know-how tecnico specializzato, investimenti iniziali in tecnologia e marketing, network di partnership strategiche consolidate.</p>`
  },
  team: {
    title: 'Il Team',
    description: 'Presentazione del team e competenze chiave',
    placeholder: 'Descrivi il team, ruoli, competenze e esperienze...',
    template: `<h3>Founder e Leadership</h3>
<p><strong>[Nome Founder/CEO]</strong> - CEO e Co-fondatore</p>
<p>Esperienza pluriennale nel settore <strong>[settore]</strong>, con competenze specifiche in <strong>[area di expertise]</strong>. Track record di successi in <strong>[achievement precedenti]</strong>.</p>

<h3>Team Operativo</h3>
<ul>
<li><strong>Responsabile Tecnico/CTO:</strong> <strong>[Nome]</strong> - Esperienza in sviluppo software e innovazione tecnologica, con background in <strong>[tecnologie]</strong></li>
<li><strong>Responsabile Commerciale/CSO:</strong> <strong>[Nome]</strong> - Background in vendite enterprise e marketing strategico, con network consolidato nel settore</li>
<li><strong>Responsabile Operativo/COO:</strong> <strong>[Nome]</strong> - Expertise in gestione processi e operations, ottimizzazione efficienza operativa</li>
</ul>

<h3>Advisory Board</h3>
<p>Il team è supportato da un advisory board di esperti del settore, tra cui <strong>[nomi o ruoli advisor]</strong>, che forniscono consulenza strategica e accesso a network di valore.</p>

<h3>Competenze Chiave del Team</h3>
<ul>
<li>Expertise tecnica e capacità di innovazione continua</li>
<li>Visione strategica e capacità di execution</li>
<li>Network industriale e relazioni consolidate</li>
<li>Esperienza nella gestione di progetti complessi e scaling</li>
</ul>`
  },
  roadmap: {
    title: 'Roadmap e Go-to-Market',
    description: 'Piano di sviluppo e strategia di lancio',
    placeholder: 'Definisci le milestone e la strategia di go-to-market...',
    template: `<h3>Milestone Principali</h3>

<p><strong>Q1-Q2 ${new Date().getFullYear()}</strong></p>
<ul>
<li>Finalizzazione MVP (Minimum Viable Product) e testing con beta users</li>
<li>Lancio ufficiale della piattaforma/prodotto sul mercato</li>
<li>Prime acquisizioni di clienti paganti e raccolta feedback</li>
<li>Setup team operativo e processi scalabili</li>
</ul>

<p><strong>Q3-Q4 ${new Date().getFullYear()}</strong></p>
<ul>
<li>Ottimizzazione prodotto basata su feedback clienti</li>
<li>Espansione commerciale e scaling campagne marketing</li>
<li>Raggiungimento obiettivo di <strong>[X]</strong> clienti attivi</li>
<li>Break-even operativo e sostenibilità finanziaria</li>
</ul>

<p><strong>${new Date().getFullYear() + 1}</strong></p>
<ul>
<li>Consolidamento posizione di mercato nel segmento target</li>
<li>Espansione geografica in nuove regioni/mercati</li>
<li>Ampliamento gamma prodotti/servizi con nuove features</li>
<li>Possibile round di investimento Serie A per accelerazione crescita</li>
</ul>

<h3>Strategia Go-to-Market</h3>
<ul>
<li><strong>Fase 1 (Mesi 1-3):</strong> Lancio soft con early adopters, focus su qualità e feedback, marketing organico e PR</li>
<li><strong>Fase 2 (Mesi 4-6):</strong> Espansione graduale con campagne paid, partnership strategiche, ottimizzazione conversion funnel</li>
<li><strong>Fase 3 (Mesi 7-12):</strong> Scale-up commerciale, automazione processi, espansione team sales, penetrazione mercato</li>
</ul>`
  },
  financialPlan: {
    title: 'Piano Economico-Finanziario',
    description: 'Proiezioni finanziarie e budget',
    placeholder: 'Dettagli su investimenti, costi, ricavi previsti...',
    template: `<h3>Investimento Iniziale Richiesto</h3>
<ul>
<li>Setup iniziale e sviluppo prodotto: €<strong>[importo]</strong></li>
<li>Marketing e comunicazione lancio: €<strong>[importo]</strong></li>
<li>Tecnologia e infrastruttura: €<strong>[importo]</strong></li>
<li>Working capital e riserva operativa: €<strong>[importo]</strong></li>
<li><strong>Totale Investimento:</strong> €<strong>[totale]</strong></li>
</ul>

<h3>Costi Operativi Mensili (a regime)</h3>
<ul>
<li>Personale (salari + contributi): €<strong>[importo]</strong></li>
<li>Marketing e acquisizione clienti: €<strong>[importo]</strong></li>
<li>Infrastruttura tecnologica (hosting, software, tools): €<strong>[importo]</strong></li>
<li>Generale e amministrativo (affitto, utilities, servizi): €<strong>[importo]</strong></li>
<li><strong>Totale Costi Mensili:</strong> €<strong>[totale]</strong></li>
</ul>

<h3>Break-even Point</h3>
<p>Previsto il raggiungimento del break-even operativo entro <strong>[12-18]</strong> mesi dall'avvio, con <strong>[X]</strong> clienti attivi e un fatturato mensile di €<strong>[Y]</strong>.</p>

<h3>ROI Previsto per Investitori</h3>
<p>ROI positivo a partire dal secondo anno di attività, con margini in crescita progressiva. Proiezione di exit multiplo di <strong>[X]</strong>x in <strong>[Y]</strong> anni attraverso acquisizione strategica o IPO.</p>`
  },
  revenueProjections: {
    title: 'Proiezioni Ricavi',
    description: 'Proiezioni di fatturato e crescita',
    placeholder: 'Proiezioni dei ricavi per i prossimi anni...',
    template: `<h3>Proiezioni Finanziarie a 3 Anni</h3>

<p><strong>Anno 1 (${new Date().getFullYear()})</strong></p>
<ul>
<li>Ricavi totali: €<strong>[importo]</strong></li>
<li>Numero clienti attivi: <strong>[numero]</strong></li>
<li>MRR (Monthly Recurring Revenue): €<strong>[importo]</strong></li>
<li>Crescita mensile media: <strong>[X%]</strong></li>
</ul>

<p><strong>Anno 2 (${new Date().getFullYear() + 1})</strong></p>
<ul>
<li>Ricavi totali: €<strong>[importo]</strong> (+<strong>[%]</strong> vs Anno 1)</li>
<li>Numero clienti attivi: <strong>[numero]</strong></li>
<li>Espansione mercato e nuovi segmenti</li>
<li>Miglioramento margini operativi del <strong>[X%]</strong></li>
</ul>

<p><strong>Anno 3 (${new Date().getFullYear() + 2})</strong></p>
<ul>
<li>Ricavi totali: €<strong>[importo]</strong> (+<strong>[%]</strong> vs Anno 2)</li>
<li>Numero clienti attivi: <strong>[numero]</strong></li>
<li>Consolidamento leadership di mercato</li>
<li>EBITDA positivo con margine del <strong>[X%]</strong></li>
</ul>

<h3>Assunzioni e Metriche Chiave</h3>
<p>Le proiezioni si basano su assunzioni conservative derivate da:</p>
<ul>
<li>Tasso di conversione medio del <strong>[X%]</strong> da prospect a cliente</li>
<li>CAC (Customer Acquisition Cost) medio di €<strong>[Y]</strong></li>
<li>LTV (Lifetime Value) stimato di €<strong>[Z]</strong> per cliente</li>
<li>Churn rate mensile contenuto al <strong>[W%]</strong></li>
<li>Retention rate annuale del <strong>[R%]</strong></li>
</ul>`
  }
}

export default function BusinessPlanEditor({
  service,
  initialData,
  onSave,
  onComplete,
  onSuspend,
  isUpdating
}: BusinessPlanEditorProps) {
  const { showToast } = useToast()

  // Check if there's a saved creation mode or existing content
  const savedMode = initialData?.creationMode
  const hasExistingContent = initialData?.executiveSummary || initialData?.idea || initialData?.businessModel

  const [creationMode, setCreationMode] = useState<CreationMode | null>(savedMode || (hasExistingContent ? 'scratch' : null))
  const [viewMode, setViewMode] = useState<ViewMode>('edit')
  const [isGenerating, setIsGenerating] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [showAIQuestionnaire, setShowAIQuestionnaire] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)

  // AI Suggestions state
  const [showSuggestionModal, setShowSuggestionModal] = useState(false)
  const [currentSuggestionSection, setCurrentSuggestionSection] = useState<string>('')
  const [suggestionText, setSuggestionText] = useState('')
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false)

  // Manual save status
  const [manualSaveStatus, setManualSaveStatus] = useState<'idle' | 'saved'>('idle')

  // PDF export status
  const [pdfExportStatus, setPdfExportStatus] = useState<'idle' | 'exporting' | 'exported'>('idle')

  // Track if the component has been initialized to prevent auto-save on mount
  const [isInitialized, setIsInitialized] = useState(false)
  const [formData, setFormData] = useState<LocalBusinessPlanData>({
    executiveSummary: initialData?.executiveSummary || '',
    executiveSummaryData: initialData?.executiveSummaryData || {
      companyName: '',
      sector: '',
      mainObjective: '',
      keyStrategy: '',
      strengthPoints: [],
      financialProjections: {}
    },
    idea: initialData?.idea || '',
    ideaData: initialData?.ideaData || {
      problem: '',
      solution: '',
      valueProposition: [],
      vision: ''
    },
    businessModel: initialData?.businessModel || '',
    businessModelData: initialData?.businessModelData || {
      revenueStreams: [],
      customerSegments: [],
      distributionChannels: [],
      costStructure: { fixedCosts: [], variableCosts: [] }
    },
    marketAnalysis: initialData?.marketAnalysis || '',
    marketAnalysisData: initialData?.marketAnalysisData || {
      competitors: [],
      segments: []
    },
    team: initialData?.team || '',
    teamData: initialData?.teamData || {
      members: [],
      orgChartType: 'hierarchical',
      description: ''
    },
    roadmap: initialData?.roadmap || '',
    roadmapData: initialData?.roadmapData || {
      milestones: [],
      phases: [],
      visualizationType: 'timeline'
    },
    financialPlan: initialData?.financialPlan || '',
    financialPlanData: initialData?.financialPlanData || {
      projectionYears: [],
      scenarios: [],
      currency: 'EUR',
      notes: ''
    },
    revenueProjections: initialData?.revenueProjections || '',
    revenueProjectionsData: initialData?.revenueProjectionsData || {
      streams: [],
      projectionYears: [],
      scenarios: []
    },
    customSections: initialData?.customSections || []
  })

  // Sync formData when initialData changes (but not on initial mount)
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true)
      return
    }

    // Only update if initialData has actual content
    if (initialData) {
      setFormData({
        executiveSummary: initialData.executiveSummary || '',
        executiveSummaryData: initialData.executiveSummaryData || formData.executiveSummaryData,
        idea: initialData.idea || '',
        ideaData: initialData.ideaData || formData.ideaData,
        businessModel: initialData.businessModel || '',
        businessModelData: initialData.businessModelData || formData.businessModelData,
        marketAnalysis: initialData.marketAnalysis || '',
        marketAnalysisData: initialData.marketAnalysisData || formData.marketAnalysisData,
        team: initialData.team || '',
        teamData: initialData.teamData || formData.teamData,
        roadmap: initialData.roadmap || '',
        roadmapData: initialData.roadmapData || formData.roadmapData,
        financialPlan: initialData.financialPlan || '',
        financialPlanData: initialData.financialPlanData || formData.financialPlanData,
        revenueProjections: initialData.revenueProjections || '',
        revenueProjectionsData: initialData.revenueProjectionsData || formData.revenueProjectionsData,
        customSections: initialData.customSections || []
      })
    }
  }, [initialData])

  // Auto-save effect
  useEffect(() => {
    // Don't auto-save until component is initialized
    if (!isInitialized) return

    // Check if there's any meaningful content to save
    const hasLegacyContent = formData.executiveSummary || formData.idea ||
                            formData.businessModel || formData.marketAnalysis ||
                            formData.team || formData.roadmap ||
                            formData.financialPlan || formData.revenueProjections

    const hasStructuredData = formData.executiveSummaryData?.companyName ||
                             formData.ideaData?.problem ||
                             formData.businessModelData?.revenueStreams?.length ||
                             formData.marketAnalysisData?.competitors?.length ||
                             formData.teamData?.members?.length ||
                             formData.roadmapData?.milestones?.length ||
                             formData.financialPlanData?.scenarios?.length ||
                             formData.revenueProjectionsData?.streams?.length

    const hasCustomSections = formData.customSections?.length > 0

    // Only auto-save if there's actual content
    if (!hasLegacyContent && !hasStructuredData && !hasCustomSections) return

    setAutoSaveStatus('unsaved')
    const timer = setTimeout(() => {
      handleAutoSave()
    }, 3000) // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(timer)
  }, [formData, creationMode])

  const handleAutoSave = async () => {
    setAutoSaveStatus('saving')
    try {
      // Include creationMode in auto-save to prevent it from being overwritten
      await onSave({ ...formData, creationMode: creationMode || undefined })
      setAutoSaveStatus('saved')
    } catch (error) {
      console.error('Auto-save failed:', error)
      setAutoSaveStatus('unsaved')
    }
  }

  const saveModeToDatabase = async (mode: CreationMode) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/business-plan/save-mode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId: service._id,
          mode: mode
        })
      })

      if (!response.ok) {
        throw new Error('Errore nel salvataggio della modalità')
      }

      console.log('Modalità salvata nel database:', mode)
    } catch (error) {
      console.error('Error saving mode:', error)
      // Non blocchiamo l'utente se il salvataggio fallisce
    }
  }

  const handleModeSelection = async (mode: CreationMode) => {
    setCreationMode(mode)

    // Save mode to database
    await saveModeToDatabase(mode)

    if (mode === 'template') {
      await applyTemplate()
    } else if (mode === 'ai') {
      // Show questionnaire instead of generating immediately
      setShowAIQuestionnaire(true)
    }
    // 'scratch' mode starts with empty fields
  }

  const applyTemplate = async () => {
    const currentYear = new Date().getFullYear()

    const templateData: LocalBusinessPlanData = {
      executiveSummary: SECTION_TEMPLATES.executiveSummary.template,
      executiveSummaryData: {
        companyName: service.userId.name,
        sector: 'Tecnologia / Software',
        mainObjective: 'Diventare il leader di mercato nella digitalizzazione delle PMI italiane',
        keyStrategy: 'Offrire una piattaforma SaaS innovativa con pricing competitivo e supporto personalizzato',
        strengthPoints: [
          'Proposta di valore unica e differenziante',
          'Team esperto con track record comprovato',
          'Modello di business scalabile e sostenibile',
          'Opportunità di mercato in forte crescita'
        ],
        financialProjections: {
          breakEvenMonths: 18,
          revenueGrowthPercent: 150,
          yearlyProjections: `Anno 1: €250k, Anno 2: €625k, Anno 3: €1.5M`
        }
      },
      idea: SECTION_TEMPLATES.idea.template,
      ideaData: {
        problem: 'Le PMI italiane affrontano difficoltà nella gestione digitale dei processi aziendali, con software complessi, costosi e poco intuitivi che richiedono formazione specializzata.',
        solution: 'Una piattaforma SaaS all-in-one che integra gestione clienti, fatturazione, contabilità e analytics in un\'unica interfaccia intuitiva, accessibile via web e mobile.',
        valueProposition: [
          'Interfaccia intuitiva senza necessità di formazione',
          'Prezzo competitivo con piano gratuito',
          'Supporto clienti in italiano 7/7',
          'Integrazione con commercialisti e consulenti'
        ],
        vision: 'Diventare il punto di riferimento per la digitalizzazione delle PMI italiane, aiutando 100.000+ aziende a gestire il proprio business in modo efficiente entro 5 anni.'
      },
      businessModel: SECTION_TEMPLATES.businessModel.template,
      businessModelData: {
        revenueStreams: [
          {
            id: 'revenue_1',
            name: 'Abbonamento Base',
            description: 'Piano mensile per piccole imprese (1-5 utenti)',
            margin: 70
          },
          {
            id: 'revenue_2',
            name: 'Abbonamento Professional',
            description: 'Piano mensile per medie imprese (6-20 utenti)',
            margin: 75
          },
          {
            id: 'revenue_3',
            name: 'Servizi Premium',
            description: 'Consulenza e personalizzazioni su richiesta',
            margin: 60
          }
        ],
        customerSegments: [
          {
            id: 'segment_1',
            name: 'Piccole Imprese',
            description: 'Aziende con 1-10 dipendenti, fatturato fino a €500k/anno',
            type: 'primary'
          },
          {
            id: 'segment_2',
            name: 'Studi Professionali',
            description: 'Commercialisti, consulenti, avvocati con necessità di gestione clienti',
            type: 'secondary'
          }
        ],
        distributionChannels: [
          {
            id: 'channel_1',
            name: 'Vendita Diretta Online',
            description: 'Sito web con sistema di onboarding automatico'
          },
          {
            id: 'channel_2',
            name: 'Partnership con Commercialisti',
            description: 'Network di commercialisti che consigliano la soluzione ai clienti'
          },
          {
            id: 'channel_3',
            name: 'Digital Marketing',
            description: 'Google Ads, Facebook Ads, Content Marketing, SEO'
          }
        ],
        costStructure: {
          fixedCosts: [
            { name: 'Personale', description: 'Salari e contributi team' },
            { name: 'Ufficio', description: 'Affitto e utilities' },
            { name: 'Infrastruttura Cloud', description: 'Server, database, CDN' },
            { name: 'Software e Tools', description: 'Licenze software necessari per operare' }
          ],
          variableCosts: [
            { name: 'Marketing e Pubblicità', description: 'Campagne digital e acquisizione clienti' },
            { name: 'Customer Support', description: 'Costi per supporto clienti (scalabile)' },
            { name: 'Transazioni', description: 'Commissioni su pagamenti e gateway' }
          ]
        }
      },
      marketAnalysis: SECTION_TEMPLATES.marketAnalysis.template,
      marketAnalysisData: {
        competitors: [
          {
            id: 'comp_1',
            name: 'Competitor A',
            description: 'Leader di mercato con 15% market share',
            strengths: 'Brand consolidato, ampia gamma di funzionalità',
            weaknesses: 'Prezzo elevato, interfaccia complessa, scarso supporto',
            marketShare: 15
          },
          {
            id: 'comp_2',
            name: 'Competitor B',
            description: 'Soluzione economica con focus su piccole imprese',
            strengths: 'Prezzo competitivo, semplice da usare',
            weaknesses: 'Funzionalità limitate, no supporto avanzato',
            marketShare: 8
          }
        ],
        segments: [
          {
            id: 'seg_1',
            name: 'Piccole Imprese Italia',
            size: 500000000,
            growth: 5.5,
            description: 'Mercato italiano PMI con fatturato fino a €1M'
          },
          {
            id: 'seg_2',
            name: 'Professionisti e Consulenti',
            size: 200000000,
            growth: 7.2,
            description: 'Studi professionali e consulenti indipendenti'
          }
        ],
        totalMarketSize: 700000000,
        targetMarketSize: 150000000,
        marketGrowthRate: 6.2
      },
      team: SECTION_TEMPLATES.team.template,
      teamData: {
        members: [
          {
            id: 'member_1',
            name: service.userId.name,
            role: 'CEO & Founder',
            department: 'Management',
            description: 'Esperienza pluriennale nel settore tech e gestione aziendale'
          },
          {
            id: 'member_2',
            name: '[Nome CTO]',
            role: 'CTO',
            department: 'Tech',
            description: 'Sviluppo software e architettura cloud, 10+ anni esperienza',
            parentId: 'member_1'
          },
          {
            id: 'member_3',
            name: '[Nome CSO]',
            role: 'Chief Sales Officer',
            department: 'Sales',
            description: 'Vendite B2B e partnership strategiche',
            parentId: 'member_1'
          }
        ],
        orgChartType: 'hierarchical',
        description: 'Team compatto ed esperto con competenze complementari'
      },
      roadmap: SECTION_TEMPLATES.roadmap.template,
      roadmapData: {
        milestones: [
          {
            id: 'milestone_1',
            title: 'MVP e Beta Testing',
            description: 'Lancio Minimum Viable Product con 50 beta testers',
            startDate: `${currentYear}-01-01`,
            endDate: `${currentYear}-03-31`,
            status: 'completed',
            phase: 'Fase 1 - Development',
            deliverables: ['Piattaforma MVP', 'Feedback report', 'Bug fixes']
          },
          {
            id: 'milestone_2',
            title: 'Lancio Ufficiale',
            description: 'Lancio pubblico della piattaforma',
            startDate: `${currentYear}-04-01`,
            endDate: `${currentYear}-06-30`,
            status: 'in_progress',
            phase: 'Fase 2 - Launch',
            deliverables: ['Piattaforma v1.0', 'Campagna marketing', 'Documentazione']
          },
          {
            id: 'milestone_3',
            title: 'Scaling e Crescita',
            description: 'Obiettivo 500 clienti paganti',
            startDate: `${currentYear}-07-01`,
            endDate: `${currentYear}-12-31`,
            status: 'planned',
            phase: 'Fase 3 - Growth',
            deliverables: ['Nuove features', 'Team expansion', 'Partnership']
          }
        ],
        phases: [
          {
            id: 'phase_1',
            name: 'Development',
            color: '#3B82F6',
            startDate: `${currentYear}-01-01`,
            endDate: `${currentYear}-03-31`
          },
          {
            id: 'phase_2',
            name: 'Launch',
            color: '#22C55E',
            startDate: `${currentYear}-04-01`,
            endDate: `${currentYear}-06-30`
          },
          {
            id: 'phase_3',
            name: 'Growth',
            color: '#F59E0B',
            startDate: `${currentYear}-07-01`,
            endDate: `${currentYear}-12-31`
          }
        ],
        visualizationType: 'timeline'
      },
      financialPlan: SECTION_TEMPLATES.financialPlan.template,
      financialPlanData: {
        projectionYears: [`${currentYear}`, `${currentYear + 1}`, `${currentYear + 2}`],
        scenarios: [
          {
            id: 'scenario_conservativo',
            name: 'Conservativo',
            description: 'Scenario prudente con crescita moderata',
            costCategories: [
              {
                id: 'cost_1',
                name: 'Personale',
                values: {
                  [`${currentYear}`]: 80000,
                  [`${currentYear + 1}`]: 120000,
                  [`${currentYear + 2}`]: 180000
                },
                isRecurring: true
              },
              {
                id: 'cost_2',
                name: 'Marketing',
                values: {
                  [`${currentYear}`]: 30000,
                  [`${currentYear + 1}`]: 45000,
                  [`${currentYear + 2}`]: 60000
                },
                isRecurring: true
              }
            ],
            revenueCategories: [
              {
                id: 'rev_1',
                name: 'Abbonamenti',
                values: {
                  [`${currentYear}`]: 150000,
                  [`${currentYear + 1}`]: 350000,
                  [`${currentYear + 2}`]: 700000
                },
                isRecurring: true
              }
            ]
          }
        ],
        currency: 'EUR',
        notes: 'Proiezioni basate su tasso di conversione 3%, CAC €150, LTV €1200'
      },
      revenueProjections: SECTION_TEMPLATES.revenueProjections.template,
      revenueProjectionsData: {
        projectionYears: [`${currentYear}`, `${currentYear + 1}`, `${currentYear + 2}`],
        streams: [
          {
            id: 'stream_1',
            name: 'Abbonamento Base',
            description: 'Piano €49/mese',
            pricing: 49,
            projectedUnits: {
              [`${currentYear}`]: 150,
              [`${currentYear + 1}`]: 400,
              [`${currentYear + 2}`]: 800
            }
          },
          {
            id: 'stream_2',
            name: 'Abbonamento Professional',
            description: 'Piano €149/mese',
            pricing: 149,
            projectedUnits: {
              [`${currentYear}`]: 50,
              [`${currentYear + 1}`]: 150,
              [`${currentYear + 2}`]: 350
            }
          }
        ],
        scenarios: [
          {
            id: 'scenario_conservativo',
            name: 'Conservativo',
            multiplier: 0.7
          },
          {
            id: 'scenario_ottimistico',
            name: 'Ottimistico',
            multiplier: 1.3
          }
        ]
      },
      customSections: []
    }

    setFormData(templateData)
    setExpandedSections(Object.keys(SECTION_TEMPLATES))

    // Save template data to database
    try {
      await onSave({ ...templateData, creationMode: 'template' })
      showToast('Template applicato e salvato! Modifica i contenuti personalizzandoli.', 'success')
    } catch (error) {
      console.error('Error saving template:', error)
      showToast('Template applicato (salvataggio automatico potrebbe aver fallito)', 'warning')
    }
  }

  const generateWithAI = async (questionnaireData: AIQuestionnaireData) => {
    setIsGenerating(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/business-plan/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clientName: service.userId.name,
          clientEmail: service.userId.email,
          context: questionnaireData
        })
      })

      if (!response.ok) {
        throw new Error('Errore nella generazione AI')
      }

      const data = await response.json()
      const aiGeneratedData = data.businessPlan

      setFormData(aiGeneratedData)
      setExpandedSections(Object.keys(SECTION_TEMPLATES))
      setShowAIQuestionnaire(false)

      // Save AI-generated data to database
      try {
        await onSave({ ...aiGeneratedData, creationMode: 'ai' })
        showToast('Business Plan generato con AI e salvato! Rivedi e personalizza i contenuti.', 'success')
      } catch (saveError) {
        console.error('Error saving AI-generated data:', saveError)
        showToast('Business Plan generato (salvataggio automatico potrebbe aver fallito)', 'warning')
      }
    } catch (error) {
      console.error('AI generation error:', error)
      showToast('Errore nella generazione AI. Usa il template o inizia da zero.', 'error')
      setCreationMode('template')
      setShowAIQuestionnaire(false)
      await applyTemplate()
    } finally {
      setIsGenerating(false)
    }
  }

  const updateSection = (section: keyof Omit<LocalBusinessPlanData, 'customSections'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: value
    }))
  }

  const addCustomSection = (type?: BusinessPlanSectionType) => {
    let newSection: CustomSection

    switch (type) {
      case 'swot':
        newSection = {
          id: `custom_${Date.now()}`,
          title: 'Analisi SWOT',
          content: '',
          type: 'swot',
          data: {
            strengths: [],
            weaknesses: [],
            opportunities: [],
            threats: []
          } as SWOTData
        }
        break
      case 'business_model_canvas':
        newSection = {
          id: `custom_${Date.now()}`,
          title: 'Business Model Canvas',
          content: '',
          type: 'business_model_canvas',
          data: {
            keyPartners: '',
            keyActivities: '',
            keyResources: '',
            valuePropositions: '',
            customerRelationships: '',
            channels: '',
            customerSegments: '',
            costStructure: '',
            revenueStreams: ''
          } as BusinessModelCanvasData
        }
        break
      case 'questionnaire':
        newSection = {
          id: `custom_${Date.now()}`,
          title: 'Questionario Strategico',
          content: '',
          type: 'questionnaire',
          data: {
            items: [],
            notes: ''
          } as QuestionnaireData
        }
        break
      default:
        newSection = {
          id: `custom_${Date.now()}`,
          title: 'Nuova Sezione',
          content: ''
        }
    }

    setFormData(prev => ({
      ...prev,
      customSections: [...prev.customSections, newSection]
    }))
    setExpandedSections(prev => [...prev, newSection.id])
  }

  const updateCustomSection = (id: string, field: 'title' | 'content' | 'data', value: string | BusinessPlanSectionData | Modulo662Data) => {
    setFormData(prev => ({
      ...prev,
      customSections: prev.customSections.map(section =>
        section.id === id ? { ...section, [field]: value } : section
      )
    }))
  }

  const deleteCustomSection = (id: string) => {
    setFormData(prev => ({
      ...prev,
      customSections: prev.customSections.filter(section => section.id !== id)
    }))
    setExpandedSections(prev => prev.filter(sectionId => sectionId !== id))
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleExportPDF = async () => {
    try {
      setPdfExportStatus('exporting')
      showToast('Generazione PDF in corso...', 'info')

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm

      // Create temporary container
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      container.style.top = '0'
      container.style.width = '210mm'
      container.style.backgroundColor = 'white'
      document.body.appendChild(container)

      const { createRoot } = await import('react-dom/client')
      const root = createRoot(container)

      // Render the complete BusinessPlanPreview component
      await new Promise<void>((resolve) => {
        root.render(
          <BusinessPlanPreview
            data={formData}
            clientName={service.userId.name}
            clientEmail={service.userId.email}
            clientPhone={service.userId.phone}
          />
        )
        // Wait for rendering and any charts to load
        setTimeout(resolve, 2000)
      })

      // Capture the rendered preview
      const previewElement = container.firstChild as HTMLElement
      if (previewElement) {
        const canvas = await html2canvas(previewElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: previewElement.scrollWidth,
          windowHeight: previewElement.scrollHeight
        })

        const imgWidth = pageWidth
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        // Add image to PDF with pagination
        let heightLeft = imgHeight
        let position = 0

        while (heightLeft > 0) {
          if (position !== 0) {
            pdf.addPage()
          }

          const imgData = canvas.toDataURL('image/png')
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
          heightLeft -= pageHeight
          position = heightLeft - imgHeight
        }
      }

      // Cleanup
      root.unmount()
      document.body.removeChild(container)

      // Save PDF
      const fileName = `business-plan-${service.userId.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)

      setPdfExportStatus('exported')
      showToast('Business Plan esportato con successo!', 'success')

      // Torna a "Esporta PDF" dopo 5 secondi
      setTimeout(() => {
        setPdfExportStatus('idle')
      }, 5000)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      setPdfExportStatus('idle')
      showToast('Errore nell\'esportazione del PDF', 'error')
    }
  }

  const confirmReset = async () => {
    try {
      // Save reset to database (remove creationMode)
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/business-plan/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId: service._id
        })
      })

      if (!response.ok) {
        throw new Error('Errore nel reset del business plan')
      }

      // Reset all form data to empty
      const emptyData = {
        executiveSummary: '',
        executiveSummaryData: undefined,
        idea: '',
        ideaData: undefined,
        businessModel: '',
        businessModelData: undefined,
        marketAnalysis: '',
        marketAnalysisData: undefined,
        team: '',
        teamData: undefined,
        roadmap: '',
        roadmapData: undefined,
        financialPlan: '',
        financialPlanData: undefined,
        revenueProjections: '',
        revenueProjectionsData: undefined,
        customSections: [],
        creationMode: undefined  // This removes the creation mode from saved data
      }

      // Notify parent to reload data by calling onSave with empty data
      await onSave(emptyData)

      // Reset local state to show creation mode selection
      setCreationMode(null)  // This is the key - reset to null to show selection screen
      setFormData(emptyData)
      setShowResetModal(false)
      showToast('Puoi scegliere di nuovo la modalità di creazione', 'info')
    } catch (error) {
      console.error('Error resetting business plan:', error)
      showToast('Errore nel reset del business plan', 'error')
    }
  }

  const handleAISuggest = async (sectionKey: string) => {
    try {
      setCurrentSuggestionSection(sectionKey)
      setShowSuggestionModal(true)
      setIsLoadingSuggestion(true)
      setSuggestionText('')

      const currentContent = formData[sectionKey as keyof Omit<LocalBusinessPlanData, 'customSections'>] as string

      const response = await api.generateBusinessPlanSuggestion({
        section: sectionKey,
        currentContent: currentContent || '',
        context: {
          clientName: service.userId.name,
          clientEmail: service.userId.email
        }
      })

      if (response.success !== false && response.suggestion) {
        setSuggestionText(response.suggestion)
      } else {
        throw new Error('Nessun suggerimento ricevuto')
      }
    } catch (error) {
      console.error('Error getting AI suggestion:', error)
      showToast('Errore nel caricamento dei suggerimenti AI', 'error')
      setShowSuggestionModal(false)
    } finally {
      setIsLoadingSuggestion(false)
    }
  }

  const applySuggestion = () => {
    if (suggestionText && currentSuggestionSection) {
      // Chiudi la sezione corrente per forzare il re-render del RichTextEditor
      setExpandedSections(prev => prev.filter(id => id !== currentSuggestionSection))

      // Applica il suggerimento
      updateSection(currentSuggestionSection as keyof Omit<LocalBusinessPlanData, 'customSections'>, suggestionText)

      // Riapri la sezione dopo un breve delay
      setTimeout(() => {
        setExpandedSections(prev => [...prev, currentSuggestionSection])
      }, 100)

      setShowSuggestionModal(false)
      showToast('Suggerimento applicato con successo!', 'success')
    }
  }

  const isComplete = formData.executiveSummary && formData.idea && formData.marketAnalysis

  if (!creationMode) {
    return (
      <div className="space-y-6">
        {/* Client Info Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Business Plan per {service.userId.name}
            </h3>
            <p className="text-gray-600">{service.userId.email}</p>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Come vuoi creare il Business Plan?
          </h3>
          <p className="text-gray-600 text-center mb-8">
            Scegli la modalità che preferisci per iniziare
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AI Generation */}
            <button
              onClick={() => handleModeSelection('ai')}
              disabled={isGenerating}
              className="group p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-200 text-left disabled:opacity-50"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Generazione AI
              </h4>
              <p className="text-sm text-gray-600">
                L'AI crea automaticamente un business plan completo basato sui dati del cliente
              </p>
              <div className="mt-4 text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Inizia con AI →
              </div>
            </button>

            {/* Template */}
            <button
              onClick={() => handleModeSelection('template')}
              className="group p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:shadow-lg transition-all duration-200 text-left"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Usa Template
              </h4>
              <p className="text-sm text-gray-600">
                Parti da un template professionale pre-compilato e personalizzalo
              </p>
              <div className="mt-4 text-green-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Usa Template →
              </div>
            </button>

            {/* From Scratch */}
            <button
              onClick={() => handleModeSelection('scratch')}
              className="group p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all duration-200 text-left"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 group-hover:scale-110 transition-transform">
                <Edit3 className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Da Zero
              </h4>
              <p className="text-sm text-gray-600">
                Crea il business plan completamente da zero con massima libertà
              </p>
              <div className="mt-4 text-purple-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Inizia da zero →
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show AI Questionnaire
  if (showAIQuestionnaire) {
    return (
      <AIQuestionnaireForm
        clientName={service.userId.name}
        onSubmit={generateWithAI}
        onBack={() => {
          setShowAIQuestionnaire(false)
          setCreationMode(null)
        }}
        isGenerating={isGenerating}
      />
    )
  }

  if (isGenerating) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          <h3 className="text-xl font-semibold text-gray-900">
            Generazione Business Plan in corso...
          </h3>
          <p className="text-gray-600 text-center max-w-md">
            L'AI sta analizzando i dati del cliente e generando un business plan completo e professionale.
            Questo potrebbe richiedere alcuni secondi.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Business Plan - {service.userId.name}
            </h3>
            <div className="flex items-center space-x-3 mt-2">
              <span className="text-sm text-gray-600">
                Modalità: <span className="font-medium">
                  {creationMode === 'ai' ? 'AI Generata' : creationMode === 'template' ? 'Template' : 'Da Zero'}
                </span>
              </span>
              <span className="text-gray-300">|</span>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {autoSaveStatus === 'saved' && 'Salvato'}
                  {autoSaveStatus === 'saving' && 'Salvataggio...'}
                  {autoSaveStatus === 'unsaved' && 'Modifiche non salvate'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowResetModal(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-amber-300 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
              title="Ricomincia da capo e scegli una nuova modalità"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Ricomincia</span>
            </button>

            <button
              onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {viewMode === 'edit' ? (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Anteprima</span>
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4" />
                  <span>Modifica</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportPDF}
              disabled={pdfExportStatus === 'exporting'}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-all duration-200 ${
                pdfExportStatus === 'exported'
                  ? 'border-green-600 text-green-600 bg-green-50'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {pdfExportStatus === 'exporting' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>
                {pdfExportStatus === 'exporting' && 'Esportazione...'}
                {pdfExportStatus === 'exported' && 'Esportato'}
                {pdfExportStatus === 'idle' && 'Esporta PDF'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'preview' ? (
        <BusinessPlanPreview
          data={formData}
          clientName={service.userId.name}
          clientEmail={service.userId.email}
        />
      ) : (
        <>
          {/* Sections */}
          <div className="space-y-4">
            {Object.entries(SECTION_TEMPLATES).map(([key, template]) => {
              // Special handling for Executive Summary section - use structured editor
              if (key === 'executiveSummary') {
                return (
                  <ExecutiveSummaryEditor
                    key={key}
                    data={formData.executiveSummaryData || { companyName: '', sector: '', mainObjective: '', keyStrategy: '', strengthPoints: [], financialProjections: {} }}
                    onChange={(data) => setFormData(prev => ({ ...prev, executiveSummaryData: data }))}
                    isExpanded={expandedSections.includes(key)}
                    onToggle={() => toggleSection(key)}
                  />
                )
              }

              // Special handling for Idea section - use structured editor
              if (key === 'idea') {
                return (
                  <IdeaEditor
                    key={key}
                    data={formData.ideaData || { problem: '', solution: '', valueProposition: [], vision: '' }}
                    onChange={(data) => setFormData(prev => ({ ...prev, ideaData: data }))}
                    isExpanded={expandedSections.includes(key)}
                    onToggle={() => toggleSection(key)}
                  />
                )
              }

              // Special handling for Business Model section - use structured editor
              if (key === 'businessModel') {
                return (
                  <BusinessModelEditor
                    key={key}
                    data={formData.businessModelData || { revenueStreams: [], customerSegments: [], distributionChannels: [], costStructure: { fixedCosts: [], variableCosts: [] } }}
                    onChange={(data) => setFormData(prev => ({ ...prev, businessModelData: data }))}
                    isExpanded={expandedSections.includes(key)}
                    onToggle={() => toggleSection(key)}
                  />
                )
              }

              // Special handling for Market Analysis section - use structured editor
              if (key === 'marketAnalysis') {
                return (
                  <MarketAnalysisEditor
                    key={key}
                    data={formData.marketAnalysisData || { competitors: [], segments: [] }}
                    onChange={(data) => setFormData(prev => ({ ...prev, marketAnalysisData: data }))}
                    isExpanded={expandedSections.includes(key)}
                    onToggle={() => toggleSection(key)}
                  />
                )
              }

              // Special handling for Team section - use structured editor
              if (key === 'team') {
                return (
                  <TeamSectionEditor
                    key={key}
                    data={formData.teamData || { members: [], orgChartType: 'hierarchical', description: '' }}
                    onChange={(data) => setFormData(prev => ({ ...prev, teamData: data }))}
                    isExpanded={expandedSections.includes(key)}
                    onToggle={() => toggleSection(key)}
                  />
                )
              }

              // Special handling for Roadmap section - use structured editor
              if (key === 'roadmap') {
                return (
                  <RoadmapEditor
                    key={key}
                    data={formData.roadmapData || { milestones: [], phases: [], visualizationType: 'timeline' }}
                    onChange={(data) => setFormData(prev => ({ ...prev, roadmapData: data }))}
                    isExpanded={expandedSections.includes(key)}
                    onToggle={() => toggleSection(key)}
                  />
                )
              }

              // Special handling for Financial Plan section - use structured editor
              if (key === 'financialPlan') {
                return (
                  <FinancialPlanEditor
                    key={key}
                    data={formData.financialPlanData || { projectionYears: [], scenarios: [], currency: 'EUR', notes: '' }}
                    onChange={(data) => setFormData(prev => ({ ...prev, financialPlanData: data }))}
                    isExpanded={expandedSections.includes(key)}
                    onToggle={() => toggleSection(key)}
                  />
                )
              }

              // Special handling for Revenue Projections section - use structured editor
              if (key === 'revenueProjections') {
                return (
                  <RevenueProjectionsEditor
                    key={key}
                    data={formData.revenueProjectionsData || { streams: [], projectionYears: [], scenarios: [] }}
                    onChange={(data) => setFormData(prev => ({ ...prev, revenueProjectionsData: data }))}
                    isExpanded={expandedSections.includes(key)}
                    onToggle={() => toggleSection(key)}
                  />
                )
              }

              // Regular sections with rich text editor (if any remain)
              return (
                <BusinessPlanSection
                  key={key}
                  id={key}
                  title={template.title}
                  description={template.description}
                  placeholder={template.placeholder}
                  value={formData[key as keyof Omit<LocalBusinessPlanData, 'customSections'>] as string}
                  onChange={(value) => updateSection(key as keyof Omit<LocalBusinessPlanData, 'customSections'>, value)}
                  isExpanded={expandedSections.includes(key)}
                  onToggle={() => toggleSection(key)}
                  onAISuggest={() => handleAISuggest(key)}
                />
              )
            })}

            {/* Custom Sections */}
            {formData.customSections.map((section) => {
              // Team section with structured data
              if (section.type === 'team' && section.data) {
                return (
                  <TeamSectionEditor
                    key={section.id}
                    data={section.data as TeamSectionData}
                    onChange={(data) => updateCustomSection(section.id, 'data', data)}
                    isExpanded={expandedSections.includes(section.id)}
                    onToggle={() => toggleSection(section.id)}
                  />
                )
              }

              // Financial Plan section with structured data
              if (section.type === 'financial_plan' && section.data) {
                return (
                  <FinancialPlanEditor
                    key={section.id}
                    data={section.data as FinancialPlanData}
                    onChange={(data) => updateCustomSection(section.id, 'data', data)}
                    isExpanded={expandedSections.includes(section.id)}
                    onToggle={() => toggleSection(section.id)}
                  />
                )
              }

              // Market Analysis section with structured data
              if (section.type === 'market_analysis' && section.data) {
                return (
                  <MarketAnalysisEditor
                    key={section.id}
                    data={section.data as MarketAnalysisData}
                    onChange={(data) => updateCustomSection(section.id, 'data', data)}
                    isExpanded={expandedSections.includes(section.id)}
                    onToggle={() => toggleSection(section.id)}
                  />
                )
              }

              // SWOT Analysis section with structured data
              if (section.type === 'swot' && section.data) {
                return (
                  <SWOTEditor
                    key={section.id}
                    data={section.data as SWOTData}
                    onChange={(data) => updateCustomSection(section.id, 'data', data)}
                    isExpanded={expandedSections.includes(section.id)}
                    onToggle={() => toggleSection(section.id)}
                  />
                )
              }

              // Business Model Canvas section with structured data
              if (section.type === 'business_model_canvas' && section.data) {
                return (
                  <BusinessModelCanvasEditor
                    key={section.id}
                    data={section.data as BusinessModelCanvasData}
                    onChange={(data) => updateCustomSection(section.id, 'data', data)}
                    isExpanded={expandedSections.includes(section.id)}
                    onToggle={() => toggleSection(section.id)}
                  />
                )
              }

              // Questionnaire section with structured data
              if (section.type === 'questionnaire' && section.data) {
                return (
                  <QuestionnaireEditor
                    key={section.id}
                    data={section.data as QuestionnaireData}
                    onChange={(data) => updateCustomSection(section.id, 'data', data)}
                    isExpanded={expandedSections.includes(section.id)}
                    onToggle={() => toggleSection(section.id)}
                  />
                )
              }

              // Special handling for Modulo 662 sections
              if (section.type === 'modulo662' && section.data) {
                const isExpanded = expandedSections.includes(section.id)
                return (
                  <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <button
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleSection(section.id)
                            }}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </button>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">Domanda di Agevolazione - Fondo di Garanzia PMI</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (window.confirm('Sei sicuro di voler eliminare questa sezione?')) {
                                deleteCustomSection(section.id)
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Elimina sezione"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="p-6 border-t border-gray-100 bg-gray-50">
                        <Modulo662Form
                          initialData={section.data as Modulo662Data}
                          onSave={(data) => updateCustomSection(section.id, 'data', data)}
                          clientName={service.userId.name}
                          clientEmail={service.userId.email}
                        />
                      </div>
                    )}
                  </div>
                )
              }

              // Regular custom sections
              return (
                <BusinessPlanSection
                  key={section.id}
                  id={section.id}
                  title={section.title}
                  description="Sezione personalizzata"
                  placeholder="Contenuto della sezione personalizzata..."
                  value={section.content}
                  onChange={(value) => updateCustomSection(section.id, 'content', value)}
                  isExpanded={expandedSections.includes(section.id)}
                  onToggle={() => toggleSection(section.id)}
                  isCustom
                  onDelete={() => deleteCustomSection(section.id)}
                  onTitleChange={(value) => updateCustomSection(section.id, 'title', value)}
                />
              )
            })}

            {/* Add Custom Section Buttons */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Aggiungi Sezione Aggiuntiva</h3>

              {/* Questionnaire Button */}
              <button
                onClick={() => addCustomSection('questionnaire')}
                className="w-full p-4 border-2 border-blue-200 bg-blue-50 rounded-xl hover:border-blue-400 hover:bg-blue-100 transition-all duration-200 flex flex-col items-center space-y-2 text-blue-700 hover:text-blue-800"
              >
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span className="font-medium text-sm">Aggiungi Questionario Strategico</span>
                </div>
                <span className="text-xs text-blue-600">Domande di validazione per il business plan</span>
              </button>

              {/* Generic Custom Section Button */}
              <button
                onClick={() => addCustomSection()}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-500 hover:bg-gray-50 transition-all duration-200 flex flex-col items-center space-y-2 text-gray-600 hover:text-gray-700"
              >
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span className="font-medium text-sm">Aggiungi Sezione Personalizzata</span>
                </div>
                <span className="text-xs text-gray-500">Sezione con testo libero</span>
              </button>
              <p className="text-xs text-gray-500 italic">
                Tutte le sezioni standard del business plan sono già incluse sopra
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <button
                  onClick={onSuspend}
                  disabled={isUpdating}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
                >
                  Sospendi Lavoro
                </button>

                <button
                  onClick={() => showToast('Funzionalità Scoring in sviluppo', 'info')}
                  disabled={isUpdating}
                  className="px-6 py-3 border border-blue-300 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-all duration-200"
                >
                  Scoring
                </button>

                <button
                  onClick={() => {
                    const modulo662Section: CustomSection = {
                      id: `modulo_662_${Date.now()}`,
                      title: 'Modulo 662/96 - Domanda di Agevolazione Fondo di Garanzia PMI',
                      type: 'modulo662',
                      content: '', // Will be generated from data in preview mode
                      data: {
                        // Initialize with user data
                        cognomeNome: service.userId.name,
                        natoA: '',
                        natoIl: '',
                        tipoSoggetto: 'impresa',
                        denominazione: '',
                        codiceFiscale: '',
                        dataCostituzione: '',
                        comuneSede: '',
                        indirizzo: '',
                        provincia: '',
                        pec: service.userId.email,
                        emailOrdinaria: '',
                        telefono: service.userId.phone || '',
                        importoOperazione: '',
                        durataOperazione: '',
                        codiceAteco: '',
                        sedeAttivita: 'legale',
                        sedeOperativaComune: '',
                        sedeOperativaProvincia: '',
                        finalitaOperazione: 'investimento',
                        descrizioneLiquidita: '',
                        importoProgramma: '',
                        statoPrograma: 'da_iniziare',
                        dataInizio: '',
                        dataCompletamento: '',
                        dataPrevistaCompletamento: '',
                        finalitaInnovazioneTecnologica: false,
                        finalitaEfficienzaEnergetica: false,
                        finalitaRicercaSviluppo: false,
                        finalitaCrescita: false,
                        finalitaSostenibilita: false,
                        finalitaRisorseUmane: false,
                        descrizioneInvestimento: '',
                        importoTerreni: '',
                        importoFabbricati: '',
                        importoMacchinari: '',
                        importoInvestimentiImmateriali: '',
                        importoAttiviFinanziari: '',
                        importoAltro: '',
                        descrizioneAltro: '',
                        hasLiquiditaConnessa: false,
                        importoLiquiditaConnessa: '',
                        importoFinanziamento: '',
                        importoRisorseProprie: '',
                        importoAltreFonti: '',
                        hasAltreAgevolazioni: false,
                        altreAgevolazioni: [],
                        regolamentazioneUE: 'de_minimis',
                        periodoRiferimento: '',
                        tipoImpresa: 'autonoma',
                        fatturatoImpresa: '',
                        attivoImpresa: '',
                        occupatiImpresa: '',
                        impreseAssociate: [],
                        dimensioneImpresa: 'microimpresa',
                        isStartupInnovativa: false,
                        isIncubatoreCertificato: false,
                        // DICHIARA - 12 dichiarazioni obbligatorie
                        dichiaraParametriDimensionali: false,
                        dichiaraNoAiutiSalvataggio: false,
                        dichiaraAccettaNormativaComunitaria: false,
                        dichiaraAccettaDisposizioniOperative: false,
                        dichiaraAccettaSurrogazioneLegale: false,
                        dichiaraComunicaVariazioni: false,
                        dichiaraTrasmetteDocumentazione: false,
                        dichiaraComunicaPortale: false,
                        dichiaraConsenteControlli: false,
                        dichiaraAccettaRevoca: false,
                        dichiaraPrendeAttoPubblicazione: false,
                        dichiaraConsapevoleComunicazioni: false,
                        // De minimis (punto 18)
                        deMinimisRispettaLimite: false,
                        deMinimisAttuaSeparazione: false,
                        // Aiuti incompatibili (pagina 7)
                        aiutiIncompatibili: 'non_ricevuti',
                        aiutiIncompatibiliImporto: '',
                        aiutiIncompatibiliDataRimborso: '',
                        aiutiIncompatibiliMezzoRimborso: '',
                        aiutiIncompatibiliLetteraRiferimento: '',
                        // CDP - Casse Professionali
                        cassaProfessionaleENPAB: false,
                        cassaProfessionaleENPACL: false,
                        cassaProfessionaleEPAP: false,
                        cassaProfessionaleENPAM: false,
                        cassaProfessionaleDottoriCommercialisti: false,
                        cassaProfessionaleCassaForense: false,
                        cassaProfessionaleINARCASSA: false,
                        cassaProfessionaleCIPAG: false,
                        // InvestEU (pagine 9-13)
                        investEUNonAttivitaEscluse: false,
                        investEUImportoNonSuperiore: false,
                        investEUNoFocusSostanziale: false,
                        investEURiconosceAudit: false,
                        investEUConsapevoleCommissione: false,
                        investEUConservaDocumentazione: false,
                        investEUConsapevoleTrattamentoDati: false,
                        investEUNoAttivitaIllecite: false,
                        investEUNoCostruzioniArtificio: false,
                        investEURispettaStandards: false,
                        investEUSedeUE: false,
                        investEUMantieneFondi: false,
                        investEUDocumentazioneValida: false,
                        investEURispettaLeggi: false,
                        investEUComunicaTitolareEffettivo: false,
                        investEUNoGiurisdizioneNonConforme: false,
                        investEUNoSanzioniUE: false,
                        investEUComunicaEventi: false,
                        investEUNoContributoCapitale: false,
                        investEUNoPrefinanziamento: false,
                        investEUCombinazioneSupporto: false,
                        investEUUtilizzoScopo: false,
                        investEUNonAltroPortafoglio: false,
                        investEUInserisceLogo: false,
                        investEUConcordaPubblicazione: false,
                        investEUFornisceDocumentazione: false,
                        investEUNoFallimento: false,
                        investEUNoPagamentoImposte: false,
                        investEUNoElusioneFiscale: false,
                        investEUNoColgaGrave: false,
                        investEUNoCondannePenali: false,
                        investEUNoEDES: false
                      } as Modulo662Data
                    }

                    setFormData(prev => ({
                      ...prev,
                      customSections: [...prev.customSections, modulo662Section]
                    }))
                    setExpandedSections(prev => [...prev, modulo662Section.id])
                    showToast('Modulo 662 aggiunto - compila il form con i dati richiesti', 'success')
                  }}
                  disabled={isUpdating}
                  className="px-6 py-3 border border-green-300 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 transition-all duration-200"
                >
                  Modulo 662
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={async () => {
                    try {
                      await onSave({ ...formData, creationMode: creationMode || undefined })
                      setManualSaveStatus('saved')
                      showToast('Bozza salvata con successo!', 'success')

                      // Torna a "Salva Bozza" dopo 5 secondi
                      setTimeout(() => {
                        setManualSaveStatus('idle')
                      }, 5000)
                    } catch (error) {
                      showToast('Errore nel salvataggio della bozza', 'error')
                    }
                  }}
                  disabled={isUpdating}
                  className={`px-6 py-3 border rounded-lg disabled:opacity-50 transition-all duration-200 flex items-center space-x-2 ${
                    manualSaveStatus === 'saved'
                      ? 'border-green-600 text-green-600 bg-green-50'
                      : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {manualSaveStatus === 'saved' ? 'Salvato' : 'Salva Bozza'}
                  </span>
                </button>

                <button
                  onClick={() => onComplete({ ...formData, creationMode: creationMode || undefined })}
                  disabled={isUpdating || !isComplete}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center space-x-2"
                >
                  <span>{isUpdating ? 'Pubblicazione...' : 'Completa e Pubblica'}</span>
                </button>
              </div>
            </div>

            {!isComplete && (
              <p className="text-sm text-amber-600 mt-4 text-center">
                Compila almeno Executive Summary, L'Idea e Analisi di Mercato per completare il business plan
              </p>
            )}
          </div>
        </>
      )}

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Conferma Ricomincia da Capo"
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Sei sicuro di voler ricominciare da capo? Tutti i contenuti non salvati andranno persi
            e potrai scegliere una nuova modalità di creazione.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Attenzione:</strong> Questa azione resetterà completamente il business plan
              e ti permetterà di ripartire da zero con una delle tre modalità:
              Generazione AI, Template o Da Zero.
            </p>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowResetModal(false)}
              disabled={isUpdating}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Annulla
            </button>
            <button
              onClick={confirmReset}
              disabled={isUpdating}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>{isUpdating ? 'Reset in corso...' : 'Ricomincia da Capo'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* AI Suggestions Modal */}
      <Modal
        isOpen={showSuggestionModal}
        onClose={() => setShowSuggestionModal(false)}
        title="Suggerimenti AI per la Sezione"
        maxWidth="3xl"
      >
        {isLoadingSuggestion ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Generazione suggerimenti in corso...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Suggerimento AI:</strong> L'AI ha analizzato il contenuto corrente e ha generato dei suggerimenti per migliorare questa sezione.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: suggestionText }}
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSuggestionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Chiudi
              </button>
              <button
                onClick={applySuggestion}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Applica Suggerimento</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
