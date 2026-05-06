// User model — database query helpers for users table
import { pool, logger } from '../db.js';

export async function getUserById(id) {
  try {
    const result = await pool.query('SELECT id, username, role, name, phone, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (err) {
    logger.error('getUserById error:', err.message);
    throw err;
  }
}

export async function getUserByUsername(username) {
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  } catch (err) {
    logger.error('getUserByUsername error:', err.message);
    throw err;
  }
}
