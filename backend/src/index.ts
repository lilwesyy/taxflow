import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'

// Load .env from backend directory FIRST
dotenv.config({ path: path.join(__dirname, '..', '.env') })

// Check required environment variables
const checkEnvVariables = () => {
  const required = ['MONGODB_URI', 'JWT_SECRET']
  const optional = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'FRONTEND_URL']

  const missing: string[] = []
  const warnings: string[] = []

  // Check required variables
  required.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  })

  // Check optional variables (email configuration)
  const emailVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS']
  const missingEmailVars = emailVars.filter(varName => !process.env[varName])

  if (missingEmailVars.length > 0) {
    warnings.push(`⚠️  Email configuration incomplete. Missing: ${missingEmailVars.join(', ')}`)
    warnings.push('   Email features (password reset) will not work properly.')
  }

  if (!process.env.FRONTEND_URL) {
    warnings.push('⚠️  FRONTEND_URL not set. Using default: http://localhost:5173')
  }

  // Exit if required variables are missing
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach(varName => {
      console.error(`   - ${varName}`)
    })
    console.error('\nPlease set these variables in your .env file')
    process.exit(1)
  }

  // Show warnings for optional variables
  if (warnings.length > 0) {
    console.log('\n' + warnings.join('\n') + '\n')
  }

  console.log('✅ Environment variables validated')
}

checkEnvVariables()

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
import servicesRoutes from './routes/services'
import invoicesRoutes from './routes/invoices'
import arubaRoutes from './routes/aruba'
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
app.use('/api/services', servicesRoutes)
app.use('/api/invoices', invoicesRoutes)
app.use('/api/aruba', arubaRoutes)

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