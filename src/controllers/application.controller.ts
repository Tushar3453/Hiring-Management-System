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

// Recruiter: To see job applicants
export const getJobApplications = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const applications = await ApplicationService.getApplicationsByJobId(jobId as string);
    res.status(200).json(applications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Recruiter: To update application status
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Application ID
    const { status } = req.body; // New Status (e.g., "SHORTLISTED")

    const updatedApp = await ApplicationService.updateApplicationStatus(id as string, status);
    res.status(200).json({ message: "Status updated!", updatedApp });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};