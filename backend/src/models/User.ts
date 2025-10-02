import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

interface ActivityLog {
  date: Date
  action: string
  detail: string
}

interface IUser extends mongoose.Document {
  email: string
  password: string
  name: string
  role: 'business' | 'admin'
  phone?: string
  professionalRole?: string
  bio?: string
  address?: string
  fiscalCode?: string
  registrationNumber?: string

  // Business/Tax related fields
  company?: string
  piva?: string
  codiceAteco?: string
  regimeContabile?: 'Forfettario' | 'Ordinario' | 'Semplificato'
  aliquotaIva?: string
  fatturato?: number
  status?: 'active' | 'pending' | 'new' | 'inactive'
  pendingRequests?: number
  consulenze?: number
  fatturePagate?: number
  fattureInAttesa?: number
  documentiForniti?: number
  prossimaTasse?: Date
  note?: string
  attivitaRecenti?: ActivityLog[]
  ultimaAttivita?: Date

  notificationSettings?: {
    emailNewClient: boolean
    emailNewRequest: boolean
    emailPayment: boolean
    pushNotifications: boolean
    weeklyReport: boolean
  }
  securitySettings?: {
    sessionTimeout: number // in minutes, default 30 days (43200 minutes)
  }
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['business', 'admin'], default: 'business' },
  phone: { type: String },
  professionalRole: { type: String },
  bio: { type: String },
  address: { type: String },
  fiscalCode: { type: String },
  registrationNumber: { type: String },

  // Business/Tax related fields
  company: { type: String },
  piva: { type: String },
  codiceAteco: { type: String },
  regimeContabile: { type: String, enum: ['Forfettario', 'Ordinario', 'Semplificato'], default: 'Forfettario' },
  aliquotaIva: { type: String, default: '5%' },
  fatturato: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'pending', 'new', 'inactive'], default: 'new' },
  pendingRequests: { type: Number, default: 0 },
  consulenze: { type: Number, default: 0 },
  fatturePagate: { type: Number, default: 0 },
  fattureInAttesa: { type: Number, default: 0 },
  documentiForniti: { type: Number, default: 0 },
  prossimaTasse: { type: Date },
  note: { type: String },
  attivitaRecenti: [{
    date: { type: Date, default: Date.now },
    action: String,
    detail: String
  }],
  ultimaAttivita: { type: Date, default: Date.now },

  notificationSettings: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      emailNewClient: true,
      emailNewRequest: true,
      emailPayment: false,
      pushNotifications: true,
      weeklyReport: true
    }
  },
  securitySettings: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      sessionTimeout: 43200 // 30 giorni in minuti
    }
  },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String }
}, { timestamps: true, strict: false })

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model<IUser>('User', UserSchema)