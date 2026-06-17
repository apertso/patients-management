import { PublicOnlyRoute } from '@/components/routes/public-only-route';
import { LoginForm } from '@/features/auth/login-form';

export default function LoginPage() {
  return (
    <PublicOnlyRoute>
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <section className="w-full max-w-[420px] rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
          <div className="mb-7 space-y-3 text-center">
            <p className="text-sm font-semibold text-primary">Patients Management System</p>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
              <p className="text-sm leading-6 text-muted-foreground">
                Use one of the demo accounts to access the protected workspace.
              </p>
            </div>
          </div>

          <LoginForm />
        </section>
      </main>
    </PublicOnlyRoute>
  );
}
