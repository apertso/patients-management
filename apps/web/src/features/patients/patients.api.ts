import { apiRequest } from '@/lib/api-client';

import type { PaginatedPatientsResponse, Patient, PatientsQuery } from './patients.types';

export function getPatients(
  query: PatientsQuery,
  token: string,
): Promise<PaginatedPatientsResponse> {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  });

  if (query.search.trim()) {
    params.set('search', query.search.trim());
  }

  return apiRequest<PaginatedPatientsResponse>(`/patients?${params.toString()}`, {
    token,
  });
}

export function getPatient(id: string, token: string): Promise<Patient> {
  return apiRequest<Patient>(`/patients/${id}`, {
    token,
  });
}
