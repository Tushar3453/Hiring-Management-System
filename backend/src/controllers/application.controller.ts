import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import * as ApplicationService from '../services/application.service.js';
import { parseResume } from '../utils/ats.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs'; 

interface AuthRequest extends Request {
  user?: { id: string };
  file?: Express.Multer.File; 
}

export const applyJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { jobId } = req.body;
    
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    let finalResumeUrl: string | null = null;
    let finalResumeText: string | null = null;

    // --- SCENARIO 1: User uploaded a custom resume ---
    if (req.file) {
        console.log("Processing Custom Resume...");
        
        try {
            // Read file from disk to get Buffer for Parsing
            const fileBuffer = fs.readFileSync(req.file.path);
            finalResumeText = await parseResume(fileBuffer);

            // Upload to Cloudinary using the File Path
            const cloudRes = await cloudinary.uploader.upload(req.file.path, {
                folder: "application_resumes",
                resource_type: "auto"
            });
            
            finalResumeUrl = cloudRes.secure_url;

            // Clean up: Delete local file
            fs.unlinkSync(req.file.path);

        } catch (err) {
            console.error("File processing failed", err);
            // Attempt to clean up even on error
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            throw new Error("Failed to process resume file");
        }
    } 
    // --- SCENARIO 2: Use Profile Resume ---
    else {
        const userProfile = await prisma.user.findUnique({
            where: { id: userId },
            select: { resumeUrl: true, resumeText: true }
        });

        if (!userProfile?.resumeUrl) {
            res.status(400).json({ message: "No resume found. Please upload one or apply with a file." });
            return;
        }

        finalResumeUrl = userProfile.resumeUrl;
        finalResumeText = userProfile.resumeText || ""; 
    }

    const application = await ApplicationService.createApplication(
        userId, 
        jobId, 
        finalResumeUrl, 
        finalResumeText
    );
    
    res.status(201).json(application);

  } catch (error: any) {
    console.error("Apply Error:", error);
    res.status(500).json({ message: error.message || "Failed to apply" });
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
    const { status, salary, date, note, interviewDate, interviewLink } = req.body;
    // Recruiter can't hire manually
    if (status === 'HIRED') {
      res.status(400).json({ message: "Action Not Allowed: You cannot manually mark as HIRED. The student must accept the offer first." });
      return;
    }

    const updatedApp = await ApplicationService.updateApplicationStatus(
      id as string, status, { salary, date, note, interviewDate, interviewLink });
      res.status(200).json({ message: "Status updated!", updatedApp }
    );
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
    const id = req.params.id as string;
    const { action } = req.body; // Expecting "ACCEPT" or "REJECT"
    const studentId = req.user?.id;

    if (!studentId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Validate Input
    if (action !== 'ACCEPT' && action !== 'REJECT') {
      res.status(400).json({ message: "Invalid Action. Use ACCEPT or REJECT." });
      return;
    }

    // Call Service (Logic + Notification happens there)
    const result = await ApplicationService.respondToOffer(id, studentId, action);

    res.status(200).json({
      message: `Offer ${action === 'ACCEPT' ? 'Accepted' : 'Rejected'} Successfully!`,
      status: result.status
    });

  } catch (error: any) {
    // Handle custom errors from service
    if (error.message.includes("Unauthorized") || error.message.includes("Action Failed")) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

export const rescheduleInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const { note } = req.body;
    const studentId = req.user?.id;

    if (!studentId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    if (!note) {
        res.status(400).json({ message: "A reason/note is required for rescheduling." });
        return;
    }

    await ApplicationService.requestReschedule(id as string, studentId, note);
    
    res.status(200).json({ message: "Reschedule request sent to recruiter." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};