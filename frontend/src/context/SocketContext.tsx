import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import axios from 'axios'; 

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

  // get notifications from backend
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    if (user) {
      // fetch history
      fetchNotifications(); 

      // connect socket
      const newSocket = io("http://localhost:5000"); 
      setSocket(newSocket);

      newSocket.emit("register", user.id);

      // listen for new notifications
      newSocket.on("receive_notification", (newNotif: Notification) => {
        setNotifications((prev) => [newNotif, ...prev]);
      });

      return () => {
        newSocket.disconnect();
      };
    } else {
        // logout
        if (socket) {
            socket.disconnect();
            setSocket(null);
            setNotifications([]); 
        }
    }
  }, [user]);

  // mark as read
  const markAsRead = async (id: string) => {
    // frontend update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    
    // backend update
    try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (err) {
        console.error("Failed to mark read on server");
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead }}>
      {children}
    </SocketContext.Provider>
  );
};