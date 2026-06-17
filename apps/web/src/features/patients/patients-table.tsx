import type { UserRole } from '@/features/auth/auth.types';
import { formatDate, formatDateTime } from '@/lib/date-format';
import { cn } from '@/lib/ui';

import type { Patient } from './patients.types';

type PatientsTableProps = {
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

function TruncatedText({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn('block truncate', className)} title={value}>
      {value}
    </span>
  );
}

export function PatientsTable({
  patients,
  userRole,
  onViewPatient,
  onEditPatient,
  onDeletePatient,
}: PatientsTableProps) {
  const canMutatePatients = userRole === 'admin';

  return (
    <div className="hidden w-full overflow-hidden bg-card text-card-foreground md:block">
      <table className="w-full table-fixed border-collapse text-left text-sm">
        {canMutatePatients ? (
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[27%]" />
            <col className="w-[15%]" />
            <col className="w-[11%]" />
            <col className="w-[12%]" />
            <col className="w-[11%]" />
          </colgroup>
        ) : (
          <colgroup>
            <col className="w-[28%]" />
            <col className="w-[32%]" />
            <col className="w-[16%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
          </colgroup>
        )}
        <thead className="border-b border-border bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-4" scope="col">
              Patient
            </th>
            <th className="px-4 py-4" scope="col">
              Email
            </th>
            <th className="px-4 py-4" scope="col">
              Phone
            </th>
            <th className="px-4 py-4" scope="col">
              DOB
            </th>
            <th className="px-4 py-4" scope="col">
              Created
            </th>
            {canMutatePatients ? (
              <th className="px-4 py-4" scope="col">
                Actions
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {patients.map((patient) => {
            const patientName = `${patient.firstName} ${patient.lastName}`;

            return (
              <tr
                key={patient.id}
                className="cursor-pointer transition hover:bg-muted/50 focus:outline-none focus-visible:bg-muted/50"
                tabIndex={0}
                aria-label={`View patient ${patientName}`}
                onClick={() => onViewPatient(patient.id)}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) {
                    return;
                  }

                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onViewPatient(patient.id);
                  }
                }}
              >
                <td className="px-4 py-4 align-middle">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold", getAvatarColorClass(patient.firstName))}>
                      {getInitials(patient.firstName, patient.lastName)}
                    </div>
                    <div className="min-w-0">
                      <TruncatedText
                        className="font-semibold text-foreground"
                        value={patientName}
                      />
                      <p className="mt-0.5 truncate text-xs text-muted-foreground" title={patient.id}>
                        ID: {patient.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 align-middle text-foreground">
                  <TruncatedText value={patient.email} />
                </td>
                <td className="px-4 py-4 align-middle text-foreground">
                  <TruncatedText value={patient.phoneNumber ?? '—'} />
                </td>
                <td className="px-4 py-4 align-middle text-foreground">
                  <TruncatedText value={formatDate(patient.dob)} />
                </td>
                <td className="px-4 py-4 align-middle text-foreground">
                  <span className="block truncate" title={formatDateTime(patient.createdAt)}>
                    {formatDate(patient.createdAt)}
                  </span>
                </td>
                {canMutatePatients ? (
                  <td className="px-4 py-4 align-middle">
                    <div className="flex flex-nowrap gap-1">
                      <button
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1.5 text-xs font-medium text-foreground shadow-sm transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/30"
                        type="button"
                        aria-label="Edit patient"
                        title="Edit patient"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEditPatient(patient.id);
                        }}
                      >
                        <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button
                        className="inline-flex items-center gap-1 rounded-md border border-error/20 bg-error/5 px-2 py-1.5 text-xs font-medium text-error transition hover:bg-error/10 focus:outline-none focus:ring-2 focus:ring-error/30"
                        type="button"
                        aria-label="Delete patient"
                        title="Delete patient"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeletePatient(patient);
                        }}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                ) : null}
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
