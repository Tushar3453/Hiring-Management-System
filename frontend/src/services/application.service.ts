import api from './api';

export interface Application {
  id: string;
  status: 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'OFFERED' | 'HIRED' | 'REJECTED';
  job: {
    title: string;
    companyName: string;
    location: string;
    recruiter: {
      firstName: string;
      email: string;
    };
  };
}

export interface Applicant {
  id: string;
  status: 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'OFFERED' | 'HIRED' | 'REJECTED';
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    resumeUrl?: string;
    skills: string[];
    bio?: string;
    institutionName?: string;
  };
}

// Get logged-in user's applications
export const getMyApplications = async () => {
  const response = await api.get('/applications/history');
  return response.data;
};

// Recruiter: Get all applicants for a specific job
export const getJobApplications = async (jobId: string) => {
  const response = await api.get(`/applications/job/${jobId}`);
  return response.data;
};

// Recruiter: Update applicant status
export const updateApplicationStatus = async (appId: string, status: string, offerDetails?: any) => {
  // If offerDetails exists, spread it into the body
  const payload = { status, ...offerDetails };
  const response = await api.patch(`/applications/${appId}/status`, payload);
  return response.data;
};

// Student: Accept/Reject Offer
export const respondToOffer = async (applicationId: string, action: 'ACCEPT' | 'REJECT') => {
  const response = await api.patch(`/applications/${applicationId}/response`, { action });
  return response.data;
};