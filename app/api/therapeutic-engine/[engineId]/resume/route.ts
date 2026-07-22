// ============================================================================
// POST /api/therapeutic-engine/[engineId]/resume
// Resumes a paused therapeutic engine.
// ============================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/ssr';
import { getEngineSessionState, resumeEngine } from '@/lib/therapeuticEngine';

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

    // Resume
    const result = await resumeEngine(engineId);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (err) {
    console.error('[API] POST /therapeutic-engine/[engineId]/resume error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
