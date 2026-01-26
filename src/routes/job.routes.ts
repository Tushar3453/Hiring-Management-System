import { Router } from 'express';
import { postJob } from '../controllers/job.controller.js';
import { authenticateUser, authorizeRecruiter } from '../middlewares/auth.middleware.js';

const router = Router();

// Sirf Logged-in (authenticate) + Recruiters (authorize) hi job post kar sakte hain
router.post('/', authenticateUser, authorizeRecruiter, postJob);

export default router;