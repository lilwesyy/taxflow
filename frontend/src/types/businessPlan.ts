/**
 * TypeScript interfaces for structured Business Plan sections
 * Based on BusinnesPlan.pdf analysis
 */

// ============================================================================
// EXECUTIVE SUMMARY SECTION
// ============================================================================

export interface ExecutiveSummaryData {
  companyName: string
  sector: string
  mainObjective: string
  keyStrategy: string
  strengthPoints: string[]
  financialProjections: {
    breakEvenMonths?: number
    revenueGrowthPercent?: number
    yearlyProjections?: string
  }
  generalSummary?: string
}

// ============================================================================
// IDEA SECTION
// ============================================================================

export interface IdeaData {
  problem: string // Il problema che risolviamo
  solution: string // La nostra soluzione
  valueProposition: string[] // Punti di differenziazione
  vision: string // La visione a lungo termine
  targetMarket?: string
}

// ============================================================================
// BUSINESS MODEL SECTION
// ============================================================================

export interface BusinessRevenueStream {
  id: string
  name: string
  description: string
  margin?: number
}

export interface CustomerSegment {
  id: string
  name: string
  description: string
  type: 'primary' | 'secondary'
}

export interface DistributionChannel {
  id: string
  name: string
  description: string
}

export interface CostStructure {
  fixedCosts: Array<{ name: string; description: string }>
  variableCosts: Array<{ name: string; description: string }>
}

export interface BusinessModelData {
  revenueStreams: BusinessRevenueStream[]
  customerSegments: CustomerSegment[]
  distributionChannels: DistributionChannel[]
  costStructure: CostStructure
  notes?: string
}

// ============================================================================
// TEAM SECTION
// ============================================================================

export interface TeamMember {
  id: string
  name: string
  role: string
  department?: string // e.g., "CDA", "Marketing", "Tech", etc.
  description: string // Experience and responsibilities
  photoUrl?: string
  linkedIn?: string
  email?: string
  parentId?: string // For hierarchical org chart (reports to)
}

export interface TeamSectionData {
  members: TeamMember[]
  orgChartType?: 'hierarchical' | 'flat' // Visualization type
  description?: string // Overall team description
}

// ============================================================================
// FINANCIAL PLAN SECTION
// ============================================================================

export interface FinancialCategory {
  id: string
  name: string // e.g., "sito web assistenza", "ADV", "Project Manager", etc.
  values: { [year: string]: number } // { "2025": 18000, "2026": 18000, ... }
  description?: string
  isRecurring?: boolean // If this cost/revenue repeats yearly
}

export interface FinancialScenario {
  id: string
  name: string // e.g., "Conservativo", "Ottimistico"
  description?: string
  costCategories: FinancialCategory[]
  revenueCategories: FinancialCategory[]
}

export interface FinancialPlanData {
  projectionYears: string[] // e.g., ["2025", "2026", "2027", "2028", "2029", "2030"]
  scenarios: FinancialScenario[]
  currency: string // e.g., "EUR"
  notes?: string

  // Calculated fields (computed from categories)
  totals?: {
    [scenarioId: string]: {
      costs: { [year: string]: number }
      revenues: { [year: string]: number }
      profits: { [year: string]: number }
    }
  }
}

// ============================================================================
// MARKET ANALYSIS SECTION
// ============================================================================

export interface CompetitorData {
  id: string
  name: string
  description: string
  strengths: string
  weaknesses: string
  marketShare?: number // Percentage
  revenue?: number
  founded?: string
  website?: string
  targetMarket?: string
  keyFeatures?: string[]
}

export interface MarketSegment {
  id: string
  name: string
  size: number // Market size in currency
  growth: number // Growth rate percentage
  description?: string
}

export interface MarketAnalysisData {
  competitors: CompetitorData[]
  segments: MarketSegment[]
  totalMarketSize?: number
  targetMarketSize?: number
  marketGrowthRate?: number

  // ISTAT or other statistical data
  demographicData?: {
    [key: string]: string | number
  }

  notes?: string
}

// ============================================================================
// ROADMAP SECTION
// ============================================================================

export interface RoadmapMilestone {
  id: string
  title: string
  description: string
  startDate: string // ISO date string
  endDate?: string // ISO date string
  status: 'planned' | 'in_progress' | 'completed' | 'delayed'
  phase?: string // e.g., "Phase 1", "Launch", "Growth", etc.
  dependencies?: string[] // IDs of milestones this depends on
  deliverables?: string[]
  team?: string[] // Team members assigned
}

export interface RoadmapData {
  milestones: RoadmapMilestone[]
  phases?: Array<{
    id: string
    name: string
    color?: string
    startDate: string
    endDate: string
  }>
  visualizationType?: 'timeline' | 'gantt' | 'phases'
  notes?: string
}

// ============================================================================
// SWOT ANALYSIS SECTION
// ============================================================================

export interface SWOTItem {
  id: string
  text: string
  priority?: 'high' | 'medium' | 'low'
}

export interface SWOTData {
  strengths: SWOTItem[]
  weaknesses: SWOTItem[]
  opportunities: SWOTItem[]
  threats: SWOTItem[]
  strategicSummary?: string
  actionItems?: string[]
}

// ============================================================================
// BUSINESS MODEL CANVAS SECTION
// ============================================================================

export interface BusinessModelCanvasData {
  keyPartners: string
  keyActivities: string
  keyResources: string
  valuePropositions: string
  customerRelationships: string
  channels: string
  customerSegments: string
  costStructure: string
  revenueStreams: string
}

// ============================================================================
// ABELL MODEL SECTION
// ============================================================================

export interface AbellModelData {
  customerGroups: string[] // Chi (Who) - Target customers
  customerFunctions: string[] // Cosa (What) - Customer needs/functions
  technologies: string[] // Come (How) - Technologies used
  description?: string
}

// ============================================================================
// REVENUE PROJECTIONS SECTION
// ============================================================================

export interface RevenueStream {
  id: string
  name: string // e.g., "Subscription Tier 1", "Enterprise Licenses", etc.
  description?: string
  pricing: number // Price per unit
  projectedUnits: { [year: string]: number } // Units sold per year
  projectedRevenue?: { [year: string]: number } // Calculated: pricing * units
}

export interface RevenueProjectionsData {
  streams: RevenueStream[]
  projectionYears: string[]
  scenarios?: Array<{
    id: string
    name: string // "Conservative" or "Optimistic"
    multiplier: number // Adjustment factor
  }>
  notes?: string

  // Calculated totals
  totals?: {
    [scenarioId: string]: { [year: string]: number }
  }
}

// ============================================================================
// OBJECTIVES SECTION (OBIETTIVO)
// ============================================================================

export interface SMARTObjective {
  id: string
  title: string
  description: string
  specific: string // What exactly will be accomplished?
  measurable: string // How will it be measured?
  achievable: string // How can it be achieved?
  relevant: string // Why is it important?
  timeBound: string // When will it be achieved?
  status: 'not_started' | 'in_progress' | 'completed'
  progress?: number // 0-100
}

export interface ObjectivesData {
  objectives: SMARTObjective[]
  vision?: string
  mission?: string
  coreValues?: string[]
  notes?: string
}

// ============================================================================
// PREDICTIVE ANALYSIS SECTION (PROPOSTA PREDITTIVA)
// ============================================================================

export interface TimeSeriesForecast {
  id: string
  metric: string // e.g., "Revenue", "Users", "Market Share"
  historicalData: Array<{ date: string; value: number }>
  forecastData: Array<{ date: string; value: number; confidence?: { lower: number; upper: number } }>
  algorithm?: string // e.g., "ARIMA", "Prophet", "Linear Regression"
}

export interface ClusterData {
  id: string
  name: string
  description: string
  customerCount: number
  averageValue: number
  characteristics: string[]
  color?: string
}

export interface PropensityModel {
  id: string
  name: string // e.g., "Churn Propensity", "Purchase Propensity"
  description: string
  segments: Array<{
    name: string
    propensity: number // 0-100
    size: number
    actions?: string[]
  }>
}

export interface PredictiveAnalysisData {
  timeSeriesForecasts: TimeSeriesForecast[]
  clusters: ClusterData[]
  propensityModels: PropensityModel[]
  notes?: string
}

// ============================================================================
// PERFORMANCE SECTION (PERFORMANCE)
// ============================================================================

export interface KPIMetric {
  id: string
  name: string
  description?: string
  currentValue: number
  targetValue: number
  unit: string // e.g., "€", "%", "count"
  category: 'financial' | 'customer' | 'operational' | 'growth'
  trend: 'up' | 'down' | 'stable'
  historicalData?: Array<{ date: string; value: number }>
}

export interface PerformanceData {
  kpis: KPIMetric[]
  performancePeriod?: string // e.g., "Q1 2025"
  benchmarks?: Array<{
    name: string
    value: number
    source?: string
  }>
  notes?: string
}

// ============================================================================
// BUDGET SIMULATION SECTION (SIMULAZIONE BUDGET)
// ============================================================================

export interface BudgetScenario {
  id: string
  name: string // e.g., "Pessimistico", "Base", "Ottimistico"
  description?: string
  revenueGrowth: number // Percentage
  costIncrease: number // Percentage
  assumptions: string[]
  projections: {
    [year: string]: {
      revenue: number
      costs: number
      profit: number
      margins: number
    }
  }
}

export interface BudgetSimulationData {
  scenarios: BudgetScenario[]
  projectionYears: string[]
  baseYear?: string
  currency: string
  notes?: string
}

// ============================================================================
// ALERTS SECTION (ALERT SU UNDERPERFORMANCE)
// ============================================================================

export interface PerformanceAlert {
  id: string
  name: string
  metric: string
  condition: 'below' | 'above' | 'equals'
  threshold: number
  currentValue?: number
  status: 'active' | 'triggered' | 'resolved'
  severity: 'low' | 'medium' | 'high' | 'critical'
  actions?: string[]
  triggeredDate?: string
}

export interface AlertsData {
  alerts: PerformanceAlert[]
  monitoringPeriod?: string
  escalationRules?: Array<{
    severity: string
    action: string
    responsible: string
  }>
  notes?: string
}

// ============================================================================
// MARKETING STRATEGY SECTION (STRATEGIA DI MARKETING)
// ============================================================================

export interface MarketingChannel {
  id: string
  name: string // e.g., "Google Ads", "Facebook", "Email Marketing"
  description?: string
  budget: number
  expectedROI: number // Return on Investment %
  kpis: Array<{
    name: string
    target: number
    current?: number
  }>
}

export interface MarketingCampaign {
  id: string
  name: string
  objective: string
  channels: string[] // IDs of channels
  budget: number
  startDate: string
  endDate: string
  status: 'planned' | 'active' | 'paused' | 'completed'
  results?: {
    reach?: number
    conversions?: number
    cost?: number
    roi?: number
  }
}

export interface MarketingStrategyData {
  channels: MarketingChannel[]
  campaigns: MarketingCampaign[]
  totalBudget?: number
  targetAudience?: string
  positioning?: string
  uniqueSellingProposition?: string
  notes?: string
}

// ============================================================================
// QUESTIONNAIRE SECTION (QUESTIONARIO STRATEGICO)
// ============================================================================

export interface QuestionnaireItem {
  id: string
  question: string
  answer: string
  category: 'problem' | 'market' | 'competition' | 'scalability' | 'risks' | 'metrics' | 'team' | 'financial'
  priority?: 'high' | 'medium' | 'low'
}

export interface QuestionnaireData {
  items: QuestionnaireItem[]
  completionPercentage?: number // Calculated: answered questions / total questions * 100
  notes?: string
  lastUpdated?: string
}

// ============================================================================
// CUSTOM SECTION UNION TYPE
// ============================================================================

export type BusinessPlanSectionType =
  | 'team'
  | 'financial_plan'
  | 'market_analysis'
  | 'objectives'
  | 'predictive_analysis'
  | 'performance'
  | 'budget_simulation'
  | 'alerts'
  | 'marketing_strategy'
  | 'roadmap'
  | 'swot'
  | 'business_model_canvas'
  | 'abell_model'
  | 'revenue_projections'
  | 'questionnaire'
  | 'modulo662'
  | 'regular' // Free text section

export type BusinessPlanSectionData =
  | ExecutiveSummaryData
  | IdeaData
  | BusinessModelData
  | TeamSectionData
  | FinancialPlanData
  | MarketAnalysisData
  | ObjectivesData
  | PredictiveAnalysisData
  | PerformanceData
  | BudgetSimulationData
  | AlertsData
  | MarketingStrategyData
  | RoadmapData
  | SWOTData
  | BusinessModelCanvasData
  | AbellModelData
  | RevenueProjectionsData
  | QuestionnaireData
  | any // For modulo662 or custom data

// ============================================================================
// CUSTOM SECTION INTERFACE (extends existing PurchasedService model)
// ============================================================================

export interface BusinessPlanCustomSection {
  id: string
  title: string
  type: BusinessPlanSectionType
  content?: string // For regular/free-text sections
  data?: BusinessPlanSectionData // For structured sections
}

// ============================================================================
// COMPLETE BUSINESS PLAN CONTENT INTERFACE
// ============================================================================

export interface BusinessPlanContent {
  // Creation mode
  creationMode?: 'ai' | 'template' | 'scratch'

  // Standard sections (free text with rich editor)
  executiveSummary?: string
  idea?: string
  businessModel?: string
  marketAnalysis?: string
  team?: string
  roadmap?: string
  financialPlan?: string
  revenueProjections?: string

  // Custom sections (mix of structured and free text)
  customSections?: BusinessPlanCustomSection[]

  // Legacy fields (for backward compatibility)
  objective?: string
  timeSeriesForecasting?: string
  budgetSimulation?: string
  alerts?: string
  pdfUrl?: string
}

// ============================================================================
// CHART CONFIGURATION TYPES
// ============================================================================

export type ChartType = 'pie' | 'bar' | 'line' | 'area' | 'scatter' | 'radar'

export interface ChartConfig {
  type: ChartType
  title: string
  data: any[] // Chart data in format expected by recharts
  xKey?: string
  yKey?: string | string[]
  colors?: string[]
  height?: number
  showLegend?: boolean
  showGrid?: boolean
  customOptions?: any
}
