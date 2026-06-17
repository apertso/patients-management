import { z } from 'zod';

function getDateFromInput(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export const patientFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required.')
    .max(80, 'First name must be 80 characters or less.'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required.')
    .max(80, 'Last name must be 80 characters or less.'),
  email: z
    .string()
    .trim()
    .email('Enter a valid email address.')
    .max(255, 'Email must be 255 characters or less.'),
  phoneNumber: z
    .string()
    .trim()
    .max(40, 'Phone number must be 40 characters or less.')
    .optional()
    .or(z.literal('')),
  dob: z
    .string()
    .refine((value) => {
      if (!value) {
        return false;
      }

      const date = getDateFromInput(value);

      return Number.isFinite(date.getTime());
    }, 'Enter a valid date of birth.')
    .refine((value) => {
      const date = getDateFromInput(value);

      return !Number.isFinite(date.getTime()) || date <= new Date();
    }, 'Date of birth cannot be in the future.'),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;
