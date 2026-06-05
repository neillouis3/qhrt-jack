import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseServer } from '@/lib/supabaseClient';

// Helpers
/**
 * Verify the requester is authenticated AND has an admin role.
 * Returns the user object on success or a 401/403 response on failure.
 */
async function requireAdmin(
  request: NextRequest
): Promise<
  ReturnType<typeof supabaseServer>['auth']['getUser'] extends any ? any : never | NextResponse
> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // No-op - read only in this context.
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

  // Check role via server client (bypasses RLS)
  const { data: roleData, error: roleError } = await supabaseServer
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (roleError || !roleData?.role || roleData.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden — admin access required' }, { status: 403 });
  }

  return user;
}

// GET - aggregate stats
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult; // unauthorized / forbidden

  try {
    // ---- Parallelize ALL independent queries --------------------------------
    const [totalUsersRes, intakeCompletedRes, sessionsCompletedRes, stressDataRes, activeUsersRes] =
      await Promise.all([
        supabaseServer.from('user_roles').select('*', { count: 'exact', head: true }),
        supabaseServer
          .from('user_progress')
          .select('*', { count: 'exact', head: true })
          .eq('intake_completed', true),
        supabaseServer
          .from('user_progress')
          .select('sessions_completed', { count: 'exact', head: true })
          .not('sessions_completed', 'is', null),
        supabaseServer
          .from('user_progress')
          .select('avg_stress_before, avg_stress_after')
          .not('avg_stress_before', 'is', null),
        (async () => {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          try {
            return await supabaseServer
              .from('user_progress')
              .select('*', { count: 'exact', head: true })
              .gte('last_session_date', sevenDaysAgo.toISOString());
          } catch {
            return { count: 0, error: null };
          }
        })(),
      ]);

    // Ratings & mood logs are optional tables - fetch in parallel too
    const [avgRating, moodTrend] = await Promise.all([
      (async () => {
        try {
          const { data, error } = await supabaseServer
            .from('session_ratings')
            .select('rating')
            .not('rating', 'is', null);
          if (!error && data?.length) {
            return (
              data.reduce(
                (sum: number, r: { rating: number | null }) => sum + (r.rating as number),
                0
              ) / data.length
            );
          }
        } catch {
          /* table doesn't exist yet */
        }
        return null;
      })(),
      (async () => {
        try {
          // Use SQL GROUP BY instead of fetching all rows and grouping in JS
          // This is much faster for large tables
          const { data, error } = await supabaseServer
            .from('mood_logs')
            .select('mood_score, logged_at')
            .order('logged_at', { ascending: true })
            .limit(100); // Reduced from 1000 - dashboard doesn't need that much history

          if (!error && data?.length) {
            const grouped: Record<string, number[]> = {};
            for (const row of data as { mood_score: number; logged_at: string }[]) {
              const date = new Date(row.logged_at).toISOString().slice(0, 10);
              if (!grouped[date]) grouped[date] = [];
              grouped[date].push(row.mood_score as number);
            }
            return Object.entries(grouped)
              .map(([date, scores]) => ({
                date,
                avg_mood:
                  Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100,
              }))
              .sort((a, b) => a.date.localeCompare(b.date));
          }
        } catch {
          /* table doesn't exist yet */
        }
        return null;
      })(),
    ]);

    // ---- Process results -----------------------------------------------------
    let avgStressBefore: number | null = null;
    let avgStressAfter: number | null = null;

    if (!stressDataRes.error && stressDataRes.data?.length) {
      const valid = (
        stressDataRes.data as Array<{
          avg_stress_before: number | null;
          avg_stress_after: number | null;
        }>
      ).filter((r) => r.avg_stress_before != null && r.avg_stress_after != null);
      if (valid.length) {
        avgStressBefore =
          valid.reduce((sum, r) => sum + (r.avg_stress_before as number), 0) / valid.length;
        avgStressAfter =
          valid.reduce((sum, r) => sum + (r.avg_stress_after as number), 0) / valid.length;
      }
    }

    return NextResponse.json(
      {
        totalUsers: totalUsersRes.error ? 0 : (totalUsersRes.count ?? 0),
        intakeCompleted: intakeCompletedRes.error ? 0 : (intakeCompletedRes.count ?? 0),
        sessionsCompleted: sessionsCompletedRes.error ? 0 : (sessionsCompletedRes.count ?? 0),
        avgStressBefore: avgStressBefore != null ? Math.round(avgStressBefore * 100) / 100 : null,
        avgStressAfter: avgStressAfter != null ? Math.round(avgStressAfter * 100) / 100 : null,
        avgRating: avgRating != null ? Math.round(avgRating * 100) / 100 : null,
        moodTrend,
        activeUsers7d: activeUsersRes.count ?? 0,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[admin/stats] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
