import type { AuthUser } from '@/features/auth/auth.types';

const TOKEN_KEY = 'patients_management_token';
const USER_KEY = 'patients_management_user';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.email === 'string' &&
    (candidate.role === 'admin' || candidate.role === 'user')
  );
}

export function saveAuthSession(token: string, user: AuthUser): void {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    return;
  }
}

export function getStoredToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): AuthUser | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const storedUser = window.localStorage.getItem(USER_KEY);

    if (!storedUser) {
      return null;
    }

    const parsedUser: unknown = JSON.parse(storedUser);

    return isAuthUser(parsedUser) ? parsedUser : null;
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  } catch {
    return;
  }
}
