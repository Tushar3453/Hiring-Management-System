import { Router } from 'express';
import { applyJob, getMyApplications, getJobApplications, updateStatus } from '../controllers/application.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';

const router = Router();

// To apply for a job(User)
router.post('/', authenticateUser, applyJob);
//To see my applications(User)
router.get('/history', authenticateUser, getMyApplications);
//To see job applications(Recruiter)
router.get('/job/:jobId', authenticateUser, getJobApplications);
//To update application status(Recruiter)
router.patch('/:id/status', authenticateUser, updateStatus);

export default router;