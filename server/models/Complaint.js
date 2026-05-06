// Complaint model — database queries for complaints management
import { pool, logger } from '../db.js';

export async function getNextComplaintId() {
  try {
    const result = await pool.query(
      `SELECT id FROM complaints ORDER BY id DESC LIMIT 1`
    );
    if (result.rows.length === 0) return 'CMP-00001';
    const lastId = result.rows[0].id;
    const num = parseInt(lastId.replace('CMP-', ''), 10);
    return `CMP-${String(num + 1).padStart(5, '0')}`;
  } catch (err) {
    logger.error('getNextComplaintId error:', err.message);
    return `CMP-${String(Date.now()).slice(-5)}`;
  }
}

export async function getComplaintById(id) {
  try {
    const result = await pool.query(
      `SELECT c.*, a.name as asset_name, a.type as linked_asset_type, 
              a.area as asset_area, a.status as asset_status,
              a.health_score, a.iot_sensor_reading, a.iot_expected_reading, a.iot_deviation_percent
       FROM complaints c
       LEFT JOIN assets a ON c.asset_id = a.id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } catch (err) {
    logger.error('getComplaintById error:', err.message);
    throw err;
  }
}

export async function getAllComplaints(filters = {}) {
  try {
    const { status, severity, asset_type, area, search, page = 1, limit = 20 } = filters;
    const conditions = [];
    const params = [];
    let paramIdx = 1;

    if (status && status !== 'all') {
      conditions.push(`c.status = $${paramIdx++}`);
      params.push(status);
    }
    if (severity && severity !== 'all') {
      conditions.push(`c.severity = $${paramIdx++}`);
      params.push(severity);
    }
    if (asset_type && asset_type !== 'all') {
      conditions.push(`c.asset_type = $${paramIdx++}`);
      params.push(asset_type);
    }
    if (area && area !== 'all') {
      conditions.push(`c.area ILIKE $${paramIdx++}`);
      params.push(`%${area}%`);
    }
    if (search) {
      conditions.push(`(c.description ILIKE $${paramIdx} OR c.id ILIKE $${paramIdx} OR c.name ILIKE $${paramIdx})`);
      params.push(`%${search}%`);
      paramIdx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM complaints c ${where}`,
      params
    );

    const dataResult = await pool.query(
      `SELECT c.*, a.name as asset_name, a.status as asset_status, a.health_score
       FROM complaints c
       LEFT JOIN assets a ON c.asset_id = a.id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, offset]
    );

    return {
      complaints: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
    };
  } catch (err) {
    logger.error('getAllComplaints error:', err.message);
    throw err;
  }
}

export async function getComplaintStats() {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'open') as open_count,
        COUNT(*) FILTER (WHERE status = 'in_review') as in_review_count,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
        COUNT(*) FILTER (WHERE severity = 'minor') as minor_count,
        COUNT(*) FILTER (WHERE severity = 'moderate') as moderate_count,
        COUNT(*) FILTER (WHERE severity = 'severe') as severe_count,
        COUNT(*) FILTER (WHERE asset_type = 'streetlight') as streetlight_count,
        COUNT(*) FILTER (WHERE asset_type = 'road') as road_count,
        COUNT(*) FILTER (WHERE asset_type = 'waterpipe') as waterpipe_count,
        COUNT(*) FILTER (WHERE asset_type = 'sewer') as sewer_count,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as this_week_count
      FROM complaints
    `);
    return result.rows[0];
  } catch (err) {
    logger.error('getComplaintStats error:', err.message);
    throw err;
  }
}

export async function updateComplaintStatus(id, status, adminNotes = null) {
  try {
    const result = await pool.query(
      `UPDATE complaints SET status = $1, admin_notes = COALESCE($2, admin_notes), updated_at = NOW() WHERE id = $3 RETURNING *`,
      [status, adminNotes, id]
    );
    return result.rows[0];
  } catch (err) {
    logger.error('updateComplaintStatus error:', err.message);
    throw err;
  }
}

export async function updateComplaintClassification(id, classification) {
  try {
    const result = await pool.query(
      `UPDATE complaints SET 
        ai_severity = $1, ai_confidence = $2, ai_urgency = $3,
        ai_requires_dispatch = $4, ai_key_issues = $5, ai_reasoning = $6,
        ai_likely_asset_id = $7, ai_likely_asset_type = $8,
        updated_at = NOW()
      WHERE id = $9 RETURNING *`,
      [
        classification.severity, classification.confidence, classification.urgency,
        classification.requires_dispatch, JSON.stringify(classification.key_issues || []),
        classification.reasoning, classification.likely_asset_id || null,
        classification.likely_asset_type || null, id
      ]
    );
    return result.rows[0];
  } catch (err) {
    logger.error('updateComplaintClassification error:', err.message);
    throw err;
  }
}
