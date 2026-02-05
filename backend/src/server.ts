import { createServer } from 'http';
import app from './app.js';
import { initSocket } from './socket.js'; 

const PORT = process.env.PORT || 5000;

// Create Raw HTTP Server (wrapping Express app)
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`
  ========================================
  🚀 Server is flying on port ${PORT} (Socket.io Ready)
  🔗 http://localhost:${PORT}
  ========================================
  `);
});