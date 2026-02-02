import { Router } from 'express';
import { authenticateUser, authorizeRecruiter } from '../middlewares/auth.middleware.js';
import { postJob, getJobs, getSingleJob, getMyJobs } from '../controllers/job.controller.js'; 

const router = Router();

// Sirf Logged-in (authenticate) + Recruiters (authorize) hi job post kar sakte hain
router.post('/', authenticateUser, authorizeRecruiter, postJob);

// GET All Jobs
router.get('/', getJobs);

// Recruiter: Get posted jobs
router.get('/my-jobs', authenticateUser, authorizeRecruiter, getMyJobs);

// GET Single Job
router.get('/:id', getSingleJob);

export default router;