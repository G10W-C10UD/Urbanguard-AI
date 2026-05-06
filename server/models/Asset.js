// Asset model — database query helpers for assets table
import { pool, logger } from '../db.js';

export async function getAllAssets() {
  try {
    const result = await pool.query('SELECT * FROM assets ORDER BY id ASC');
    return result.rows;
  } catch (err) {
    logger.error('getAllAssets error:', err.message);
    throw err;
  }
}

export async function getAssetById(id) {
  try {
    const result = await pool.query('SELECT * FROM assets WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (err) {
    logger.error('getAssetById error:', err.message);
    throw err;
  }
}
