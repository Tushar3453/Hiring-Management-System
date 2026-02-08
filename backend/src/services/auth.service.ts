import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from './email.service.js';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';

// REGISTER
export const registerUser = async (userData: any) => {
  const { email, password, firstName, lastName, role, companyName, institutionName } = userData;

  // Check Validations
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("User already exists");

  // Regex: Min 6 chars, 1 Uppercase, 1 Number, 1 Special Char (!@#$%^&*)
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/;

  if (!passwordRegex.test(password)) {
    throw new Error("Password must be at least 6 characters long and include at least one uppercase letter, one number, and one special character (!@#$%^&*).");
  }

  // Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save to Database
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || 'STUDENT',
      companyName: role === 'RECRUITER' ? companyName : null,
      institutionName: role === 'STUDENT' ? institutionName : null
    },
    select: {
      id: true,
      email: true,
      role: true,
      companyName: true,
      institutionName: true
    }
  });

  // using .catch() so if email fails, it doesn't crash the registration process
  sendWelcomeEmail(email, firstName)
    .catch(err => console.error("Failed to send welcome email:", err));

  return user;
};

// LOGIN
export const loginUser = async (loginData: any) => {
  const { email, password } = loginData;

  // Find User
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid email or password");

  // Match Password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

  // Generate Token
  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  return { user, token };
};

// Forgot Password Service
export const forgotPasswordService = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("User with this email does not exist");
  }

  // generate token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour

  // Database Update
  await prisma.user.update({
    where: { email },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires: passwordResetExpires
    }
  });

  // Send Email
  const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

  await sendPasswordResetEmail(user.email, resetUrl);

  return { message: "Password reset link sent to your email!" };
};

// Reset Password Service 
export const resetPasswordService = async (token: string, newPassword: string) => {
  // Validate Token & Expiry
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { gt: new Date() } // Check if expiry is in the future
    }
  });

  if (!user) {
    throw new Error("Invalid or expired token");
  }

  // Hash Password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update User & Clear Token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    }
  });

  return { message: "Password reset successful! Please login." };
};