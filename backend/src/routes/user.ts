import { Router, Response } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        professionalRole: user.professionalRole,
        bio: user.bio,
        address: user.address,
        fiscalCode: user.fiscalCode,
        registrationNumber: user.registrationNumber,
        notificationSettings: user.notificationSettings || {
          emailNewClient: true,
          emailNewRequest: true,
          emailPayment: false,
          pushNotifications: true,
          weeklyReport: true
        },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Update user
router.put('/update', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    const { name, email, phone, professionalRole, bio, address, fiscalCode, registrationNumber, currentPassword, newPassword, notificationSettings } = req.body

    // Update basic fields
    if (name !== undefined) user.name = name.trim()
    if (email !== undefined) user.email = email.trim().toLowerCase()
    if (phone !== undefined) user.phone = phone?.trim() || undefined
    if (professionalRole !== undefined) user.professionalRole = professionalRole?.trim() || undefined
    if (bio !== undefined) user.bio = bio?.trim() || undefined
    if (address !== undefined) user.address = address?.trim() || undefined
    if (fiscalCode !== undefined) user.fiscalCode = fiscalCode?.trim().toUpperCase() || undefined
    if (registrationNumber !== undefined) user.registrationNumber = registrationNumber?.trim() || undefined

    // Update notification settings
    if (notificationSettings !== undefined) {
      user.set('notificationSettings', notificationSettings)
      user.markModified('notificationSettings')
    }

    // Update password
    if (newPassword !== undefined) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'La password attuale è richiesta per cambiarla' })
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'La password attuale non è corretta' })
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'La nuova password deve essere di almeno 8 caratteri' })
      }

      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(newPassword, salt)
    }

    await user.save()

    const savedUser = await User.findById(user._id).select('-password')

    if (!savedUser) {
      return res.status(404).json({ error: 'Utente non trovato dopo il salvataggio' })
    }

    res.json({
      success: true,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        name: savedUser.name,
        role: savedUser.role,
        phone: savedUser.phone,
        professionalRole: savedUser.professionalRole,
        bio: savedUser.bio,
        address: savedUser.address,
        fiscalCode: savedUser.fiscalCode,
        registrationNumber: savedUser.registrationNumber,
        notificationSettings: savedUser.notificationSettings,
        updatedAt: savedUser.updatedAt
      }
    })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

export default router