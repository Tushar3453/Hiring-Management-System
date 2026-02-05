import { prisma } from '../config/prisma.js'; 
import { ApplicationStatus } from '@prisma/client';
import { calculateATSScore } from '../utils/ats.js'; 
import { sendNotification } from './notification.service.js'; 

export const createApplication = async (userId: string, jobId: string) => {
  
  // Parallel Fetch: Get Student Data AND Job Data
  const [student, job] = await Promise.all([
    prisma.user.findUnique({ 
      where: { id: userId },
      select: { firstName: true, lastName: true, resumeUrl: true, resumeText: true } 
    }),
    prisma.job.findUnique({
      where: { id: jobId },
      select: { requirements: true, title: true, recruiterId: true } 
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
  const atsResult = calculateATSScore(student.resumeText || "", job.requirements);
  console.log(`📊 ATS Score: ${atsResult.score}% for Job: ${job.title}`);

  // Create Application
  const newApplication = await prisma.application.create({
    data: {
      studentId: userId,
      jobId: jobId,
      status: 'APPLIED',
      resumeUrl: student.resumeUrl,
      atsScore: atsResult.score,        
      missingSkills: atsResult.missingSkills 
    }
  });

  // NOTIFICATION TRIGGER (To Recruiter)
  if (job.recruiterId) {
    await sendNotification(
        job.recruiterId,
        `New Applicant: ${student.firstName} ${student.lastName} has applied for ${job.title}.`,
        'info'
    );
  }

  return newApplication;
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
            select: { firstName: true, email: true } 
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' } // newest apply is first
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
    },
    orderBy: { atsScore: 'desc' } // Show highest score candidates first
  });
};

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

  // Fetch Current Status + Job Details for Notification
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { 
        status: true,
        studentId: true, // Needed for notification
        job: {
            select: { title: true, companyName: true } // Needed for notification message
        }
    }
  });

  if (!application) {
    throw new Error("Application not found");
  }

  const currentStatus = application.status;

  // Rule Book
  const allowedTransitions: Record<string, string[]> = {
    'APPLIED': ['SHORTLISTED', 'REJECTED'],
    'SHORTLISTED': ['INTERVIEW', 'REJECTED'],
    'INTERVIEW': ['OFFERED', 'REJECTED'],
    'OFFERED': ['HIRED', 'REJECTED'],
    'HIRED': [],   
    'REJECTED': [] 
  };

  if (currentStatus !== newStatus && !allowedTransitions[currentStatus]?.includes(newStatus)) {
    throw new Error(`Invalid Move: You cannot go directly from ${currentStatus} to ${newStatus}`);
  }

  // Prepare Update Data
  const updateData: any = { status: newStatus };
  
  if (newStatus === 'OFFERED' && offerDetails) {
      updateData.offerSalary = offerDetails.salary;
      updateData.joiningDate = offerDetails.date;
      updateData.offerNote = offerDetails.note;
  }

  // Update in DB
  const updatedApp = await prisma.application.update({
    where: { id: applicationId },
    data: updateData
  });

  // NOTIFICATION TRIGGER (To Student)
  // determine type: Rejected = error (red), Hired/Offered = success (green), others = info (blue)
  let notifType: 'info' | 'success' | 'error' = 'info';
  if (newStatus === 'REJECTED') notifType = 'error';
  if (['OFFERED', 'HIRED'].includes(newStatus)) notifType = 'success';

  const message = `Update: Your application for ${application.job.title} at ${application.job.companyName} is now ${newStatus}.`;

  await sendNotification(application.studentId, message, notifType);

  return updatedApp;
};