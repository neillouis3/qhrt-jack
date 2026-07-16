import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';
import { requireAdmin } from '@/lib/adminAuth';

// ---------------------------------------------------------------------------
// GET — list completion rules (optionally filtered by evidence_dimension_id)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const authCheck = await requireAdmin(request);
  if (authCheck) return authCheck;

  try {
    const { searchParams } = new URL(request.url);
    const evidenceDimensionId = searchParams.get('evidence_dimension_id');

    let query = supabaseServer.from('completion_rules').select('*');

    if (evidenceDimensionId) {
      query = query.eq('evidence_dimension_id', evidenceDimensionId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ completion_rules: data ?? [] }, { status: 200 });
  } catch (err) {
    console.error('[api/admin/completion-rules] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — create a new completion rule
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const authCheck = await requireAdmin(request);
  if (authCheck) return authCheck;

  try {
    const body = await request.json();
    const { evidence_dimension_id, rule_expression } = body as {
      evidence_dimension_id?: string;
      rule_expression?: object;
    };

    if (!evidence_dimension_id || !rule_expression) {
      return NextResponse.json(
        { error: 'evidence_dimension_id and rule_expression are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('completion_rules')
      .insert({
        evidence_dimension_id,
        rule_expression,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, completion_rule: data }, { status: 201 });
  } catch (err) {
    console.error('[api/admin/completion-rules] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH — update a completion rule
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest) {
  const authCheck = await requireAdmin(request);
  if (authCheck) return authCheck;

  try {
    const body = await request.json();
    const { id, ...updates } = body as {
      id?: string;
      rule_expression?: object;
      is_active?: boolean;
    };

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('completion_rules')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, completion_rule: data });
  } catch (err) {
    console.error('[api/admin/completion-rules] PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE — delete a completion rule
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

    const { error } = await supabaseServer.from('completion_rules').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[api/admin/completion-rules] DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
