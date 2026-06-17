import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Patient, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { PatientQueryDto, PatientSortBy, SortOrder } from './dto/patient-query.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

type PaginatedPatients = {
  data: Patient[];
  page: number;
  limit: number;
  total: number;
};

type DeletePatientResponse = {
  ok: true;
};

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PatientQueryDto): Promise<PaginatedPatients> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sortBy = query.sortBy ?? PatientSortBy.createdAt;
    const sortOrder = query.sortOrder ?? SortOrder.desc;
    const search = query.search?.trim();
    const where: Prisma.PatientWhereInput | undefined = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phoneNumber: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const orderBy: Prisma.PatientOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.patient.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      data,
      page,
      limit,
      total,
    };
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found.');
    }

    return patient;
  }

  async create(dto: CreatePatientDto): Promise<Patient> {
    try {
      return await this.prisma.patient.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          phoneNumber: dto.phoneNumber,
          dob: new Date(dto.dob),
        },
      });
    } catch (error: unknown) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Patient with this email already exists.');
      }

      throw error;
    }
  }

  async update(id: string, dto: UpdatePatientDto): Promise<Patient> {
    await this.findOne(id);

    try {
      return await this.prisma.patient.update({
        where: { id },
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          phoneNumber: dto.phoneNumber,
          dob: dto.dob ? new Date(dto.dob) : undefined,
        },
      });
    } catch (error: unknown) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Patient with this email already exists.');
      }

      throw error;
    }
  }

  async remove(id: string): Promise<DeletePatientResponse> {
    await this.findOne(id);
    await this.prisma.patient.delete({
      where: { id },
    });

    return {
      ok: true,
    };
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }
}
