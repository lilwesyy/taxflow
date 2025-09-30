import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/database'
import authRoutes from './routes/auth'
import userRoutes from './routes/user'
import securityRoutes from './routes/security'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://backend-production-3061.up.railway.app',
    // TODO: Aggiungi qui il tuo dominio Vercel dopo il deploy
    // 'https://your-app.vercel.app'
  ],
  credentials: true
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/security', securityRoutes)

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
}).catch((error) => {
  console.error('Failed to connect to MongoDB:', error)
  process.exit(1)
})