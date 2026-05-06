// Job model — placeholder for Phase 9
import { pool, logger } from '../db.js';

export async function getAllJobs() {
  try {
    const result = await pool.query('SELECT * FROM jobs ORDER BY dispatched_at DESC');
    return result.rows;
  } catch (err) {
    logger.error('getAllJobs error:', err.message);
    throw err;
  }
}
