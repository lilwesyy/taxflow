import { Router, Request, Response } from 'express'

const router = Router()

// Get application configuration (public endpoint)
router.get('/', async (req: Request, res: Response) => {
  try {
    const countdownMode = process.env.COUNTDOWN_MODE === 'true'
    const launchDate = process.env.LAUNCH_DATE || new Date().toISOString()

    res.json({
      success: true,
      countdownMode,
      launchDate
    })
  } catch (error) {
    console.error('Config error:', error)
    res.status(500).json({ error: 'Errore interno del server' })
  }
})

export default router
