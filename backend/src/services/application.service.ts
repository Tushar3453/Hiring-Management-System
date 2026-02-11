import { prisma } from '../config/prisma.js';
import { ApplicationStatus } from '@prisma/client';
import { calculateATSScore } from '../utils/ats.js';
import { sendNotification } from './notification.service.js';
import {
  sendInterviewEmail,
  sendOfferEmail,
  sendOfferResponseEmail,
  sendApplicationReceivedEmail,
  sendRejectionEmail,
  sendRescheduleRequestEmail
} from './email.service.js';

// Create Application (Student applies)
export const createApplication = async (
  userId: string,
  jobId: string,
  resumeUrl: string,     
  resumeText: string    
) => {

  // Fetch Job Data Only (We already have resume data)
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { requirements: true, title: true, recruiterId: true, companyName: true }
  });

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
  const atsResult = calculateATSScore(resumeText, job.requirements);
  console.log(`📊 ATS Score: ${atsResult.score}% for Job: ${job.title}`);

  // Create Application
  const newApplication = await prisma.application.create({
    data: {
      studentId: userId,
      jobId: jobId,
      status: 'APPLIED',
      resumeUrl: resumeUrl, 
      atsScore: atsResult.score,
      missingSkills: atsResult.missingSkills
    }
  });

  // Send "Application Received" Email
  // Fetch student email for notification
  const student = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true }
  });

  if (student) {
    sendApplicationReceivedEmail(student.email, student.firstName || "Applicant", job.companyName || "Company", job.title)
      .catch(err => console.error("Failed to send application received email:", err));
  }

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
          location: true,
          linkedin: true,
          github: true,
          website: true
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
  data?: {
    salary?: string,
    date?: string,
    note?: string,
    interviewDate?: string,
    interviewLink?: string
  }
) => {

  // Fetch Current Status + Job Details for Notification
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      status: true,
      studentId: true,
      job: { select: { title: true, companyName: true } },
      student: { select: { email: true, firstName: true } }
    }
  });

  if (!application) {
    throw new Error("Application not found");
  }

  const currentStatus = application.status;

  // Prevent Duplicate Updates
  if (currentStatus === newStatus && newStatus !== 'INTERVIEW') {
    // We allow re-updating 'INTERVIEW' status for rescheduling
    throw new Error(`Candidate is already marked as ${newStatus}. No changes made.`);
  }

  // Rule Book for Transitions
  // Allowing INTERVIEW -> INTERVIEW for rescheduling updates
  const allowedTransitions: Record<string, string[]> = {
    'APPLIED': ['SHORTLISTED', 'REJECTED'],
    'SHORTLISTED': ['INTERVIEW', 'REJECTED'],
    'INTERVIEW': ['OFFERED', 'REJECTED', 'INTERVIEW'],
    'OFFERED': ['HIRED', 'REJECTED'],
    'HIRED': [],
    'REJECTED': []
  };

  if (allowedTransitions[currentStatus] && !allowedTransitions[currentStatus].includes(newStatus)) {
    throw new Error(`Invalid Move: You cannot go directly from ${currentStatus} to ${newStatus}`);
  }

  // Prepare Update Data
  let updateData: any = { status: newStatus };

  const candidateEmail = application.student.email;
  const candidateName = application.student.firstName || "Candidate";
  const jobTitle = application.job.title;
  const companyName = application.job.companyName || "Company";

  // --- LOGIC FOR INTERVIEW ---
  if (newStatus === 'INTERVIEW') {
    if (!data?.interviewDate || !data?.interviewLink) {
      throw new Error("Interview Date and Link are required");
    }

    updateData = {
      ...updateData,
      interviewDate: new Date(data.interviewDate),
      interviewLink: data.interviewLink,
      interviewNote: data.note,
      rescheduleRequested: false, // Reset if it was requested
      isInterviewConfirmed: false // Reset confirmation
    };

    // Send Email
    sendInterviewEmail(
      candidateEmail,
      candidateName,
      companyName,
      jobTitle,
      new Date(data.interviewDate),
      data.interviewLink,
      data.note
    ).catch(err => console.error("Failed to send interview email:", err));
  }

  // --- LOGIC FOR OFFER ---
  if (newStatus === 'OFFERED' && data) {
    updateData.offerSalary = data.salary;
    updateData.joiningDate = data.date;
    updateData.offerNote = data.note;

    const salary = data.salary || "Competitive";
    sendOfferEmail(candidateEmail, candidateName, companyName, jobTitle, salary)
      .catch(err => console.error("Failed to send offer email:", err));
  }

  // Update in DB
  const updatedApp = await prisma.application.update({
    where: { id: applicationId },
    data: updateData
  });

  // --- LOGIC FOR REJECTION ---
  if (newStatus === 'REJECTED') {
    sendRejectionEmail(candidateEmail, candidateName, companyName, jobTitle)
      .catch(err => console.error("Failed to send rejection email:", err));
  }

  // In-App Notification Logic
  let message = "";
  let notifType: 'info' | 'success' | 'warning' | 'error' = 'info';

  switch (newStatus) {
    case 'SHORTLISTED':
      message = `🎉 Congratulations! You have been SHORTLISTED for ${jobTitle} at ${companyName}.`;
      notifType = 'success';
      break;

    case 'INTERVIEW':
      const dateStr = data?.interviewDate ? new Date(data.interviewDate).toLocaleDateString() : 'soon';
      message = `📅 Good News! You have been invited for an INTERVIEW for ${jobTitle} at ${companyName} on ${dateStr}. Check your dashboard to confirm.`;
      notifType = 'info'; // Blue
      break;

    case 'OFFERED':
      message = `🚀 Incredible! You have received an OFFER for the position of ${jobTitle} at ${companyName}!`;
      notifType = 'success'; // Green
      break;

    case 'REJECTED':
      message = `Update on your application for ${jobTitle} at ${companyName}. Unfortunately, the team has decided not to proceed.`;
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

export const respondToOffer = async (applicationId: string, studentId: string, action: 'ACCEPT' | 'REJECT') => {

  // Fetch Application & Recruiter Details
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        select: {
          title: true,
          recruiterId: true,
          companyName: true,
          recruiter: { select: { email: true, firstName: true } }
        }
      },
      student: {
        select: { firstName: true, lastName: true }
      }
    }
  });

  if (!application) throw new Error("Application not found");

  // Security Checks
  if (application.studentId !== studentId) {
    throw new Error("Unauthorized: You can only respond to your own applications");
  }

  if (application.status !== 'OFFERED') {
    throw new Error("Action Failed: No pending offer found to respond to.");
  }

  // Status Change (HIRED or REJECTED)
  const newStatus = action === 'ACCEPT' ? 'HIRED' : 'REJECTED';

  const updatedApp = await prisma.application.update({
    where: { id: applicationId },
    data: { status: newStatus }
  });

  // Send Notification to Recruiter
  const studentName = `${application.student.firstName} ${application.student.lastName}`;
  const jobTitle = application.job.title;
  const recruiterEmail = application.job.recruiter.email;
  const recruiterName = application.job.recruiter.firstName || "Recruiter";

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

  // Send Email to Recruiter
  sendOfferResponseEmail(
    recruiterEmail,
    recruiterName,
    studentName,
    jobTitle,
    action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED'
  ).catch(err => console.error("Failed to send recruiter email:", err));

  return updatedApp;
};

export const requestReschedule = async (applicationId: string, studentId: string, note: string) => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        select: {
          title: true,
          recruiterId: true,
          companyName: true,
          recruiter: { select: { email: true, firstName: true } } // Fetch Recruiter Email
        }
      },
      student: { select: { firstName: true, lastName: true } }
    }
  });

  if (!application) throw new Error("Application not found");

  if (application.studentId !== studentId) {
    throw new Error("Unauthorized");
  }

  if (application.status !== 'INTERVIEW') {
    throw new Error("Reschedule is only available for scheduled interviews.");
  }

  // Update DB
  const updatedApp = await prisma.application.update({
    where: { id: applicationId },
    data: {
      rescheduleRequested: true,
      rescheduleNote: note,
      isInterviewConfirmed: false
    }
  });

  // Prepare names
  const studentName = `${application.student.firstName} ${application.student.lastName}`;
  const recruiterEmail = application.job.recruiter.email;
  const recruiterName = application.job.recruiter.firstName || "Recruiter";

  // Send In-App Notification 
  await sendNotification(
    application.job.recruiterId,
    `📅 Action Required: ${studentName} requested a reschedule for ${application.job.title}.`,
    'warning'
  );

  // Send Email to Recruiter 
  sendRescheduleRequestEmail(
    recruiterEmail,
    recruiterName,
    studentName,
    application.job.title,
    note
  ).catch(err => console.error("Failed to send reschedule email:", err));

  return updatedApp;
};