import mongoose from 'mongoose'

export interface IInvoice extends mongoose.Document {
  conversationId?: mongoose.Types.ObjectId
  businessUserId: mongoose.Types.ObjectId
  adminUserId?: mongoose.Types.ObjectId
  numero: string
  cliente: string
  clienteEmail: string
  azienda?: string
  consulente?: string
  servizio: string
  tipo: string
  importo: number
  iva: number
  totale: number
  status: 'paid' | 'pending' | 'failed' | 'canceled'
  dataEmissione: string
  dataPagamento?: string
  metodoPagamento?: string
  stripePaymentIntentId?: string
  stripePaymentStatus?: string
  stripeCheckoutSessionId?: string
  stripeSubscriptionId?: string
  // Subscription info
  subscriptionPlanId?: string
  subscriptionPlanName?: string
  subscriptionInterval?: 'month' | 'year'
  createdAt: Date
  updatedAt: Date
}

const InvoiceSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  },
  businessUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  numero: { type: String, required: true, unique: true },
  cliente: { type: String, required: true },
  clienteEmail: { type: String, required: true },
  azienda: { type: String },
  consulente: { type: String },
  servizio: { type: String, required: true },
  tipo: { type: String, required: true },
  importo: { type: Number, required: true },
  iva: { type: Number, required: true },
  totale: { type: Number, required: true },
  status: {
    type: String,
    enum: ['paid', 'pending', 'failed', 'canceled'],
    default: 'pending'
  },
  dataEmissione: { type: String, required: true },
  dataPagamento: { type: String },
  metodoPagamento: { type: String },
  stripePaymentIntentId: { type: String },
  stripePaymentStatus: { type: String },
  stripeCheckoutSessionId: { type: String },
  stripeSubscriptionId: { type: String },
  // Subscription info
  subscriptionPlanId: { type: String },
  subscriptionPlanName: { type: String },
  subscriptionInterval: { type: String, enum: ['month', 'year'] }
}, { timestamps: true })

// Index for faster queries
InvoiceSchema.index({ adminUserId: 1, status: 1 })
InvoiceSchema.index({ businessUserId: 1 })
InvoiceSchema.index({ numero: 1 })
InvoiceSchema.index({ stripeCheckoutSessionId: 1 })

// Static method to generate invoice number
InvoiceSchema.statics.generateInvoiceNumber = async function(): Promise<string> {
  const year = new Date().getFullYear()
  const lastInvoice = await this.findOne({
    numero: new RegExp(`^INV-${year}-`)
  }).sort({ createdAt: -1 })

  let nextNumber = 1
  if (lastInvoice) {
    const match = lastInvoice.numero.match(/INV-\d+-(\d+)/)
    if (match) {
      nextNumber = parseInt(match[1]) + 1
    }
  }

  return `INV-${year}-${nextNumber.toString().padStart(4, '0')}`
}

const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema)
export default Invoice
