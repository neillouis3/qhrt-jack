import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for session cookie
  const sessionCookie = request.cookies.get('sb-auth-token')?.value;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    // TODO: Check admin role from session
    // For now, allow any authenticated user
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
