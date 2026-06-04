import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseServer } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const {
      presentingConcern,
      presentingConcernOther,
      stress,
      emotionalIntensity,
      bodyTension,
      regulationIssue,
      regulationIssueOther,
      sleepQuality,
      goals,
    } = await request.json();

    if (!presentingConcern && !presentingConcernOther) {
      return NextResponse.json({ error: 'Please select a presenting concern' }, { status: 400 });
    }

    // Verify session
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

    // Upsert user_progress record
    await supabaseServer.from('user_progress').upsert(
      {
        user_id: user.id,
        intake_completed: true,
        presenting_concern: presentingConcern,
        presenting_concern_other: presentingConcernOther,
        stress_before: stress,
        emotional_intensity_before: emotionalIntensity,
        body_tension_before: bodyTension,
        regulation_issue: regulationIssue,
        regulation_issue_other: regulationIssueOther,
        sleep_quality: sleepQuality,
        goals,
        intake_date: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
