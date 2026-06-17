import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Patient, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PatientSortBy, SortOrder } from './dto/patient-query.dto';
import { PatientsService } from './patients.service';

type PatientFindUnique = (args: Prisma.PatientFindUniqueArgs) => Promise<Patient | null>;
type PatientFindMany = (args: Prisma.PatientFindManyArgs) => Promise<Patient[]>;
type PatientCount = (args: Prisma.PatientCountArgs) => Promise<number>;
type PatientCreate = (args: Prisma.PatientCreateArgs) => Promise<Patient>;
type PatientUpdate = (args: Prisma.PatientUpdateArgs) => Promise<Patient>;
type PatientDelete = (args: Prisma.PatientDeleteArgs) => Promise<Patient>;
type Transaction = (queries: unknown[]) => Promise<[Patient[], number]>;

const patient: Patient = {
  id: 'patient-id',
  firstName: 'Emma',
  lastName: 'Johnson',
  email: 'emma.johnson@example.com',
  phoneNumber: '+1 555 0101',
  dob: new Date('1988-04-12T00:00:00.000Z'),
  createdAt: new Date('2026-06-17T10:00:00.000Z'),
  updatedAt: new Date('2026-06-17T10:00:00.000Z'),
};

describe('PatientsService', () => {
  let service: PatientsService;
  let prisma: {
    patient: {
      findUnique: jest.MockedFunction<PatientFindUnique>;
      findMany: jest.MockedFunction<PatientFindMany>;
      count: jest.MockedFunction<PatientCount>;
      create: jest.MockedFunction<PatientCreate>;
      update: jest.MockedFunction<PatientUpdate>;
      delete: jest.MockedFunction<PatientDelete>;
    };
    $transaction: jest.MockedFunction<Transaction>;
  };

  beforeEach(async () => {
    prisma = {
      patient: {
        findUnique: jest.fn<PatientFindUnique>(),
        findMany: jest.fn<PatientFindMany>(),
        count: jest.fn<PatientCount>(),
        create: jest.fn<PatientCreate>(),
        update: jest.fn<PatientUpdate>(),
        delete: jest.fn<PatientDelete>(),
      },
      $transaction: jest.fn<Transaction>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
  });

  it('returns paginated patients metadata', async () => {
    prisma.patient.findMany.mockResolvedValue([patient]);
    prisma.patient.count.mockResolvedValue(1);
    prisma.$transaction.mockResolvedValue([[patient], 1]);

    await expect(
      service.findAll({
        page: 1,
        limit: 10,
        sortBy: PatientSortBy.createdAt,
        sortOrder: SortOrder.desc,
      }),
    ).resolves.toEqual({
      data: [patient],
      page: 1,
      limit: 10,
      total: 1,
    });
    expect(prisma.patient.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    );
  });

  it('applies search across patient fields', async () => {
    prisma.patient.findMany.mockResolvedValue([patient]);
    prisma.patient.count.mockResolvedValue(1);
    prisma.$transaction.mockResolvedValue([[patient], 1]);

    await service.findAll({
      page: 1,
      limit: 10,
      search: 'emma',
      sortBy: PatientSortBy.lastName,
      sortOrder: SortOrder.asc,
    });

    expect(prisma.patient.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { firstName: { contains: 'emma', mode: 'insensitive' } },
            { lastName: { contains: 'emma', mode: 'insensitive' } },
            { email: { contains: 'emma', mode: 'insensitive' } },
            { phoneNumber: { contains: 'emma', mode: 'insensitive' } },
          ],
        },
        orderBy: { lastName: 'asc' },
      }),
    );
  });

  it('throws NotFoundException when a patient is missing', async () => {
    prisma.patient.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('maps unique email violations to ConflictException on create', async () => {
    prisma.patient.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['email'] },
      }),
    );

    await expect(
      service.create({
        firstName: 'Emma',
        lastName: 'Johnson',
        email: 'emma.johnson@example.com',
        phoneNumber: '+1 555 0101',
        dob: '1988-04-12',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('maps unique email violations to ConflictException on update', async () => {
    prisma.patient.findUnique.mockResolvedValue(patient);
    prisma.patient.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['email'] },
      }),
    );

    await expect(
      service.update('patient-id', {
        firstName: 'Emma',
        lastName: 'Johnson',
        email: 'duplicate@example.com',
        phoneNumber: '+1 555 0101',
        dob: '1988-04-12',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('removes a patient and returns ok', async () => {
    prisma.patient.findUnique.mockResolvedValue(patient);
    prisma.patient.delete.mockResolvedValue(patient);

    await expect(service.remove('patient-id')).resolves.toEqual({ ok: true });
    expect(prisma.patient.delete).toHaveBeenCalledWith({
      where: { id: 'patient-id' },
    });
  });
});
