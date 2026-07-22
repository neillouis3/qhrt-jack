// ============================================================================
// POST /api/therapeutic-engine/[engineId]/complete-phase
// Completes the current phase with optional observations.
// ============================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/ssr';
import { getEngineSessionState, completeCurrentPhase } from '@/lib/therapeuticEngine';
import type { CompletePhaseRequest } from '@/lib/types/therapeutic-engine';

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

    // Parse request body
    const body = await request.json();
    const requestData: CompletePhaseRequest = {
      phase_order: state.engine.current_phase_order,
      observations: body.observations || undefined,
    };

    // Complete phase
    const result = await completeCurrentPhase(engineId, requestData);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (err) {
    console.error('[API] POST /therapeutic-engine/[engineId]/complete-phase error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
