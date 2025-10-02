import mongoose from 'mongoose'

export interface IFeedback extends mongoose.Document {
  clientId: mongoose.Types.ObjectId
  clientName: string
  clientCompany?: string
  consultantId?: mongoose.Types.ObjectId
  consultantName: string
  service: string
  rating: number // 1-5
  title: string
  message: string
  category: string
  recommend: boolean
  positiveAspects?: string
  suggestions?: string
  status: 'pending' | 'responded' | 'archived'
  response?: string
  responseDate?: Date
  respondedBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const FeedbackSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  clientCompany: {
    type: String
  },
  consultantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  consultantName: {
    type: String,
    required: true
  },
  service: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: [
      'Qualità Servizio',
      'Professionalità',
      'Tempestività',
      'Contenuto',
      'Innovazione',
      'Comunicazione'
    ],
    default: 'Qualità Servizio'
  },
  recommend: {
    type: Boolean,
    default: true
  },
  positiveAspects: {
    type: String
  },
  suggestions: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'responded', 'archived'],
    default: 'pending'
  },
  response: {
    type: String
  },
  responseDate: {
    type: Date
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true })

// Index per performance
FeedbackSchema.index({ clientId: 1, createdAt: -1 })
FeedbackSchema.index({ consultantId: 1, createdAt: -1 })
FeedbackSchema.index({ status: 1 })
FeedbackSchema.index({ rating: 1 })

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema)
