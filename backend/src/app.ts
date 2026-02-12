import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js'; 
import jobRoutes from './routes/job.routes.js';
import applicationRoutes from './routes/application.routes.js';
import userRoutes from './routes/user.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import savedJobRoutes from './routes/savedJob.routes.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const app: Application = express();

// Middlewares
app.use(cors({
  origin: [
    "http://localhost:5173",                 
    process.env.CLIENT_URL || "http://localhost:5173",                
    "https://hirehub-frontend.vercel.app"    
  ],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/user', userRoutes); 
app.use('/api/notifications', notificationRoutes);
app.use('/api/saved-jobs', savedJobRoutes);

// Health Check
app.get('/', (req, res) => {
  res.json({ message: "HMS Backend is ALIVE! 🚀" });
});

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads'); 
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
    console.log("Created 'uploads' directory");
}

export default app;