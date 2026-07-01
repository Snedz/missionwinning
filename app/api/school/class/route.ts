import { NextRequest, NextResponse } from 'next/server';
import { upsertSchoolClass } from '@/lib/schoolClassServer';
import { normalizeClassCode } from '@/lib/schoolClass';

/** Register a PE class code in Supabase (optional — local codes work offline). */
export async function POST(request: NextRequest) {
  let body: { code?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const code = normalizeClassCode(body.code ?? '');
  if (!code) {
    return NextResponse.json({ error: 'Invalid class code' }, { status: 400 });
  }

  const name = (body.name ?? 'PE Class').trim() || 'PE Class';
  const result = await upsertSchoolClass(code, name, null);

  if (!result.ok) {
    if (result.error === 'not_configured') {
      return NextResponse.json({ code, name, registered: false, source: 'local_only' });
    }
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ code, name, registered: true, source: 'cloud' });
}
