import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Toggle Save Logic
export const toggleSavedJob = async (userId: string, jobId: string) => {
  // Check if already saved
  const existing = await prisma.savedJob.findUnique({
    where: {
      userId_jobId: { userId, jobId }
    }
  });

  if (existing) {
    // If exists -> Delete (Unsave)
    await prisma.savedJob.delete({
      where: { id: existing.id }
    });
    return { isSaved: false, message: "Job removed from saved list" };
  } else {
    // If doesnt exist -> Create (Save)
    await prisma.savedJob.create({
      data: { userId, jobId }
    });
    return { isSaved: true, message: "Job saved successfully" };
  }
};

// Get All Saved Jobs Logic
export const getUserSavedJobs = async (userId: string) => {
  const savedJobs = await prisma.savedJob.findMany({
    where: { userId },
    include: {
      job: {
        include: { 
          recruiter: { 
            select: { companyName: true, location: true } 
          } 
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Return just the job details
  return savedJobs.map((item) => item.job);
};