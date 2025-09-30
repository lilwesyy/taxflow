import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import Session from '../models/Session'

export interface AuthRequest extends Request {
  userId?: string
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token non fornito' })
    }

    const token = authHeader.substring(7)
    const JWT_SECRET = process.env.JWT_SECRET || 'taxflow_jwt_secret_key_2024'

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      req.userId = decoded.userId

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