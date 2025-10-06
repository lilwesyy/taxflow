import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'

// Load .env from backend directory FIRST
dotenv.config({ path: path.join(__dirname, '..', '.env') })

import connectDB from './config/database'
import authRoutes from './routes/auth'
import userRoutes from './routes/user'
import securityRoutes from './routes/security'
import chatRoutes from './routes/chat'
import aiAssistantRoutes from './routes/ai-assistant'
import clientsRoutes from './routes/clients'
import feedbackRoutes from './routes/feedback'
import stripeRoutes from './routes/stripe'
import documentsRoutes from './routes/documents'
import { startSessionCleanupJob } from './jobs/sessionCleanup'

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://backend-production-3061.up.railway.app',
    'https://taxflow-loyjstpx6-mircos-projects-0bb30613.vercel.app',
    'https://taxflow.it',
    'https://www.taxflow.it'
  ],
  credentials: true
}))

// Stripe webhook needs raw body - must be before express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }))

app.use(express.json())

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/security', securityRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/ai', aiAssistantRoutes)
app.use('/api/clients', clientsRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/stripe', stripeRoutes)
app.use('/api/documents', documentsRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'TaxFlow API',
    version: '1.0.0'
  })
})

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`)
  })

  // Start scheduled jobs
  startSessionCleanupJob()
}).catch((error) => {
  console.error('Failed to connect to MongoDB:', error)
  process.exit(1)
})