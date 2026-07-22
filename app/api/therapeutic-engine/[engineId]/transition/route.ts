// ============================================================================
// POST /api/therapeutic-engine/[engineId]/transition
// Transitions to the next phase (with rule validation).
// ============================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/ssr';
import { getEngineSessionState, transitionToNextPhase } from '@/lib/therapeuticEngine';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ engineId: string }> }
) {
  try {
    const { engineId } = await params;
    const supabase = createClient();

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const state = await getEngineSessionState(engineId);
    if (!state) {
      return NextResponse.json({ error: 'Engine not found.' }, { status: 404 });
    }
    if (state.engine.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check engine is not paused or completed
    if (state.engine.status === 'completed') {
      return NextResponse.json({ error: 'Engine has already been completed.' }, { status: 400 });
    }
    if (state.engine.status === 'paused') {
      return NextResponse.json(
        { error: 'Engine is paused. Resume before transitioning.' },
        { status: 400 }
      );
    }

    // Transition
    const result = await transitionToNextPhase(engineId);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message, state: result.newState });
  } catch (err) {
    console.error('[API] POST /therapeutic-engine/[engineId]/transition error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
