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

    // Fetch emails + created_at from auth.users separately (auth tables can't be joined in RLS queries)
    let userInfoMap: Record<string, { email: string; created_at: string }> = {};
    if (userIds.length > 0) {
      try {
        const { data: adminUsers, error: adminErr } = await supabaseServer.auth.admin.listUsers();

        if (adminErr) {
          console.error('[api/admin/users] auth.admin.listUsers error:', adminErr);
        } else {
          // Filter to only the users we care about
          const relevant = (adminUsers?.users ?? []).filter((u: any) => userIds.includes(u.id));
          for (const u of relevant) {
            userInfoMap[u.id] = {
              email: u.email ?? '',
              created_at:
                typeof u.created_at === 'string' ? u.created_at : new Date().toISOString(),
            };
          }
        }
      } catch (err) {
        console.error('[api/admin/users] auth.admin.listUsers exception:', err);
      }
    }

    // Fetch progress data for each user
    let progressMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: progressData, error: progressErr } = await supabaseServer
        .from('user_progress')
        .select('user_id, intake_completed, sessions_completed')
        .in('user_id', userIds);

      if (!progressErr && progressData) {
        for (const p of progressData as any[]) {
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
