// ============================================================================
// POST /api/therapeutic-engine/[engineId]/complete-phase
// Completes the current phase with optional observations.
// ============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireUser } from '@/lib/adminAuth';
import { getEngineSessionState, completeCurrentPhase } from '@/lib/therapeuticEngine';
import type { CompletePhaseRequest } from '@/lib/types/therapeutic-engine';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ engineId: string }> }
) {
  const userResult = await requireUser(request);
  if (userResult instanceof NextResponse) return userResult;
  if (!userResult) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { engineId } = await params;

    // Verify ownership
    const state = await getEngineSessionState(engineId);
    if (!state) {
      return NextResponse.json({ error: 'Engine not found.' }, { status: 404 });
    }
    if (state.engine.user_id !== userResult.user.id) {
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
