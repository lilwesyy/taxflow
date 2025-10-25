import mongoose, { Document, Schema } from 'mongoose'

export interface IJob extends Document {
  title: string
  location: string
  type: string // Full-time, Part-time, Contract, etc.
  salary?: string
  description: string
  requirements: string[]
  responsibilities: string[]
  benefits: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const JobSchema = new Schema<IJob>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Full-time', 'Part-time', 'Contratto', 'Stage', 'Freelance'],
    default: 'Full-time'
  },
  salary: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: [String],
    default: []
  },
  responsibilities: {
    type: [String],
    default: []
  },
  benefits: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Update the updatedAt field before saving
JobSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.model<IJob>('Job', JobSchema)
