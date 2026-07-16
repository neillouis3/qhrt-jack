import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';
import { requireAdmin } from '@/lib/adminAuth';

// ---------------------------------------------------------------------------
// GET — list prompts (optionally filtered by knowledge_model_id)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const authCheck = await requireAdmin(request);
  if (authCheck) return authCheck;

  try {
    const { searchParams } = new URL(request.url);
    const knowledgeModelId = searchParams.get('knowledge_model_id');

    let query = supabaseServer.from('prompts').select('*');

    if (knowledgeModelId) {
      query = query.eq('knowledge_model_id', knowledgeModelId);
    }

    query = query.order('display_order', { ascending: true });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ prompts: data ?? [] }, { status: 200 });
  } catch (err) {
    console.error('[api/admin/prompts] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — create a new prompt
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const authCheck = await requireAdmin(request);
  if (authCheck) return authCheck;

  try {
    const body = await request.json();
    const {
      knowledge_model_id,
      evidence_dimension_id,
      prompt_key,
      prompt_text,
      response_type,
      display_order,
    } = body as {
      knowledge_model_id?: string;
      evidence_dimension_id?: string | null;
      prompt_key?: string;
      prompt_text?: string;
      response_type?: string;
      display_order?: number;
    };

    if (!knowledge_model_id || !prompt_key?.trim() || !prompt_text?.trim()) {
      return NextResponse.json(
        { error: 'knowledge_model_id, prompt_key, and prompt_text are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('prompts')
      .insert({
        knowledge_model_id,
        evidence_dimension_id: evidence_dimension_id ?? null,
        prompt_key: prompt_key.trim(),
        prompt_text: prompt_text.trim(),
        response_type: response_type ?? 'free_text',
        display_order: display_order ?? 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, prompt: data }, { status: 201 });
  } catch (err) {
    console.error('[api/admin/prompts] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH — update a prompt
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest) {
  const authCheck = await requireAdmin(request);
  if (authCheck) return authCheck;

  try {
    const body = await request.json();
    const { id, ...updates } = body as {
      id?: string;
      prompt_text?: string;
      response_type?: string;
      display_order?: number;
      is_active?: boolean;
    };

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('prompts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, prompt: data });
  } catch (err) {
    console.error('[api/admin/prompts] PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE — delete a prompt
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  const authCheck = await requireAdmin(request);
  if (authCheck) return authCheck;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabaseServer.from('prompts').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[api/admin/prompts] DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
