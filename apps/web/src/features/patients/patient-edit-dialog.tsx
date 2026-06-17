'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';

import { useToast } from '@/components/feedback/use-toast';
import { useAuth } from '@/features/auth/use-auth';
import { ApiError } from '@/lib/api-client';

import { PatientForm } from './patient-form';
import {
  getEmptyPatientFormValues,
  getPatientFormValues,
  toPatientMutationInput,
} from './patient-form.types';
import {
  getPatientMutationErrorMessage,
  isUnauthorizedError,
} from './patient-mutation-error';
import { getPatient, updatePatient } from './patients.api';
import type {
  CreatePatientInput,
  PaginatedPatientsResponse,
  Patient,
  PatientFormInput,
} from './patients.types';

type PatientEditDialogProps = {
  patientId: string | null;
  open: boolean;
  onClose: () => void;
};

type UpdatePatientContext = {
  patientId: string | null;
  previousPatientsQueries: [QueryKey, PaginatedPatientsResponse | undefined][];
  previousPatient: Patient | undefined;
};

function getPatientLoadErrorMessage(error: unknown): string {
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

export function PatientEditDialog({ patientId, open, onClose }: PatientEditDialogProps) {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const titleId = useId();
  const descriptionId = useId();
  const initialFocusRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setServerError(null);
    onClose();
  }, [onClose]);

  const patientQuery = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => {
      if (!patientId || !auth.token) {
        throw new ApiError('Missing patient details parameters.', 401, null);
      }

      return getPatient(patientId, auth.token);
    },
    enabled: open && Boolean(patientId) && Boolean(auth.token),
  });

  const patient = patientQuery.data;
  const defaultValues = useMemo(
    () => (patient ? getPatientFormValues(patient) : getEmptyPatientFormValues()),
    [patient],
  );

  const updateMutation = useMutation<Patient, unknown, CreatePatientInput, UpdatePatientContext>({
    mutationFn: (input) => {
      if (!patientId) {
        throw new ApiError('Missing patient id.', 404, null);
      }

      if (!auth.token) {
        throw new ApiError('Missing authentication token.', 401, null);
      }

      return updatePatient(patientId, input, auth.token);
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ['patients'] });
      await queryClient.cancelQueries({ queryKey: ['patient', patientId] });

      const previousPatientsQueries = queryClient.getQueriesData<PaginatedPatientsResponse>({
        queryKey: ['patients'],
      });
      const previousPatient = patientId
        ? queryClient.getQueryData<Patient>(['patient', patientId])
        : undefined;

      if (patientId && previousPatient) {
        const optimisticPatient: Patient = {
          ...previousPatient,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phoneNumber: input.phoneNumber ?? null,
          dob: `${input.dob}T00:00:00.000Z`,
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData(['patient', patientId], optimisticPatient);
        queryClient.setQueriesData<PaginatedPatientsResponse>(
          { queryKey: ['patients'] },
          (oldData) => {
            if (!oldData) {
              return oldData;
            }

            return {
              ...oldData,
              data: oldData.data.map((patientItem) =>
                patientItem.id === patientId ? optimisticPatient : patientItem,
              ),
            };
          },
        );
      }

      return {
        patientId,
        previousPatientsQueries,
        previousPatient,
      };
    },
    onError: (error, _input, context) => {
      if (context) {
        for (const [queryKey, data] of context.previousPatientsQueries) {
          queryClient.setQueryData(queryKey, data);
        }

        if (context.patientId) {
          if (context.previousPatient) {
            queryClient.setQueryData(['patient', context.patientId], context.previousPatient);
          } else {
            queryClient.removeQueries({ queryKey: ['patient', context.patientId] });
          }
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

      if (error instanceof ApiError && error.statusCode === 404) {
        void queryClient.invalidateQueries({ queryKey: ['patients'] });
      }
    },
    onSuccess: (updatedPatient, _input, context) => {
      const updatedPatientId = context?.patientId ?? updatedPatient.id;

      queryClient.setQueryData(['patient', updatedPatientId], updatedPatient);
      queryClient.setQueriesData<PaginatedPatientsResponse>(
        { queryKey: ['patients'] },
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          return {
            ...oldData,
            data: oldData.data.map((patientItem) =>
              patientItem.id === updatedPatient.id ? updatedPatient : patientItem,
            ),
          };
        },
      );
      setServerError(null);
      onClose();
      showToast({
        title: 'Patient updated',
        description: 'The patient record was saved successfully.',
        variant: 'success',
      });
      void queryClient.invalidateQueries({ queryKey: ['patients'] });
      void queryClient.invalidateQueries({ queryKey: ['patient', updatedPatientId] });
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        handleClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, open]);

  useEffect(() => {
    if (!open || !patient) {
      return;
    }

    window.setTimeout(() => initialFocusRef.current?.focus(), 0);
  }, [open, patient]);

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

    if (patientQuery.error instanceof ApiError && patientQuery.error.statusCode === 404) {
      void queryClient.invalidateQueries({ queryKey: ['patients'] });
    }
  }, [auth, patientQuery.error, queryClient]);

  if (!open) {
    return null;
  }

  async function handleSubmit(values: PatientFormInput) {
    setServerError(null);

    try {
      await updateMutation.mutateAsync(toPatientMutationInput(values));
    } catch {
      // Mutation errors are rendered through onError so form values stay intact.
    }
  }

  const isUnauthorizedLoadError =
    patientQuery.error instanceof ApiError && patientQuery.error.statusCode === 401;

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
            Edit patient
          </h2>
          <p className="mt-1 text-sm text-muted-foreground" id={descriptionId}>
            Update patient demographics and contact information.
          </p>
        </header>

        <div className="px-5 py-5">
          {patientQuery.isPending ? (
            <div className="space-y-4" aria-label="Loading patient form">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="h-20 animate-pulse rounded-md bg-muted" />
                <div className="h-20 animate-pulse rounded-md bg-muted" />
                <div className="h-20 animate-pulse rounded-md bg-muted" />
                <div className="h-20 animate-pulse rounded-md bg-muted" />
                <div className="h-20 animate-pulse rounded-md bg-muted" />
              </div>
            </div>
          ) : null}

          {patientQuery.isError && !isUnauthorizedLoadError ? (
            <section className="rounded-lg border border-error/20 bg-error/10 p-4">
              <h3 className="font-semibold text-error">Unable to load patient</h3>
              <p className="mt-2 text-sm leading-6 text-error">
                {getPatientLoadErrorMessage(patientQuery.error)}
              </p>
              <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2 focus:ring-offset-background"
                  type="button"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2 focus:ring-offset-background"
                  type="button"
                  onClick={() => {
                    void patientQuery.refetch();
                  }}
                >
                  Try again
                </button>
              </div>
            </section>
          ) : null}

          {patient ? (
            <PatientForm
              id={`edit-patient-${patient.id}`}
              defaultValues={defaultValues}
              submitLabel={updateMutation.isPending ? 'Saving...' : 'Save changes'}
              isSubmitting={updateMutation.isPending}
              serverError={serverError}
              initialFocusRef={initialFocusRef}
              onSubmit={handleSubmit}
              onCancel={handleClose}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
