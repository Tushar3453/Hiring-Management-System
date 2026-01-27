import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';

// A property named user can also be there
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  // Extracting token from header ("Bearer <token>")
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({ message: "Access Denied. No token provided." });
    return; 
  }

  const token = authHeader.split(" ")[1]; // ignore "Bearer"

  try {
    // Verify Token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    
    // Request object mein user data jod do (taaki aage use kar sakein)
    (req as AuthRequest).user = decoded;
    
    next(); 
  } catch (error) {
    res.status(403).json({ message: "Invalid Token" });
  }
};

// Only for Recruiters
export const authorizeRecruiter = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as AuthRequest).user;
  
  if (user?.role !== 'RECRUITER') {
    res.status(403).json({ message: "Access Denied. Recruiters only." });
    return;
  }
  
  next();
};