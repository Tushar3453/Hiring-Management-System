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

// GET All Jobs
export const getJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await JobService.getAllJobs();
    res.status(200).json(jobs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// GET Single Job
export const getSingleJob = async (req: Request, res: Response) => {
  try {
    const job = await JobService.getJobById(req.params.id as string);
    
    if (!job) {
       res.status(404).json({ message: "Job not found" });
       return;
    }
    
    res.status(200).json(job);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};