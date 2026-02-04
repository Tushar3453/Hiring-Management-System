import { Request, Response } from 'express';
import * as ApplicationService from '../services/application.service.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { ApplicationStatus } from '@prisma/client';

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
    if (error.message === "You have already applied for this job") {
        res.status(400).json({ message: "You have already applied for this job" });
    } else {
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
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
    const { status, salary, date, note } = req.body; // New Status (e.g., "SHORTLISTED")
    // Recruiter can't hire manually
    if (status === 'HIRED') {
        res.status(400).json({ message: "Action Not Allowed: You cannot manually mark as HIRED. The student must accept the offer first." });
        return;
    }

    const updatedApp = await ApplicationService.updateApplicationStatus(id as string, status, { salary, date, note });
    res.status(200).json({ message: "Status updated!", updatedApp });
  } catch (error: any) {
    // Check for our custom error message
    if (error.message.includes("Invalid Move")) {
      res.status(400).json({ message: error.message }); 
    } else {
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  }
};

// Student Responds to Offer
export const studentResponse = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id  = req.params.id as string; // Application ID
        const { action } = req.body; // "ACCEPT" or "REJECT"
        const studentId = req.user?.id;

        if (!studentId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Fetch Application to verify ownership and status
        const application = await ApplicationService.getApplicationById(id); 

        if (!application) {
            res.status(404).json({ message: "Application not found" });
            return;
        }

        if (application.studentId !== studentId) {
             res.status(403).json({ message: "Access Denied: Not your application" });
             return;
        }

        if (application.status !== 'OFFERED') {
             res.status(400).json({ message: "Action Failed: No pending offer found." });
             return;
        }

        // Determine New Status
        let newStatus: ApplicationStatus;
        if (action === 'ACCEPT') {
            newStatus = ApplicationStatus.HIRED;
        } else if (action === 'REJECT') {
            newStatus = ApplicationStatus.REJECTED;
        } else {
             res.status(400).json({ message: "Invalid Action. Use ACCEPT or REJECT." });
             return;
        }

        // Update Status
        const updatedApp = await ApplicationService.updateApplicationStatus(id, newStatus);
        
        res.status(200).json({ 
            message: `Offer ${action === 'ACCEPT' ? 'Accepted' : 'Rejected'} Successfully!`, 
            status: newStatus 
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};