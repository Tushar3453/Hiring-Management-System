import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware.js';

const prisma = new PrismaClient();

// Get Profile (Current User)
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // user id from auth middleware
    const userId = (req as AuthRequest).user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        bio: true,
        location: true,
        website: true,
        linkedin: true,
        github: true,
        skills: true,
        companyName: true,
        designation: true,
      }
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// Update Profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.id;
    
    // data from frontend
    const { 
      bio, location, website, linkedin, github, skills, 
      companyName, designation, institutionName,
      firstName, lastName
    } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        bio,
        location,
        website,
        linkedin,
        github,
        skills,       
        companyName,
        designation,
        institutionName
      }
    });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating profile" });
  }
};