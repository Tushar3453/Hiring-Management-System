import express from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // temp storage

router.get('/profile', authenticateUser, getProfile);
router.put('/profile', authenticateUser, upload.single('resume'), updateProfile);

export default router;