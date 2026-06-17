'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useAuth } from '@/features/auth/use-auth';
import { ApiError } from '@/lib/api-client';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const auth = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    clearErrors('root');

    try {
      await auth.login(values);
      router.push('/patients');
    } catch (error) {
      const message =
        error instanceof ApiError && error.statusCode === 401
          ? 'Invalid email or password.'
          : 'Something went wrong. Please try again.';

      setError('root', {
        type: 'server',
        message,
      });
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          disabled={isSubmitting}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:bg-muted"
          {...register('email')}
        />
        {errors.email?.message ? (
          <p className="text-sm text-error" id="email-error">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          disabled={isSubmitting}
          aria-invalid={errors.password ? 'true' : 'false'}
          aria-describedby={errors.password ? 'password-error' : undefined}
          className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:bg-muted"
          {...register('password')}
        />
        {errors.password?.message ? (
          <p className="text-sm text-error" id="password-error">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      {errors.root?.message ? (
        <p className="rounded-md border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
          {errors.root.message}
        </p>
      ) : null}

      <button
        className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </button>

      <div className="rounded-md border border-border bg-muted/70 px-3 py-3 text-xs leading-5 text-muted-foreground">
        <p className="font-medium text-foreground">Demo accounts:</p>
        <p>Admin: admin@example.com / password123</p>
        <p>User: user@example.com / password123</p>
      </div>
    </form>
  );
}
