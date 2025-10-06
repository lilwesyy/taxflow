import mongoose from 'mongoose'

interface IDocument extends mongoose.Document {
  // Riferimento utente
  userId: mongoose.Types.ObjectId
  clientId?: mongoose.Types.ObjectId // Per admin: riferimento al cliente

  // Informazioni documento
  nome: string
  tipo: string // modello_redditi, dichiarazione_iva, fattura_elettronica, etc.
  categoria: 'dichiarazioni' | 'fatturazione' | 'comunicazioni' | 'versamenti' | 'consultazione' | 'registri' | 'altri_documenti'
  descrizione?: string

  // Metadati file
  fileName: string
  fileUrl: string
  formato: string // PDF, XML, XLSX, etc.
  dimensione: number // in bytes
  mimeType: string

  // Status e protocollo
  status: 'elaborato' | 'in_elaborazione' | 'in_attesa' | 'rifiutato'
  protocollo?: string
  importo?: string // per documenti con importi (F24, fatture, etc.)

  // Dati temporali
  anno: string
  dataCaricamento: Date
  dataModifica: Date

  // Note e cronologia
  note?: string
  cronologia: Array<{
    data: Date
    azione: string
    utente: string
  }>

  // Soft delete
  deleted: boolean
  deletedAt?: Date
}

const DocumentSchema = new mongoose.Schema<IDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    nome: {
      type: String,
      required: true,
      trim: true
    },
    tipo: {
      type: String,
      required: true,
      trim: true
    },
    categoria: {
      type: String,
      required: true,
      enum: ['dichiarazioni', 'fatturazione', 'comunicazioni', 'versamenti', 'consultazione', 'registri', 'altri_documenti']
    },
    descrizione: {
      type: String,
      trim: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    formato: {
      type: String,
      required: true,
      uppercase: true
    },
    dimensione: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['elaborato', 'in_elaborazione', 'in_attesa', 'rifiutato'],
      default: 'in_elaborazione'
    },
    protocollo: {
      type: String,
      trim: true
    },
    importo: {
      type: String,
      trim: true
    },
    anno: {
      type: String,
      required: true
    },
    dataCaricamento: {
      type: Date,
      default: Date.now
    },
    dataModifica: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      trim: true
    },
    cronologia: [
      {
        data: {
          type: Date,
          default: Date.now
        },
        azione: {
          type: String,
          required: true
        },
        utente: {
          type: String,
          required: true
        }
      }
    ],
    deleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
)

// Indici composti per query efficienti
DocumentSchema.index({ userId: 1, categoria: 1, deleted: 1 })
DocumentSchema.index({ userId: 1, anno: 1, deleted: 1 })
DocumentSchema.index({ clientId: 1, categoria: 1, deleted: 1 })
DocumentSchema.index({ status: 1, deleted: 1 })

// Middleware per aggiornare dataModifica
DocumentSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.dataModifica = new Date()
  }
  next()
})

export default mongoose.model<IDocument>('Document', DocumentSchema)
