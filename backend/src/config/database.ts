import mongoose from 'mongoose'

const MAX_RETRIES = 5
const RETRY_DELAY_MS = 3000

interface ConnectionOptions {
  maxRetries?: number
  retryDelay?: number
}

export const connectDB = async (options: ConnectionOptions = {}) => {
  const MONGODB_URI = process.env.MONGODB_URI

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined')
  }

  const maxRetries = options.maxRetries ?? MAX_RETRIES
  const retryDelay = options.retryDelay ?? RETRY_DELAY_MS

  // Configure connection options with pooling
  const connectionOptions: mongoose.ConnectOptions = {
    maxPoolSize: 10, // Maximum number of connections in the pool
    minPoolSize: 2,  // Minimum number of connections in the pool
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    serverSelectionTimeoutMS: 5000, // Timeout for server selection
    heartbeatFrequencyMS: 10000, // Heartbeat every 10 seconds
  }

  let retries = 0

  while (retries < maxRetries) {
    try {
      await mongoose.connect(MONGODB_URI, connectionOptions)
      console.log('✅ Connected to MongoDB with connection pooling')

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error)
      })

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected')
      })

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected')
      })

      return
    } catch (error) {
      retries++
      console.error(
        `❌ MongoDB connection error (attempt ${retries}/${maxRetries}):`,
        error instanceof Error ? error.message : error
      )

      if (retries >= maxRetries) {
        console.error('❌ Max retries reached. Exiting...')
        process.exit(1)
      }

      console.log(`⏳ Retrying in ${retryDelay / 1000} seconds...`)
      await new Promise(resolve => setTimeout(resolve, retryDelay))
    }
  }
}

/**
 * Check if database is connected
 */
export const isConnected = (): boolean => {
  return mongoose.connection.readyState === 1
}

/**
 * Gracefully close database connection
 */
export const closeDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close()
    console.log('✅ MongoDB connection closed')
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error)
    throw error
  }
}

export default connectDB