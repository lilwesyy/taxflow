import express, { Request, Response } from 'express'
import Job from '../models/Job'
import { authenticateToken, isAdmin } from '../middleware/auth'

const router = express.Router()

// GET /api/jobs - Get all jobs (public endpoint, only active jobs)
router.get('/', async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 })
    res.json({ success: true, jobs })
  } catch (error: any) {
    console.error('Error fetching jobs:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/jobs/admin - Get all jobs for admin (includes inactive)
router.get('/admin', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 })
    res.json({ success: true, jobs })
  } catch (error: any) {
    console.error('Error fetching jobs for admin:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/jobs/:id - Get single job by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id)

    if (!job) {
      return res.status(404).json({ success: false, message: 'Annuncio non trovato' })
    }

    // Only return active jobs for public
    if (!job.isActive) {
      return res.status(404).json({ success: false, message: 'Annuncio non disponibile' })
    }

    res.json({ success: true, job })
  } catch (error: any) {
    console.error('Error fetching job:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// POST /api/jobs - Create new job (admin only)
router.post('/', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const { title, location, type, salary, description, requirements, responsibilities, benefits, isActive } = req.body

    // Validation
    if (!title || !location || !type || !description) {
      return res.status(400).json({
        success: false,
        message: 'Campi obbligatori mancanti: title, location, type, description'
      })
    }

    const job = new Job({
      title,
      location,
      type,
      salary: salary || '',
      description,
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      benefits: benefits || [],
      isActive: isActive !== undefined ? isActive : true
    })

    await job.save()

    res.status(201).json({ success: true, job })
  } catch (error: any) {
    console.error('Error creating job:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// PUT /api/jobs/:id - Update job (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const { title, location, type, salary, description, requirements, responsibilities, benefits, isActive } = req.body

    const updateData: any = { updatedAt: new Date() }

    if (title !== undefined) updateData.title = title
    if (location !== undefined) updateData.location = location
    if (type !== undefined) updateData.type = type
    if (salary !== undefined) updateData.salary = salary
    if (description !== undefined) updateData.description = description
    if (requirements !== undefined) updateData.requirements = requirements
    if (responsibilities !== undefined) updateData.responsibilities = responsibilities
    if (benefits !== undefined) updateData.benefits = benefits
    if (isActive !== undefined) updateData.isActive = isActive

    const job = await Job.findByIdAndUpdate(req.params.id, updateData, { new: true })

    if (!job) {
      return res.status(404).json({ success: false, message: 'Annuncio non trovato' })
    }

    res.json({ success: true, job })
  } catch (error: any) {
    console.error('Error updating job:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// DELETE /api/jobs/:id - Delete job (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id)

    if (!job) {
      return res.status(404).json({ success: false, message: 'Annuncio non trovato' })
    }

    res.json({ success: true, message: 'Annuncio eliminato con successo' })
  } catch (error: any) {
    console.error('Error deleting job:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
