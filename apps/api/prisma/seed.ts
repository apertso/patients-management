import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const patients = [
  {
    firstName: 'Emma',
    lastName: 'Johnson',
    email: 'emma.johnson@example.com',
    phoneNumber: '+1 555 0101',
    dob: '1988-04-12',
  },
  {
    firstName: 'Liam',
    lastName: 'Smith',
    email: 'liam.smith@example.com',
    phoneNumber: '+1 555 0102',
    dob: '1979-11-03',
  },
  {
    firstName: 'Olivia',
    lastName: 'Brown',
    email: 'olivia.brown@example.com',
    phoneNumber: '+1 555 0103',
    dob: '1992-07-21',
  },
  {
    firstName: 'Noah',
    lastName: 'Davis',
    email: 'noah.davis@example.com',
    phoneNumber: '+1 555 0104',
    dob: '1985-02-18',
  },
  {
    firstName: 'Ava',
    lastName: 'Miller',
    email: 'ava.miller@example.com',
    phoneNumber: '+1 555 0105',
    dob: '1998-09-30',
  },
  {
    firstName: 'William',
    lastName: 'Wilson',
    email: 'william.wilson@example.com',
    phoneNumber: '+1 555 0106',
    dob: '1972-12-09',
  },
  {
    firstName: 'Sophia',
    lastName: 'Moore',
    email: 'sophia.moore@example.com',
    phoneNumber: '+1 555 0107',
    dob: '1990-01-15',
  },
  {
    firstName: 'James',
    lastName: 'Taylor',
    email: 'james.taylor@example.com',
    phoneNumber: '+1 555 0108',
    dob: '1968-06-04',
  },
  {
    firstName: 'Isabella',
    lastName: 'Anderson',
    email: 'isabella.anderson@example.com',
    phoneNumber: '+1 555 0109',
    dob: '1983-03-27',
  },
  {
    firstName: 'Benjamin',
    lastName: 'Thomas',
    email: 'benjamin.thomas@example.com',
    phoneNumber: '+1 555 0110',
    dob: '1995-10-11',
  },
  {
    firstName: 'Mia',
    lastName: 'Jackson',
    email: 'mia.jackson@example.com',
    phoneNumber: '+1 555 0111',
    dob: '2001-05-06',
  },
  {
    firstName: 'Lucas',
    lastName: 'White',
    email: 'lucas.white@example.com',
    phoneNumber: '+1 555 0112',
    dob: '1976-08-24',
  },
];

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      passwordHash,
      role: Role.admin,
    },
    create: {
      email: 'admin@example.com',
      passwordHash,
      role: Role.admin,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {
      passwordHash,
      role: Role.user,
    },
    create: {
      email: 'user@example.com',
      passwordHash,
      role: Role.user,
    },
  });

  for (const patient of patients) {
    await prisma.patient.upsert({
      where: { email: patient.email },
      update: {
        firstName: patient.firstName,
        lastName: patient.lastName,
        phoneNumber: patient.phoneNumber,
        dob: new Date(patient.dob),
      },
      create: {
        ...patient,
        dob: new Date(patient.dob),
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
