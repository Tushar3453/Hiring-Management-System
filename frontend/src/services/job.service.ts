import api from './api';

export interface JobData {
  title: string;
  description: string;
  companyName: string;
  location: string;
  minSalary: string | number;
  maxSalary: string | number;
  currency: string;
  requirements: string[];
}

// Post a Job (Recruiter)
export const postJob = async (jobData: JobData) => {
  // Backend expects numbers, convert strings to numbers
  const payload = {
    ...jobData,
    minSalary: Number(jobData.minSalary),
    maxSalary: Number(jobData.maxSalary),
  };
  
  const response = await api.post('/jobs', payload);
  return response.data;
};

// Get All Jobs (Student)
export const getAllJobs = async () => {
  const response = await api.get('/jobs');
  return response.data;
};

// Apply for Job (Student - Future Use)
export const applyForJob = async (jobId: string) => {
  const response = await api.post('/applications', { jobId });
  return response.data;
};