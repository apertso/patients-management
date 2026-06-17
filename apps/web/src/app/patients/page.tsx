'use client';

import { AppShell } from '@/components/layout/app-shell';
import { ProtectedRoute } from '@/components/routes/protected-route';
import { PatientsListPage } from '@/features/patients/patients-list-page';

export default function PatientsPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <PatientsListPage />
      </AppShell>
    </ProtectedRoute>
  );
}
