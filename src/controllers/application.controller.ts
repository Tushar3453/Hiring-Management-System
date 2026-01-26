import { Request, Response } from 'express';
import * as ApplicationService from '../services/application.service.js';
import { AuthRequest } from '../middlewares/auth.middleware.js'; 

export const applyJob = async (req: Request, res: Response) => {
  try {
    // get user id from auth middleware
    const userId = (req as AuthRequest).user?.id;
    const { jobId } = req.body;

    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    
    if (!jobId) {
        res.status(400).json({ message: "Job ID is required" });
        return;
    }

    const application = await ApplicationService.createApplication(userId, jobId);
    
    res.status(201).json({ 
      message: "Applied successfully! Good luck!", 
      application 
    });
  } catch (error: any) {
    // if duplicate application, send 400 Bad Request
    res.status(400).json({ error: error.message });
  }
};

export const getMyApplications = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.id;

    if (!userId) {
       res.status(401).json({ message: "Unauthorized" });
       return;
    }

    const applications = await ApplicationService.getApplicationsByStudent(userId);
    res.status(200).json(applications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};