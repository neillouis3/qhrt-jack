import type { Metadata } from 'next';
import NavbarLayout from '@/components/NavbarLayout';
import { NavItem } from '@/components/Navbar';

export const metadata: Metadata = {
  title: {
    default: 'QHRT',
    template: '%s | QHRT',
  },
  description: 'QHRT application',
};

const userLinks: NavItem[] = [
  { name: 'Home', path: '/home' },
  { name: 'Sessions', path: '/sessions' },
];

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <NavbarLayout userLinks={userLinks}>{children}</NavbarLayout>;
}
