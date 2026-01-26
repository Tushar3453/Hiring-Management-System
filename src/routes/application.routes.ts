import { Router } from 'express';
import { applyJob, getMyApplications } from '../controllers/application.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/applications
// Login required
router.post('/', authenticateUser, applyJob);
router.get('/history', authenticateUser, getMyApplications);

export default router;