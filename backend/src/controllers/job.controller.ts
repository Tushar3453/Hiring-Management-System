import { Request, Response } from 'express';
import * as JobService from '../services/job.service.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

// Create Job
export const postJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const recruiterId = req.user?.id;

    if (!recruiterId) {
       res.status(401).json({ message: "Unauthorized" });
       return;
    }

    const job = await JobService.createJob(req.body, recruiterId);
    res.status(201).json({ message: "Job posted successfully!", job });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// GET All Jobs (with Search & Filters)
export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    // Explicitly casting query params to string
    const query = req.query.query as string | undefined;
    const location = req.query.location as string | undefined;
    const jobType = req.query.jobType as string | undefined;
    const experienceLevel = req.query.experienceLevel as string | undefined;

    const jobs = await JobService.getAllJobs(query, location, jobType, experienceLevel);
    
    res.status(200).json(jobs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// GET Single Job
export const getSingleJob = async (req: Request, res: Response): Promise<void> => {
  try {
    // Cast req.params.id to string
    const jobId = req.params.id as string;

    const job = await JobService.getJobById(jobId);
    
    if (!job) {
       res.status(404).json({ message: "Job not found" });
       return;
    }
    
    res.status(200).json(job);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Recruiter: Get posted jobs
export const getMyJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const recruiterId = req.user?.id;

    if (!recruiterId) {
       res.status(401).json({ message: "Unauthorized" });
       return;
    }

    const jobs = await JobService.getJobsByRecruiter(recruiterId);
    res.status(200).json(jobs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Recruiter: Edit or Close (Soft Delete) Job
export const updateJob = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Cast req.params.id to string 
        const jobId = req.params.id as string;
        const recruiterId = req.user?.id;

        if (!recruiterId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const updatedJob = await JobService.updateJob(jobId, recruiterId, req.body);
        
        res.status(200).json(updatedJob);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};