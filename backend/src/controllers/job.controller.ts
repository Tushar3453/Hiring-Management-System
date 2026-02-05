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

// GET All Jobs
export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
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

//  Update Job 
export const updateJob = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const jobId = req.params.id as string;
        const recruiterId = req.user?.id;

        if (!recruiterId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // extract data
        const { 
            minSalary, 
            maxSalary, 
            isOpen, 
            requirements, 
            ...restOfBody 
        } = req.body;

        // (String -> Number/Boolean/Array)
        const cleanData = {
            ...restOfBody,
            
            // convert minSalary to number
            ...(minSalary !== undefined && { minSalary: Number(minSalary) }),
            
            // convert maxSalary to number
            ...(maxSalary !== undefined && { maxSalary: Number(maxSalary) }),
            
            // convert isOpen string to boolean
            ...(isOpen !== undefined && { isOpen: String(isOpen) === 'true' }),

            // convert requirements string to array
            ...(requirements !== undefined && {
                requirements: typeof requirements === 'string' 
                    ? requirements.split(',').map((s: string) => s.trim()) 
                    : requirements
            })
        };

        // send clean data to service
        const updatedJob = await JobService.updateJob(jobId, recruiterId, cleanData);
        
        res.status(200).json(updatedJob);
    } catch (error: any) {
        console.error("Update Error:", error);
        res.status(500).json({ message: error.message || "Failed to update job" });
    }
};