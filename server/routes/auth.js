// Auth routes — login and token verification for UrbanGuard-AI
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool, logger } from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/auth/login — authenticate user and return JWT
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`User ${user.username} logged in successfully`);
    return res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, username: user.username, role: user.role, name: user.name },
      },
      message: 'Login successful',
    });
  } catch (err) {
    logger.error('Login error:', err.message);
    return res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// GET /api/auth/me — return current user from token
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, role, name, phone, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({
      success: true,
      data: result.rows[0],
      message: 'User retrieved',
    });
  } catch (err) {
    logger.error('Get user error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to retrieve user' });
  }
});

export default router;
