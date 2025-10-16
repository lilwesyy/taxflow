import mongoose, { Schema, Document } from 'mongoose'

export interface IClient extends Document {
  userId: mongoose.Types.ObjectId  // Reference to the business user who owns this client

  // Dati anagrafici
  ragioneSociale: string  // Company name or personal name
  partitaIva?: string     // VAT number (optional for privati)
  codiceFiscale: string   // Fiscal code (required)

  // Indirizzo
  indirizzo: string
  cap: string
  comune: string
  provincia: string
  nazione: string

  // Contatti
  email?: string
  telefono?: string
  pec?: string

  // Fatturazione elettronica
  codiceDestinatario?: string  // SDI Code (7 characters, default "0000000")

  // Metadata
  note?: string
  createdAt: Date
  updatedAt: Date
}

const ClientSchema = new Schema<IClient>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // Dati anagrafici
    ragioneSociale: {
      type: String,
      required: true,
      trim: true
    },
    partitaIva: {
      type: String,
      trim: true,
      sparse: true  // Allow multiple null values
    },
    codiceFiscale: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    // Indirizzo
    indirizzo: {
      type: String,
      required: true,
      trim: true
    },
    cap: {
      type: String,
      required: true,
      trim: true
    },
    comune: {
      type: String,
      required: true,
      trim: true
    },
    provincia: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 2
    },
    nazione: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      default: 'IT'
    },

    // Contatti
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    telefono: {
      type: String,
      trim: true
    },
    pec: {
      type: String,
      trim: true,
      lowercase: true
    },

    // Fatturazione elettronica
    codiceDestinatario: {
      type: String,
      trim: true,
      uppercase: true,
      default: '0000000',
      maxlength: 7
    },

    // Metadata
    note: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
)

// Compound index for user + client name (for faster queries and uniqueness per user)
ClientSchema.index({ userId: 1, ragioneSociale: 1 })

// Index for searching
ClientSchema.index({ userId: 1, partitaIva: 1 })
ClientSchema.index({ userId: 1, codiceFiscale: 1 })

const Client = mongoose.model<IClient>('Client', ClientSchema)

export default Client
