import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('sb-auth-token')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    // Verify the session using the access token from the cookie
    const { data, error } = await supabaseServer.auth.getUser(sessionCookie);

    if (error || !data.user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const user = data.user;

    // Extract role from user_metadata (default to 'user' if not set)
    const role = (user.user_metadata?.role as string) ?? 'user';

    return NextResponse.json({ user: { ...user, role } }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
