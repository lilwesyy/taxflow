import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import Session from '../models/Session'
import User from '../models/User'

export interface AuthRequest extends Request {
  userId?: string
  user?: {
    userId: string
    role: 'business' | 'admin'
  }
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token non fornito' })
    }

    const token = authHeader.substring(7)
    const JWT_SECRET = process.env.JWT_SECRET

    if (!JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET is not defined in environment variables')
      return res.status(500).json({ error: 'Errore di configurazione del server' })
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: 'business' | 'admin' }
      req.userId = decoded.userId
      req.user = {
        userId: decoded.userId,
        role: decoded.role
      }

      // Update session last activity
      try {
        await Session.findOneAndUpdate(
          { token },
          { lastActivity: new Date() }
        )
      } catch (error) {
        console.error('Error updating session:', error)
        // Non blocchiamo la richiesta se fallisce l'aggiornamento della sessione
      }

      next()
    } catch (error) {
      return res.status(401).json({ error: 'Token non valido o scaduto' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Errore interno del server' })
  }
}

export const authenticateToken = authMiddleware

// Middleware to check if user is admin
export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId)
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Accesso negato. Solo gli admin possono accedere a questa risorsa.' })
    }
    next()
  } catch (error) {
    console.error('Admin middleware error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
}