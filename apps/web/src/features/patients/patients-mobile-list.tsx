import type { UserRole } from '@/features/auth/auth.types';
import { formatDate } from '@/lib/date-format';

import type { Patient } from './patients.types';

type PatientsMobileListProps = {
  patients: Patient[];
  userRole: UserRole;
  onViewPatient: (patientId: string) => void;
  onEditPatient: (patientId: string) => void;
  onDeletePatient: (patient: Patient) => void;
};

export function PatientsMobileList({
  patients,
  userRole,
  onViewPatient,
  onEditPatient,
  onDeletePatient,
}: PatientsMobileListProps) {
  const canMutatePatients = userRole === 'admin';

  return (
    <div className="space-y-3 md:hidden">
      {patients.map((patient) => (
        <article
          key={patient.id}
          className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm"
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
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2 focus:ring-offset-background"
              type="button"
              onClick={() => onViewPatient(patient.id)}
            >
              View
            </button>

            {canMutatePatients ? (
              <>
                <button
                  className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2 focus:ring-offset-background"
                  type="button"
                  onClick={() => onEditPatient(patient.id)}
                >
                  Edit
                </button>
                <button
                  className="rounded-md border border-error/30 px-3 py-2 text-sm font-medium text-error transition hover:bg-error/10 focus:outline-none focus:ring-2 focus:ring-error/30 focus:ring-offset-2 focus:ring-offset-background"
                  type="button"
                  onClick={() => onDeletePatient(patient)}
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
