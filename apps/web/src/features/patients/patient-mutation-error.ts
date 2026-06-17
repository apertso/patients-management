import { ApiError } from '@/lib/api-client';

export function getPatientMutationErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.statusCode === 401) {
      return 'Your session expired. Please sign in again.';
    }

    if (error.statusCode === 403) {
      return 'You do not have permission to modify patient records.';
    }

    if (error.statusCode === 404) {
      return 'This patient record could not be found.';
    }

    if (error.statusCode === 409) {
      return 'A patient with this email already exists.';
    }

    if (error.statusCode === 503) {
      return 'The API is temporarily unavailable. Please retry.';
    }
  }

  return 'Something went wrong. Please try again.';
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && error.statusCode === 401;
}
