import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import * as SavedJobService from '../services/savedJob.service.js'; 

export const toggleSaveJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { jobId } = req.body;

    if (!userId) {
       res.status(401).json({ message: "Unauthorized" });
       return;
    }

    // Call Service
    const result = await SavedJobService.toggleSavedJob(userId, jobId);
    
    // Return result
    const statusCode = result.isSaved ? 201 : 200;
    res.status(statusCode).json(result);

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSavedJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return; 
    }

    // Call Service
    const jobs = await SavedJobService.getUserSavedJobs(userId);
    
    res.status(200).json(jobs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};