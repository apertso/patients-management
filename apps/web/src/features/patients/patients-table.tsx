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

export function PatientsTable({
  patients,
  userRole,
  onViewPatient,
  onEditPatient,
  onDeletePatient,
}: PatientsTableProps) {
  const canMutatePatients = userRole === 'admin';

  return (
    <div className="hidden w-full overflow-x-auto bg-card text-card-foreground md:block">
      <table className="w-full border-collapse text-left text-sm">
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
            <th className="px-4 py-4" scope="col">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {patients.map((patient) => (
            <tr key={patient.id} className="transition hover:bg-muted/50">
              <td className="px-4 py-4 align-middle">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold", getAvatarColorClass(patient.firstName))}>
                    {getInitials(patient.firstName, patient.lastName)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {patient.firstName} {patient.lastName}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      ID: {patient.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 align-middle text-foreground">{patient.email}</td>
              <td className="px-4 py-4 align-middle text-foreground">
                {patient.phoneNumber ?? '—'}
              </td>
              <td className="px-4 py-4 align-middle text-foreground">{formatDate(patient.dob)}</td>
              <td className="px-4 py-4 align-middle text-foreground">
                {formatDateTime(patient.createdAt)}
              </td>
              <td className="px-4 py-4 align-middle">
                <div className="flex flex-wrap gap-2">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    type="button"
                    onClick={() => onViewPatient(patient.id)}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    View
                  </button>

                  {canMutatePatients ? (
                    <>
                      <button
                        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/30"
                        type="button"
                        onClick={() => onEditPatient(patient.id)}
                      >
                        <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        Edit
                      </button>
                      <button
                        className="inline-flex items-center gap-1.5 rounded-md border border-error/20 bg-error/5 px-2.5 py-1.5 text-xs font-medium text-error transition hover:bg-error/10 focus:outline-none focus:ring-2 focus:ring-error/30"
                        type="button"
                        onClick={() => onDeletePatient(patient)}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete
                      </button>
                    </>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
