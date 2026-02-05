import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { AuthContext } from './AuthContext';

// Define the shape of a Notification
export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

interface SocketContextType {
  socket: Socket | null;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Helper Hook
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within a SocketProvider");
  return context;
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const auth = useContext(AuthContext);
  const user = auth?.user; 

  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initialize Connection when User Logs In
  useEffect(() => {
    if (user) {
      const newSocket = io("http://localhost:5000"); 

      setSocket(newSocket);

      // Register the User ID so the server knows who we are
      newSocket.emit("register", user.id);

      // Listen for incoming notifications
      newSocket.on("receive_notification", (newNotif: Notification) => {
        setNotifications((prev) => [newNotif, ...prev]);
        // Optional: Play a sound here (future)
      });

      return () => {
        newSocket.disconnect();
      };
    } else {
        // If user logs out, close connection
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    }
  }, [user]);

  // Helper: Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead }}>
      {children}
    </SocketContext.Provider>
  );
};