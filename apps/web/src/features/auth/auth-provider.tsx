'use client';

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { AuthState, AuthUser, LoginInput, LoginResponse } from '@/features/auth/auth.types';
import { apiRequest } from '@/lib/api-client';
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  saveAuthSession,
} from '@/lib/auth-storage';
import { isTokenExpired } from '@/lib/jwt';

const TOKEN_CHECK_INTERVAL_MS = 30_000;

const initialAuthState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

export type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();

      if (!storedToken || !storedUser) {
        setAuthState({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      if (isTokenExpired(storedToken)) {
        clearAuthSession();
        setAuthState({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      setAuthState({
        token: storedToken,
        user: storedUser,
        isAuthenticated: true,
        isLoading: false,
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const response = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: input,
    });

    if (isTokenExpired(response.token)) {
      throw new Error('Received an expired token.');
    }

    saveAuthSession(response.token, response.user);
    setAuthState({
      token: response.token,
      user: response.user,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setAuthState({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    router.push('/login');
  }, [router]);

  useEffect(() => {
    if (!authState.token) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (authState.token && isTokenExpired(authState.token)) {
        logout();
      }
    }, TOKEN_CHECK_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [authState.token, logout]);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      token: authState.token,
      user: authState.user,
      isAuthenticated: authState.isAuthenticated,
      isLoading: authState.isLoading,
      login,
      logout,
    }),
    [authState, login, logout],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
