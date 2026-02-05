import {prisma} from '../config/prisma.js'; 
import { getIO, userSocketMap } from '../socket.js';

export const sendNotification = async (
  recipientId: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info'
) => {
  try {
    // Save to Database (Persistence)
    const notification = await prisma.notification.create({
      data: {
        recipientId,
        message,
        type,
        isRead: false,
      },
    });

    // Check if Recipient is Online (Real-time)
    const socketId = userSocketMap.get(recipientId);

    if (socketId) {
      // Emit Event via Socket
      const io = getIO();
      io.to(socketId).emit('receive_notification', notification);
      console.log(`🔔 Notification sent to User ${recipientId} on Socket ${socketId}`);
    } else {
      console.log(`🔕 User ${recipientId} is offline. Notification saved to DB.`);
    }

    return notification;

  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

// Helper: Get all notifications for a user
export const getUserNotifications = async (userId: string) => {
  return await prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: 'desc' }
  });
};

// Helper: Mark as read
export const markAsRead = async (notificationId: string) => {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true }
  });
};