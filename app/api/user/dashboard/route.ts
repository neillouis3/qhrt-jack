import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';
import { requireUser } from '@/lib/adminAuth';

/**
 * GET — returns all dashboard data for the authenticated user in one call.
 * Uses supabaseServer (secret key) to bypass RLS.
 */
export async function GET(request: NextRequest) {
  const userResult = await requireUser(request);
  if (userResult instanceof NextResponse) return userResult;
  if (!userResult) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = userResult.user.id;

  try {
    // Fetch all data in parallel
    const [progressRes, conditionsRes] = await Promise.all([
      supabaseServer.from('user_progress').select('*').eq('user_id', userId).maybeSingle(),
      supabaseServer
        .from('user_selected_conditions')
        .select(
          `
          *,
          conditions (
            id,
            name,
            short_description,
            condition_categories (id, name)
          )
        `
        )
        .eq('user_id', userId)
        .eq('is_active', true),
    ]);

    // Fetch assessment results for each selected condition
    const conditions = conditionsRes.data ?? [];
    const assessmentResultsMap: Record<string, any[]> = {};

    if (conditions.length > 0) {
      const resultsPromises = conditions.map(async (cond: any) => {
        const { data } = await supabaseServer
          .from('assessment_results')
          .select(
            `
            *,
            assessment_questions (id, question_text, minimum_value, maximum_value)
          `
          )
          .eq('condition_id', cond.condition_id)
          .order('answered_at', { ascending: false });

        if (data) {
          assessmentResultsMap[cond.condition_id] = data;
        }
      });

      await Promise.all(resultsPromises);
    }

    return NextResponse.json(
      {
        progress: progressRes.data ?? null,
        selectedConditions: conditions,
        assessmentResults: assessmentResultsMap,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[api/user/dashboard] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
