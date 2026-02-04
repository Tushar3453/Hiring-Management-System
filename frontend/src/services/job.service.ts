import api from './api';

export interface JobData {
  id?: string;
  title: string;
  description: string;
  companyName: string;
  location: string;
  minSalary: string | number;
  maxSalary: string | number;
  currency: string;
  requirements: string[];
  jobType?: string;
  createdAt?: string;
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
export const getAllJobs = async (query?: string, location?: string) => {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  if (location) params.append('location', location);

  const response = await api.get(`/jobs?${params.toString()}`);
  return response.data;
};

// Get Single Job (Student)
export const getJobById = async (id: string) => {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
};

// Apply for Job (Student - Future Use)
export const applyForJob = async (jobId: string) => {
  const response = await api.post('/applications', { jobId });
  return response.data;
};

// Get Recruiter's Jobs
export const getMyJobs = async () => {
  const response = await api.get('/jobs/my-jobs');
  return response.data;
};

// Update Job (Used for Edit and Close/Soft Delete)
export const updateJob = async (jobId: string, jobData: any) => {
  const response = await api.put(`/jobs/${jobId}`, jobData);
  return response.data;
};

// Helper specifically for closing logic if you want semantic naming
export const toggleJobStatus = async (jobId: string, currentStatus: boolean) => {
  return await updateJob(jobId, { isOpen: !currentStatus });
};