// UrbanGuard-AI Express server — entry point with auto-seed and Socket.io
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { initDB, logger } from './db.js';
import { runSeed } from './seed/seedAssets.js';
import { setupJobDispatch } from './socket/jobDispatch.js';

import authRoutes from './routes/auth.js';
import assetRoutes from './routes/assets.js';
import complaintRoutes from './routes/complaints.js';
import jobRoutes from './routes/jobs.js';
import iotRoutes from './routes/iot.js';
import aiRoutes from './routes/ai.js';

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'online', timestamp: new Date().toISOString() }, message: 'UrbanGuard-AI server is running' });
});

// Socket.io
setupJobDispatch(io);

// Make io accessible to routes
app.set('io', io);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initDB();
    logger.info('Database initialized — all tables ready');

    await runSeed();
    logger.info('Seed check complete');

    server.listen(PORT, () => {
      logger.info(`UrbanGuard-AI server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
