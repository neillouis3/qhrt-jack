// ============================================================================
// GET /api/therapeutic-engine/domains
// Returns active functional domain protocols for the current authenticated user.
// ============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireUser } from '@/lib/adminAuth';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  const userResult = await requireUser(request);
  if (userResult instanceof NextResponse) return userResult;
  if (!userResult) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { data, error } = await supabaseServer
      .from('functional_domain_protocols')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ functional_domain_protocols: data ?? [] }, { status: 200 });
  } catch (err) {
    console.error('[api/therapeutic-engine/domains] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
