export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  dob: string;
  createdAt: string;
  updatedAt: string;
};

export type PatientSortBy = 'lastName' | 'dob' | 'createdAt';

export type SortOrder = 'asc' | 'desc';

export type PatientsQuery = {
  page: number;
  limit: number;
  search: string;
  sortBy: PatientSortBy;
  sortOrder: SortOrder;
};

export type PaginatedPatientsResponse = {
  data: Patient[];
  page: number;
  limit: number;
  total: number;
};
