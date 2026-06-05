import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseServer } from '@/lib/supabaseClient';

// Helper funcs
async function requireAdmin(request: NextRequest): Promise<null | NextResponse> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // No-op - read only.
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: roleData, error: roleError } = await supabaseServer
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (roleError || !roleData?.role || roleData.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden — admin access required' }, { status: 403 });
  }

  return null; // no error
}

// GET - list users (paginated)
export async function GET(request: NextRequest) {
  const authCheck = await requireAdmin(request);
  if (authCheck) return authCheck;

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10) || 20, 100);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10) || 0;

    // Fetch user_roles (bypass RLS via server client)
    const { data: roles, error: rolesErr } = (await supabaseServer
      .from('user_roles')
      .select('user_id, role')
      .order('user_id', { ascending: false })
      .range(offset, offset + limit - 1)) as {
      data: Array<{ user_id: string; role: string }> | null;
      error: any;
    };

    if (rolesErr) {
      return NextResponse.json({ error: rolesErr.message }, { status: 500 });
    }

    const userIds = (roles ?? []).map((r) => r.user_id);

    // Fetch user info and progress data in parallel
    let userInfoMap: Record<string, { email: string; created_at: string }> = {};
    let progressMap: Record<string, any> = {};

    if (userIds.length > 0) {
      const [userInfoResults, progressRes] = await Promise.all([
        // Fetch ALL auth users in one call (faster than N parallel getUserById for small limits)
        // then filter to only the IDs we care about
        (async () => {
          try {
            const { data: adminUsers, error: adminErr } = await supabaseServer.auth.admin.listUsers(
              {
                perPage: 100, // fetch up to 100 users in one call
              }
            );
            if (!adminErr && adminUsers?.users) {
              return adminUsers.users
                .filter((u: any) => userIds.includes(u.id))
                .map((u: any) => ({
                  id: u.id,
                  email: u.email ?? '',
                  created_at: u.created_at ?? new Date().toISOString(),
                }));
            }
          } catch (err) {
            console.error('[api/admin/users] auth.admin.listUsers error:', err);
          }
          return [];
        })(),
        // Batch-fetch progress data in a single query
        supabaseServer
          .from('user_progress')
          .select('user_id, intake_completed, sessions_completed')
          .in('user_id', userIds),
      ]);

      for (const u of userInfoResults as { id: string; email: string; created_at: string }[]) {
        userInfoMap[u.id] = { email: u.email, created_at: u.created_at };
      }

      if (!progressRes.error && progressRes.data) {
        for (const p of progressRes.data as any[]) {
          progressMap[p.user_id] = p;
        }
      }
    }

    // Map into flat objects
    const users = (roles ?? []).map((r) => {
      const info = userInfoMap[r.user_id] ?? { email: '', created_at: new Date().toISOString() };
      const progress = progressMap[r.user_id] ?? {};
      return {
        id: r.user_id,
        email: info.email,
        role: r.role,
        intake_completed: progress.intake_completed ?? false,
        sessions_completed: progress.sessions_completed ?? 0,
        created_at: info.created_at,
      };
    });

    return NextResponse.json(users, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
