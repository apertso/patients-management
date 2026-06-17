import { PublicOnlyRoute } from '@/components/routes/public-only-route';
import { LoginForm } from '@/features/auth/login-form';

export default function LoginPage() {
  return (
    <PublicOnlyRoute>
      <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
        <section className="w-full max-w-[400px] rounded-lg border border-border bg-white p-6 shadow-sm">
          <div className="mb-6 space-y-2 text-center">
            <p className="text-sm font-medium text-primary">Patients Management System</p>
            <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
            <p className="text-sm text-muted-foreground">Use one of the demo accounts to continue.</p>
          </div>

          <LoginForm />
        </section>
      </main>
    </PublicOnlyRoute>
  );
}
