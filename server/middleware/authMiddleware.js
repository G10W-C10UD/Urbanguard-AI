// JWT authentication middleware — verifies Bearer token on protected routes
import jwt from 'jsonwebtoken';
import { logger } from '../db.js';

export default function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, username: decoded.username, role: decoded.role };
    next();
  } catch (err) {
    logger.error('Auth middleware error:', err.message);
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}
