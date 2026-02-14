import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";

let io: SocketIOServer;

// Map to store which user is on which socket
// Format: { "userId": "socketId" }
export const userSocketMap = new Map<string, string>();

export const initSocket = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials:true
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 User Connected:", socket.id);

    // When a user logs in, they send their UserID
    socket.on("register", (userId: string) => {
      if (userId) {
        userSocketMap.set(userId, socket.id);
        console.log(`🔗 Mapped User ${userId} to Socket ${socket.id}`);
      }
    });

    // Cleanup on disconnect
    socket.on("disconnect", () => {
      console.log("🔴 User Disconnected:", socket.id);
      // remove user from map (loop through entries)
      for (const [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          break;
        }
      }
    });
  });

  return io;
};

// Helper to get IO instance anywhere in the app
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};