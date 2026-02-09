import { Router } from 'express';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { toggleSaveJob, getSavedJobs } from '../controllers/savedJob.controller.js';

const router = Router();

// POST /api/saved-jobs/toggle
router.post('/toggle', authenticateUser, toggleSaveJob);

// GET /api/saved-jobs
router.get('/', authenticateUser, getSavedJobs);

export default router;