import { Router, Response } from 'express'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import User from '../models/User'
import Session from '../models/Session'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

// Enable 2FA - Generate secret and QR code
router.post('/2fa/enable', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA è già attivato' })
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `TaxFlow (${user.email})`,
      length: 32
    })

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

    // Save secret temporarily (will be confirmed on verification)
    user.twoFactorSecret = secret.base32
    await user.save()

    res.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl
    })
  } catch (error) {
    console.error('Enable 2FA error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Verify 2FA code and complete activation
router.post('/2fa/verify', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ error: 'Codice di verifica richiesto' })
    }

    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    if (!user.twoFactorSecret) {
      return res.status(400).json({ error: '2FA non è stato inizializzato' })
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    })

    if (!verified) {
      return res.status(400).json({ error: 'Codice di verifica non valido' })
    }

    // Enable 2FA
    user.twoFactorEnabled = true
    await user.save()

    res.json({
      success: true,
      message: 'Autenticazione a due fattori attivata con successo'
    })
  } catch (error) {
    console.error('Verify 2FA error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Disable 2FA
router.post('/2fa/disable', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { password } = req.body

    if (!password) {
      return res.status(400).json({ error: 'Password richiesta per disattivare 2FA' })
    }

    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Password non corretta' })
    }

    // Disable 2FA
    user.twoFactorEnabled = false
    user.twoFactorSecret = undefined
    await user.save()

    res.json({
      success: true,
      message: 'Autenticazione a due fattori disattivata con successo'
    })
  } catch (error) {
    console.error('Disable 2FA error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Get 2FA status
router.get('/2fa/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' })
    }

    res.json({
      success: true,
      enabled: user.twoFactorEnabled
    })
  } catch (error) {
    console.error('Get 2FA status error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Get active sessions
router.get('/sessions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await Session.find({ userId: req.userId })
      .sort({ lastActivity: -1 })
      .lean()

    const currentToken = req.headers.authorization?.substring(7)

    const sessionsList = sessions.map(session => ({
      id: session._id,
      browser: session.browser,
      os: session.os,
      device: session.device,
      location: session.location,
      ip: session.ip,
      lastActivity: session.lastActivity,
      createdAt: session.createdAt,
      isCurrent: session.token === currentToken
    }))

    res.json({
      success: true,
      sessions: sessionsList
    })
  } catch (error) {
    console.error('Get sessions error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Terminate a specific session
router.delete('/sessions/:sessionId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params

    const session = await Session.findOne({
      _id: sessionId,
      userId: req.userId
    })

    if (!session) {
      return res.status(404).json({ error: 'Sessione non trovata' })
    }

    const currentToken = req.headers.authorization?.substring(7)
    if (session.token === currentToken) {
      return res.status(400).json({ error: 'Non puoi terminare la sessione corrente' })
    }

    await Session.deleteOne({ _id: sessionId })

    res.json({
      success: true,
      message: 'Sessione terminata con successo'
    })
  } catch (error) {
    console.error('Terminate session error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

// Terminate all other sessions
router.delete('/sessions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const currentToken = req.headers.authorization?.substring(7)

    await Session.deleteMany({
      userId: req.userId,
      token: { $ne: currentToken }
    })

    res.json({
      success: true,
      message: 'Tutte le altre sessioni sono state terminate'
    })
  } catch (error) {
    console.error('Terminate all sessions error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

export default router