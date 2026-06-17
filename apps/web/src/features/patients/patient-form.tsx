'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { patientFormSchema, type PatientFormValues } from './patient-form.schema';
import type { PatientFormInput } from './patients.types';

type PatientFormProps = {
  id: string;
  defaultValues: PatientFormInput;
  submitLabel: string;
  isSubmitting: boolean;
  serverError?: string | null;
  initialFocusRef?: RefObject<HTMLInputElement | null>;
  onSubmit: (values: PatientFormInput) => Promise<void> | void;
  onCancel: () => void;
};

const todayInputValue = new Date().toISOString().slice(0, 10);

function getFieldErrorId(id: string, fieldName: keyof PatientFormInput): string {
  return `${id}-${fieldName}-error`;
}

export function PatientForm({
  id,
  defaultValues,
  submitLabel,
  isSubmitting,
  serverError,
  initialFocusRef,
  onSubmit,
  onCancel,
}: PatientFormProps) {
  const formIdRef = useRef(id);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues,
  });
  const firstNameRegistration = register('firstName');

  useEffect(() => {
    if (formIdRef.current !== id) {
      formIdRef.current = id;
      reset(defaultValues);
    }
  }, [defaultValues, id, reset]);

  async function submitForm(values: PatientFormValues) {
    await onSubmit({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phoneNumber: values.phoneNumber ?? '',
      dob: values.dob,
    });
  }

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit(submitForm)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground" htmlFor={`${id}-firstName`}>
            First name
          </label>
          <input
            id={`${id}-firstName`}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:bg-muted"
            type="text"
            autoComplete="given-name"
            aria-invalid={errors.firstName ? 'true' : 'false'}
            aria-describedby={errors.firstName ? getFieldErrorId(id, 'firstName') : undefined}
            disabled={isSubmitting}
            {...firstNameRegistration}
            ref={(element) => {
              firstNameRegistration.ref(element);

              if (initialFocusRef) {
                initialFocusRef.current = element;
              }
            }}
          />
          {errors.firstName ? (
            <p
              className="text-sm leading-5 text-error"
              id={getFieldErrorId(id, 'firstName')}
            >
              {errors.firstName.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground" htmlFor={`${id}-lastName`}>
            Last name
          </label>
          <input
            id={`${id}-lastName`}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:bg-muted"
            type="text"
            autoComplete="family-name"
            aria-invalid={errors.lastName ? 'true' : 'false'}
            aria-describedby={errors.lastName ? getFieldErrorId(id, 'lastName') : undefined}
            disabled={isSubmitting}
            {...register('lastName')}
          />
          {errors.lastName ? (
            <p className="text-sm leading-5 text-error" id={getFieldErrorId(id, 'lastName')}>
              {errors.lastName.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground" htmlFor={`${id}-email`}>
            Email
          </label>
          <input
            id={`${id}-email`}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:bg-muted"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? getFieldErrorId(id, 'email') : undefined}
            disabled={isSubmitting}
            {...register('email')}
          />
          {errors.email ? (
            <p className="text-sm leading-5 text-error" id={getFieldErrorId(id, 'email')}>
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            className="block text-sm font-medium text-foreground"
            htmlFor={`${id}-phoneNumber`}
          >
            Phone number
          </label>
          <input
            id={`${id}-phoneNumber`}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:bg-muted"
            type="tel"
            autoComplete="tel"
            aria-invalid={errors.phoneNumber ? 'true' : 'false'}
            aria-describedby={errors.phoneNumber ? getFieldErrorId(id, 'phoneNumber') : undefined}
            disabled={isSubmitting}
            {...register('phoneNumber')}
          />
          {errors.phoneNumber ? (
            <p
              className="text-sm leading-5 text-error"
              id={getFieldErrorId(id, 'phoneNumber')}
            >
              {errors.phoneNumber.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground" htmlFor={`${id}-dob`}>
            Date of birth
          </label>
          <input
            id={`${id}-dob`}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:bg-muted"
            type="date"
            max={todayInputValue}
            aria-invalid={errors.dob ? 'true' : 'false'}
            aria-describedby={errors.dob ? getFieldErrorId(id, 'dob') : undefined}
            disabled={isSubmitting}
            {...register('dob')}
          />
          {errors.dob ? (
            <p className="text-sm leading-5 text-error" id={getFieldErrorId(id, 'dob')}>
              {errors.dob.message}
            </p>
          ) : null}
        </div>
      </div>

      {serverError ? (
        <div
          className="rounded-md border border-error/20 bg-error/10 p-3 text-sm text-error"
          id={`${id}-server-error`}
          role="alert"
        >
          {serverError}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
