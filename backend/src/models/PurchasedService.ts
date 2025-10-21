import mongoose, { Document, Schema } from 'mongoose'

// Custom Section Schema
const CustomSectionSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: false }, // Not required for modulo662 type
  type: { type: String, required: false }, // 'modulo662' | 'regular'
  data: { type: Schema.Types.Mixed, required: false } // For structured data like Modulo662Data
}, { _id: false })

// Business Plan Content Schema
const BusinessPlanContentSchema = new Schema({
  // Creation mode tracking
  creationMode: { type: String, enum: ['ai', 'template', 'scratch'] },

  // New structure fields
  executiveSummary: { type: String },
  idea: { type: String },
  businessModel: { type: String },
  marketAnalysis: { type: String },
  team: { type: String },
  roadmap: { type: String },
  financialPlan: { type: String },
  revenueProjections: { type: String },
  customSections: [CustomSectionSchema],

  // Legacy fields (for backward compatibility)
  objective: { type: String },
  timeSeriesForecasting: { type: String },
  budgetSimulation: { type: String },
  alerts: { type: String },
  pdfUrl: { type: String }
}, { _id: false })

// Analisi SWOT Content Schema
const AnalisiSWOTContentSchema = new Schema({
  strengths: { type: String },
  weaknesses: { type: String },
  opportunities: { type: String },
  threats: { type: String },
  strategicSummary: { type: String },
  recommendedActions: { type: String },
  pdfUrl: { type: String }
}, { _id: false })

export interface IPurchasedService extends Document {
  userId: mongoose.Types.ObjectId
  serviceType: 'business_plan' | 'analisi_swot'
  status: 'pending' | 'in_progress' | 'completed'
  stripePaymentIntentId?: string
  stripeCheckoutSessionId?: string
  amountPaid: number
  businessPlanContent?: {
    // Creation mode tracking
    creationMode?: 'ai' | 'template' | 'scratch'
    // New structure fields
    executiveSummary?: string
    idea?: string
    businessModel?: string
    marketAnalysis?: string
    team?: string
    roadmap?: string
    financialPlan?: string
    revenueProjections?: string
    customSections?: Array<{
      id: string
      title: string
      content?: string // Optional for modulo662
      type?: string // 'modulo662' | 'regular'
      data?: any // For structured data like Modulo662Data
    }>
    // Legacy fields (for backward compatibility)
    objective?: string
    timeSeriesForecasting?: string
    budgetSimulation?: string
    alerts?: string
    pdfUrl?: string
  }
  analisiSWOTContent?: {
    strengths: string
    weaknesses: string
    opportunities: string
    threats: string
    strategicSummary: string
    recommendedActions: string
    pdfUrl?: string
  }
  assignedToConsultant?: mongoose.Types.ObjectId // Consulente che sta lavorando su questo servizio
  completedBy?: mongoose.Types.ObjectId
  completedAt?: Date
  purchasedAt: Date
}

const PurchasedServiceSchema = new Schema<IPurchasedService>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  serviceType: {
    type: String,
    enum: ['business_plan', 'analisi_swot'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  stripePaymentIntentId: { type: String },
  stripeCheckoutSessionId: { type: String },
  amountPaid: { type: Number, required: true },
  businessPlanContent: { type: BusinessPlanContentSchema },
  analisiSWOTContent: { type: AnalisiSWOTContentSchema },
  assignedToConsultant: { type: Schema.Types.ObjectId, ref: 'User' },
  completedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  completedAt: { type: Date },
  purchasedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
})

// Indexes for faster queries
PurchasedServiceSchema.index({ userId: 1, serviceType: 1 })
PurchasedServiceSchema.index({ status: 1 })

const PurchasedService = mongoose.model<IPurchasedService>('PurchasedService', PurchasedServiceSchema)

export default PurchasedService
