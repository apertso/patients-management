'use client';

import { useContext } from 'react';

import { ThemeContext } from './theme-provider';

export function ThemeToggle() {
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    return null;
  }

  const isDark = themeContext.theme === 'dark';

  return (
    <button
      className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2 focus:ring-offset-background"
      type="button"
      aria-pressed={isDark}
      onClick={themeContext.toggleTheme}
    >
      {isDark ? 'Light' : 'Dark'}
    </button>
  );
}
