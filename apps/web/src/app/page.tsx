'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/features/auth/use-auth';

export default function Home() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.isLoading) {
      return;
    }

    router.push(auth.isAuthenticated ? '/patients' : '/login');
  }, [auth.isAuthenticated, auth.isLoading, router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-sm text-muted-foreground">
      Loading...
    </main>
  );
}
