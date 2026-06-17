'use client';

import type { ReactNode } from 'react';

import { useAuth } from '@/features/auth/use-auth';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-base font-semibold text-foreground">Patients Management</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="max-w-full truncate text-muted-foreground">{auth.user?.email}</span>
            {auth.user?.role ? (
              <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-foreground">
                {auth.user.role}
              </span>
            ) : null}
            <button
              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
              type="button"
              onClick={auth.logout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
