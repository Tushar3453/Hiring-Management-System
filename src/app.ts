import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js'; 
import jobRoutes from './routes/job.routes.js';
import applicationRoutes from './routes/application.routes.js';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// Health Check
app.get('/', (req, res) => {
  res.json({ message: "HMS Backend is ALIVE! 🚀" });
});

export default app;