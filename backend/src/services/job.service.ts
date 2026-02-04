import { prisma } from '../config/prisma.js';

export const createJob = async (jobData: any, recruiterId: string) => {
    const { title, description, location, minSalary, maxSalary, requirements, companyName, jobType, experienceLevel } = jobData;

    // Fetch recruiter details
    const recruiter = await prisma.user.findUnique({
        where: { id: recruiterId }
    });

    if (!recruiter) throw new Error("Recruiter not found");

    // Determine Company Name (Priority: Job Post > Profile > Default)
    const finalCompanyName = companyName || recruiter.companyName || "Unknown Company";

    // Job Create
    return await prisma.job.create({
        data: {
            title,
            description,
            companyName: finalCompanyName,
            location: location || "Remote",
            minSalary: Number(minSalary),
            maxSalary: Number(maxSalary),
            requirements: requirements || [],
            recruiterId: recruiterId,
            jobType: jobType || "Full Time",
            experienceLevel: experienceLevel || null
        }
    });
};

// get all jobs with search and filter
export const getAllJobs = async (query?: string, location?: string, jobType?: string, experienceLevel?: string) => {
    return await prisma.job.findMany({
        where: {
            AND: [
                { isOpen: true },
                // if query is present then search in title and companyName
                query ? {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { companyName: { contains: query, mode: 'insensitive' } },
                    ]
                } : {},
                // if location is present then search in location
                location ? {
                    location: { contains: location, mode: 'insensitive' }
                } : {},
                jobType ? {
                    jobType: { equals: jobType, mode: 'insensitive' }
                } : {},
                experienceLevel ? {
                    experienceLevel: { equals: experienceLevel, mode: 'insensitive' }
                } : {}
            ]
        },
        orderBy: { createdAt: 'desc' },
        include: {
            recruiter: {
                select: { firstName: true, email: true }
            }
        }
    });
};

// get job by id
export const getJobById = async (id: string) => {
    return await prisma.job.findUnique({
        where: { id },
        include: {
            recruiter: {
                select: { firstName: true, email: true }
            }
        }
    });
};

// Get jobs posted by a specific recruiter with application count
export const getJobsByRecruiter = async (recruiterId: string) => {
    return await prisma.job.findMany({
        where: { recruiterId },
        include: {
            _count: {
                select: { apps: true } // to count applications
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

// EDIT & CLOSE JOB
export const updateJob = async (jobId: string, recruiterId: string, updateData: any) => {
    // Check if job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error("Job not found");

    // Security Check
    if (job.recruiterId !== recruiterId) {
        throw new Error("Unauthorized: You can only edit your own jobs");
    }

    // Update Job
    return await prisma.job.update({
        where: { id: jobId },
        data: updateData // send isOpen: false to close the job
    });
};