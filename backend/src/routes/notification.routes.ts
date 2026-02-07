import express from 'express';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import * as NotificationController from '../controllers/notification.controller.js';

const router = express.Router();

// Route: GET /api/notifications
router.get('/', authenticateUser, NotificationController.getNotifications);

// Route: PUT /api/notifications/:id/read
router.put('/:id/read', authenticateUser, NotificationController.markRead);

export default router;