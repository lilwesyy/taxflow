import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'path'

// Load .env from backend directory FIRST
dotenv.config({ path: path.join(__dirname, '..', '.env') })

// Check required environment variables
const checkEnvVariables = () => {
  const required = ['MONGODB_URI', 'JWT_SECRET']
  const optional = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'FRONTEND_URL', 'FATTURA_ELETTRONICA_API_KEY']

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

  // Check Fattura Elettronica API configuration
  if (!process.env.FATTURA_ELETTRONICA_API_KEY || process.env.FATTURA_ELETTRONICA_API_KEY === 'your_api_key_here') {
    warnings.push('⚠️  FATTURA_ELETTRONICA_API_KEY not configured properly.')
    warnings.push('   Electronic invoicing features will not work.')
    warnings.push('   Get your API key from: https://www.fattura-elettronica-api.it')
  } else {
    const mode = process.env.FATTURA_ELETTRONICA_API_MODE || 'test'
    console.log(`✅ Fattura Elettronica API configured (${mode} mode)`)
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
import businessClientsRoutes from './routes/business-clients'
import feedbackRoutes from './routes/feedback'
import stripeRoutes from './routes/stripe'
import documentsRoutes from './routes/documents'
import servicesRoutes from './routes/services'
import invoicesRoutes from './routes/invoices'
import arubaRoutes from './routes/aruba'
import fatturaElettronicaRoutes from './routes/fatturaelettronica'
import businessPlanRoutes from './routes/business-plan'
import { startSessionCleanupJob } from './jobs/sessionCleanup'

const app = express()
const PORT = process.env.PORT || 3000

// Security Middleware - Helmet (must be early in middleware chain)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}))

// CORS Configuration - Dynamic origin validation
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'https://taxflow.it',
  'https://www.taxflow.it'
]

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.warn(`⚠️  CORS blocked request from origin: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  maxAge: 86400 // Cache preflight for 24h
}))

// Stripe webhook needs raw body - must be before express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }))

app.use(express.json())

// Rate Limiting
// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP per window
  message: { error: 'Troppi tentativi, riprova più tardi' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Strict limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP per window
  skipSuccessfulRequests: true, // Don't count successful requests
  message: { error: 'Troppi tentativi di autenticazione, riprova tra 15 minuti' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Apply rate limiters
app.use('/api/', apiLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
app.use('/api/auth/forgot-password', authLimiter)
app.use('/api/auth/reset-password', authLimiter)

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/security', securityRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/ai', aiAssistantRoutes)
app.use('/api/clients', clientsRoutes)
app.use('/api/business-clients', businessClientsRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/stripe', stripeRoutes)
app.use('/api/documents', documentsRoutes)
app.use('/api/services', servicesRoutes)
app.use('/api/invoices', invoicesRoutes)
app.use('/api/aruba', arubaRoutes)
app.use('/api/fatturaelettronica', fatturaElettronicaRoutes)
app.use('/api/business-plan', businessPlanRoutes)

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