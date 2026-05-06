import { Router } from 'express';
import { groqChat, buildSystemPrompt } from '../services/groqService.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { pool } from '../db.js';

const router = Router();

router.post('/chat', authMiddleware, requireRole('admin'), async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  try {
    const { messages, snapshot } = req.body;
    const systemPrompt = buildSystemPrompt(snapshot);

    const allMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const stream = await groqChat(allMessages, true);
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
  } catch (error) {
    console.error('Groq Chat Error:', error);
    res.write(`data: ${JSON.stringify({ text: 'AI is temporarily unavailable. Please try again.' })}\n\n`);
    res.write('data: [DONE]\n\n');
  } finally {
    res.end();
  }
});

router.post('/fault-report/:assetId', authMiddleware, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  if (!process.env.GROQ_API_KEY) {
    res.write(`data: ${JSON.stringify({ text: 'Error: GROQ_API_KEY is not configured in server/.env' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }

  try {
    const body = req.body;
    
    const prompt = `You are an infrastructure maintenance expert for Chennai Municipal Corporation.
Generate a professional fault report for this asset.

Asset: ${body.asset_id} — ${body.asset_name}
Type: ${body.asset_type}
Location: ${body.area}, Chennai
IoT Reading: ${body.iot_actual} (expected: ${body.iot_expected}, deviation: ${body.iot_deviation}%)
Age: ${body.age} years (lifespan: ${body.lifespan} years)
Risk Score: ${body.risk_score}/100
Binary Search Result: ${body.binary_search_result}
Complaint Count: ${body.complaint_count}
Social Media Flags: ${body.social_flags}

Write a fault report with:
1. Fault Summary (2 sentences)
2. Likely Root Cause
3. Step-by-Step Repair Instructions (numbered, specific to ${body.asset_type})
4. Safety Precautions
5. Estimated Repair Time
6. Urgency Level: Immediate / Within 24hrs / Within 48hrs

Be technical and specific. This is read by field engineers.`;

    const messages = [{ role: 'user', content: prompt }];
    const stream = await groqChat(messages, true);

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Groq Fault Report Error:', error);
    res.write(`data: ${JSON.stringify({ text: 'AI is temporarily unavailable. Please try again.' })}\n\n`);
    res.write('data: [DONE]\n\n');
  } finally {
    res.end();
  }
});

router.post('/classify-complaint', async (req, res) => {
  try {
    const { complaint, area, asset_type } = req.body;

    const prompt = `You are an AI classifier for UrbanGuard-AI, Chennai's infrastructure monitoring system.
Analyse this complaint and return ONLY a valid JSON object.

Complaint: "${complaint}"
Reported location: ${area}
Reported asset type: ${asset_type}

Return ONLY this JSON:
{
  "severity": "minor|moderate|severe",
  "confidence": 0,
  "likely_asset_type": "streetlight|road|waterpipe|sewer",
  "likely_asset_id": "asset ID if identifiable, else null",
  "urgency": "immediate|within_24hrs|within_week|low",
  "key_issues": ["issue1", "issue2"],
  "requires_dispatch": true|false,
  "reasoning": "one sentence"
}`;

    const allMessages = [
      { role: 'system', content: 'Return only valid JSON.' },
      { role: 'user', content: prompt }
    ];

    const response = await groqChat(allMessages, false);
    let text = response.choices[0]?.message?.content || '{}';
    
    // Attempt to extract JSON from markdown if needed
    if (text.includes('\`\`\`json')) {
      text = text.split('\`\`\`json')[1].split('\`\`\`')[0].trim();
    } else if (text.includes('\`\`\`')) {
      text = text.split('\`\`\`')[1].split('\`\`\`')[0].trim();
    }
    
    const parsed = JSON.parse(text);
    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error('Groq Classify Error:', error);
    res.status(500).json({ success: false, error: 'Classification failed' });
  }
});

router.post('/complaint-ack', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  try {
    const { complaint_id, asset_type, area, ai_severity, ai_urgency } = req.body;

    const prompt = `You are UrbanGuard-AI, Chennai Municipal Corporation's AI assistant.
Write a warm, empathetic acknowledgement to a citizen who just filed a complaint.

Complaint ID: ${complaint_id}
Asset Type: ${asset_type}
Location: ${area}
Severity: ${ai_severity}
Urgency: ${ai_urgency}

Write 3–4 sentences:
1. Thank them warmly
2. Confirm receipt (mention complaint ID)
3. Tell them estimated response time based on urgency
4. Encourage them to track it

Be warm, human, and reassuring. This is a government system — sound helpful, not robotic.`;

    const allMessages = [
      { role: 'system', content: 'You are an empathetic assistant for Chennai Municipal Corporation.' },
      { role: 'user', content: prompt }
    ];

    const stream = await groqChat(allMessages, true);
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
  } catch (error) {
    console.error('Groq Ack Error:', error);
    res.write(`data: ${JSON.stringify({ text: 'Thank you for your report. Your complaint has been received.' })}\n\n`);
    res.write('data: [DONE]\n\n');
  } finally {
    res.end();
  }
});

router.post('/report', authMiddleware, requireRole('admin'), async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  try {
    const { report_type, asset_type, snapshot } = req.body;
    
    // We expect the frontend to pass the snapshot of current state
    const prompt = `You are UrbanGuard-AI generating an official infrastructure health report for Chennai Municipal Corporation.

Report Type: ${report_type}
Generated: ${new Date().toISOString()}

Asset Data:
${JSON.stringify(snapshot || {}, null, 2)}

Write a professional government report including:
1. Executive Summary (4 sentences — suitable for senior officials)
2. Critical Issues Requiring Immediate Attention (bullet list with asset IDs)
3. Asset Health Analysis by Type (one paragraph per type)
4. Top 5 Problem Areas in Chennai (by area name, with reasons)
5. Complaint Trend Analysis
6. Contractor Performance Summary
7. Actionable Recommendations for This Week (numbered list)
8. AI Prediction: Assets Most Likely to Fail in Next 7 Days (with reasoning)

Format as a formal government document. Use official language. Include specific IDs and locations.
If the report type is specific (like an Asset Type Deep-Dive for ${asset_type}), focus heavily on that asset type.`;

    const allMessages = [
      { role: 'system', content: 'You are UrbanGuard-AI, generating official reports.' },
      { role: 'user', content: prompt }
    ];

    const stream = await groqChat(allMessages, true);
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
  } catch (error) {
    console.error('Groq Report Error:', error);
    res.write(`data: ${JSON.stringify({ text: 'AI is temporarily unavailable. Please try again.' })}\n\n`);
    res.write('data: [DONE]\n\n');
  } finally {
    res.end();
  }
});

router.get('/briefing/:jobId', authMiddleware, requireRole('contractor'), async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  try {
    const jobResult = await pool.query('SELECT * FROM jobs WHERE id = $1', [req.params.jobId]);
    if (jobResult.rows.length === 0) {
      res.write(`data: ${JSON.stringify({ text: 'Job not found.' })}\n\n`);
      return res.write('data: [DONE]\n\n');
    }
    const job = jobResult.rows[0];

    const assetResult = await pool.query('SELECT * FROM assets WHERE id = $1', [job.asset_id]);
    const asset = assetResult.rows[0] || {};

    const prompt = `You are a field operations assistant for UrbanGuard-AI, Chennai.
A contractor has accepted a repair job. Write a clear, practical field briefing.

Job Details:
Asset ID: ${job.asset_id}
Asset Type: ${job.asset_type}
Location: ${job.area}, Chennai (GPS: ${asset.lat || 'Unknown'}, ${asset.lng || 'Unknown'})
Problem: ${job.fault_description}
Severity: ${job.severity}
Binary Search Result: ${asset.binary_faulty_index !== null ? 'Fault at segment ' + asset.binary_faulty_index : "Full inspection needed"}
IoT Reading: ${asset.iot_sensor_reading} vs expected ${asset.iot_expected_reading}
AI Fault Report Summary: ${asset.ai_fault_report || "No prior AI report."}

Write a contractor briefing with:
1. Job Summary (plain English, what needs to be done)
2. How to Find the Asset (specific directions in ${job.area})
3. Tools & Equipment Required (specific list)
4. Step-by-Step Repair Procedure (numbered, practical steps)
5. Safety Warnings (highlight critical ones)
6. Completion Checklist (what to verify before closing the job)
7. Escalation: "Contact UrbanGuard-AI Control Centre if the problem exceeds scope"
8. Estimated Time to Complete

Write simply — the contractor may not have a technical background.`;

    const allMessages = [
      { role: 'system', content: 'You are an operations assistant for Chennai Municipal Corporation.' },
      { role: 'user', content: prompt }
    ];

    const stream = await groqChat(allMessages, true);
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
  } catch (error) {
    console.error('Groq Briefing Error:', error);
    res.write(`data: ${JSON.stringify({ text: 'AI is temporarily unavailable. Please try again.' })}\n\n`);
    res.write('data: [DONE]\n\n');
  } finally {
    res.end();
  }
});

router.get('/prediction/:assetId', authMiddleware, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  try {
    const assetResult = await pool.query('SELECT * FROM assets WHERE id = $1', [req.params.assetId]);
    if (assetResult.rows.length === 0) {
      res.write(`data: ${JSON.stringify({ text: 'Asset not found.' })}\n\n`);
      return res.write('data: [DONE]\n\n');
    }
    const asset = assetResult.rows[0];

    const prompt = `You are a predictive maintenance AI for UrbanGuard-AI, Chennai.
Analyse this asset's profile and provide a maintenance prediction.

Asset: ${asset.id} | ${asset.type} | ${asset.area}
Installed: ${(asset.installed_date || new Date()).toString().split('T')[0]} 
Expected lifespan: ${asset.expected_lifespan_years} years
Last maintained: ${(asset.last_maintained || new Date()).toString().split('T')[0]}
Current health score: ${asset.health_score}/100
IoT deviation trend: ${asset.iot_deviation_percent || 0}%
Risk score: ${asset.anomaly_risk_score || 0}/100
Complaint count (30 days): ${asset.complaint_count || 0}
Season in Chennai now: Summer

Provide:
1. Predicted Failure Date Range
2. Confidence Level (%)
3. Primary Risk Factors (numbered)
4. Recommended Preventative Action`;

    const allMessages = [
      { role: 'system', content: 'You are an AI predictive maintenance advisor.' },
      { role: 'user', content: prompt }
    ];

    const stream = await groqChat(allMessages, true);
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
  } catch (error) {
    console.error('Groq Prediction Error:', error);
    res.write(`data: ${JSON.stringify({ text: 'AI is temporarily unavailable. Please try again.' })}\n\n`);
    res.write('data: [DONE]\n\n');
  } finally {
    res.end();
  }
});

router.post('/search', authMiddleware, async (req, res) => {
  try {
    const { query } = req.body;

    const prompt = `You are an AI search assistant for UrbanGuard-AI, Chennai.
Convert the user's natural language search query into an exact JSON filter object.

Query: "${query}"

Valid types: "streetlight", "road", "waterpipe", "sewer", or "all"
Valid status: "healthy", "warning", "critical", "under_repair", "repaired", or "all"
Area: city area name if mentioned (e.g. "Anna Nagar", "T Nagar", "North Chennai"), else "all"

Return ONLY this JSON:
{
  "type": "string",
  "status": "string",
  "area": "string",
  "description": "Short human-readable summary of the filter (e.g. 'Critical water pipes in North Chennai')"
}`;

    const allMessages = [
      { role: 'system', content: 'Return only valid JSON.' },
      { role: 'user', content: prompt }
    ];

    const response = await groqChat(allMessages, false);
    let text = response.choices[0]?.message?.content || '{}';
    
    if (text.includes('\`\`\`json')) {
      text = text.split('\`\`\`json')[1].split('\`\`\`')[0].trim();
    } else if (text.includes('\`\`\`')) {
      text = text.split('\`\`\`')[1].split('\`\`\`')[0].trim();
    }
    
    const parsed = JSON.parse(text);
    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error('Groq NL Search Error:', error);
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});

router.get('/social-summary/:assetId', authMiddleware, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  try {
    const assetResult = await pool.query('SELECT * FROM assets WHERE id = $1', [req.params.assetId]);
    if (assetResult.rows.length === 0) {
      res.write(`data: ${JSON.stringify({ text: 'Asset not found.' })}\n\n`);
      return res.write('data: [DONE]\n\n');
    }
    const asset = assetResult.rows[0];

    // Mock social media flags since we don't have thousands
    const prompt = `You are a sentiment analysis AI for UrbanGuard-AI, Chennai.
Summarise the public sentiment and complaints regarding this infrastructure asset.

Asset ID: ${asset.id}
Asset Type: ${asset.type}
Location: ${asset.area}
Official Complaints directly filed: ${asset.complaint_count || 0}
Social Media Flags (X, Facebook, local forums): ${asset.social_media_flags || 0}
Current System Status: ${asset.status}

Provide:
1. Public Sentiment Overview (Angry, Concerned, Unaware, Satisfied)
2. Most Common Keywords mentioned by public
3. Urgency from Public Perspective (High/Medium/Low)
4. AI Recommendation (e.g. "To avoid PR escalation, dispatch contractor within 4 hours")`;

    const allMessages = [
      { role: 'system', content: 'You are UrbanGuard-AI, analyzing public sentiment.' },
      { role: 'user', content: prompt }
    ];

    const stream = await groqChat(allMessages, true);
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
  } catch (error) {
    console.error('Groq Social Summary Error:', error);
    res.write(`data: ${JSON.stringify({ text: 'AI is temporarily unavailable. Please try again.' })}\n\n`);
    res.write('data: [DONE]\n\n');
  } finally {
    res.end();
  }
});

router.get('/digest', authMiddleware, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  try {
    const assetResult = await pool.query('SELECT status, COUNT(*) as count FROM assets GROUP BY status');
    const statusCounts = assetResult.rows.reduce((acc, row) => ({ ...acc, [row.status]: parseInt(row.count) }), {});

    const jobResult = await pool.query('SELECT status, COUNT(*) as count FROM jobs GROUP BY status');
    const jobCounts = jobResult.rows.reduce((acc, row) => ({ ...acc, [row.status]: parseInt(row.count) }), {});

    const prompt = `You are UrbanGuard-AI generating a concise Daily Executive Digest for the Chennai Municipal Commissioner.

System Snapshot:
Assets: ${JSON.stringify(statusCounts)}
Jobs: ${JSON.stringify(jobCounts)}

Write a professional 1-paragraph summary of the current operational state.
Highlight any critical numbers or backlogs.
Tone: Official, concise, actionable.`;

    const allMessages = [
      { role: 'system', content: 'You are UrbanGuard-AI, an executive summariser.' },
      { role: 'user', content: prompt }
    ];

    const stream = await groqChat(allMessages, true);
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
  } catch (error) {
    console.error('Groq Daily Digest Error:', error);
    res.write(`data: ${JSON.stringify({ text: 'Daily digest unavailable.' })}\n\n`);
    res.write('data: [DONE]\n\n');
  } finally {
    res.end();
  }
});

// GET /api/ai/status — check if AI service is configured
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const connected = !!process.env.GROQ_API_KEY;
    res.json({
      success: true,
      data: {
        connected,
        model: 'openai/gpt-oss-120b',
        provider: 'Groq',
      }
    });
  } catch (err) {
    res.json({ success: true, data: { connected: false } });
  }
});

export default router;
