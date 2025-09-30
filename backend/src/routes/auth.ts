import express from 'express';
import { login, register, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/register
router.post('/register', register);

// GET /api/auth/profile
router.get('/profile', authenticateToken, getProfile);

export default router;