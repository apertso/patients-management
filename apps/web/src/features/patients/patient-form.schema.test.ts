import { describe, expect, it } from 'vitest';

import { patientFormSchema } from './patient-form.schema';

const validPatientForm = {
  firstName: 'Emma',
  lastName: 'Johnson',
  email: 'emma.johnson@example.com',
  phoneNumber: '+1 555 0101',
  dob: '1988-04-12',
};

describe('patientFormSchema', () => {
  it('accepts a valid patient form', () => {
    expect(patientFormSchema.safeParse(validPatientForm).success).toBe(true);
  });

  it('rejects a missing first name', () => {
    expect(patientFormSchema.safeParse({ ...validPatientForm, firstName: '' }).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(patientFormSchema.safeParse({ ...validPatientForm, email: 'invalid' }).success).toBe(
      false,
    );
  });

  it('rejects a future date of birth', () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    expect(patientFormSchema.safeParse({ ...validPatientForm, dob: tomorrow }).success).toBe(
      false,
    );
  });

  it('rejects a too long phone number', () => {
    expect(
      patientFormSchema.safeParse({ ...validPatientForm, phoneNumber: '1'.repeat(41) }).success,
    ).toBe(false);
  });
});
