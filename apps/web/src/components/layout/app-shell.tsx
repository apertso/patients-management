'use client';

import type { ReactNode } from 'react';

import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useAuth } from '@/features/auth/use-auth';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-transparent">
      <header className="border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-base font-semibold text-card-foreground">Patients Management</p>
            <p className="mt-1 text-sm text-muted-foreground">Secure patient records workspace</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm sm:justify-end">
            <span className="max-w-full truncate text-muted-foreground">{auth.user?.email}</span>
            {auth.user?.role ? (
              <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-semibold uppercase text-foreground">
                {auth.user.role}
              </span>
            ) : null}
            <ThemeToggle />
            <button
              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2 focus:ring-offset-background"
              type="button"
              onClick={auth.logout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
