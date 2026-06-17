'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

function getToastClassName(variant: ToastVariant): string {
  if (variant === 'success') {
    return 'border-success/20 bg-success/10 text-success';
  }

  if (variant === 'error') {
    return 'border-error/20 bg-error/10 text-error';
  }

  return 'border-border bg-card text-card-foreground';
}

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
        {toasts.map((toast) => (
          <section
            key={toast.id}
            className={`rounded-xl border p-4 shadow-lg ${getToastClassName(toast.variant)}`}
            role={toast.variant === 'error' ? 'alert' : 'status'}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">{toast.title}</h2>
                {toast.description ? (
                  <p className="mt-1 text-sm leading-5">{toast.description}</p>
                ) : null}
              </div>
              <button
                className="rounded-md border border-current px-2 py-1 text-xs font-medium opacity-80 transition hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2 focus:ring-offset-background"
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismissToast(toast.id)}
              >
                Close
              </button>
            </div>
          </section>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
