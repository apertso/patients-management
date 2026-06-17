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

export type PatientFormInput = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string;
};

export type PatientMutationInput = Omit<PatientFormInput, 'phoneNumber'> & {
  phoneNumber?: string;
};

export type CreatePatientInput = PatientMutationInput;

export type UpdatePatientInput = Partial<PatientMutationInput>;

export type DeletePatientResponse = {
  ok: true;
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
