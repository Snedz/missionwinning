import { NextRequest, NextResponse } from 'next/server';
import { upsertSchoolClass } from '@/lib/schoolClassServer';
import { normalizeClassCode } from '@/lib/schoolClass';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';

/** Register a PE class in Supabase — requires sign-in; sets created_by. */
export async function POST(request: NextRequest) {
  let body: { code?: string; name?: string; teacherPin?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const code = normalizeClassCode(body.code ?? '');
  if (!code) {
    return NextResponse.json({ error: 'Invalid class code' }, { status: 400 });
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      {
        code,
        registered: false,
        source: 'local_only',
        reason: 'sign_in_required',
        message: 'Sign in to sync this class across devices.',
      },
      { status: 401 }
    );
  }

  const name = (body.name ?? 'PE Class').trim() || 'PE Class';
  const teacherPin = body.teacherPin?.trim() || null;
  const result = await upsertSchoolClass(code, name, user.id, teacherPin);

  if (!result.ok) {
    if (result.error === 'not_configured') {
      return NextResponse.json({ code, name, teacherPin, registered: false, source: 'local_only' });
    }
    return NextResponse.json({ error: result.error }, { status: result.status ?? 500 });
  }

  return NextResponse.json({
    code,
    name,
    teacherPin,
    registered: true,
    source: 'cloud',
    createdBy: user.id,
  });
}
