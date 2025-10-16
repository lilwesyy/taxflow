import mongoose from 'mongoose'

export interface IExpense extends mongoose.Document {
  // Riferimento utente
  userId: mongoose.Types.ObjectId

  // Dati spesa
  descrizione: string
  importo: number
  data: string // Data spesa in formato YYYY-MM-DD
  categoria: 'inps' | 'imposte' | 'affitto' | 'utilities' | 'fornitori' | 'attrezzature' | 'marketing' | 'formazione' | 'trasporti' | 'consulenze' | 'altro'
  stato: 'pagato' | 'da_pagare' | 'ricorrente'
  metodoPagamento?: 'bonifico' | 'carta' | 'contanti' | 'rid' | 'altro'

  // Spese ricorrenti
  ricorrente?: {
    frequenza: 'mensile' | 'trimestrale' | 'annuale'
    prossimaScadenza?: string
    importoFisso: boolean
  }

  // Opzionale
  note?: string
  documentoId?: mongoose.Types.ObjectId // Link a documento fiscale se presente

  // Timestamp
  createdAt: Date
  updatedAt: Date
}

const ExpenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  descrizione: {
    type: String,
    required: true,
    trim: true
  },
  importo: {
    type: Number,
    required: true,
    min: 0
  },
  data: {
    type: String,
    required: true
  },
  categoria: {
    type: String,
    required: true,
    enum: ['inps', 'imposte', 'affitto', 'utilities', 'fornitori', 'attrezzature', 'marketing', 'formazione', 'trasporti', 'consulenze', 'altro']
  },
  stato: {
    type: String,
    required: true,
    enum: ['pagato', 'da_pagare', 'ricorrente'],
    default: 'pagato'
  },
  metodoPagamento: {
    type: String,
    enum: ['bonifico', 'carta', 'contanti', 'rid', 'altro']
  },
  ricorrente: {
    frequenza: {
      type: String,
      enum: ['mensile', 'trimestrale', 'annuale']
    },
    prossimaScadenza: {
      type: String
    },
    importoFisso: {
      type: Boolean,
      default: true
    }
  },
  note: {
    type: String,
    trim: true
  },
  documentoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }
}, { timestamps: true })

// Index per query comuni
ExpenseSchema.index({ userId: 1, data: -1 })
ExpenseSchema.index({ userId: 1, categoria: 1 })
ExpenseSchema.index({ userId: 1, stato: 1 })

const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema)
export default Expense
