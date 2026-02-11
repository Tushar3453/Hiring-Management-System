import express from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

router.get('/profile', authenticateUser, getProfile);
router.put('/profile', authenticateUser, upload.single('resume'), updateProfile);

export default router;