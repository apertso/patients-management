import type { PatientSortBy, PatientsQuery, SortOrder } from './patients.types';

export const DEFAULT_PATIENTS_QUERY = {
  page: 1,
  limit: 10,
  search: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
} satisfies PatientsQuery;

function parseInteger(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) ? parsed : null;
}

function parsePage(value: string | null): number {
  const parsed = parseInteger(value);

  return parsed && parsed >= 1 ? parsed : DEFAULT_PATIENTS_QUERY.page;
}

function parseLimit(value: string | null): number {
  const parsed = parseInteger(value);

  return parsed && parsed >= 1 && parsed <= 50 ? parsed : DEFAULT_PATIENTS_QUERY.limit;
}

function isPatientSortBy(value: string | null): value is PatientSortBy {
  return value === 'lastName' || value === 'dob' || value === 'createdAt';
}

function isSortOrder(value: string | null): value is SortOrder {
  return value === 'asc' || value === 'desc';
}

function parseSortBy(value: string | null): PatientSortBy {
  return isPatientSortBy(value) ? value : DEFAULT_PATIENTS_QUERY.sortBy;
}

function parseSortOrder(value: string | null): SortOrder {
  return isSortOrder(value) ? value : DEFAULT_PATIENTS_QUERY.sortOrder;
}

export function parsePatientsQuery(searchParams: URLSearchParams): PatientsQuery {
  return {
    page: parsePage(searchParams.get('page')),
    limit: parseLimit(searchParams.get('limit')),
    search: searchParams.get('search') ?? DEFAULT_PATIENTS_QUERY.search,
    sortBy: parseSortBy(searchParams.get('sortBy')),
    sortOrder: parseSortOrder(searchParams.get('sortOrder')),
  };
}

export function createPatientsQueryString(query: PatientsQuery): string {
  return new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
    search: query.search.trim(),
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  }).toString();
}
