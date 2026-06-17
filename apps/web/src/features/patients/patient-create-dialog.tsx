'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';

import { useToast } from '@/components/feedback/use-toast';
import { useAuth } from '@/features/auth/use-auth';
import { ApiError } from '@/lib/api-client';

import { PatientForm } from './patient-form';
import {
  getEmptyPatientFormValues,
  toPatientMutationInput,
} from './patient-form.types';
import {
  getPatientMutationErrorMessage,
  isUnauthorizedError,
} from './patient-mutation-error';
import { createPatient } from './patients.api';
import type {
  CreatePatientInput,
  PaginatedPatientsResponse,
  Patient,
  PatientFormInput,
  PatientsQuery,
} from './patients.types';

type PatientCreateDialogProps = {
  open: boolean;
  onClose: () => void;
};

type CreatePatientContext = {
  previousPatientsQueries: [QueryKey, PaginatedPatientsResponse | undefined][];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPatientsQuery(value: unknown): value is PatientsQuery {
  return (
    isRecord(value) &&
    value.page === 1 &&
    value.search === '' &&
    value.sortBy === 'createdAt' &&
    value.sortOrder === 'desc'
  );
}

function isDefaultCreateTargetQuery(queryKey: QueryKey): boolean {
  const [, query] = queryKey;

  return isPatientsQuery(query);
}

function createOptimisticId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `optimistic-${crypto.randomUUID()}`;
  }

  return `optimistic-${Date.now()}-${Math.random()}`;
}

export function PatientCreateDialog({ open, onClose }: PatientCreateDialogProps) {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const titleId = useId();
  const descriptionId = useId();
  const initialFocusRef = useRef<HTMLInputElement | null>(null);
  const defaultValues = useMemo(() => getEmptyPatientFormValues(), []);
  const { showToast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setServerError(null);
    onClose();
  }, [onClose]);

  const createMutation = useMutation<Patient, unknown, CreatePatientInput, CreatePatientContext>({
    mutationFn: (input) => {
      if (!auth.token) {
        throw new ApiError('Missing authentication token.', 401, null);
      }

      return createPatient(input, auth.token);
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ['patients'] });

      const previousPatientsQueries = queryClient.getQueriesData<PaginatedPatientsResponse>({
        queryKey: ['patients'],
      });
      const now = new Date().toISOString();
      const optimisticPatient: Patient = {
        id: createOptimisticId(),
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phoneNumber: input.phoneNumber ?? null,
        dob: `${input.dob}T00:00:00.000Z`,
        createdAt: now,
        updatedAt: now,
      };

      /**
       * Optimistic create updates only the default newest-first first page.
       * Other search/sort/page combinations are invalidated after success.
       */
      for (const [queryKey, data] of previousPatientsQueries) {
        if (!data || !isDefaultCreateTargetQuery(queryKey)) {
          continue;
        }

        queryClient.setQueryData<PaginatedPatientsResponse>(queryKey, {
          ...data,
          data: [optimisticPatient, ...data.data].slice(0, data.limit),
          total: data.total + 1,
        });
      }

      return {
        previousPatientsQueries,
      };
    },
    onError: (error, _input, context) => {
      if (context) {
        for (const [queryKey, data] of context.previousPatientsQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }

      const message = getPatientMutationErrorMessage(error);
      setServerError(message);
      showToast({
        title: 'Action failed',
        description: message,
        variant: 'error',
      });

      if (isUnauthorizedError(error)) {
        auth.logout();
      }
    },
    onSuccess: () => {
      setServerError(null);
      onClose();
      showToast({
        title: 'Patient created',
        description: 'The patient record was added successfully.',
        variant: 'success',
      });
      void queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    window.setTimeout(() => initialFocusRef.current?.focus(), 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        handleClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, open]);

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

  if (!open) {
    return null;
  }

  async function handleSubmit(values: PatientFormInput) {
    setServerError(null);

    try {
      await createMutation.mutateAsync(toPatientMutationInput(values));
    } catch {
      // Mutation errors are rendered through onError so form values stay intact.
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <section
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card text-card-foreground shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <header className="border-b border-border px-5 py-4">
          <h2 className="text-xl font-semibold text-foreground" id={titleId}>
            Create patient
          </h2>
          <p className="mt-1 text-sm text-muted-foreground" id={descriptionId}>
            Add a new patient record.
          </p>
        </header>

        <div className="px-5 py-5">
          <PatientForm
            id="create-patient"
            defaultValues={defaultValues}
            submitLabel={createMutation.isPending ? 'Creating...' : 'Create patient'}
            isSubmitting={createMutation.isPending}
            serverError={serverError}
            initialFocusRef={initialFocusRef}
            onSubmit={handleSubmit}
            onCancel={handleClose}
          />
        </div>
      </section>
    </div>
  );
}
