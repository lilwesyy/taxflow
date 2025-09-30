import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

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
  notificationSettings?: {
    emailNewClient: boolean
    emailNewRequest: boolean
    emailPayment: boolean
    pushNotifications: boolean
    weeklyReport: boolean
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