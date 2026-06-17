'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';

import { useToast } from '@/components/feedback/use-toast';
import { useAuth } from '@/features/auth/use-auth';
import { ApiError } from '@/lib/api-client';

import {
  getPatientMutationErrorMessage,
  isUnauthorizedError,
} from './patient-mutation-error';
import { deletePatient } from './patients.api';
import type {
  DeletePatientResponse,
  PaginatedPatientsResponse,
  Patient,
} from './patients.types';

type PatientDeleteDialogProps = {
  patient: Patient | null;
  open: boolean;
  onClose: () => void;
};

type DeletePatientContext = {
  previousPatientsQueries: [QueryKey, PaginatedPatientsResponse | undefined][];
  previousPatient: Patient | undefined;
};

export function PatientDeleteDialog({ patient, open, onClose }: PatientDeleteDialogProps) {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const titleId = useId();
  const descriptionId = useId();
  const { showToast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setServerError(null);
    onClose();
  }, [onClose]);

  const deleteMutation = useMutation<
    DeletePatientResponse,
    unknown,
    Patient,
    DeletePatientContext
  >({
    mutationFn: (patientToDelete) => {
      if (!auth.token) {
        throw new ApiError('Missing authentication token.', 401, null);
      }

      return deletePatient(patientToDelete.id, auth.token);
    },
    onMutate: async (patientToDelete) => {
      await queryClient.cancelQueries({ queryKey: ['patients'] });
      await queryClient.cancelQueries({ queryKey: ['patient', patientToDelete.id] });

      const previousPatientsQueries = queryClient.getQueriesData<PaginatedPatientsResponse>({
        queryKey: ['patients'],
      });
      const previousPatient = queryClient.getQueryData<Patient>(['patient', patientToDelete.id]);

      queryClient.setQueriesData<PaginatedPatientsResponse>(
        { queryKey: ['patients'] },
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          return {
            ...oldData,
            data: oldData.data.filter((item) => item.id !== patientToDelete.id),
            total: Math.max(0, oldData.total - 1),
          };
        },
      );
      queryClient.removeQueries({ queryKey: ['patient', patientToDelete.id] });

      return {
        previousPatientsQueries,
        previousPatient,
      };
    },
    onError: (error, patientToDelete, context) => {
      if (context) {
        for (const [queryKey, data] of context.previousPatientsQueries) {
          queryClient.setQueryData(queryKey, data);
        }

        if (context.previousPatient) {
          queryClient.setQueryData(['patient', patientToDelete.id], context.previousPatient);
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
    onSuccess: (_response, patientToDelete) => {
      setServerError(null);
      queryClient.removeQueries({ queryKey: ['patient', patientToDelete.id] });
      onClose();
      showToast({
        title: 'Patient deleted',
        description: 'The patient record was removed.',
        variant: 'success',
      });
      void queryClient.invalidateQueries({ queryKey: ['patients'] });
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

  if (!open || !patient) {
    return null;
  }

  const patientName = `${patient.firstName} ${patient.lastName}`;

  function handleDelete() {
    if (!patient) {
      return;
    }

    setServerError(null);
    deleteMutation.mutate(patient);
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
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-background shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <header className="border-b border-border px-5 py-4">
          <h2 className="text-xl font-semibold text-foreground" id={titleId}>
            Delete patient
          </h2>
        </header>

        <div className="space-y-5 px-5 py-5">
          <p className="text-sm leading-6 text-foreground" id={descriptionId}>
            Are you sure you want to delete {patientName}? This action cannot be undone.
          </p>

          {serverError ? (
            <div
              className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900"
              id={`${patient.id}-delete-error`}
              role="alert"
            >
              {serverError}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              disabled={deleteMutation.isPending}
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete patient'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
