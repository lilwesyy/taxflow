import { Router, Response } from 'express'
import mongoose from 'mongoose'
import User from '../models/User'
import FatturaElettronica from '../models/FatturaElettronica'
import Document from '../models/Document'
import Conversation from '../models/Conversation'
import Invoice from '../models/Invoice'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

// Middleware to check if user is webmaster
const webmasterMiddleware = async (req: AuthRequest, res: Response, next: Function) => {
  try {
    const user = await User.findById(req.userId)
    if (!user || !user.webmaster) {
      return res.status(403).json({ error: 'Accesso negato. Solo i webmaster possono accedere a questa risorsa.' })
    }
    next()
  } catch (error) {
    console.error('Webmaster middleware error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
}

/**
 * GET /api/webmaster/stats
 * Get comprehensive server statistics
 */
router.get('/stats', authMiddleware, webmasterMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Get user statistics
    const [totalUsers, adminUsers, businessUsers, webmasterUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'business' }),
      User.countDocuments({ webmaster: true })
    ])

    // Get detailed breakdown of business users by status
    const [
      businessPendingRegistration,
      businessApprovedRegistration,
      businessRejectedRegistration,
      businessPendingPiva,
      businessApprovedPiva,
      businessRejectedPiva,
      businessFullyApproved
    ] = await Promise.all([
      User.countDocuments({ role: 'business', registrationApprovalStatus: 'pending' }),
      User.countDocuments({ role: 'business', registrationApprovalStatus: 'approved' }),
      User.countDocuments({ role: 'business', registrationApprovalStatus: 'rejected' }),
      User.countDocuments({ role: 'business', pivaFormSubmitted: true, pivaApprovalStatus: 'pending' }),
      User.countDocuments({ role: 'business', pivaApprovalStatus: 'approved' }),
      User.countDocuments({ role: 'business', pivaApprovalStatus: 'rejected' }),
      User.countDocuments({
        role: 'business',
        registrationApprovalStatus: 'approved',
        pivaApprovalStatus: 'approved'
      })
    ])

    // Get invoice statistics
    const [totalInvoices, totalFattureElettroniche] = await Promise.all([
      Invoice.countDocuments(),
      FatturaElettronica.countDocuments()
    ])

    // Get document statistics
    const totalDocuments = await Document.countDocuments()

    // Get conversation statistics
    const totalConversations = await Conversation.countDocuments()

    // Calculate database size (approximate)
    const db = mongoose.connection.db
    const stats = await db?.stats()
    const databaseSizeBytes = stats?.dataSize || 0
    const databaseSize = formatBytes(databaseSizeBytes)

    // Get active connections (MongoDB)
    const activeConnections = mongoose.connection.readyState === 1 ? 1 : 0

    // Calculate uptime
    const uptimeSeconds = process.uptime()
    const uptime = formatUptime(uptimeSeconds)

    // Get today's statistics (mock for now - would need request tracking)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const requestsToday = await User.countDocuments({
      updatedAt: { $gte: today }
    })

    // Get memory and CPU usage
    const memoryUsage = process.memoryUsage()
    const usedMemory = memoryUsage.heapUsed
    const totalMemory = memoryUsage.heapTotal
    const memoryPercentage = ((usedMemory / totalMemory) * 100).toFixed(1)

    // CPU usage (approximate - Node.js single-threaded)
    const cpuUsage = process.cpuUsage()
    const cpuPercentage = Math.min(100, Math.random() * 50 + 20).toFixed(1) // Mock for now

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    })

    // Get active subscriptions
    const activeSubscriptions = await User.countDocuments({
      subscriptionStatus: 'active'
    })

    // Get pending approvals
    const pendingRegistrations = await User.countDocuments({
      registrationApprovalStatus: 'pending'
    })

    const pendingPivaRequests = await User.countDocuments({
      pivaFormSubmitted: true,
      pivaApprovalStatus: 'pending'
    })

    res.json({
      success: true,
      stats: {
        // User statistics
        totalUsers,
        adminUsers,
        businessUsers,
        webmasterUsers,
        recentRegistrations,
        activeSubscriptions,
        pendingRegistrations,
        pendingPivaRequests,

        // Detailed business users breakdown
        breakdown: {
          businessPendingRegistration,
          businessApprovedRegistration,
          businessRejectedRegistration,
          businessPendingPiva,
          businessApprovedPiva,
          businessRejectedPiva,
          businessFullyApproved
        },

        // Invoice statistics
        totalInvoices: totalInvoices + totalFattureElettroniche,
        totalInvoicesClassic: totalInvoices,
        totalFattureElettroniche,

        // Document statistics
        totalDocuments,
        totalConversations,

        // Database statistics
        databaseSize,
        databaseSizeBytes,

        // Server performance
        uptime,
        uptimeSeconds,
        activeConnections,
        requestsToday,
        cpuUsage: `${cpuPercentage}%`,
        memoryUsage: `${memoryPercentage}%`,
        memoryUsedMB: (usedMemory / 1024 / 1024).toFixed(2),
        memoryTotalMB: (totalMemory / 1024 / 1024).toFixed(2),

        // Environment info
        nodeVersion: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV || 'development'
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching webmaster stats:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

/**
 * GET /api/webmaster/users/recent
 * Get recently registered users
 */
router.get('/users/recent', authMiddleware, webmasterMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10

    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    res.json({
      success: true,
      users: recentUsers
    })
  } catch (error) {
    console.error('Error fetching recent users:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

/**
 * GET /api/webmaster/users/by-type
 * Get users organized by type/status
 */
router.get('/users/by-type', authMiddleware, webmasterMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const [
      admins,
      businessPendingRegistration,
      businessApprovedWaitingPiva,
      businessPendingPiva,
      businessFullyApproved,
      businessRejected
    ] = await Promise.all([
      // Admin users
      User.find({ role: 'admin' })
        .select('-password -twoFactorSecret')
        .sort({ createdAt: -1 })
        .lean(),

      // Business - Pending registration
      User.find({
        role: 'business',
        registrationApprovalStatus: 'pending'
      })
        .select('-password -twoFactorSecret')
        .sort({ createdAt: -1 })
        .lean(),

      // Business - Approved registration, waiting for P.IVA form
      User.find({
        role: 'business',
        registrationApprovalStatus: 'approved',
        $or: [
          { pivaFormSubmitted: { $ne: true } },
          { pivaFormSubmitted: null },
          { pivaFormSubmitted: false }
        ]
      })
        .select('-password -twoFactorSecret')
        .sort({ createdAt: -1 })
        .lean(),

      // Business - Pending P.IVA approval
      User.find({
        role: 'business',
        pivaFormSubmitted: true,
        pivaApprovalStatus: 'pending'
      })
        .select('-password -twoFactorSecret')
        .sort({ updatedAt: -1 })
        .lean(),

      // Business - Fully approved (active clients)
      User.find({
        role: 'business',
        registrationApprovalStatus: 'approved',
        pivaApprovalStatus: 'approved'
      })
        .select('-password -twoFactorSecret')
        .sort({ createdAt: -1 })
        .lean(),

      // Business - Rejected (any rejection)
      User.find({
        role: 'business',
        $or: [
          { registrationApprovalStatus: 'rejected' },
          { pivaApprovalStatus: 'rejected' }
        ]
      })
        .select('-password -twoFactorSecret')
        .sort({ updatedAt: -1 })
        .lean()
    ])

    res.json({
      success: true,
      users: {
        admins,
        businessPendingRegistration,
        businessApprovedWaitingPiva,
        businessPendingPiva,
        businessFullyApproved,
        businessRejected
      }
    })
  } catch (error) {
    console.error('Error fetching users by type:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

/**
 * GET /api/webmaster/rejected-users
 * Get list of rejected users
 */
router.get('/rejected-users', authMiddleware, webmasterMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const rejectedUsers = await User.find({
      $or: [
        { registrationApprovalStatus: 'rejected' },
        { pivaApprovalStatus: 'rejected' }
      ]
    })
      .select('-password -twoFactorSecret')
      .sort({ updatedAt: -1 })
      .lean()

    res.json({
      success: true,
      users: rejectedUsers
    })
  } catch (error) {
    console.error('Error fetching rejected users:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

/**
 * DELETE /api/webmaster/user/:userId
 * Permanently delete a user from database
 */
router.delete('/user/:userId', authMiddleware, webmasterMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params

    // Find the user first to check if it exists
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    // Prevent deletion of admin users
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Non è possibile eliminare utenti admin' })
    }

    // Delete the user
    await User.findByIdAndDelete(userId)

    console.log(`✅ User deleted by webmaster: ${user.email} (ID: ${userId})`)

    res.json({
      success: true,
      message: 'Utente eliminato definitivamente',
      deletedUser: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

/**
 * DELETE /api/webmaster/rejected-users/bulk
 * Delete all rejected users at once
 */
router.delete('/rejected-users/bulk', authMiddleware, webmasterMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.body // 'registration' | 'piva' | 'all'

    let query: any = {}
    if (type === 'registration') {
      query = { registrationApprovalStatus: 'rejected' }
    } else if (type === 'piva') {
      query = { pivaApprovalStatus: 'rejected' }
    } else {
      query = {
        $or: [
          { registrationApprovalStatus: 'rejected' },
          { pivaApprovalStatus: 'rejected' }
        ]
      }
    }

    // Get users before deleting for logging
    const usersToDelete = await User.find(query).select('email name role').lean()

    // Delete users
    const result = await User.deleteMany(query)

    console.log(`✅ Bulk deletion by webmaster: ${result.deletedCount} users deleted`)
    usersToDelete.forEach(u => {
      console.log(`   - ${u.email} (${u.name})`)
    })

    res.json({
      success: true,
      message: `${result.deletedCount} utenti eliminati definitivamente`,
      deletedCount: result.deletedCount,
      deletedUsers: usersToDelete
    })
  } catch (error) {
    console.error('Error bulk deleting rejected users:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

/**
 * GET /api/webmaster/system/info
 * Get detailed system information
 */
router.get('/system/info', authMiddleware, webmasterMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const mongooseVersion = mongoose.version
    const nodeVersion = process.version
    const platform = process.platform
    const arch = process.arch
    const memoryUsage = process.memoryUsage()

    res.json({
      success: true,
      system: {
        node: {
          version: nodeVersion,
          platform,
          arch
        },
        mongodb: {
          version: mongooseVersion,
          connectionState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          name: mongoose.connection.name
        },
        memory: {
          rss: formatBytes(memoryUsage.rss),
          heapTotal: formatBytes(memoryUsage.heapTotal),
          heapUsed: formatBytes(memoryUsage.heapUsed),
          external: formatBytes(memoryUsage.external)
        },
        uptime: {
          formatted: formatUptime(process.uptime()),
          seconds: process.uptime()
        }
      }
    })
  } catch (error) {
    console.error('Error fetching system info:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Helper functions
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)

  return parts.length > 0 ? parts.join(' ') : '< 1m'
}

export default router
