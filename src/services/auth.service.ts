import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';

// REGISTER
export const registerUser = async (userData: any) => {
  const { email, password, firstName, lastName, role, companyName, institutionName } = userData;

  // Check Validations
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("User already exists");

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

  return user;
};

// LOGIN
export const loginUser = async (loginData: any) => {
    const { email, password } = loginData;

    // Find User
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid email or password");

    // Math Password
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