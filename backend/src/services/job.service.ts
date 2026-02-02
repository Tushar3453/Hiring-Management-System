import { prisma } from '../config/prisma.js';

export const createJob = async (jobData: any, recruiterId: string) => {
    const { title, description, location, minSalary, maxSalary, requirements, companyName } = jobData;

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
            recruiterId: recruiterId
        }
    });
};

// get all jobs
export const getAllJobs = async () => {
    return await prisma.job.findMany({
        orderBy: { createdAt: 'desc' }, // Latest job first
        include: {
            recruiter: {
                select: { firstName: true, lastName: true, email: true } // dont show password
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