import { Router } from 'express';
import { authenticateUser, authorizeRecruiter } from '../middlewares/auth.middleware.js';
import { postJob, getJobs, getSingleJob } from '../controllers/job.controller.js'; 

const router = Router();

// Sirf Logged-in (authenticate) + Recruiters (authorize) hi job post kar sakte hain
router.post('/', authenticateUser, authorizeRecruiter, postJob);

// GET All Jobs
router.get('/', getJobs);

// GET Single Job
router.get('/:id', getSingleJob);

export default router;