import mongoose from 'mongoose'

interface ISession extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  token: string
  userAgent: string
  browser: string
  os: string
  device: string
  ip: string
  location: string
  lastActivity: Date
  createdAt: Date
  updatedAt: Date
}

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  userAgent: { type: String, required: true },
  browser: { type: String },
  os: { type: String },
  device: { type: String },
  ip: { type: String },
  location: { type: String, default: 'Unknown' },
  lastActivity: { type: Date, default: Date.now }
}, { timestamps: true })

// Indice per velocizzare le query
SessionSchema.index({ userId: 1, lastActivity: -1 })
SessionSchema.index({ token: 1 }, { unique: true })

// TTL index per eliminare automaticamente le sessioni dopo 30 giorni di inattività
SessionSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 })

export default mongoose.model<ISession>('Session', SessionSchema)