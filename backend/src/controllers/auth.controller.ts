import { Request, Response } from 'express';
import * as AuthService from '../services/auth.service.js';

// Signup Handler
export const signup = async (req: Request, res: Response) => {
  try {
    const user = await AuthService.registerUser(req.body);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Login Handler
export const login = async (req: Request, res: Response) => {
  try {
    const data = await AuthService.loginUser(req.body);
    res.status(200).json({ 
      message: "Login successful", 
      token: data.token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role
      }
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

// Forgot Password 
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ message: "Email is required" });
        return; 
    }
    const result = await AuthService.forgotPasswordService(email);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Something went wrong" });
  }
};

// Reset Password 
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!password) {
        res.status(400).json({ message: "New password is required" });
        return;
    }

    const result = await AuthService.resetPasswordService(token as string, password);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Something went wrong" });
  }
};