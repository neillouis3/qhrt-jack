import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for session cookie
  const sessionCookie = request.cookies.get('sb-auth-token')?.value;

  // Protect /dashboard, /content (admin), /home, /sessions (user) routes
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/content') ||
    pathname.startsWith('/home') ||
    pathname.startsWith('/sessions')
  ) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    // TODO: Check admin role from session
    // For now, allow any authenticated user
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/content/:path*', '/home/:path*', '/sessions/:path*'],
};
