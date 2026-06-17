'use client';

import { useEffect, useId, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/use-auth';
import { ApiError } from '@/lib/api-client';
import { formatDate, formatDateTime } from '@/lib/date-format';

import { getPatient } from './patients.api';

type PatientDetailsDialogProps = {
  patientId: string | null;
  token: string | null;
  open: boolean;
  onClose: () => void;
};

function getDialogErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.statusCode === 403) {
      return 'You do not have permission to view this patient record.';
    }

    if (error.statusCode === 404) {
      return 'This patient record could not be found.';
    }

    if (error.statusCode === 503) {
      return 'The API is temporarily unavailable. Please retry.';
    }
  }

  return 'Something went wrong while loading patient details.';
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/50 p-3">
      <dt className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm text-foreground">{value}</dd>
    </div>
  );
}

export function PatientDetailsDialog({
  patientId,
  token,
  open,
  onClose,
}: PatientDetailsDialogProps) {
  const auth = useAuth();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLElement | null>(null);
  const patientQuery = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => {
      if (!patientId || !token) {
        throw new Error('Missing patient details parameters.');
      }

      return getPatient(patientId, token);
    },
    enabled: open && Boolean(patientId) && Boolean(token),
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    window.setTimeout(() => dialogRef.current?.focus(), 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (patientQuery.error instanceof ApiError && patientQuery.error.statusCode === 401) {
      auth.logout();
    }
  }, [auth, patientQuery.error]);

  if (!open) {
    return null;
  }

  const patient = patientQuery.data;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        ref={dialogRef}
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card text-card-foreground shadow-xl outline-none"
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground" id={titleId}>
              Patient details
            </h2>
            <p className="mt-1 text-sm text-muted-foreground" id={descriptionId}>
              View the latest read-only patient record.
            </p>
          </div>
          <button
            className="rounded-md p-1 text-muted-foreground hover:bg-muted focus:outline-none"
            type="button"
            onClick={onClose}
            aria-label="Close patient details"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="px-5 py-5">
          {patientQuery.isPending ? (
            <div className="space-y-3" aria-label="Loading patient details">
              <div className="h-5 w-48 animate-pulse rounded bg-muted" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="h-16 animate-pulse rounded-md bg-muted" />
                <div className="h-16 animate-pulse rounded-md bg-muted" />
                <div className="h-16 animate-pulse rounded-md bg-muted" />
                <div className="h-16 animate-pulse rounded-md bg-muted" />
              </div>
            </div>
          ) : null}

          {patientQuery.isError &&
          !(patientQuery.error instanceof ApiError && patientQuery.error.statusCode === 401) ? (
            <section className="rounded-lg border border-error/20 bg-error/10 p-4">
              <h3 className="font-semibold text-error">Unable to load patient details</h3>
              <p className="mt-2 text-sm leading-6 text-error">
                {getDialogErrorMessage(patientQuery.error)}
              </p>
              <button
                className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2 focus:ring-offset-background"
                type="button"
                onClick={() => {
                  void patientQuery.refetch();
                }}
              >
                Try again
              </button>
            </section>
          ) : null}

          {patient ? (
            <dl className="grid gap-3 sm:grid-cols-2">
              <DetailItem label="Full name" value={`${patient.firstName} ${patient.lastName}`} />
              <DetailItem label="Email" value={patient.email} />
              <DetailItem label="Phone number" value={patient.phoneNumber ?? '—'} />
              <DetailItem label="Date of birth" value={formatDate(patient.dob)} />
              <DetailItem label="Created at" value={formatDateTime(patient.createdAt)} />
              <DetailItem label="Updated at" value={formatDateTime(patient.updatedAt)} />
              <div className="sm:col-span-2">
                <DetailItem label="ID" value={patient.id} />
              </div>
            </dl>
          ) : null}
        </div>
      </section>
    </div>
  );
}
