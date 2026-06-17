'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/ui';

type ToastVariant = 'success' | 'error' | 'info';

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

export type ToastContextValue = {
  showToast: (toast: Omit<Toast, 'id'>) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

type ToastProviderProps = {
  children: ReactNode;
};

function createToastId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

// Helper function removed in favor of inline logic

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutIdsRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timeoutId = timeoutIdsRef.current.get(id);

    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
      timeoutIdsRef.current.delete(id);
    }

    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = createToastId();

      setToasts((currentToasts) => [...currentToasts, { ...toast, id }]);

      const timeoutId = window.setTimeout(() => dismissToast(id), 4_000);
      timeoutIdsRef.current.set(id, timeoutId);
    },
    [dismissToast],
  );

  useEffect(() => {
    const timeoutIds = timeoutIdsRef.current;

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutIds.clear();
    };
  }, []);

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      showToast,
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        className="fixed left-4 right-4 top-4 z-[60] space-y-3 sm:left-auto sm:w-full sm:max-w-sm"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.variant === 'success';
          const isError = toast.variant === 'error';
          return (
            <section
              key={toast.id}
              className={cn(
                "pointer-events-auto relative flex w-full items-start justify-between space-x-4 overflow-hidden rounded-xl border p-4 pr-6 shadow-lg transition-all",
                isSuccess && "border-success/30 bg-card text-success",
                isError && "border-error/30 bg-card text-error",
                !isSuccess && !isError && "border-border bg-card text-foreground"
              )}
              role={isError ? 'alert' : 'status'}
            >
              <div className="flex items-start gap-3">
                {isSuccess && (
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {isError && (
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-error" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-semibold">{toast.title}</h3>
                  {toast.description ? (
                    <p className={cn("text-sm", isSuccess ? "text-success/80" : isError ? "text-error/80" : "text-muted-foreground")}>{toast.description}</p>
                  ) : null}
                </div>
              </div>
              <button
                className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-muted focus:outline-none"
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismissToast(toast.id)}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </section>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
