import type { UserRole } from '@/features/auth/auth.types';
import { formatDate, formatDateTime } from '@/lib/date-format';

import type { Patient } from './patients.types';

type PatientsTableProps = {
  patients: Patient[];
  userRole: UserRole;
  onViewPatient: (patientId: string) => void;
  onEditPatient: (patientId: string) => void;
  onDeletePatient: (patient: Patient) => void;
};

export function PatientsTable({
  patients,
  userRole,
  onViewPatient,
  onEditPatient,
  onDeletePatient,
}: PatientsTableProps) {
  const canMutatePatients = userRole === 'admin';

  return (
    <div className="hidden overflow-hidden rounded-lg border border-border bg-background shadow-sm md:block">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-muted/70 text-xs uppercase tracking-normal text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold" scope="col">
              Patient
            </th>
            <th className="px-4 py-3 font-semibold" scope="col">
              Email
            </th>
            <th className="px-4 py-3 font-semibold" scope="col">
              Phone
            </th>
            <th className="px-4 py-3 font-semibold" scope="col">
              DOB
            </th>
            <th className="px-4 py-3 font-semibold" scope="col">
              Created
            </th>
            <th className="px-4 py-3 font-semibold" scope="col">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {patients.map((patient) => (
            <tr key={patient.id} className="transition hover:bg-muted/40">
              <td className="px-4 py-4 align-top">
                <p className="font-medium text-foreground">
                  {patient.firstName} {patient.lastName}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  ID: {patient.id.slice(0, 8)}
                </p>
              </td>
              <td className="px-4 py-4 align-top text-foreground">{patient.email}</td>
              <td className="px-4 py-4 align-top text-foreground">
                {patient.phoneNumber ?? '—'}
              </td>
              <td className="px-4 py-4 align-top text-foreground">{formatDate(patient.dob)}</td>
              <td className="px-4 py-4 align-top text-foreground">
                {formatDateTime(patient.createdAt)}
              </td>
              <td className="px-4 py-4 align-top">
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
                    type="button"
                    onClick={() => onViewPatient(patient.id)}
                  >
                    View
                  </button>

                  {canMutatePatients ? (
                    <>
                      <button
                        className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
                        type="button"
                        onClick={() => onEditPatient(patient.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-2"
                        type="button"
                        onClick={() => onDeletePatient(patient)}
                      >
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
