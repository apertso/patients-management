import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

type FindByEmail = (email: string) => Promise<User | null>;
type SignAsync = (payload: Record<string, unknown>) => Promise<string>;

const createUser = (passwordHash: string): User => ({
  id: 'user-id',
  email: 'admin@example.com',
  passwordHash,
  role: Role.admin,
  createdAt: new Date('2026-06-17T10:00:00.000Z'),
  updatedAt: new Date('2026-06-17T10:00:00.000Z'),
});

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByEmail: jest.MockedFunction<FindByEmail> };
  let jwtService: { signAsync: jest.MockedFunction<SignAsync> };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn<FindByEmail>(),
    };
    jwtService = {
      signAsync: jest.fn<SignAsync>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('returns a token and public user for valid credentials', async () => {
    const passwordHash = await bcrypt.hash('password123', 4);
    usersService.findByEmail.mockResolvedValue(createUser(passwordHash));
    jwtService.signAsync.mockResolvedValue('jwt-token');

    await expect(
      service.login({
        email: 'admin@example.com',
        password: 'password123',
      }),
    ).resolves.toEqual({
      token: 'jwt-token',
      user: {
        email: 'admin@example.com',
        role: Role.admin,
      },
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'user-id',
      email: 'admin@example.com',
      role: Role.admin,
    });
  });

  it('does not include passwordHash in the login response', async () => {
    const passwordHash = await bcrypt.hash('password123', 4);
    usersService.findByEmail.mockResolvedValue(createUser(passwordHash));
    jwtService.signAsync.mockResolvedValue('jwt-token');

    const response = await service.login({
      email: 'admin@example.com',
      password: 'password123',
    });

    expect(response.user).not.toHaveProperty('passwordHash');
  });

  it('throws UnauthorizedException when the user is missing', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'admin@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws UnauthorizedException for an invalid password', async () => {
    const passwordHash = await bcrypt.hash('password123', 4);
    usersService.findByEmail.mockResolvedValue(createUser(passwordHash));

    await expect(
      service.login({
        email: 'admin@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
