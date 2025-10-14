import mongoose, { Document, Schema } from 'mongoose'

// Business Plan Content Schema
const BusinessPlanContentSchema = new Schema({
  executiveSummary: { type: String },
  objective: { type: String },
  marketAnalysis: { type: String },
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
    executiveSummary: string
    objective: string
    marketAnalysis: string
    timeSeriesForecasting: string
    budgetSimulation: string
    alerts: string
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
