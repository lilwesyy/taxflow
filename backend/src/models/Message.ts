import mongoose from 'mongoose'

export interface IMessage extends mongoose.Document {
  conversationId: mongoose.Types.ObjectId
  senderId: mongoose.Types.ObjectId
  senderRole: 'business' | 'admin'
  testo?: string
  stato: 'sent' | 'delivered' | 'read'
  attachments?: {
    filename: string
    url: string
    mimeType: string
    size: number
  }[]
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderRole: {
    type: String,
    enum: ['business', 'admin'],
    required: true
  },
  testo: {
    type: String,
    required: false,
    maxlength: 5000
  },
  stato: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  attachments: [{
    filename: { type: String },
    url: { type: String },
    mimeType: { type: String },
    size: { type: Number }
  }]
}, { timestamps: true })

// Indexes for faster queries
MessageSchema.index({ conversationId: 1, createdAt: -1 })
MessageSchema.index({ senderId: 1 })

export default mongoose.model<IMessage>('Message', MessageSchema)
