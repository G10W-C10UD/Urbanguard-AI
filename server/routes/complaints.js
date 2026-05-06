// Complaint routes — submit, list, get, update status, stats (Phase 8)
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { pool, logger } from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { groqChat } from '../services/groqService.js';
import {
  getNextComplaintId,
  getComplaintById,
  getAllComplaints,
  getComplaintStats,
  updateComplaintStatus,
  updateComplaintClassification,
} from '../models/Complaint.js';

const router = Router();

// Optional auth — tries to extract user but does not block unauthenticated requests
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id, username: decoded.username, role: decoded.role };
    }
  } catch {
    // No-op: unauthenticated is fine for citizen complaints
  }
  next();
}

// POST /api/complaints — Submit complaint (public, no auth required)
router.post('/', async (req, res) => {
  try {
    const { name, phone, area, asset_type, asset_id, description, severity, photo_url } = req.body;

    // Validate required fields
    if (!name || !phone || !area || !asset_type || !description || !severity) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: name, phone, area, asset_type, description, severity' 
      });
    }

    if (description.length < 20) {
      return res.status(400).json({ 
        success: false, 
        error: 'Description must be at least 20 characters' 
      });
    }

    const complaintId = await getNextComplaintId();

    // Insert complaint
    const insertQuery = `
      INSERT INTO complaints (id, name, phone, area, asset_type, asset_id, description, severity, photo_url, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'open')
      RETURNING *
    `;
    const result = await pool.query(insertQuery, [
      complaintId, name, phone, area, asset_type,
      asset_id || null, description, severity, photo_url || null
    ]);

    const complaint = result.rows[0];

    // Classify complaint via Groq AI (non-streaming, inline)
    let classification = null;
    try {
      const classifyPrompt = `You are an AI classifier for UrbanGuard-AI, Chennai's infrastructure monitoring system.
Analyse this complaint and return ONLY a valid JSON object.

Complaint: "${description}"
Reported location: ${area}
Reported asset type: ${asset_type}
Citizen-reported severity: ${severity}

Return ONLY this JSON:
{
  "severity": "minor|moderate|severe",
  "confidence": 85,
  "likely_asset_type": "streetlight|road|waterpipe|sewer",
  "likely_asset_id": null,
  "urgency": "immediate|within_24hrs|within_week|low",
  "key_issues": ["issue1", "issue2"],
  "requires_dispatch": true,
  "reasoning": "one sentence"
}`;

      const aiMessages = [
        { role: 'system', content: 'Return only valid JSON. No markdown, no explanation.' },
        { role: 'user', content: classifyPrompt }
      ];

      const aiResponse = await groqChat(aiMessages, false);
      let text = aiResponse.choices[0]?.message?.content || '{}';

      // Extract JSON from markdown if wrapped
      if (text.includes('```json')) {
        text = text.split('```json')[1].split('```')[0].trim();
      } else if (text.includes('```')) {
        text = text.split('```')[1].split('```')[0].trim();
      }

      classification = JSON.parse(text);

      // Update complaint with AI classification
      await updateComplaintClassification(complaintId, classification);

      // Auto-dispatch job if severe + requires_dispatch
      if (classification.requires_dispatch && classification.severity === 'severe') {
        const targetAssetId = asset_id || classification.likely_asset_id;
        if (targetAssetId) {
          try {
            const assetResult = await pool.query('SELECT * FROM assets WHERE id = $1', [targetAssetId]);
            const asset = assetResult.rows[0];
            if (asset) {
              const io = req.app.get('io');
              const { createAndDispatchJob } = await import('../services/jobService.js');
              const job = await createAndDispatchJob({
                asset_id: targetAssetId,
                asset_type: asset.type,
                area: asset.area,
                fault_description: description,
                severity: 'severe',
                io
              });
              if (job) {
                await pool.query(
                  `UPDATE complaints SET job_id = $1 WHERE id = $2`,
                  [job.id, complaintId]
                );
                logger.info(`Auto-dispatched job ${job.id} for severe complaint ${complaintId}`);
              }
            }
          } catch (jobErr) {
            logger.error('Auto-dispatch job error:', jobErr.message);
          }
        }
      }

      // Update asset complaint_count and complaint_score
      if (asset_id) {
        try {
          const severityScore = severity === 'severe' ? 30 : severity === 'moderate' ? 15 : 5;
          await pool.query(
            `UPDATE assets SET complaint_count = complaint_count + 1, complaint_score = complaint_score + $1, updated_at = NOW() WHERE id = $2`,
            [severityScore, asset_id]
          );
        } catch (assetErr) {
          logger.error('Asset complaint score update error:', assetErr.message);
        }
      }
    } catch (aiErr) {
      logger.error('AI classification failed (complaint still saved):', aiErr.message);
    }

    res.json({
      success: true,
      data: { ...complaint, classification },
      message: 'Complaint submitted successfully'
    });
  } catch (err) {
    logger.error('Submit complaint error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to submit complaint' });
  }
});

// GET /api/complaints/stats — Stats summary (admin only)
router.get('/stats', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const stats = await getComplaintStats();
    res.json({ success: true, data: stats, message: 'Complaint stats' });
  } catch (err) {
    logger.error('Complaint stats error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// GET /api/complaints/:id — Single complaint detail (admin only)
router.get('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const complaint = await getComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }
    res.json({ success: true, data: complaint, message: 'Complaint detail' });
  } catch (err) {
    logger.error('Get complaint error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch complaint' });
  }
});

// GET /api/complaints — List all complaints (admin only)
router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      severity: req.query.severity,
      asset_type: req.query.asset_type,
      area: req.query.area,
      search: req.query.search,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
    };
    const data = await getAllComplaints(filters);
    res.json({ success: true, data, message: 'Complaints list' });
  } catch (err) {
    logger.error('List complaints error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch complaints' });
  }
});

// PUT /api/complaints/:id/status — Update status (admin only)
router.put('/:id/status', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    const validStatuses = ['open', 'in_review', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const updated = await updateComplaintStatus(req.params.id, status, admin_notes);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }
    res.json({ success: true, data: updated, message: 'Status updated' });
  } catch (err) {
    logger.error('Update complaint status error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

export default router;
