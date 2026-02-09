-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "interviewDate" TIMESTAMP(3),
ADD COLUMN     "interviewLink" TEXT,
ADD COLUMN     "interviewNote" TEXT,
ADD COLUMN     "isInterviewConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rescheduleNote" TEXT,
ADD COLUMN     "rescheduleRequested" BOOLEAN NOT NULL DEFAULT false;
