import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';

const router = express.Router();

// Middleware per verificare il token JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'taxflow_jwt_secret_key_2024';

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.userId = decoded.userId;
    next();
  });
};

// GET /api/user/me - Get current user
router.get('/me', authenticateToken, async (req: any, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/user/update - Update user profile
router.put('/update', authenticateToken, async (req: any, res) => {
  try {
    const { name, email, phone, professionalRole, bio, address, fiscalCode, registrationNumber, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({ error: 'Invalid name' });
      }
      user.name = name.trim();
    }

    // Update email if provided
    if (email !== undefined) {
      if (typeof email !== 'string') {
        return res.status(400).json({ error: 'Invalid email' });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Check if email is already taken
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser && existingUser._id?.toString() !== user._id?.toString()) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      user.email = normalizedEmail;
    }

    // Update optional profile fields
    if (phone !== undefined) user.phone = phone?.trim() || undefined;
    if (professionalRole !== undefined) user.professionalRole = professionalRole?.trim() || undefined;
    if (bio !== undefined) user.bio = bio?.trim() || undefined;
    if (address !== undefined) user.address = address?.trim() || undefined;
    if (fiscalCode !== undefined) user.fiscalCode = fiscalCode?.trim().toUpperCase() || undefined;
    if (registrationNumber !== undefined) user.registrationNumber = registrationNumber?.trim() || undefined;

    // Update password if provided
    if (newPassword !== undefined) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required' });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Validate new password
      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

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
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;