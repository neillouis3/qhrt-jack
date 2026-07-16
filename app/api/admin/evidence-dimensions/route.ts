import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';
import { requireAdmin } from '@/lib/adminAuth';

// ---------------------------------------------------------------------------
// GET — list evidence dimensions (optionally filtered by knowledge_model_id)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const authCheck = await requireAdmin(request);
  if (authCheck) return authCheck;

  try {
    const { searchParams } = new URL(request.url);
    const knowledgeModelId = searchParams.get('knowledge_model_id');

    let query = supabaseServer.from('evidence_dimensions').select('*');

    if (knowledgeModelId) {
      query = query.eq('knowledge_model_id', knowledgeModelId);
    }

    query = query.order('priority', { ascending: true });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ evidence_dimensions: data ?? [] }, { status: 200 });
  } catch (err) {
    console.error('[api/admin/evidence-dimensions] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — create a new evidence dimension
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const authCheck = await requireAdmin(request);
  if (authCheck) return authCheck;

  try {
    const body = await request.json();
    const { knowledge_model_id, name, description, priority, is_required } = body as {
      knowledge_model_id?: string;
      name?: string;
      description?: string;
      priority?: number;
      is_required?: boolean;
    };

    if (!knowledge_model_id || !name?.trim()) {
      return NextResponse.json(
        { error: 'knowledge_model_id and name are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('evidence_dimensions')
      .insert({
        knowledge_model_id,
        name: name.trim(),
        description: description ?? null,
        priority: priority ?? 0,
        is_required: is_required ?? true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, evidence_dimension: data }, { status: 201 });
  } catch (err) {
    console.error('[api/admin/evidence-dimensions] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH — update an evidence dimension
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest) {
  const authCheck = await requireAdmin(request);
  if (authCheck) return authCheck;

  try {
    const body = await request.json();
    const { id, ...updates } = body as {
      id?: string;
      name?: string;
      description?: string;
      priority?: number;
      is_required?: boolean;
      is_active?: boolean;
    };

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('evidence_dimensions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, evidence_dimension: data });
  } catch (err) {
    console.error('[api/admin/evidence-dimensions] PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE — delete an evidence dimension
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

    const { error } = await supabaseServer.from('evidence_dimensions').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[api/admin/evidence-dimensions] DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
