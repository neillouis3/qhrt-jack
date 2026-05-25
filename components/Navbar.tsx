'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useNavigationGuard from '@/hooks/useNavigationGuard';

export interface NavItem {
  name: string;
  path: string;
}

export interface NavbarProps {
  logo?: string;
  logoHref?: string;
  links: NavItem[];
  rightContent?: React.ReactNode;
}

export default function Navbar({
  logo = 'QHRT',
  logoHref = '/',
  links,
  rightContent,
}: NavbarProps) {
  const pathname = usePathname();
  const navigate = useNavigationGuard();

  return (
    <header className="bg-white dark:bg-zinc-900 flex translate-z-0 z-1000 flex-row justify-between items-center w-full ring-1 ring-zinc-200 dark:ring-zinc-800 px-6 py-3 sticky top-0">
      <div className="flex items-center gap-6">
        <Link
          href={logoHref}
          onClick={(e) => {
            if (!navigate(logoHref)) e.preventDefault();
          }}
          className="text-lg font-bold text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-opacity"
        >
          {logo}
        </Link>
        <nav className="hidden sm:flex items-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={(e) => {
                  if (!navigate(link.path)) e.preventDefault();
                }}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }
                `}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-3">{rightContent}</div>
    </header>
  );
}
