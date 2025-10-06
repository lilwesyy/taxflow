import mongoose from 'mongoose'

export interface IInvoice extends mongoose.Document {
  conversationId: mongoose.Types.ObjectId
  businessUserId: mongoose.Types.ObjectId
  adminUserId: mongoose.Types.ObjectId
  numero: string
  cliente: string
  clienteEmail: string
  azienda: string
  consulente: string
  servizio: string
  tipo: string
  importo: number
  iva: number
  totale: number
  status: 'paid' | 'pending' | 'failed' | 'canceled'
  dataEmissione: string
  dataPagamento: string
  stripePaymentIntentId: string
  stripePaymentStatus: string
  createdAt: Date
  updatedAt: Date
}

const InvoiceSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  businessUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  numero: { type: String, required: true, unique: true },
  cliente: { type: String, required: true },
  clienteEmail: { type: String, required: true },
  azienda: { type: String },
  consulente: { type: String, required: true },
  servizio: { type: String, required: true },
  tipo: { type: String, required: true },
  importo: { type: Number, required: true },
  iva: { type: Number, required: true },
  totale: { type: Number, required: true },
  status: {
    type: String,
    enum: ['paid', 'pending', 'failed', 'canceled'],
    default: 'paid'
  },
  dataEmissione: { type: String, required: true },
  dataPagamento: { type: String },
  stripePaymentIntentId: { type: String, required: true },
  stripePaymentStatus: { type: String }
}, { timestamps: true })

// Index for faster queries
InvoiceSchema.index({ adminUserId: 1, status: 1 })
InvoiceSchema.index({ businessUserId: 1 })
InvoiceSchema.index({ numero: 1 })

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema)
