import { apiRequest } from '@/lib/api-client';

import type {
  CreatePatientInput,
  DeletePatientResponse,
  PaginatedPatientsResponse,
  Patient,
  PatientsQuery,
  UpdatePatientInput,
} from './patients.types';

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

export function createPatient(input: CreatePatientInput, token: string): Promise<Patient> {
  return apiRequest<Patient>('/patients', {
    method: 'POST',
    body: input,
    token,
  });
}

export function updatePatient(
  id: string,
  input: UpdatePatientInput,
  token: string,
): Promise<Patient> {
  return apiRequest<Patient>(`/patients/${id}`, {
    method: 'PUT',
    body: input,
    token,
  });
}

export function deletePatient(id: string, token: string): Promise<DeletePatientResponse> {
  return apiRequest<DeletePatientResponse>(`/patients/${id}`, {
    method: 'DELETE',
    token,
  });
}
