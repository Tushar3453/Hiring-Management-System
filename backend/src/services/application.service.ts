import { prisma } from '../config/prisma.js'; 
import { ApplicationStatus } from '@prisma/client';
import { calculateATSScore } from '../utils/ats.js'; 
import { sendNotification } from './notification.service.js'; 

// Create Application (Student applies)
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
  
  return newApplication;
};

// Get Student's History
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
    orderBy: { createdAt: 'desc' } 
  });
};

// Get Job Applicants (Recruiter View)
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
    orderBy: { atsScore: 'desc' } // Show highest score first
  });
};

// Get Single App
export const getApplicationById = async (id: string) => {
  return await prisma.application.findUnique({
    where: { id },
    include: {
      job: { select: { title: true, companyName: true, recruiterId: true } },
      student: { select: { firstName: true, lastName: true } }
    }
  });
};

// UPDATE STATUS 
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
        studentId: true, 
        job: {
            select: { title: true, companyName: true } 
        }
    }
  });

  if (!application) {
    throw new Error("Application not found");
  }

  const currentStatus = application.status;

  // Prevent Duplicate Updates
  if (currentStatus === newStatus) {
    throw new Error(`Candidate is already marked as ${newStatus}. No changes made.`);
  }

  // Rule Book for Transitions
  const allowedTransitions: Record<string, string[]> = {
    'APPLIED': ['SHORTLISTED', 'REJECTED'],
    'SHORTLISTED': ['INTERVIEW', 'REJECTED'],
    'INTERVIEW': ['OFFERED', 'REJECTED'],
    'OFFERED': ['HIRED', 'REJECTED'],
    'HIRED': [],   
    'REJECTED': [] 
  };

  if (allowedTransitions[currentStatus] && !allowedTransitions[currentStatus].includes(newStatus)) {
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

  // Custom Notification Messages & Types
  let message = "";
  let notifType: 'info' | 'success' | 'warning' | 'error' = 'info';

  const jobTitle = application.job.title;
  const company = application.job.companyName;

  switch (newStatus) {
    case 'SHORTLISTED':
      message = `🎉 Congratulations! You have been SHORTLISTED for ${jobTitle} at ${company}.`;
      notifType = 'success';
      break;

    case 'INTERVIEW':
      message = `📅 Good News! You have been invited for an INTERVIEW for ${jobTitle} at ${company}. Check your email/dashboard for details.`;
      notifType = 'info'; // Blue
      break;

    case 'OFFERED':
      message = `🚀 Incredible! You have received an OFFER for the position of ${jobTitle} at ${company}!`;
      notifType = 'success'; // Green
      break;

    case 'REJECTED':
      message = `Update on your application for ${jobTitle} at ${company}. Unfortunately, the team has decided not to proceed.`;
      notifType = 'error'; // Red
      break;

    case 'HIRED':
      message = `🎊 You are officially HIRED for ${jobTitle}! Welcome to the team.`;
      notifType = 'success';
      break;

    default:
      message = `Update: Your application status for ${jobTitle} is now ${newStatus}.`;
      notifType = 'info';
  }

  // Send Notification
  await sendNotification(application.studentId, message, notifType);

  return updatedApp;
};

// Student Responds to Offer
export const respondToOffer = async (applicationId: string, studentId: string, action: 'ACCEPT' | 'REJECT') => {
  
  // Fetch Application + Recruiter Info 
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        select: { title: true, recruiterId: true, companyName: true }
      },
      student: {
        select: { firstName: true, lastName: true }
      }
    }
  });

  if (!application) throw new Error("Application not found");

  // Validation Checks
  if (application.studentId !== studentId) {
    throw new Error("Unauthorized: You can only respond to your own applications");
  }

  if (application.status !== 'OFFERED') {
    throw new Error("Action Failed: No pending offer found to respond to.");
  }

  // Determine New Status
  const newStatus = action === 'ACCEPT' ? 'HIRED' : 'REJECTED';

  // Update Database
  const updatedApp = await prisma.application.update({
    where: { id: applicationId },
    data: { status: newStatus }
  });

  // Notify Recruiter
  const studentName = `${application.student.firstName} ${application.student.lastName}`;
  const jobTitle = application.job.title;

  if (action === 'ACCEPT') {
    await sendNotification(
      application.job.recruiterId,
      `🎉 Great News! ${studentName} has ACCEPTED your offer for ${jobTitle}!`,
      'success'
    );
  } else {
    await sendNotification(
      application.job.recruiterId,
      `⚠️ Update: ${studentName} has REJECTED your offer for ${jobTitle}.`,
      'error'
    );
  }

  return updatedApp;
};