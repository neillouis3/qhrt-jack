import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseServer } from '@/lib/supabaseClient';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

/**
 * Build a Supabase query chain for user_roles, applying optional filters.
 */
function buildRolesQuery(
  q: ReturnType<typeof supabaseServer.from>,
  filters: { search?: string; role?: string; intake?: string }
) {
  if (filters.role && filters.role !== 'all') {
    q = q.eq('role', filters.role);
  }
  return q;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserEntry {
  id: string;
  email: string;
  role: string;
  intake_completed: boolean;
  sessions_completed: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// GET — list users with pagination, search, filter & sort
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const authCheck = await requireAdmin(request);
  if (authCheck) return authCheck;

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10', 10) || 10, 100);
    const page = parseInt(searchParams.get('page') ?? '1', 10) || 1;
    const offset = (page - 1) * limit;
    const search = searchParams.get('search') ?? '';
    const roleFilter = searchParams.get('role') ?? 'all';
    const intakeFilter = searchParams.get('intake') ?? 'all';
    const sortBy = searchParams.get('sortBy') ?? 'created_at';
    const sortOrder = searchParams.get('sortOrder') ?? 'desc';

    // 1. Fetch ALL user_roles (we filter in JS for search — auth users aren't in the same table)
    const { data: allRoles, error: rolesErr } = await supabaseServer
      .from('user_roles')
      .select('user_id, role');

    if (rolesErr) {
      return NextResponse.json({ error: rolesErr.message }, { status: 500 });
    }

    // 2. Fetch ALL auth users (admin API — needed for email search)
    const { data: adminUsersData } = await supabaseServer.auth.admin.listUsers({
      perPage: 1000,
    });
    const allAuthUsers = adminUsersData?.users ?? [];

    // Build a lookup map for auth info
    const authMap: Record<string, { email: string; created_at: string }> = {};
    for (const u of allAuthUsers as any[]) {
      authMap[u.id] = {
        email: u.email ?? '',
        created_at: u.created_at ?? new Date().toISOString(),
      };
    }

    // 3. Fetch ALL progress data
    const { data: allProgress } = await supabaseServer
      .from('user_progress')
      .select('user_id, intake_completed, sessions_completed');

    const progressMap: Record<string, { intake_completed?: boolean; sessions_completed?: number }> =
      {};
    if (allProgress) {
      for (const p of allProgress as Array<{
        user_id: string;
        intake_completed?: boolean;
        sessions_completed?: number;
      }>) {
        progressMap[p.user_id] = p;
      }
    }

    // 4. Merge into flat user objects
    let users: UserEntry[] = ((allRoles as Array<{ user_id: string; role: string }>) ?? []).map(
      (r) => {
        const info = authMap[r.user_id] ?? { email: '', created_at: new Date().toISOString() };
        const progress = progressMap[r.user_id] ?? {};
        return {
          id: r.user_id,
          email: info.email,
          role: r.role,
          intake_completed: progress.intake_completed ?? false,
          sessions_completed: progress.sessions_completed ?? 0,
          created_at: info.created_at,
        };
      }
    );

    // 5. Apply filters (role, intake)
    if (roleFilter !== 'all') {
      users = users.filter((u) => u.role === roleFilter);
    }
    if (intakeFilter === 'completed') {
      users = users.filter((u) => u.intake_completed);
    } else if (intakeFilter === 'pending') {
      users = users.filter((u) => !u.intake_completed);
    }

    // 6. Apply search (email substring match, case-insensitive)
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      users = users.filter((u) => u.email.toLowerCase().includes(term));
    }

    // 7. Sort
    users.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'email') {
        cmp = a.email.localeCompare(b.email);
      } else if (sortBy === 'role') {
        cmp = a.role.localeCompare(b.role);
      } else if (sortBy === 'intake_completed') {
        cmp = Number(a.intake_completed) - Number(b.intake_completed);
      } else if (sortBy === 'sessions_completed') {
        cmp = a.sessions_completed - b.sessions_completed;
      } else {
        // default: created_at
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    // 8. Paginate
    const totalUsers = users.length;
    const totalPages = Math.ceil(totalUsers / limit);
    const paginated = users.slice(offset, offset + limit);

    return NextResponse.json(
      { users: paginated, pagination: { page, limit, totalUsers, totalPages } },
      { status: 200 }
    );
  } catch (err) {
    console.error('[api/admin/users] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH — update a user's role  ({ userId, role })
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest) {
  const authCheck = await requireAdmin(request);
  if (authCheck) return authCheck;

  try {
    const body = await request.json();
    const { userId, role } = body as { userId: string; role: string };

    if (!userId || !role) {
      return NextResponse.json({ error: 'userId and role are required' }, { status: 400 });
    }

    if (!['admin', 'user'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "admin" or "user".' },
        { status: 400 }
      );
    }

    const { error: updateErr } = await supabaseServer
      .from('user_roles')
      .update({ role })
      .eq('user_id', userId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: `Role updated to "${role}"` },
      { status: 200 }
    );
  } catch (err) {
    console.error('[api/admin/users] PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE — delete a user from Supabase Auth + clean up related rows
//   body: { userId }
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  const authCheck = await requireAdmin(request);
  if (authCheck) return authCheck;

  try {
    const body = await request.json();
    const { userId } = body as { userId: string };

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Delete from auth (cascades via trigger ideally, but we clean up manually too)
    const { error: authErr } = await supabaseServer.auth.admin.deleteUser(userId);
    if (authErr) {
      return NextResponse.json({ error: authErr.message }, { status: 500 });
    }

    // Clean up related rows
    await Promise.all([
      supabaseServer.from('user_roles').delete().eq('user_id', userId),
      supabaseServer.from('user_progress').delete().eq('user_id', userId),
    ]);

    return NextResponse.json({ success: true, message: 'User deleted' }, { status: 200 });
  } catch (err) {
    console.error('[api/admin/users] DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — send password-reset email  ({ userId })
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const authCheck = await requireAdmin(request);
  if (authCheck) return authCheck;

  try {
    const body = await request.json();
    const { userId } = body as { userId: string };

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Look up the user's email first
    const { data: userData, error: userErr } = await supabaseServer.auth.admin.getUserById(userId);

    if (userErr || !userData?.user?.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Send password-reset email
    const { error: resetErr } = await supabaseServer.auth.admin.generateLink({
      type: 'password_reset',
      email: userData.user.email,
    });

    if (resetErr) {
      return NextResponse.json({ error: resetErr.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: `Password reset email sent to ${userData.user.email}` },
      { status: 200 }
    );
  } catch (err) {
    console.error('[api/admin/users] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
