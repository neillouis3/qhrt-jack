import type { Metadata } from 'next';
import { NavItem } from '@/components/NavbarContext';
import NavbarProvider from '@/components/NavbarProvider';

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
  return <NavbarProvider value={{ userLinks }}>{children}</NavbarProvider>;
}
