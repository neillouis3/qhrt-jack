import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseServer } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Create a response object to hold cookies and headers
    let response = NextResponse.json({});

    // Create a server client with getAll/setAll cookie handlers
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll().map((cookie) => ({
              name: cookie.name,
              value: cookie.value,
            }));
          },
          setAll(cookies) {
            cookies.forEach((cookie) => {
              response.cookies.set({ name: cookie.name, value: cookie.value, ...cookie.options });
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Fetch role from public.user_roles table using the user's UUID
    const userId = data.user?.id;
    let role = 'user'; // default fallback

    if (userId) {
      const { data: roleData, error: roleError } = await supabaseServer
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleError) {
        // If no role record exists, default to 'user'
        role = 'user';
      } else if (roleData && roleData.role) {
        role = roleData.role;
      }
    }

    // Session cookies are written to `response` via setAll above
    return NextResponse.json({ user: data.user, role }, { status: 200, headers: response.headers });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
