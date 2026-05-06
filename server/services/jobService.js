import { pool, logger } from '../db.js';
import { groqChat } from './groqService.js';

const PAY_SCALE = {
  streetlight: { warning: 800, critical: 1500, severe: 1500 },
  road: { warning: 5000, critical: 12000, severe: 12000 },
  waterpipe: { warning: 3000, critical: 8000, severe: 8000 },
  sewer: { warning: 2500, critical: 6000, severe: 6000 }
};

export async function createAndDispatchJob({ asset_id, asset_type, area, fault_description, severity, io }) {
  try {
    if (!asset_id || !asset_type || !area || !fault_description || !severity) {
      throw new Error('Missing required fields for job dispatch');
    }

    // Check if asset already has an active job
    const existingJob = await pool.query(`SELECT id FROM jobs WHERE asset_id = $1 AND status IN ('open', 'assigned', 'en_route', 'in_progress')`, [asset_id]);
    if (existingJob.rows.length > 0) {
      logger.info(`Job already exists for asset ${asset_id}, skipping auto-dispatch.`);
      return null;
    }

    const job_id = `JOB-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    let estimated_pay = PAY_SCALE[asset_type]?.[severity] || 1000;

    let notification_text = '';
    try {
      const prompt = `You are UrbanGuard-AI writing a job notification for contractors in Chennai.
Write a clear, compelling job notification (3-4 sentences) that:
1. Describes the problem clearly
2. States the location (${area})
3. Mentions the pay (₹${estimated_pay})
4. Encourages quick acceptance (first to accept gets the job)

Asset: ${asset_type} in ${area}
Problem: ${fault_description}
Severity: ${severity}
Keep it short, clear and motivating.`;

      const aiResponse = await groqChat([{ role: 'user', content: prompt }], false);
      notification_text = aiResponse.choices[0]?.message?.content || `New job in ${area}. Pay: ₹${estimated_pay}. Issue: ${fault_description}`;
    } catch (aiErr) {
      logger.error('AI Notification generation failed:', aiErr.message);
      notification_text = `New ${severity} job for ${asset_type} in ${area}. Pay: ₹${estimated_pay}.`;
    }

    const insertQuery = `
      INSERT INTO jobs (id, asset_id, asset_type, area, fault_description, severity, estimated_pay, notification_text, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open')
      RETURNING * 
    `;
    const result = await pool.query(insertQuery, [
      job_id, asset_id, asset_type, area, fault_description, severity, estimated_pay, notification_text
    ]);

    await pool.query('UPDATE assets SET job_status = $1 WHERE id = $2', ['open', asset_id]);

    const job = result.rows[0];

    if (io) {
      io.to('contractors').emit('new_job', job);
    }

    logger.info(`Successfully auto-dispatched job ${job_id} for asset ${asset_id}`);
    return job;
  } catch (err) {
    logger.error('createAndDispatchJob error:', err.message);
    throw err;
  }
}
