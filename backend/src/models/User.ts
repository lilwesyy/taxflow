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
  city?: string
  cap?: string
  fiscalCode?: string
  registrationNumber?: string

  // Business/Tax related fields
  company?: string
  piva?: string
  codiceAteco?: string
  settoreAttivita?: string
  regimeContabile?: 'Forfettario' | 'Ordinario' | 'Semplificato'
  aliquotaIva?: string
  fatturato?: number
  status?: 'active' | 'pending' | 'new' | 'inactive' | 'rejected' | 'pending_payment'

  // Two-step approval process
  registrationApprovalStatus?: 'pending' | 'approved' | 'rejected'  // First approval: can login
  pivaFormSubmitted?: boolean  // Has submitted P.IVA form
  pivaApprovalStatus?: 'pending' | 'approved' | 'rejected'  // Second approval: full access

  // Stripe & Subscription
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  selectedPlan?: {
    id: string
    stripePriceId: string
    name: string
    price: number
    type: 'annual' | 'monthly'
    interval: 'year' | 'month'
  }
  subscriptionStatus?: 'pending_payment' | 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid'
  subscriptionCurrentPeriodStart?: Date
  subscriptionCurrentPeriodEnd?: Date
  subscriptionCancelAtPeriodEnd?: boolean

  // P.IVA Request Data
  pivaRequestData?: {
    // Dati Anagrafici
    firstName: string
    lastName: string
    dateOfBirth: string
    placeOfBirth: string
    fiscalCode: string
    residenceAddress: string
    residenceCity: string
    residenceCAP: string
    residenceProvince: string

    // Dati Attività
    businessActivity: string
    codiceAteco: string
    businessName?: string
    businessAddress?: string
    businessCity?: string
    businessCAP?: string
    businessProvince?: string

    // Regime Fiscale
    expectedRevenue: number
    hasOtherIncome: boolean
    otherIncomeDetails?: string

    // P.IVA esistente
    hasExistingPiva?: boolean
    existingPivaNumber?: string

    // Documenti
    hasIdentityDocument: boolean
    hasFiscalCode: boolean

    // Note aggiuntive
    additionalNotes?: string

    submittedAt: Date
  }
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
  city: { type: String },
  cap: { type: String },
  fiscalCode: { type: String },
  registrationNumber: { type: String },

  // Business/Tax related fields
  company: { type: String },
  piva: { type: String },
  codiceAteco: { type: String },
  settoreAttivita: { type: String },
  regimeContabile: { type: String, enum: ['Forfettario', 'Ordinario', 'Semplificato'], default: 'Forfettario' },
  aliquotaIva: { type: String, default: '5%' },
  fatturato: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'pending', 'new', 'inactive', 'pending_payment'], default: 'new' },

  // Two-step approval process
  registrationApprovalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  pivaFormSubmitted: { type: Boolean, default: false },
  pivaApprovalStatus: { type: String, enum: ['pending', 'approved', 'rejected'] },

  // Stripe & Subscription
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  selectedPlan: {
    id: String,
    stripePriceId: String,
    name: String,
    price: Number,
    type: { type: String, enum: ['annual', 'monthly'] },
    interval: { type: String, enum: ['year', 'month'] }
  },
  subscriptionStatus: {
    type: String,
    enum: ['pending_payment', 'active', 'past_due', 'canceled', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid']
  },
  subscriptionCurrentPeriodStart: { type: Date },
  subscriptionCurrentPeriodEnd: { type: Date },
  subscriptionCancelAtPeriodEnd: { type: Boolean, default: false },

  // P.IVA Request Data
  pivaRequestData: {
    hasExistingPiva: Boolean,
    existingPivaNumber: String,
    firstName: String,
    lastName: String,
    dateOfBirth: String,
    placeOfBirth: String,
    fiscalCode: String,
    residenceAddress: String,
    residenceCity: String,
    residenceCAP: String,
    residenceProvince: String,
    businessActivity: String,
    codiceAteco: String,
    businessName: String,
    businessAddress: String,
    businessCity: String,
    businessCAP: String,
    businessProvince: String,
    expectedRevenue: Number,
    hasOtherIncome: Boolean,
    otherIncomeDetails: String,
    hasIdentityDocument: Boolean,
    hasFiscalCode: Boolean,
    additionalNotes: String,
    submittedAt: Date
  },
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
  } catch (error) {
    next(error as Error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Indexes for faster queries
UserSchema.index({ email: 1 }, { unique: true })
UserSchema.index({ role: 1 })
UserSchema.index({ registrationApprovalStatus: 1 })
UserSchema.index({ pivaApprovalStatus: 1 })
UserSchema.index({ role: 1, registrationApprovalStatus: 1 }) // Compound index for admin queries
UserSchema.index({ stripeCustomerId: 1 })
UserSchema.index({ stripeSubscriptionId: 1 })

export default mongoose.model<IUser>('User', UserSchema)