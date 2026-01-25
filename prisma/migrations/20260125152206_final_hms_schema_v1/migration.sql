-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN     "location" TEXT DEFAULT 'Remote',
ADD COLUMN     "maxSalary" INTEGER,
ADD COLUMN     "minSalary" INTEGER,
ADD COLUMN     "requirements" TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;
