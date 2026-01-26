import { Request, Response } from 'express';
import * as JobService from '../services/job.service.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const postJob = async (req: Request, res: Response) => {
  try {
    // Get User ID from AuthRequest
    const recruiterId = (req as AuthRequest).user?.id;

    if (!recruiterId) {
       res.status(401).json({ message: "Unauthorized" });
       return;
    }

    // call service
    const job = await JobService.createJob(req.body, recruiterId);
    
    res.status(201).json({ message: "Job posted successfully!", job });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};