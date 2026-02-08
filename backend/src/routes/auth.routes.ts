import { Router } from 'express';
import { signup, login,forgotPassword,resetPassword } from '../controllers/auth.controller.js';

const router = Router();

// POST /api/auth/signup
router.post('/signup', signup);

// POST /api/auth/login
router.post('/login', login);

// Forgot Password Routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;