import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('sb-auth-token')?.value;
    if (sessionCookie) {
      await supabaseServer.auth.signOut({
        scope: 'global',
      });
    }

    const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    response.cookies.delete('sb-auth-token');
    response.cookies.delete('sb-user-role');

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
