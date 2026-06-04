import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Verify session using SSR client with cookie handlers
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // No-op in GET - read only.
          },
        },
      }
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Fetch role from public.user_roles table (default to 'user' if not found, bypass RLS)
    let role = 'user';
    const { data: roleData, error: roleError } = await supabaseServer
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleError && roleData?.role) {
      role = roleData.role;
    }

    // Fetch intake status (bypass RLS with server client)
    let intakeCompleted = false;
    const { data: progressData, error: progressError } = await supabaseServer
      .from('user_progress')
      .select('intake_completed')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!progressError && progressData?.intake_completed) {
      intakeCompleted = true;
    }

    return NextResponse.json({ user: { ...user }, role, intakeCompleted }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
