'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          const role = data.user?.role ?? 'user';
          // Admin users go to dashboard, regular users go to home
          router.push(role === 'admin' ? '/dashboard' : '/home');
          return;
        }
      } catch {
        // Not logged in, show login page
      } finally {
        setChecking(false);
      }
    };
    checkSession();
  }, [router]);

  const handleSuccess = async () => {
    // Check the user's role to determine where to redirect
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        const role = data.user?.role ?? 'user';
        router.push(role === 'admin' ? '/dashboard' : '/home');
        return;
      }
    } catch {
      // Fallback to home on error
    }
    router.push('/home');
  };

  if (checking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <p className="text-sm text-muted">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-white">
            {mode === 'login' ? 'Sign in to your account' : 'Create an account'}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="font-medium text-primary hover:text-primary-dark dark:text-primary-light"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
        <LoginForm mode={mode} onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
