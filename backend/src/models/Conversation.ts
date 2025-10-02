import mongoose from 'mongoose'

export interface IConversation extends mongoose.Document {
  businessUserId: mongoose.Types.ObjectId
  adminUserId?: mongoose.Types.ObjectId
  status: 'active' | 'pending' | 'scheduled' | 'completed'
  priority: 'low' | 'medium' | 'high'
  tipo: string
  argomento: string
  durataConsulenza?: string
  rating?: number
  fatturata: boolean
  importo: number
  lastMessageAt: Date
  createdAt: Date
  updatedAt: Date
}

const ConversationSchema = new mongoose.Schema({
  businessUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'scheduled', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  tipo: { type: String, required: true },
  argomento: { type: String, required: true },
  durataConsulenza: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  fatturata: { type: Boolean, default: false },
  importo: { type: Number, default: 0 },
  lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true })

// Index for faster queries
ConversationSchema.index({ businessUserId: 1, adminUserId: 1 })
ConversationSchema.index({ status: 1 })
ConversationSchema.index({ lastMessageAt: -1 })

export default mongoose.model<IConversation>('Conversation', ConversationSchema)
