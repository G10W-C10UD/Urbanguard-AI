// Socket.io job dispatch system for UrbanGuard-AI
// Handles real-time job notifications between system and contractors

import { logger } from '../db.js';

export function setupJobDispatch(io) {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join role-based rooms on connection
    socket.on('join_room', ({ role, userId }) => {
      if (role === 'contractor') {
        socket.join('contractors');
        if (userId) socket.join(`contractor_${userId}`);
        logger.info(`Contractor ${userId || 'unknown'} joined contractors room`);
      }
      if (role === 'admin') {
        socket.join('admin');
        logger.info(`Admin joined admin room`);
      }
    });

    // Contractor accepts a job
    socket.on('accept_job', async ({ job_id, contractor_id }) => {
      // Handled by REST API — this is just for real-time updates
      io.to('contractors').emit('job_taken', { job_id });
      io.to('admin').emit('job_status_update', { job_id, status: 'assigned', contractor_id });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return {
    emitNewJob: (job) => io.to('contractors').emit('new_job', job),
    emitJobTaken: (jobId) => io.to('contractors').emit('job_taken', { job_id: jobId }),
    emitJobUpdate: (update) => io.to('admin').emit('job_status_update', update),
    emitToContractor: (contractorId, event, data) => io.to(`contractor_${contractorId}`).emit(event, data)
  };
}
