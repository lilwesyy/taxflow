import { Router, Response } from 'express'
import mongoose from 'mongoose'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { validateObjectId } from '../middleware/validateObjectId'
import Expense from '../models/Expense'

const router = Router()

// GET /api/expenses - Get expenses (business: own expenses, admin: all or filtered by clientId)
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const userRole = req.user!.role
    const { categoria, stato, startDate, endDate, clientId } = req.query

    let query: mongoose.FilterQuery<typeof Expense> = {}

    if (userRole === 'business') {
      // Business users can only see their own expenses
      query.userId = userId
    } else if (userRole === 'admin') {
      // Admin can filter by clientId or see all
      if (clientId) {
        query.userId = clientId
      }
      // If no clientId, admin sees all expenses
    }

    // Apply filters
    if (categoria) query.categoria = categoria
    if (stato) query.stato = stato

    // Date range filter
    if (startDate || endDate) {
      query.data = {}
      if (startDate) query.data.$gte = startDate
      if (endDate) query.data.$lte = endDate
    }

    const expenses = await Expense.find(query)
      .populate('userId', 'name email company')
      .sort({ data: -1 })

    // Format expenses for frontend
    const formattedExpenses = expenses.map(exp => ({
      id: exp._id,
      descrizione: exp.descrizione,
      importo: exp.importo,
      data: exp.data,
      categoria: exp.categoria,
      stato: exp.stato,
      metodoPagamento: exp.metodoPagamento,
      ricorrente: exp.ricorrente,
      note: exp.note,
      documentoId: exp.documentoId,
      createdAt: exp.createdAt,
      updatedAt: exp.updatedAt,
      user: exp.userId ? {
        id: (exp.userId as any)._id,
        nome: (exp.userId as any).name,
        email: (exp.userId as any).email,
        azienda: (exp.userId as any).company
      } : null
    }))

    res.json({
      success: true,
      expenses: formattedExpenses
    })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    res.status(500).json({ error: 'Errore durante il recupero delle spese' })
  }
})

// POST /api/expenses - Create new expense
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const userRole = req.user!.role
    const {
      descrizione,
      importo,
      data,
      categoria,
      stato,
      metodoPagamento,
      ricorrente,
      note,
      documentoId,
      clientId // Admin can create expense for a client
    } = req.body

    // Validation
    if (!descrizione || !importo || !data || !categoria) {
      return res.status(400).json({
        error: 'Campi obbligatori mancanti: descrizione, importo, data, categoria'
      })
    }

    // Validate importo
    if (typeof importo !== 'number' || importo < 0) {
      return res.status(400).json({ error: 'Importo non valido' })
    }

    // Determine target userId
    let targetUserId = userId
    if (userRole === 'admin' && clientId) {
      targetUserId = clientId
    }

    // Create expense
    const expense = new Expense({
      userId: targetUserId,
      descrizione,
      importo,
      data,
      categoria,
      stato: stato || 'pagato',
      metodoPagamento,
      ricorrente,
      note,
      documentoId
    })

    await expense.save()

    res.status(201).json({
      success: true,
      message: 'Spesa creata con successo',
      expense: {
        id: expense._id,
        descrizione: expense.descrizione,
        importo: expense.importo,
        data: expense.data,
        categoria: expense.categoria,
        stato: expense.stato
      }
    })
  } catch (error) {
    console.error('Error creating expense:', error)
    res.status(500).json({ error: 'Errore durante la creazione della spesa' })
  }
})

// GET /api/expenses/:id - Get single expense
router.get('/:id', authMiddleware, validateObjectId('id'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const userRole = req.user!.role
    const { id } = req.params

    const expense = await Expense.findById(id)
      .populate('userId', 'name email company')
      .populate('documentoId', 'nome tipo fileUrl')

    if (!expense) {
      return res.status(404).json({ error: 'Spesa non trovata' })
    }

    // Authorization check
    if (userRole === 'business' && expense.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Non autorizzato ad accedere a questa spesa' })
    }

    const formattedExpense = {
      id: expense._id,
      descrizione: expense.descrizione,
      importo: expense.importo,
      data: expense.data,
      categoria: expense.categoria,
      stato: expense.stato,
      metodoPagamento: expense.metodoPagamento,
      ricorrente: expense.ricorrente,
      note: expense.note,
      documentoId: expense.documentoId,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
      user: expense.userId ? {
        id: (expense.userId as any)._id,
        nome: (expense.userId as any).name,
        email: (expense.userId as any).email,
        azienda: (expense.userId as any).company
      } : null,
      documento: expense.documentoId ? {
        id: (expense.documentoId as any)._id,
        nome: (expense.documentoId as any).nome,
        tipo: (expense.documentoId as any).tipo,
        fileUrl: (expense.documentoId as any).fileUrl
      } : null
    }

    res.json({
      success: true,
      expense: formattedExpense
    })
  } catch (error) {
    console.error('Error fetching expense:', error)
    res.status(500).json({ error: 'Errore durante il recupero della spesa' })
  }
})

// PUT /api/expenses/:id - Update expense
router.put('/:id', authMiddleware, validateObjectId('id'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const userRole = req.user!.role
    const { id } = req.params
    const {
      descrizione,
      importo,
      data,
      categoria,
      stato,
      metodoPagamento,
      ricorrente,
      note,
      documentoId
    } = req.body

    const expense = await Expense.findById(id)

    if (!expense) {
      return res.status(404).json({ error: 'Spesa non trovata' })
    }

    // Authorization check
    if (userRole === 'business' && expense.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Non autorizzato a modificare questa spesa' })
    }

    // Update fields
    if (descrizione !== undefined) expense.descrizione = descrizione
    if (importo !== undefined) {
      if (typeof importo !== 'number' || importo < 0) {
        return res.status(400).json({ error: 'Importo non valido' })
      }
      expense.importo = importo
    }
    if (data !== undefined) expense.data = data
    if (categoria !== undefined) expense.categoria = categoria
    if (stato !== undefined) expense.stato = stato
    if (metodoPagamento !== undefined) expense.metodoPagamento = metodoPagamento
    if (ricorrente !== undefined) expense.ricorrente = ricorrente
    if (note !== undefined) expense.note = note
    if (documentoId !== undefined) expense.documentoId = documentoId

    await expense.save()

    res.json({
      success: true,
      message: 'Spesa aggiornata con successo',
      expense: {
        id: expense._id,
        descrizione: expense.descrizione,
        importo: expense.importo,
        data: expense.data,
        categoria: expense.categoria,
        stato: expense.stato
      }
    })
  } catch (error) {
    console.error('Error updating expense:', error)
    res.status(500).json({ error: 'Errore durante l\'aggiornamento della spesa' })
  }
})

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id', authMiddleware, validateObjectId('id'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const userRole = req.user!.role
    const { id } = req.params

    const expense = await Expense.findById(id)

    if (!expense) {
      return res.status(404).json({ error: 'Spesa non trovata' })
    }

    // Authorization check
    if (userRole === 'business' && expense.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Non autorizzato a eliminare questa spesa' })
    }

    await Expense.findByIdAndDelete(id)

    res.json({
      success: true,
      message: 'Spesa eliminata con successo'
    })
  } catch (error) {
    console.error('Error deleting expense:', error)
    res.status(500).json({ error: 'Errore durante l\'eliminazione della spesa' })
  }
})

// GET /api/expenses/stats/summary - Get expense statistics
router.get('/stats/summary', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const userRole = req.user!.role
    const { clientId, startDate, endDate } = req.query

    let query: mongoose.FilterQuery<typeof Expense> = {}

    if (userRole === 'business') {
      query.userId = userId
    } else if (userRole === 'admin' && clientId) {
      query.userId = clientId
    }

    // Date range filter
    if (startDate || endDate) {
      query.data = {}
      if (startDate) query.data.$gte = startDate
      if (endDate) query.data.$lte = endDate
    }

    const expenses = await Expense.find(query)

    // Calculate statistics
    const totaleSpese = expenses.reduce((sum, exp) => sum + exp.importo, 0)
    const spesePagate = expenses.filter(e => e.stato === 'pagato').reduce((sum, exp) => sum + exp.importo, 0)
    const speseDaPagare = expenses.filter(e => e.stato === 'da_pagare').reduce((sum, exp) => sum + exp.importo, 0)
    const speseRicorrenti = expenses.filter(e => e.stato === 'ricorrente').length

    const perCategoria: Record<string, number> = {}
    expenses.forEach(exp => {
      if (!perCategoria[exp.categoria]) {
        perCategoria[exp.categoria] = 0
      }
      perCategoria[exp.categoria] += exp.importo
    })

    const stats = {
      totale: expenses.length,
      totaleSpese,
      spesePagate,
      speseDaPagare,
      speseRicorrenti,
      perCategoria,
      perStato: {
        pagato: expenses.filter(e => e.stato === 'pagato').length,
        da_pagare: expenses.filter(e => e.stato === 'da_pagare').length,
        ricorrente: speseRicorrenti
      }
    }

    res.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Error fetching expense stats:', error)
    res.status(500).json({ error: 'Errore durante il recupero delle statistiche' })
  }
})

export default router
