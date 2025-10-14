import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'

/**
 * Middleware to validate MongoDB ObjectId parameters
 * Prevents NoSQL injection attacks via invalid ObjectIds
 * 
 * @param paramName - The name of the parameter to validate (default: 'id')
 */
export const validateObjectId = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName]
    
    if (!id) {
      return res.status(400).json({ error: 'ID parametro mancante' })
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID non valido' })
    }
    
    next()
  }
}

/**
 * Middleware to validate multiple ObjectId parameters
 * 
 * @param paramNames - Array of parameter names to validate
 */
export const validateObjectIds = (...paramNames: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const paramName of paramNames) {
      const id = req.params[paramName]
      
      if (id && !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: `${paramName} non valido` })
      }
    }
    
    next()
  }
}
