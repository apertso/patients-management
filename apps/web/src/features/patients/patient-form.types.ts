import type { CreatePatientInput, Patient, PatientFormInput } from './patients.types';

export function getEmptyPatientFormValues(): PatientFormInput {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dob: '',
  };
}

export function getPatientFormValues(patient: Patient): PatientFormInput {
  return {
    firstName: patient.firstName,
    lastName: patient.lastName,
    email: patient.email,
    phoneNumber: patient.phoneNumber ?? '',
    dob: patient.dob.slice(0, 10),
  };
}

export function toPatientMutationInput(values: PatientFormInput): CreatePatientInput {
  const phoneNumber = values.phoneNumber.trim();

  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phoneNumber: phoneNumber || undefined,
    dob: values.dob.trim(),
  };
}
