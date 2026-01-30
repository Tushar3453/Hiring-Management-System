import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

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
        resumeUrl: true,
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

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.id;

    // get fields from request body
    const {
      bio, location, website, linkedin, github, skills,
      companyName, designation, institutionName,
      firstName, lastName
    } = req.body;

    let resumeUrl = undefined;

    // check if a file is uploaded
    if (req.file) {
      // upload file to cloudinary
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "resumes",
        resource_type: "auto"
      });
      
      // secure link
      resumeUrl = uploadResult.secure_url;

      // remove file from local server after upload
      fs.unlinkSync(req.file.path);
    }

    // handle skills if it comes as a string from form data
    let formattedSkills = skills;
    if (typeof skills === 'string') {
      formattedSkills = skills.split(',').map((s: string) => s.trim());
    }

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
        skills: formattedSkills,
        companyName,
        designation,
        institutionName,
        ...(resumeUrl && { resumeUrl }) // only update if new resume exists
      }
    });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating profile" });
  }
};