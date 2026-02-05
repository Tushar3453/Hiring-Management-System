import { prisma } from '../config/prisma.js'; 
import { ApplicationStatus } from '@prisma/client';
import { calculateATSScore } from '../utils/ats.js'; 

export const createApplication = async (userId: string, jobId: string) => {
  
  // Parallel Fetch: Get Student Data AND Job Data
  const [student, job] = await Promise.all([
    prisma.user.findUnique({ 
      where: { id: userId },
      select: { resumeUrl: true, resumeText: true } // Fetch Text too!
    }),
    prisma.job.findUnique({
      where: { id: jobId },
      select: { requirements: true, title: true } // Fetch Skills
    })
  ]);

  // Validations
  if (!student || !student.resumeUrl) {
    throw new Error("Please upload a resume in your profile before applying.");
  }
  if (!job) {
    throw new Error("Job not found.");
  }

  // Check for Existing Application
  const existingApplication = await prisma.application.findFirst({
    where: { studentId: userId, jobId: jobId }
  });

  if (existingApplication) {
    throw new Error("You have already applied for this job");
  }

  // EXECUTE ATS LOGIC 
  // We compare the Student's Stored Text vs Job Requirements
  const atsResult = calculateATSScore(student.resumeText || "", job.requirements);
  
  console.log(`📊 ATS Score: ${atsResult.score}% for Job: ${job.title}`);

  // Create Application with Snapshot Data
  return await prisma.application.create({
    data: {
      studentId: userId,
      jobId: jobId,
      status: 'APPLIED',
      
      // Snapshot Data
      resumeUrl: student.resumeUrl,
      atsScore: atsResult.score,        
      missingSkills: atsResult.missingSkills 
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

// get application by id for student
export const getApplicationById = async (id: string) => {
  return await prisma.application.findUnique({
    where: { id }
  });
};

// update application status
export const updateApplicationStatus = async (
  applicationId: string,
  newStatus: ApplicationStatus,
  offerDetails?: { salary: string, date: string, note: string }
) => {

  // Fetch Current Status from DB
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { status: true }
  });

  if (!application) {
    throw new Error("Application not found");
  }

  const currentStatus = application.status;

  // Define The Rule Book (Allowed Transitions)
  const allowedTransitions: Record<string, string[]> = {
    'APPLIED': ['SHORTLISTED', 'REJECTED'],
    'SHORTLISTED': ['INTERVIEW', 'REJECTED'],
    'INTERVIEW': ['OFFERED', 'REJECTED'],
    'OFFERED': ['HIRED', 'REJECTED'],
    'HIRED': [],   // Final Destination
    'REJECTED': [] // Final Destination
  };

  // Validation Check
  if (currentStatus !== newStatus && !allowedTransitions[currentStatus]?.includes(newStatus)) {
    throw new Error(`Invalid Move: You cannot go directly from ${currentStatus} to ${newStatus}`);
  }

  // Prepare Update Data
  const updateData: any = { status: newStatus };
  
  // Only add details if status is OFFERED
  if (newStatus === 'OFFERED' && offerDetails) {
      updateData.offerSalary = offerDetails.salary;
      updateData.joiningDate = offerDetails.date;
      updateData.offerNote = offerDetails.note;
  }

  // Update in DB (Only if validation passes)
  return await prisma.application.update({
    where: { id: applicationId },
    data: updateData
  });
};