// Asset CRUD routes — query and update infrastructure assets
import { Router } from 'express';
import { pool, logger } from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// GET /api/assets — return all 100 assets
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { type, status, area } = req.query;
    let query = 'SELECT * FROM assets';
    const conditions = [];
    const params = [];

    if (type) {
      params.push(type);
      conditions.push(`type = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (area) {
      params.push(`%${area}%`);
      conditions.push(`area ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id ASC';

    const result = await pool.query(query, params);
    return res.json({
      success: true,
      data: result.rows,
      message: `${result.rows.length} assets retrieved`,
    });
  } catch (err) {
    logger.error('Get assets error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to retrieve assets' });
  }
});

// GET /api/assets/:id — return single asset by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM assets WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }

    return res.json({
      success: true,
      data: result.rows[0],
      message: 'Asset retrieved',
    });
  } catch (err) {
    logger.error('Get asset error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to retrieve asset' });
  }
});

// PUT /api/assets/:id — update asset (admin only)
router.put('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const allowedFields = [
      'status', 'health_score', 'last_maintained',
      'iot_sensor_reading', 'iot_deviation_percent', 'iot_last_updated',
      'binary_faulty_index', 'binary_segment_readings', 'binary_last_run',
      'anomaly_age_factor', 'anomaly_weather_factor', 'anomaly_risk_score',
      'anomaly_risk_level', 'anomaly_predicted_failure',
      'social_media_flags', 'complaint_count', 'complaint_score',
      'ai_fault_report', 'ai_prediction',
      'assigned_contractor_id', 'job_status',
    ];

    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        values.push(req.body[field]);
        updates.push(`${field} = $${values.length}`);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }

    values.push(new Date().toISOString());
    updates.push(`updated_at = $${values.length}`);
    values.push(req.params.id);

    const query = `UPDATE assets SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }

    return res.json({
      success: true,
      data: result.rows[0],
      message: 'Asset updated',
    });
  } catch (err) {
    logger.error('Update asset error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to update asset' });
  }
});

export default router;
