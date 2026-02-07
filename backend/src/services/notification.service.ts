import { prisma } from '../config/prisma.js'; 
import { getIO, userSocketMap } from '../socket.js';

export const sendNotification = async (
  recipientId: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info'
) => {
  try {
    // Save to Database (Critical for persistence)
    const notification = await prisma.notification.create({
      data: {
        recipientId,
        message,
        type,
        isRead: false,
      },
    });

    // Check if Recipient is Online
    const socketId = userSocketMap.get(recipientId);

    if (socketId) {
      try {
        const io = getIO();
        // Emit Event via Socket
        io.to(socketId).emit('receive_notification', notification);
        console.log(`🔔 Online: Sent to User ${recipientId} on Socket ${socketId}`);
      } catch (socketError) {
        console.error("⚠️ Socket Emit Failed (User will see it next login):", socketError);
      }
    } else {
      console.log(`🔕 Offline: Notification saved for User ${recipientId}`);
    }

    return notification;

  } catch (error) {
    console.error("❌ CRITICAL: Failed to create notification:", error);
    // Return null so the main app doesn't crash if notifications fail
    return null;
  }
};

export const getUserNotifications = async (userId: string) => {
  return await prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: 'desc' } // Newest first
  });
};

export const markAsRead = async (notificationId: string) => {
  // First check if it exists to avoid errors
  const exists = await prisma.notification.findUnique({
    where: { id: notificationId }
  });

  if (!exists) return null;

  return await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true }
  });
};