import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...');

  const recruiter = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'Recruiter',
      email: 'recruiter@hirehub.com',
      password: 'hashedpassword123', 
      role: 'RECRUITER',
      companyName: 'Tech Innovators Inc.',
    },
  });

  console.log(`Created Recruiter: ${recruiter.email}`);

  const jobTypes = ['Full Time', 'Part Time', 'Internship', 'Contract'];
  const expLevels = ['Fresher', '0-1 Years', '1-3 Years', '3-5 Years', '5+ Years'];
  const locations = ['Bangalore', 'Mumbai', 'Remote', 'Delhi', 'Pune', 'Hyderabad', 'Pune / Remote'];

  const jobsData = Array.from({ length: 55 }).map(() => ({
    title: faker.person.jobTitle(),
    description: faker.lorem.paragraphs(2),
    companyName: recruiter.companyName || 'HireHub Startup',
    location: faker.helpers.arrayElement(locations),
    minSalary: faker.number.int({ min: 300000, max: 700000 }),
    maxSalary: faker.number.int({ min: 800000, max: 2500000 }),
    currency: 'INR',
    jobType: faker.helpers.arrayElement(jobTypes),
    experienceLevel: faker.helpers.arrayElement(expLevels),
    requirements: [faker.helpers.arrayElement(['React', 'Node.js', 'Python']), faker.helpers.arrayElement(['AWS', 'Docker', 'MongoDB'])],
    isOpen: true,
    recruiterId: recruiter.id,
  }));

  await prisma.job.createMany({
    data: jobsData,
  });

  console.log('Successfully seeded 55 Jobs!');
}

main()
  .catch((e) => {
    console.error(e);
    // process.exit(1);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });