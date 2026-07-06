/**
 * Register PE class in Supabase (teacher, signed in).
 * Auth: session | Schema: schoolClassCreateSchema
 * See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { upsertSchoolClass } from '@/lib/schoolClassServer';
import { normalizeClassCode } from '@/lib/schoolClass';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';
import { parseJsonBody, schoolClassCreateSchema } from '@/lib/apiSchemas';

/** Register a PE class in Supabase — requires sign-in; sets created_by. */
export const POST = withApiLogging('school/class', async(request: NextRequest) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseJsonBody(schoolClassCreateSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const code = normalizeClassCode(parsed.data.code);
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

  const name = (parsed.data.name ?? 'PE Class').trim() || 'PE Class';
  const teacherPin = parsed.data.teacherPin?.trim() || null;
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
});
