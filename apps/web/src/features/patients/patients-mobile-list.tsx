import type { UserRole } from '@/features/auth/auth.types';
import { formatDate } from '@/lib/date-format';
import { cn } from '@/lib/ui';

import type { Patient } from './patients.types';

type PatientsMobileListProps = {
  patients: Patient[];
  userRole: UserRole;
  onViewPatient: (patientId: string) => void;
  onEditPatient: (patientId: string) => void;
  onDeletePatient: (patient: Patient) => void;
};

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getAvatarColorClass(name: string) {
  const colors = [
    'bg-blue-100 text-blue-950 dark:bg-blue-900/50 dark:text-white',
    'bg-purple-100 text-purple-950 dark:bg-purple-900/50 dark:text-white',
    'bg-green-100 text-green-950 dark:bg-green-900/50 dark:text-white',
    'bg-amber-100 text-amber-950 dark:bg-amber-900/50 dark:text-white',
    'bg-rose-100 text-rose-950 dark:bg-rose-900/50 dark:text-white',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export function PatientsMobileList({
  patients,
  userRole,
  onViewPatient,
  onEditPatient,
  onDeletePatient,
}: PatientsMobileListProps) {
  const canMutatePatients = userRole === 'admin';

  return (
    <div className="flex flex-col divide-y divide-border bg-card md:hidden">
      {patients.map((patient) => (
        <article
          key={patient.id}
          className="p-4 text-card-foreground"
        >
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold", getAvatarColorClass(patient.firstName))}>
              {getInitials(patient.firstName, patient.lastName)}
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {patient.firstName} {patient.lastName}
              </h2>
              <p className="break-words text-sm text-muted-foreground">{patient.email}</p>
            </div>
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
