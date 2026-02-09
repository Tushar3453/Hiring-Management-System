import { Router } from 'express';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { 
  applyJob, 
  getMyApplications, 
  getJobApplications, 
  updateStatus, 
  studentResponse,
  rescheduleInterview 
} from '../controllers/application.controller.js';

const router = Router();

// To apply for a job(User)
router.post('/', authenticateUser, applyJob);
//To see my applications(User)
router.get('/history', authenticateUser, getMyApplications);
//To see job applications(Recruiter)
router.get('/job/:jobId', authenticateUser, getJobApplications);
//To update application status(Recruiter)
router.patch('/:id/status', authenticateUser, updateStatus);
//To respond to offer(Student)
router.patch('/:id/response', authenticateUser, studentResponse);
// Request Reschedule (Student)
router.patch('/:id/reschedule', authenticateUser, rescheduleInterview);

export default router;