import { Router, Response } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { validateObjectId } from '../middleware/validateObjectId'
import { passwordSchema } from '../validators/auth'

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
        city: user.city,
        cap: user.cap,
        fiscalCode: user.fiscalCode,
        registrationNumber: user.registrationNumber,
        company: user.company,
        piva: user.piva,
        codiceAteco: user.codiceAteco,
        settoreAttivita: user.settoreAttivita,
        regimeContabile: user.regimeContabile,
        aliquotaIva: user.aliquotaIva,
        fatturato: user.fatturato,
        status: user.status,
        notificationSettings: user.notificationSettings || {
          emailNewClient: true,
          emailNewRequest: true,
          emailPayment: false,
          pushNotifications: true,
          weeklyReport: true
        },
        pivaRequestData: user.pivaRequestData,
        pivaFormSubmitted: user.pivaFormSubmitted,
        pivaApprovalStatus: user.pivaApprovalStatus,
        registrationApprovalStatus: user.registrationApprovalStatus,
        // Subscription fields
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        selectedPlan: user.selectedPlan,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionCurrentPeriodStart: user.subscriptionCurrentPeriodStart,
        subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
        subscriptionCancelAtPeriodEnd: user.subscriptionCancelAtPeriodEnd,
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

    const { name, email, phone, professionalRole, bio, address, city, cap, fiscalCode, registrationNumber, currentPassword, newPassword, notificationSettings, pivaRequestData, pivaFormSubmitted, pivaApprovalStatus, company, piva, codiceAteco, settoreAttivita, regimeContabile, aliquotaIva } = req.body

    // Validation
    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ error: 'Il nome è obbligatorio' })
    }

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Email non valida' })
      }
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } })
      if (existingUser) {
        return res.status(400).json({ error: 'Email già in uso' })
      }
    }

    if (phone !== undefined && phone) {
      const phoneRegex = /^(\+39)?[ ]?[0-9]{9,10}$/
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        return res.status(400).json({ error: 'Numero di telefono non valido' })
      }
    }

    if (fiscalCode !== undefined && fiscalCode) {
      const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/
      if (!cfRegex.test(fiscalCode.toUpperCase())) {
        return res.status(400).json({ error: 'Codice fiscale non valido' })
      }
    }

    if (piva !== undefined && piva) {
      const pivaRegex = /^(IT)?[0-9]{11}$/
      if (!pivaRegex.test(piva.replace(/\s/g, ''))) {
        return res.status(400).json({ error: 'Partita IVA non valida' })
      }
    }

    if (cap !== undefined && cap) {
      const capRegex = /^[0-9]{5}$/
      if (!capRegex.test(cap)) {
        return res.status(400).json({ error: 'CAP non valido' })
      }
    }

    if (codiceAteco !== undefined && codiceAteco) {
      const atecoRegex = /^[0-9]{2}\.[0-9]{2}\.[0-9]{2}$/
      if (!atecoRegex.test(codiceAteco)) {
        return res.status(400).json({ error: 'Codice ATECO non valido (formato: XX.XX.XX)' })
      }
    }

    // Update basic fields
    if (name !== undefined) user.name = name.trim()
    if (email !== undefined) user.email = email.trim().toLowerCase()
    if (phone !== undefined) user.phone = phone?.trim() || undefined
    if (professionalRole !== undefined) user.professionalRole = professionalRole?.trim() || undefined
    if (bio !== undefined) user.bio = bio?.trim() || undefined
    if (address !== undefined) user.address = address?.trim() || undefined
    if (city !== undefined) user.city = city?.trim() || undefined
    if (cap !== undefined) user.cap = cap?.trim() || undefined
    if (fiscalCode !== undefined) user.fiscalCode = fiscalCode?.trim().toUpperCase() || undefined
    if (registrationNumber !== undefined) user.registrationNumber = registrationNumber?.trim() || undefined
    if (company !== undefined) user.company = company?.trim() || undefined
    if (piva !== undefined) user.piva = piva?.trim() || undefined
    if (codiceAteco !== undefined) user.codiceAteco = codiceAteco?.trim() || undefined
    if (settoreAttivita !== undefined) user.settoreAttivita = settoreAttivita?.trim() || undefined
    if (regimeContabile !== undefined) user.regimeContabile = regimeContabile?.trim() || undefined
    if (aliquotaIva !== undefined) user.aliquotaIva = aliquotaIva?.trim() || undefined

    // Update notification settings
    if (notificationSettings !== undefined) {
      user.set('notificationSettings', notificationSettings)
      user.markModified('notificationSettings')
    }

    // Update P.IVA related fields
    if (pivaRequestData !== undefined) {
      user.set('pivaRequestData', pivaRequestData)
      user.markModified('pivaRequestData')
    }
    if (pivaFormSubmitted !== undefined) {
      user.pivaFormSubmitted = pivaFormSubmitted
    }
    if (pivaApprovalStatus !== undefined) {
      user.pivaApprovalStatus = pivaApprovalStatus
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

      // Validate new password with Zod schema
      const passwordValidation = passwordSchema.safeParse(newPassword)
      if (!passwordValidation.success) {
        const errors = passwordValidation.error.issues.map((e: any) => e.message).join(', ')
        return res.status(400).json({ error: errors })
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
        city: savedUser.city,
        cap: savedUser.cap,
        fiscalCode: savedUser.fiscalCode,
        registrationNumber: savedUser.registrationNumber,
        company: savedUser.company,
        piva: savedUser.piva,
        codiceAteco: savedUser.codiceAteco,
        settoreAttivita: savedUser.settoreAttivita,
        regimeContabile: savedUser.regimeContabile,
        aliquotaIva: savedUser.aliquotaIva,
        fatturato: savedUser.fatturato,
        status: savedUser.status,
        notificationSettings: savedUser.notificationSettings,
        pivaRequestData: savedUser.pivaRequestData,
        pivaFormSubmitted: savedUser.pivaFormSubmitted,
        pivaApprovalStatus: savedUser.pivaApprovalStatus,
        registrationApprovalStatus: savedUser.registrationApprovalStatus,
        updatedAt: savedUser.updatedAt
      }
    })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Get pending registration approvals (admin only)
router.get('/pending-registrations', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorizzato' })
    }

    const pendingUsers = await User.find({
      registrationApprovalStatus: 'pending',
      role: 'business'
    }).select('-password').sort({ createdAt: -1 })

    res.json({
      success: true,
      users: pendingUsers
    })
  } catch (error) {
    console.error('Get pending registrations error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Approve/reject registration (admin only)
router.post('/pending-registrations/:userId/approve', authMiddleware, validateObjectId('userId'), async (req: AuthRequest, res: Response) => {
  try {
    const adminUser = await User.findById(req.userId)
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorizzato' })
    }

    const { approved, note } = req.body
    const targetUser = await User.findById(req.params.userId)

    if (!targetUser) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    targetUser.registrationApprovalStatus = approved ? 'approved' : 'rejected'
    if (note) {
      targetUser.note = note
    }

    await targetUser.save()

    res.json({
      success: true,
      message: approved ? 'Registrazione approvata. L\'utente può ora effettuare il login.' : 'Registrazione respinta',
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        registrationApprovalStatus: targetUser.registrationApprovalStatus
      }
    })
  } catch (error) {
    console.error('Approve registration error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Get pending P.IVA requests (admin only) - only users who submitted the form
router.get('/piva-requests', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorizzato' })
    }

    const pendingUsers = await User.find({
      pivaFormSubmitted: true,
      pivaApprovalStatus: { $in: ['pending', null] },
      role: 'business'
    }).select('-password').sort({ updatedAt: -1 })

    res.json({
      success: true,
      requests: pendingUsers
    })
  } catch (error) {
    console.error('Get P.IVA requests error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Approve/reject P.IVA request (admin only)
router.post('/piva-requests/:userId/approve', authMiddleware, validateObjectId('userId'), async (req: AuthRequest, res: Response) => {
  try {
    const adminUser = await User.findById(req.userId)
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorizzato' })
    }

    const { approved, note } = req.body
    const targetUser = await User.findById(req.params.userId)

    if (!targetUser) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    targetUser.pivaApprovalStatus = approved ? 'approved' : 'rejected'
    if (note) {
      targetUser.note = note
    }

    // If approved, copy data from pivaRequestData to main user fields
    if (approved && targetUser.pivaRequestData) {
      const pivaData = targetUser.pivaRequestData as any

      // Update main user fields from P.IVA request data
      if (pivaData.fiscalCode) targetUser.fiscalCode = pivaData.fiscalCode
      if (pivaData.residenceAddress) {
        // Combine full address
        targetUser.address = `${pivaData.residenceAddress}, ${pivaData.residenceCity} ${pivaData.residenceCAP} (${pivaData.residenceProvince})`
      }
      if (pivaData.codiceAteco) targetUser.codiceAteco = pivaData.codiceAteco
      if (pivaData.businessName) targetUser.company = pivaData.businessName
      if (pivaData.existingPivaNumber) targetUser.piva = pivaData.existingPivaNumber

      // Set status to pending payment - user needs to choose plan and pay
      targetUser.status = 'pending_payment'
      targetUser.subscriptionStatus = 'pending_payment'
    }

    await targetUser.save()

    res.json({
      success: true,
      message: approved ? 'Richiesta P.IVA approvata. L\'utente ha ora accesso completo.' : 'Richiesta P.IVA respinta',
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        pivaApprovalStatus: targetUser.pivaApprovalStatus
      }
    })
  } catch (error) {
    console.error('Approve P.IVA request error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

export default router