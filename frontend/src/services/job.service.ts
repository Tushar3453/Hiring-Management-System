import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// get all jobs
export const getAllJobs = async (token: string) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  const response = await axios.get(`${API_URL}/jobs`, config);
  return response.data;
};

// apply for job
export const applyForJob = async (jobId: string, token: string) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  // Backend expects: { jobId: "..." }
  const response = await axios.post(`${API_URL}/applications`, { jobId }, config);
  return response.data;
};