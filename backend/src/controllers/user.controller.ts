import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import { parseResume } from '../utils/ats.js'; 

const prisma = new PrismaClient();

// Get Profile (Current User)
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
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
        institutionName: true,
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

    let resumeUrl: string | undefined = undefined;
    let resumeText: string | undefined = undefined;

    if (req.file) {
      console.log("Processing Resume Upload...");
      
      try {
        const filePath = req.file.path;
        
        // Since we are using diskStorage, we must read the file into a buffer for pdf-parse
        const fileBuffer = fs.readFileSync(filePath); 

        // Run Upload and Parsing in Parallel
        const [uploadResult, parsedText] = await Promise.all([
          cloudinary.uploader.upload(filePath, {
            folder: "resumes",
            resource_type: "auto"
          }),
          parseResume(fileBuffer) // Extract text using buffer
        ]);
        
        resumeUrl = uploadResult.secure_url;
        resumeText = parsedText;

        console.log("Resume Parsed. Text Length:", resumeText.length);

        // Remove file from local server after processing
        fs.unlinkSync(filePath);

      } catch (err) {
        console.error("Resume processing failed:", err);
        // Clean up file if it exists and error occurred
        if (req.file && fs.existsSync(req.file.path)) {
           fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: "Failed to process resume file" });
        return;
      }
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
        ...(resumeUrl && { resumeUrl }), // Update URL if new file
        ...(resumeText && { resumeText }) // Update Text if new file
      }
    });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating profile" });
  }
};