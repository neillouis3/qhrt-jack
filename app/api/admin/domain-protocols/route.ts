// ============================================================================
// GET /api/admin/domain-protocols — list functional domain protocols (admin)
// POST /api/admin/domain-protocols — create a new protocol
// ============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  const authCheck = await requireAdmin(request);
  if (authCheck) return authCheck;

  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    let query = supabaseServer.from('functional_domain_protocols').select('*');
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    query = query.order('name', { ascending: true });

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ functional_domain_protocols: data ?? [] }, { status: 200 });
  } catch (err) {
    console.error('[api/admin/domain-protocols] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAdmin(request);
  if (authCheck) return authCheck;

  try {
    const body = await request.json();
    const { name, description, delivery_content } = body as {
      name?: string;
      description?: string;
      delivery_content?: Record<string, unknown>;
    };

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('functional_domain_protocols')
      .insert({
        name: name.trim(),
        description: description ?? null,
        delivery_content: delivery_content ?? {},
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, protocol: data }, { status: 201 });
  } catch (err) {
    console.error('[api/admin/domain-protocols] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
