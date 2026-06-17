'use client';

import { useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { ThemeContext } from '@/components/theme/theme-provider';
import { useAuth } from '@/features/auth/use-auth';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const auth = useAuth();
  const themeContext = useContext(ThemeContext);
  const accountMenuRef = useRef<HTMLDetailsElement | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const roleLabel = auth.user?.role ? auth.user.role.charAt(0).toUpperCase() + auth.user.role.slice(1) : 'Account';
  const isDarkTheme = themeContext?.theme === 'dark';

  useEffect(() => {
    if (!isAccountMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAccountMenuOpen]);

  return (
    <div className="min-h-screen bg-transparent">
      <header className="border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563eb] text-white shadow-sm">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M11 7h2v3h3v2h-3v3h-2v-3H8v-2h3V7z" fill="#2563eb" />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-foreground">Patients Management</p>
              <p className="text-xs font-medium text-muted-foreground">Secure patient records workspace</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm sm:justify-end">
            <details className="group relative" open={isAccountMenuOpen} ref={accountMenuRef}>
              <summary
                className="flex cursor-pointer list-none items-center gap-2 text-foreground outline-none transition hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/40 [&::-webkit-details-marker]:hidden"
                onClick={(event) => {
                  event.preventDefault();
                  setIsAccountMenuOpen((current) => !current);
                }}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted/60 text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <span className="text-sm font-medium">{roleLabel}</span>
                <svg className="h-4 w-4 text-muted-foreground transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>

              <div className="absolute left-0 top-full z-20 mt-3 w-52 overflow-hidden rounded-xl border border-border bg-card py-1 text-sm text-foreground shadow-md sm:left-auto sm:right-0">
                <div className="border-b border-border px-3 py-2">
                  <p className="truncate text-xs font-medium text-muted-foreground">{auth.user?.email}</p>
                </div>
                {themeContext ? (
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-muted-foreground transition hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground focus:outline-none"
                    type="button"
                    onClick={() => {
                      themeContext.toggleTheme();
                      setIsAccountMenuOpen(false);
                    }}
                  >
                    {isDarkTheme ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                    {isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
                  </button>
                ) : null}
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-muted-foreground transition hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground focus:outline-none"
                  type="button"
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    auth.logout();
                  }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </details>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
