'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { UserRole } from '@/features/auth/auth.types';
import { useAuth } from '@/features/auth/use-auth';
import { ApiError } from '@/lib/api-client';

import { PatientCreateDialog } from './patient-create-dialog';
import { PatientDeleteDialog } from './patient-delete-dialog';
import { PatientDetailsDialog } from './patient-details-dialog';
import { PatientEditDialog } from './patient-edit-dialog';
import { getPatients } from './patients.api';
import { PatientsEmptyState } from './patients-empty-state';
import { PatientsErrorState } from './patients-error-state';
import { PatientsListSkeleton } from './patients-list-skeleton';
import { PatientsMobileList } from './patients-mobile-list';
import { PatientsPagination } from './patients-pagination';
import {
  createPatientsQueryString,
  parsePatientsQuery,
} from './patients-query-state';
import { PatientsTable } from './patients-table';
import { PatientsToolbar } from './patients-toolbar';
import type { Patient, PatientsQuery, PatientSortBy, SortOrder } from './patients.types';

function getPatientsErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.statusCode === 403) {
      return 'You do not have permission to view patient records.';
    }

    if (error.statusCode === 503) {
      return 'The API is temporarily unavailable. Please retry.';
    }
  }

  return 'Something went wrong while loading patient records.';
}

function shouldResetPage(
  currentQuery: PatientsQuery,
  nextPartialQuery: Partial<PatientsQuery>,
): boolean {
  return (
    (nextPartialQuery.search !== undefined && nextPartialQuery.search !== currentQuery.search) ||
    (nextPartialQuery.sortBy !== undefined && nextPartialQuery.sortBy !== currentQuery.sortBy) ||
    (nextPartialQuery.sortOrder !== undefined &&
      nextPartialQuery.sortOrder !== currentQuery.sortOrder) ||
    (nextPartialQuery.limit !== undefined && nextPartialQuery.limit !== currentQuery.limit)
  );
}

export function PatientsListPage() {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const query = useMemo(
    () => parsePatientsQuery(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const patientsQuery = useQuery({
    queryKey: ['patients', query],
    queryFn: () => {
      if (!auth.token) {
        throw new Error('Missing authentication token.');
      }

      return getPatients(query, auth.token);
    },
    enabled: Boolean(auth.token),
    placeholderData: (previousData) => previousData,
  });

  const updateQuery = useCallback(
    (nextPartialQuery: Partial<PatientsQuery>) => {
      const nextQuery: PatientsQuery = {
        ...query,
        ...nextPartialQuery,
      };

      if (shouldResetPage(query, nextPartialQuery)) {
        nextQuery.page = 1;
      }

      router.push(`${pathname}?${createPatientsQueryString(nextQuery)}`);
    },
    [pathname, query, router],
  );

  useEffect(() => {
    if (patientsQuery.error instanceof ApiError && patientsQuery.error.statusCode === 401) {
      auth.logout();
    }
  }, [auth, patientsQuery.error]);

  useEffect(() => {
    if (!patientsQuery.data || patientsQuery.isFetching) {
      return;
    }

    const totalPages = Math.max(1, Math.ceil(patientsQuery.data.total / query.limit));

    if (query.page > totalPages) {
      updateQuery({ page: totalPages });
    }
  }, [patientsQuery.data, patientsQuery.isFetching, query.limit, query.page, updateQuery]);

  const userRole: UserRole = auth.user?.role ?? 'user';
  const canMutatePatients = userRole === 'admin';
  const patients = patientsQuery.data?.data ?? [];
  const hasSearch = query.search.trim().length > 0;
  const isUnauthorizedError =
    patientsQuery.error instanceof ApiError && patientsQuery.error.statusCode === 401;

  const handleSearchChange = useCallback(
    (search: string) => updateQuery({ search }),
    [updateQuery],
  );
  const handleSortChange = useCallback(
    (sortBy: PatientSortBy) => updateQuery({ sortBy }),
    [updateQuery],
  );
  const handleSortOrderChange = useCallback(
    (sortOrder: SortOrder) => updateQuery({ sortOrder }),
    [updateQuery],
  );
  const handleLimitChange = useCallback((limit: number) => updateQuery({ limit }), [updateQuery]);
  const handlePageChange = useCallback((page: number) => updateQuery({ page }), [updateQuery]);
  const handleDeletePatient = useCallback(
    (patient: Patient) => {
      if (selectedPatientId === patient.id) {
        setSelectedPatientId(null);
      }

      setDeletingPatient(patient);
    },
    [selectedPatientId],
  );

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-foreground">Patients</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Search, sort, and manage patient records.
            </p>
          </div>

          {canMutatePatients ? (
            <button
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2 focus:ring-offset-background sm:w-auto"
              type="button"
              onClick={() => setIsCreateOpen(true)}
            >
              Create patient
            </button>
          ) : null}
        </div>

        <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm leading-6 text-card-foreground shadow-sm">
          {userRole === 'admin'
            ? 'Admin access: create, edit, and delete patient records.'
            : 'View-only access: patient records can be reviewed but not modified.'}
        </div>
      </header>

      {isUnauthorizedError ? null : (
        <>
          {patientsQuery.isPending ? (
            <PatientsListSkeleton />
          ) : (
            <>
              <PatientsToolbar
                query={query}
                isFetching={patientsQuery.isFetching && !patientsQuery.isPending}
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                onSortOrderChange={handleSortOrderChange}
                onLimitChange={handleLimitChange}
              />

              {patientsQuery.isError ? (
                <PatientsErrorState
                  message={getPatientsErrorMessage(patientsQuery.error)}
                  onRetry={() => {
                    void patientsQuery.refetch();
                  }}
                />
              ) : (
                <>
                  {patients.length === 0 ? (
                    <PatientsEmptyState
                      hasSearch={hasSearch}
                      canCreate={canMutatePatients}
                      onClearSearch={() => updateQuery({ search: '' })}
                      onCreatePatient={() => setIsCreateOpen(true)}
                    />
                  ) : (
                    <>
                      <PatientsTable
                        patients={patients}
                        userRole={userRole}
                        onViewPatient={setSelectedPatientId}
                        onEditPatient={setEditingPatientId}
                        onDeletePatient={handleDeletePatient}
                      />
                      <PatientsMobileList
                        patients={patients}
                        userRole={userRole}
                        onViewPatient={setSelectedPatientId}
                        onEditPatient={setEditingPatientId}
                        onDeletePatient={handleDeletePatient}
                      />
                    </>
                  )}

                  {patientsQuery.data ? (
                    <PatientsPagination
                      page={query.page}
                      limit={query.limit}
                      total={patientsQuery.data.total}
                      isFetching={patientsQuery.isFetching}
                      onPageChange={handlePageChange}
                    />
                  ) : null}
                </>
              )}
            </>
          )}
        </>
      )}

      <PatientDetailsDialog
        patientId={selectedPatientId}
        token={auth.token}
        open={selectedPatientId !== null}
        onClose={() => setSelectedPatientId(null)}
      />

      <PatientCreateDialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <PatientEditDialog
        patientId={editingPatientId}
        open={editingPatientId !== null}
        onClose={() => setEditingPatientId(null)}
      />

      <PatientDeleteDialog
        patient={deletingPatient}
        open={deletingPatient !== null}
        onClose={() => setDeletingPatient(null)}
      />
    </section>
  );
}
