-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "experienceLevel" TEXT,
ADD COLUMN     "jobType" TEXT NOT NULL DEFAULT 'Full Time';
