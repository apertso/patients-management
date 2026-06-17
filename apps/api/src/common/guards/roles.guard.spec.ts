import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '../types/authenticated-user.type';
import { RolesGuard } from './roles.guard';

type GetAllAndOverride = (metadataKey: string, targets: unknown[]) => Role[] | undefined;

function createExecutionContext(user?: AuthenticatedUser): ExecutionContext {
  const request = user ? { user } : {};

  return {
    getClass: jest.fn(() => class TestController {}),
    getHandler: jest.fn(() => function testHandler() {}),
    switchToHttp: jest.fn(() => ({
      getRequest: jest.fn(() => request),
      getResponse: jest.fn(),
      getNext: jest.fn(),
    })),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let reflector: { getAllAndOverride: jest.MockedFunction<GetAllAndOverride> };
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn<GetAllAndOverride>(),
    };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('allows the route when no roles metadata is set', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(createExecutionContext())).toBe(true);
  });

  it('allows a user with the required role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.admin]);

    expect(
      guard.canActivate(
        createExecutionContext({
          id: 'user-id',
          email: 'admin@example.com',
          role: Role.admin,
        }),
      ),
    ).toBe(true);
  });

  it('denies a user with the wrong role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.admin]);

    expect(
      guard.canActivate(
        createExecutionContext({
          id: 'user-id',
          email: 'user@example.com',
          role: Role.user,
        }),
      ),
    ).toBe(false);
  });

  it('denies requests without a user', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.admin]);

    expect(guard.canActivate(createExecutionContext())).toBe(false);
  });
});
