import { Router } from 'express';
import { signup, login } from '../controllers/auth.controller.js';
import { authenticateUser, AuthRequest } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/auth/signup
router.post('/signup', signup);

// POST /api/auth/login
router.post('/login', login);

// Test Route (Sirf logged in users ke liye)
router.get('/profile', authenticateUser, (req, res) => {
  const user = (req as AuthRequest).user;
  res.json({ message: `Welcome back, User ID: ${user?.id}`, role: user?.role });
});

export default router;