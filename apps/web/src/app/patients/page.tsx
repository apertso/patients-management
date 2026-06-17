'use client';

import { AppShell } from '@/components/layout/app-shell';
import { ProtectedRoute } from '@/components/routes/protected-route';
import { useAuth } from '@/features/auth/use-auth';

function PatientsPlaceholder() {
  const { user } = useAuth();

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Patients</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          The protected patients workspace is ready. The table and CRUD flows will be implemented
          in the next stages.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-white p-5 text-sm leading-6 text-foreground">
        {user?.role === 'admin'
          ? 'You are signed in as an admin. Create, edit, and delete actions will be available in the CRUD stage.'
          : 'You are signed in as a user. This account will have view-only access.'}
      </div>
    </section>
  );
}

export default function PatientsPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <PatientsPlaceholder />
      </AppShell>
    </ProtectedRoute>
  );
}
