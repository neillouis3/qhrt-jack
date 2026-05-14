import type { Metadata } from 'next';
import { NavItem } from '@/components/NavbarContext';
import NavbarProvider from '@/components/NavbarProvider';

export const metadata: Metadata = {
  title: {
    default: 'QHRT Admin',
    template: '%s | QHRT Admin',
  },
  description: 'QHRT admin dashboard',
};

const adminLinks: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Content', path: '/content' },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <NavbarProvider value={{ adminLinks }}>{children}</NavbarProvider>;
}
