// Central Groq AI service for UrbanGuard-AI
// All AI features call this file — never call Groq directly in routes

import Groq from 'groq-sdk';
import { logger } from '../db.js';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;

async function callWithRetry(params, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await client.chat.completions.create(params);
    } catch (err) {
      const isRateLimit = err.status === 429 ||
        (err.error && err.error.code === 'rate_limit_exceeded');
      
      if (isRateLimit && attempt < retries) {
        // Use retry-after header if available, otherwise exponential backoff
        const retryAfter = err.headers?.['retry-after'];
        const delay = retryAfter
          ? parseInt(retryAfter) * 1000
          : BASE_DELAY_MS * Math.pow(2, attempt);
        logger.info(`Groq rate limited — retrying in ${delay}ms (attempt ${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
}

export async function groqChat(messages, stream = false) {
  return await callWithRetry({
    model: 'openai/gpt-oss-120b',
    messages,
    temperature: 1,
    max_completion_tokens: 4096,
    top_p: 1,
    reasoning_effort: 'medium',
    stream,
    stop: null,
  });
}

export function buildSystemPrompt(snapshot) {
  return `You are UrbanGuard-AI, an intelligent assistant for Chennai's government infrastructure monitoring system.

Current System Snapshot:
- Total assets: 100 (25 street lights, 25 roads, 25 water pipes, 25 sewers)
- Critical assets: ${snapshot.critical}
- Warning assets: ${snapshot.warning}
- Healthy assets: ${snapshot.healthy}
- Under repair: ${snapshot.underRepair}
- Open repair jobs: ${snapshot.openJobs}
- Today's complaints: ${snapshot.todayComplaints}
- Current date: ${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
- City: Chennai, Tamil Nadu, India
- Current season: ${snapshot.season}

Asset Summary:
${snapshot.assetSummary}

You have full knowledge of all 100 assets, their locations, health scores, IoT readings, complaint counts, and job statuses. Answer clearly, concisely, and professionally. When referencing assets always include their ID and area. Be direct — this is a government monitoring platform.`;
}
