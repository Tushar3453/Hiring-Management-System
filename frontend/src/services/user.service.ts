import api from './api.js';

// User Profile Data Type
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'STUDENT' | 'RECRUITER';
  
  // Optional Profile Fields
  bio?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  skills?: string[]; // Array of strings
  companyName?: string;
  designation?: string;
  institutionName?: string;
}

// Get Profile
export const getProfile = async () => {
  const response = await api.get<UserProfile>('/user/profile');
  return response.data;
};

// Update Profile
export const updateProfile = async (data: Partial<UserProfile>) => {
  const response = await api.put('/user/profile', data);
  return response.data;
};