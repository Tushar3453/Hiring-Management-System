import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import api from '../services/api'; 

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
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_BASE_URL.replace('/api', ''); 

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

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      // Using 'api' instance (Header/Token is auto-attached)
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    if (user) {
      // Fetch old notifications
      fetchNotifications(); 

      // Connect Socket
      console.log("Connecting to Socket at:", SOCKET_URL);
      const newSocket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"] // fallback for cloud servers
      }); 
      setSocket(newSocket);

      // Register User ID
      newSocket.emit("register", user.id);

      // Listen for new notifications
      newSocket.on("receive_notification", (newNotif: Notification) => {
        setNotifications((prev) => [newNotif, ...prev]);
      });

      return () => {
        newSocket.disconnect();
      };
    } else {
        // Logout cleanup
        if (socket) {
            socket.disconnect();
            setSocket(null);
            setNotifications([]); 
        }
    }
  }, [user]);

  // Mark as read
  const markAsRead = async (id: string) => {
    // Optimistic UI Update (Immediate)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    
    // Backend Update
    try {
        await api.put(`/notifications/${id}/read`);
    } catch (err) {
        console.error("Failed to mark read on server", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead }}>
      {children}
    </SocketContext.Provider>
  );
};