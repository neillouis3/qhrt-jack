'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Navbar, { NavItem } from '@/components/Navbar';
import UserMenu from '@/components/UserMenu';

interface NavbarLayoutProps {
  children: React.ReactNode;
  adminLinks?: NavItem[];
  userLinks?: NavItem[];
}

export default function NavbarLayout({
  children,
  adminLinks = [],
  userLinks = [],
}: NavbarLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setUser({
            name: data.user.email ?? 'User',
            email: data.user.email ?? '',
            role: data.user.role ?? 'user',
          });
        }
      } catch {
        /* not logged in */
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/auth/login');
    } catch {
      /* handle error */
    }
  };

  const isAdminRoute =
    (pathname?.startsWith('/dashboard') || pathname?.startsWith('/content')) ?? false;
  const isUserRoute = (pathname?.startsWith('/home') || pathname?.startsWith('/sessions')) ?? false;
  const isAuthRoute = pathname?.startsWith('/auth') ?? false;

  // Auth pages have their own layout, don't wrap them
  if (isAuthRoute) return <>{children}</>;

  // Determine which links to show based on user role
  const links = user?.role === 'admin' ? adminLinks : isUserRoute ? userLinks : [];

  const rightContent = loading ? (
    <div className="w-20 h-8 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
  ) : user ? (
    <UserMenu
      items={[
        { label: 'Settings', onClick: () => {} },
        { label: 'Log out', onClick: handleLogout, danger: true },
      ]}
      initialEmail={user.email}
    />
  ) : (
    <div className="flex items-center gap-2">
      <a
        href="/auth/login"
        className="px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
      >
        Log in
      </a>
      <a
        href="/auth/login"
        className="px-3 py-1.5 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
      >
        Sign up
      </a>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar logo="QHRT" logoHref="/" links={links} rightContent={rightContent} />
      <main className="flex flex-1 w-full">{children}</main>
    </div>
  );
}
