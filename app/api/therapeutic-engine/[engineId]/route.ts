// ============================================================================
// GET /api/therapeutic-engine/[engineId]
// Returns full engine session state for a user's therapeutic engine.
// ============================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/ssr';
import { getEngineSessionState } from '@/lib/therapeuticEngine';

export async function GET(request: Request, { params }: { params: Promise<{ engineId: string }> }) {
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

    // Get engine state
    const state = await getEngineSessionState(engineId);
    if (!state) {
      return NextResponse.json({ error: 'Engine not found.' }, { status: 404 });
    }

    // Verify ownership
    if (state.engine.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ state });
  } catch (err) {
    console.error('[API] GET /therapeutic-engine/[engineId] error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
