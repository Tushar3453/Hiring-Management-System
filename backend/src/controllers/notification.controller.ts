import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js'; 
import * as NotificationService from '../services/notification.service.js';

// GET: Fetch all notifications
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const notifications = await NotificationService.getUserNotifications(userId);
    res.status(200).json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// PUT: Mark single notification as read
export const markRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const  id  = req.params.id as string;
    await NotificationService.markAsRead(id);
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};