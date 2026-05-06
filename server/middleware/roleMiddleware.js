// Role-based access control middleware — restricts routes to specific user roles
import { logger } from '../db.js';

export function requireRole(...roles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }
      if (!roles.includes(req.user.role)) {
        logger.warn(`Access denied for user ${req.user.username} (role: ${req.user.role}) — required: ${roles.join(', ')}`);
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }
      next();
    } catch (err) {
      logger.error('Role middleware error:', err.message);
      return res.status(500).json({ success: false, error: 'Authorization check failed' });
    }
  };
}
