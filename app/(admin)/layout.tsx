import type { Metadata } from 'next';
import NavbarLayout from '@/components/NavbarLayout';
import { NavItem } from '@/components/Navbar';

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
  return <NavbarLayout adminLinks={adminLinks}>{children}</NavbarLayout>;
}
