import mongoose, { Schema, Document } from 'mongoose'

export interface INewsletter extends Document {
  email: string
  subscribedAt: Date
  notified: boolean
  notifiedAt: Date | null
}

const NewsletterSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  notified: {
    type: Boolean,
    default: false
  },
  notifiedAt: {
    type: Date,
    default: null
  }
})

export default mongoose.model<INewsletter>('Newsletter', NewsletterSchema)
