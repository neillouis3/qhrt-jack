import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get user role from cookie (set during login)
  const role = request.cookies.get('sb-user-role')?.value;
  const isAuthenticated = !!request.cookies.get('sb-auth-token')?.value;

  // Admin routes: require admin role
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/content')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    if (role !== 'admin') {
      // Non-admin users get redirected to their home page
      return NextResponse.redirect(new URL('/home', request.url));
    }
  }

  // User routes: require authentication (any authenticated user can access)
  if (pathname.startsWith('/home') || pathname.startsWith('/sessions')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    // Authenticated users (both admin and user roles) can access user routes
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/content/:path*', '/home/:path*', '/sessions/:path*'],
};
