// IoT routes — placeholder for Phase 6
import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => {
  res.json({ success: true, data: [], message: 'IoT endpoint — Phase 6' });
});

export default router;
