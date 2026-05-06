import { Router } from 'express';
import { pool, logger } from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { groqChat } from '../services/groqService.js';

const router = Router();

const PAY_SCALE = {
  streetlight: { warning: 800, critical: 1500 },
  road: { warning: 5000, critical: 12000 },
  waterpipe: { warning: 3000, critical: 8000 },
  sewer: { warning: 2500, critical: 6000 }
};

// GET /api/jobs/stats (admin only)
router.get('/stats', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const totalQuery = await pool.query('SELECT COUNT(*) FROM jobs');
    const statusQuery = await pool.query('SELECT status, COUNT(*) FROM jobs GROUP BY status');
    const assetTypeQuery = await pool.query('SELECT asset_type, COUNT(*) FROM jobs GROUP BY asset_type');
    const completedTodayQuery = await pool.query('SELECT COUNT(*) FROM jobs WHERE status = $1 AND completed_at >= CURRENT_DATE', ['completed']);
    
    const avgTimeQuery = await pool.query(`
      SELECT AVG(EXTRACT(EPOCH FROM (completed_at - accepted_at))/3600) as avg_hours 
      FROM jobs WHERE status = 'completed' AND accepted_at IS NOT NULL AND completed_at IS NOT NULL
    `);
    
    const payQuery = await pool.query("SELECT SUM(estimated_pay) FROM jobs WHERE status IN ('completed', 'payment_pending', 'paid')");

    const stats = {
      total: parseInt(totalQuery.rows[0].count),
      by_status: statusQuery.rows.reduce((acc, row) => ({ ...acc, [row.status]: parseInt(row.count) }), {}),
      by_asset_type: assetTypeQuery.rows.reduce((acc, row) => ({ ...acc, [row.asset_type]: parseInt(row.count) }), {}),
      completed_today: parseInt(completedTodayQuery.rows[0].count),
      avg_completion_time_hours: avgTimeQuery.rows[0].avg_hours ? parseFloat(avgTimeQuery.rows[0].avg_hours).toFixed(1) : 0,
      total_pay_disbursed: parseInt(payQuery.rows[0].sum || 0)
    };

    res.json({ success: true, data: stats });
  } catch (err) {
    logger.error('Get jobs stats error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch job stats' });
  }
});

// GET /api/jobs/available (contractor only)
router.get('/available', authMiddleware, requireRole('contractor'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT j.*, a.name as asset_name, a.lat, a.lng
      FROM jobs j
      JOIN assets a ON j.asset_id = a.id
      WHERE j.status = 'open'
      ORDER BY j.dispatched_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    logger.error('Get available jobs error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch available jobs' });
  }
});

// GET /api/jobs/my-jobs (contractor only)
router.get('/my-jobs', authMiddleware, requireRole('contractor'), async (req, res) => {
  try {
    const contractorId = req.user.id;
    const result = await pool.query(`
      SELECT j.*, a.name as asset_name, a.lat, a.lng
      FROM jobs j
      JOIN assets a ON j.asset_id = a.id
      WHERE j.accepted_by = $1
      ORDER BY j.accepted_at DESC
    `, [contractorId]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    logger.error('Get my jobs error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch contractor jobs' });
  }
});

// GET /api/jobs (admin only)
router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { status, severity, asset_type, area, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT j.*, a.name as asset_name, u.name as contractor_name
      FROM jobs j
      JOIN assets a ON j.asset_id = a.id
      LEFT JOIN users u ON j.accepted_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND j.status = $${paramIndex++}`;
      params.push(status);
    }
    if (severity) {
      query += ` AND j.severity = $${paramIndex++}`;
      params.push(severity);
    }
    if (asset_type) {
      query += ` AND j.asset_type = $${paramIndex++}`;
      params.push(asset_type);
    }
    if (area) {
      query += ` AND j.area ILIKE $${paramIndex++}`;
      params.push(`%${area}%`);
    }
    if (search) {
      query += ` AND (j.id ILIKE $${paramIndex} OR j.area ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY j.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    logger.error('Get all jobs error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch jobs' });
  }
});

// GET /api/jobs/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT j.*, a.name as asset_name, a.lat, a.lng, u.name as contractor_name, u.phone as contractor_phone
      FROM jobs j
      JOIN assets a ON j.asset_id = a.id
      LEFT JOIN users u ON j.accepted_by = u.id
      WHERE j.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    logger.error('Get job error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch job details' });
  }
});

import { createAndDispatchJob } from '../services/jobService.js';

// ... (keep GET routes) ...
// POST /api/jobs (create & dispatch)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { asset_id, asset_type, area, fault_description, severity } = req.body;

    const io = req.app.get('io');
    const job = await createAndDispatchJob({ asset_id, asset_type, area, fault_description, severity, io });

    if (!job) {
      return res.status(400).json({ success: false, error: 'Asset already has an active job' });
    }

    res.json({ success: true, data: job, message: 'Job created and broadcasted' });
  } catch (err) {
    logger.error('Save job error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to create job' });
  }
});

// POST /api/jobs/:id/accept (contractor only)
router.post('/:id/accept', authMiddleware, requireRole('contractor'), async (req, res) => {
  try {
    const job_id = req.params.id;
    const contractor_id = req.user.id;

    const jobCheck = await pool.query('SELECT status FROM jobs WHERE id = $1', [job_id]);
    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    if (jobCheck.rows[0].status !== 'open') {
      return res.json({ success: false, error: 'Job already taken by another contractor' });
    }

    const updateJob = `
      UPDATE jobs 
      SET status = 'assigned', accepted_by = $1, accepted_at = NOW(), updated_at = NOW()
      WHERE id = $2 AND status = 'open'
      RETURNING *
    `;
    const result = await pool.query(updateJob, [contractor_id, job_id]);

    if (result.rowCount === 0) {
      return res.json({ success: false, error: 'Job already taken by another contractor' });
    }

    const job = result.rows[0];

    await pool.query('UPDATE assets SET job_status = $1, assigned_contractor_id = $2 WHERE id = $3', ['assigned', contractor_id, job.asset_id]);

    const io = req.app.get('io');
    if (io) {
      io.to('contractors').emit('job_taken', { job_id });
      io.to(`contractor_${contractor_id}`).emit('job_confirmed', { job_id });
      io.to('admin').emit('job_status_update', { job_id, status: 'assigned', contractor_id });
    }

    res.json({ 
      success: true, 
      data: job, 
      briefing_stream_url: `/api/ai/briefing/${job_id}`,
      message: 'Job accepted successfully' 
    });
  } catch (err) {
    logger.error('Accept job error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to accept job' });
  }
});

// PUT /api/jobs/:id/status (contractor only)
router.put('/:id/status', authMiddleware, requireRole('contractor'), async (req, res) => {
  try {
    const job_id = req.params.id;
    const contractor_id = req.user.id;
    const { status, completion_notes } = req.body;

    const validTransitions = ['assigned', 'en_route', 'in_progress', 'completed'];
    if (!validTransitions.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const jobCheck = await pool.query('SELECT asset_id FROM jobs WHERE id = $1 AND accepted_by = $2', [job_id, contractor_id]);
    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found or not assigned to you' });
    }

    const asset_id = jobCheck.rows[0].asset_id;

    let updateQuery = `UPDATE jobs SET status = $1, updated_at = NOW()`;
    const params = [status, job_id, contractor_id];
    
    if (status === 'completed') {
      updateQuery += `, completed_at = NOW(), completion_notes = $4`;
      params.push(completion_notes || null);
    }
    
    updateQuery += ` WHERE id = $2 AND accepted_by = $3 RETURNING *`;

    const result = await pool.query(updateQuery, params);
    const job = result.rows[0];

    if (status === 'completed') {
      await pool.query('UPDATE assets SET job_status = $1, status = $2, assigned_contractor_id = NULL WHERE id = $3', ['none', 'repaired', asset_id]);
    } else {
      await pool.query('UPDATE assets SET job_status = $1 WHERE id = $2', [status, asset_id]);
    }

    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('job_status_update', { job_id, status, contractor_id });
    }

    res.json({ success: true, data: job, message: 'Status updated successfully' });
  } catch (err) {
    logger.error('Update job status error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

export default router;
