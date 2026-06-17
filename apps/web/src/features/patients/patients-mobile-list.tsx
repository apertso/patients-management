import type { UserRole } from '@/features/auth/auth.types';
import { formatDate } from '@/lib/date-format';

import type { Patient } from './patients.types';

type PatientsMobileListProps = {
  patients: Patient[];
  userRole: UserRole;
  onViewPatient: (patientId: string) => void;
};

export function PatientsMobileList({
  patients,
  userRole,
  onViewPatient,
}: PatientsMobileListProps) {
  return (
    <div className="space-y-3 md:hidden">
      {patients.map((patient) => (
        <article
          key={patient.id}
          className="rounded-lg border border-border bg-background p-4 shadow-sm"
        >
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">
              {patient.firstName} {patient.lastName}
            </h2>
            <p className="break-words text-sm text-muted-foreground">{patient.email}</p>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Phone
              </dt>
              <dd className="mt-1 text-foreground">{patient.phoneNumber ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                DOB
              </dt>
              <dd className="mt-1 text-foreground">{formatDate(patient.dob)}</dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
              type="button"
              onClick={() => onViewPatient(patient.id)}
            >
              View patient
            </button>

            {userRole === 'admin' ? (
              <>
                <button
                  className="rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground opacity-60"
                  type="button"
                  title="Available in the next stage"
                  disabled
                >
                  Edit
                </button>
                <button
                  className="rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground opacity-60"
                  type="button"
                  title="Available in the next stage"
                  disabled
                >
                  Delete
                </button>
              </>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
