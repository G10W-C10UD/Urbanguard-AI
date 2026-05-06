// Database connection pool for UrbanGuard-AI using PostgreSQL
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const logger = {
  info: (...args) => process.env.NODE_ENV !== 'production' && console.log('[INFO]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
};

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'citizen', 'contractor')),
        name VARCHAR(100),
        phone VARCHAR(20),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS assets (
        id VARCHAR(10) PRIMARY KEY,
        type VARCHAR(20) NOT NULL CHECK (type IN ('streetlight', 'road', 'waterpipe', 'sewer')),
        name VARCHAR(100) NOT NULL,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        area VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'healthy' CHECK (status IN ('healthy', 'warning', 'critical', 'under_repair', 'repaired')),
        health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
        installed_date DATE NOT NULL,
        expected_lifespan_years INTEGER NOT NULL,
        last_maintained DATE,
        iot_sensor_reading DOUBLE PRECISION DEFAULT 0,
        iot_expected_reading DOUBLE PRECISION DEFAULT 0,
        iot_unit VARCHAR(20),
        iot_deviation_percent DOUBLE PRECISION DEFAULT 0,
        iot_last_updated TIMESTAMPTZ DEFAULT NOW(),
        binary_faulty_index INTEGER,
        binary_segment_readings JSONB,
        binary_last_run TIMESTAMPTZ,
        anomaly_age_factor DOUBLE PRECISION DEFAULT 0,
        anomaly_weather_factor DOUBLE PRECISION DEFAULT 0,
        anomaly_risk_score DOUBLE PRECISION DEFAULT 0,
        anomaly_risk_level VARCHAR(10) DEFAULT 'low' CHECK (anomaly_risk_level IN ('low', 'medium', 'high')),
        anomaly_predicted_failure DATE,
        social_media_flags INTEGER DEFAULT 0,
        complaint_count INTEGER DEFAULT 0,
        complaint_score INTEGER DEFAULT 0,
        ai_fault_report TEXT,
        ai_prediction TEXT,
        assigned_contractor_id UUID REFERENCES users(id),
        job_status VARCHAR(20) DEFAULT 'none' CHECK (job_status IN ('none', 'open', 'assigned', 'en_route', 'in_progress', 'completed')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS iot_readings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        asset_id VARCHAR(10) REFERENCES assets(id) ON DELETE CASCADE,
        reading DOUBLE PRECISION NOT NULL,
        expected DOUBLE PRECISION NOT NULL,
        deviation_percent DOUBLE PRECISION NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS complaints (
        id VARCHAR(20) PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        asset_id VARCHAR(10) REFERENCES assets(id),
        description TEXT NOT NULL,
        severity VARCHAR(10) CHECK (severity IN ('minor', 'moderate', 'severe')),
        ai_severity VARCHAR(10),
        ai_confidence INTEGER,
        ai_urgency VARCHAR(20),
        ai_requires_dispatch BOOLEAN DEFAULT false,
        ai_key_issues JSONB,
        ai_reasoning TEXT,
        photo_url TEXT,
        status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS jobs (
        id VARCHAR(20) PRIMARY KEY,
        asset_id VARCHAR(10) REFERENCES assets(id),
        asset_type VARCHAR(20),
        area VARCHAR(100),
        fault_description TEXT,
        ai_briefing TEXT,
        severity VARCHAR(10),
        estimated_pay INTEGER,
        status VARCHAR(30) DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'en_route', 'in_progress', 'completed', 'payment_pending', 'paid')),
        accepted_by UUID REFERENCES users(id),
        dispatched_at TIMESTAMPTZ DEFAULT NOW(),
        accepted_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        completion_notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS social_flags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        asset_id VARCHAR(10) REFERENCES assets(id) ON DELETE CASCADE,
        platform VARCHAR(50),
        content TEXT,
        flagged_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ai_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        report_type VARCHAR(50) NOT NULL,
        content TEXT,
        generated_by UUID REFERENCES users(id),
        generated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS binary_search_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        asset_id VARCHAR(10) REFERENCES assets(id) ON DELETE CASCADE,
        total_units INTEGER,
        readings JSONB,
        steps JSONB,
        faulty_index INTEGER,
        run_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    // Add missing columns to complaints table (safe re-run with IF NOT EXISTS)
    await client.query(`
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS name VARCHAR(100);
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS area VARCHAR(100);
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS asset_type VARCHAR(20);
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS admin_notes TEXT;
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS job_id VARCHAR(20);
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS ai_likely_asset_id VARCHAR(10);
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS ai_likely_asset_type VARCHAR(20);
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS notification_text TEXT;
    `);

    logger.info('All database tables created successfully');
  } catch (err) {
    logger.error('Failed to initialize database:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

export { pool, initDB, logger };
