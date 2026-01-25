import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health Check Route (Sirf ye check karne ke liye ki server chal raha hai)
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: "HMS Backend is Running! 🚀" });
});

export default app;