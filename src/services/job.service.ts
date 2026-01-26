import { prisma } from '../config/prisma.js';

export const createJob = async (jobData: any, recruiterId: string) => {
  const { title, description, location, minSalary, maxSalary, requirements } = jobData;

  // Prisma query to create job
  return await prisma.job.create({
    data: {
      title,
      description,
      location: location || "Remote", // Default -> Remote
      minSalary: Number(minSalary),   // Ensure number format
      maxSalary: Number(maxSalary),
      requirements: requirements || [],
      recruiterId: recruiterId // ID from token
    }
  });
};