import cron from 'node-cron'
import User from '../models/User'
import Session from '../models/Session'

// Cleanup expired sessions for all users based on their individual timeout settings
export const cleanupExpiredSessions = async () => {
  try {
    console.log('🧹 Starting automatic session cleanup...')

    const users = await User.find({}).select('_id securitySettings')
    let totalDeleted = 0

    for (const user of users) {
      const timeoutMinutes = user.securitySettings?.sessionTimeout || 43200
      const expiryDate = new Date(Date.now() - timeoutMinutes * 60 * 1000)

      const result = await Session.deleteMany({
        userId: user._id,
        lastActivity: { $lt: expiryDate }
      })

      if (result.deletedCount > 0) {
        console.log(`  → Deleted ${result.deletedCount} expired sessions for user ${user._id}`)
        totalDeleted += result.deletedCount
      }
    }

    console.log(`✅ Session cleanup completed. Total deleted: ${totalDeleted}`)
  } catch (error) {
    console.error('❌ Session cleanup error:', error)
  }
}

// Schedule cleanup to run every hour
export const startSessionCleanupJob = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', () => {
    cleanupExpiredSessions()
  })

  console.log('⏰ Session cleanup job scheduled (runs every hour)')

  // Run once on startup
  setTimeout(() => {
    cleanupExpiredSessions()
  }, 5000) // Wait 5 seconds after startup
}
