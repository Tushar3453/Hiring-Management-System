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
  resumeUrl?: string;
  skills?: string[]; // Array of strings
  companyName?: string;
  designation?: string;
  institutionName?: string;
}

// Get Profile
export const getProfile = async () => {
  const response = await api.get('user/profile');
  return response.data;
};

// update profile with form data
export const updateProfile = async (data: Partial<UserProfile> | FormData): Promise<UserProfile> => {
  const response = await api.put('/user/profile', data, {
    headers: {
      'Content-Type': 'multipart/form-data', // required for file upload
    },
  });
  return response.data;
};