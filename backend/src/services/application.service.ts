import { prisma } from '../config/prisma.js';

export const createApplication = async (userId: string, jobId: string) => {
    // Check if the user has already applied for this job
    const existingApplication = await prisma.application.findFirst({
        where: {
            studentId: userId,
            jobId: jobId
        }
    });

    if (existingApplication) {
        throw new Error("You have already applied for this job");
    }

    // Create new application
    return await prisma.application.create({
        data: {
            studentId: userId,
            jobId: jobId,
            status: 'APPLIED' // Default status
        }
    });
};

export const getApplicationsByStudent = async (userId: string) => {
    return await prisma.application.findMany({
        where: { studentId: userId },
        include: {
            job: {
                select: {
                    title: true,
                    location: true,
                    companyName: true,
                    recruiter: {
                        select: { firstName: true, email: true } // Company/Recruiter info
                    }
                }
            }
        },
        orderBy: { status: 'asc' } // Sort by status or date
    });
};

// get applications by job id for recruiter
export const getApplicationsByJobId = async (jobId: string) => {
  return await prisma.application.findMany({
    where: { jobId },
    include: {
      student: {
        select: { 
          id: true, 
          firstName: true, 
          lastName: true, 
          email: true, 
          institutionName: true,
          resumeUrl: true,
          skills: true,
          bio: true,
          location: true
        }
      }
    }
  });
};

// update application status
export const updateApplicationStatus = async (applicationId: string, status: any) => {
  return await prisma.application.update({
    where: { id: applicationId },
    data: { status }
  });
};