import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@/app/globals.css';
import NavbarLayout from '@/components/NavbarLayout';
import { NavItem } from '@/components/Navbar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NavbarLayout adminLinks={adminLinks}>{children}</NavbarLayout>
      </body>
    </html>
  );
}
