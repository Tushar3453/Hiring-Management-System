import api from './api';


// Forgot Password API Call
export const forgotPassword = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

// Reset Password API Call
export const resetPassword = async (token: string, password: string) => {
  const response = await api.post(`/auth/reset-password/${token}`, { password });
  return response.data;
};