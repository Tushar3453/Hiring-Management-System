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
                    recruiter: {
                        select: { firstName: true, email: true } // Company/Recruiter info
                    }
                }
            }
        },
        orderBy: { status: 'asc' } // Sort by status or date
    });
};