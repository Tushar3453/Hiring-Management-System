import nodemailer from 'nodemailer';
import dns from 'dns';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

try {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {
  console.log("Could not set default result order, ignoring...");
}

console.log("📧 Email Config Check:");
console.log("USER:", process.env.MAIL_USER ? "Loaded ✅" : "Missing ❌");

// Configure Transporter 
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3' 
  },
  localAddress: '0.0.0.0', 
} as any);

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("🚨 Transporter Error:", error);
  } else {
    console.log("✅ Server is ready to take our messages");
  }
});

// Generic Send Function
export const sendEmail = async (to: string, subject: string, htmlContent: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"HireHub Team" <${process.env.MAIL_USER}>`, // Sender Name
      to: to, // Receiver
      subject: subject, // Subject Line
      html: htmlContent, // HTML Body 
    });

    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);

    return null;
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  const subject = "Welcome to HireHub! 🚀";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2563eb;">Welcome to HireHub, ${name}!</h2>
      <p>We are thrilled to have you on board.</p>
      <p>Start exploring jobs or posting vacancies today.</p>
      <br>
      <p>Best regards,<br>The HireHub Team</p>
    </div>
  `;
  return await sendEmail(email, subject, html);
};

// Interview Schedule Email 
export const sendInterviewEmail = async (
  email: string,
  name: string,
  company: string,
  role: string,
  date: Date,
  link: string,
  note?: string
) => {
  const subject = `Interview Invitation: ${company} for ${role}`;

  // Format Date nicely (e.g., "Monday, February 12, 2024 at 10:00 AM")
  const formattedDate = new Date(date).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2563eb;">Interview Invitation 📅</h2>
      <p>Dear ${name},</p>
      <p>We are pleased to invite you for an interview for the <strong>${role}</strong> position at <strong>${company}</strong>.</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>🕒 Time:</strong> ${formattedDate}</p>
        <p><strong>🔗 Link:</strong> <a href="${link}" target="_blank">${link}</a></p>
        ${note ? `<p><strong>📝 Note:</strong> ${note}</p>` : ''}
      </div>

      <p>Please login to your dashboard to <strong>Confirm</strong> your availability.</p>
      <br>
      <p>Best of luck,<br>The HireHub Team</p>
    </div>
  `;
  return await sendEmail(email, subject, html);
};

// Job Offer Email
export const sendOfferEmail = async (email: string, name: string, company: string, role: string, salary: string) => {
  const subject = `Congratulations! Job Offer from ${company} 🎉`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #16a34a;">You're Hired! (Almost) 🥂</h2>
      <p>Dear ${name},</p>
      <p>We are delighted to inform you that <strong>${company}</strong> has extended a job offer for the position of <strong>${role}</strong>.</p>
      
      <div style="background-color: #f0fdf4; padding: 15px; border-left: 5px solid #16a34a; margin: 20px 0;">
        <p style="margin: 0;"><strong>Offered Salary:</strong> ${salary} LPA</p>
      </div>

      <p>Please login to your dashboard to <strong>Accept</strong> or <strong>Reject</strong> this offer.</p>
      <br>
      <a href="${CLIENT_URL}/my-applications" style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Offer Letter</a>
      <p>Congratulations again,<br>The HireHub Team</p>
    </div>
  `;
  return await sendEmail(email, subject, html);
};

// Recruiter Notification Email (Offer Response) 📢
export const sendOfferResponseEmail = async (
  recruiterEmail: string,
  recruiterName: string,
  studentName: string,
  jobTitle: string,
  action: 'ACCEPTED' | 'REJECTED'
) => {
  const subject = action === 'ACCEPTED'
    ? `🎉 Offer Accepted! ${studentName} is joining your team`
    : `⚠️ Offer Rejected by ${studentName}`;

  const color = action === 'ACCEPTED' ? '#16a34a' : '#dc2626'; // Green or Red
  const statusText = action === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED';

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: ${color};">${action === 'ACCEPTED' ? 'Great News! 🥂' : 'Update on Offer'}</h2>
      <p>Hello ${recruiterName},</p>
      <p><strong>${studentName}</strong> has <strong>${statusText}</strong> your job offer for the position of <strong>${jobTitle}</strong>.</p>
      
      <p>Please login to your dashboard to view the updated status.</p>
      <br>
      <a href="${CLIENT_URL}/dashboard" style="background-color: ${color}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Application</a>
      <p>Best regards,<br>The HireHub Team</p>
    </div>
  `;

  return await sendEmail(recruiterEmail, subject, html);
};

// Application Received (Student applies)
export const sendApplicationReceivedEmail = async (email: string, name: string, company: string, role: string) => {
  const subject = `Application Received: ${role} at ${company}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2563eb;">Hi ${name},</h2>
      <p>Thanks for applying to <strong>${company}</strong> for the position of <strong>${role}</strong>.</p>
      <p>We have received your application and the team is reviewing it.</p>
      <br>
      <p>We will get back to you if your profile matches our requirements.</p>
      <p>Best regards,<br>The HireHub Team</p>
    </div>
  `;
  return await sendEmail(email, subject, html);
};

// Rejection Email 
export const sendRejectionEmail = async (email: string, name: string, company: string, role: string) => {
  const subject = `Update on your application for ${role}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <p>Dear ${name},</p>
      <p>Thank you for giving us the opportunity to consider your application for the <strong>${role}</strong> position at <strong>${company}</strong>.</p>
      <p>After careful review, we have decided to move forward with other candidates who more closely match our current requirements.</p>
      <br>
      <p>We appreciate your interest and wish you the best in your job search.</p>
      <p>Sincerely,<br>${company} Hiring Team</p>
    </div>
  `;
  return await sendEmail(email, subject, html);
};

// Forgot Password Email 
export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  const subject = "Reset Your Password - HireHub";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #dc2626;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password for your HireHub account.</p>
      <p>Click the button below to set a new password. This link is valid for <strong>1 hour</strong>.</p>
      <br>
      <a href="${resetLink}" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      <br><br>
      <p>Or copy and paste this link in your browser:</p>
      <p style="color: #007bff;">${resetLink}</p>
      <br>
      <p style="font-size: 12px; color: #666;">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
    </div>
  `;
  return await sendEmail(email, subject, html);
};

export const sendRescheduleRequestEmail = async (
  email: string,
  recruiterName: string,
  studentName: string,
  jobTitle: string,
  note: string
) => {
  const subject = `Reschedule Requested: ${studentName} for ${jobTitle}`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #ea580c;">Reschedule Requested 📅</h2>
      <p>Hello ${recruiterName},</p>
      <p>Candidate <strong>${studentName}</strong> has requested to reschedule their interview for the <strong>${jobTitle}</strong> position.</p>
      
      <div style="background-color: #fff7ed; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ea580c;">
        <p><strong>📝 Reason/Note:</strong></p>
        <p style="font-style: italic;">"${note}"</p>
      </div>

      <p>Please login to your dashboard to update the interview time.</p>
      <br>
      <a href="${CLIENT_URL}/recruiter-dashboard" style="background-color: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
    </div>
  `;

  return await sendEmail(email, subject, html);
};

