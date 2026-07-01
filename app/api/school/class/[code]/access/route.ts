import { NextRequest, NextResponse } from 'next/server';
import { isClassCreator, verifyTeacherPin } from '@/lib/schoolClassServer';
import { normalizeClassCode } from '@/lib/schoolClass';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';

/** Check teacher dashboard access — creator bypass or valid PIN. */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code: raw } = await context.params;
  const code = normalizeClassCode(raw);
  if (!code) {
    return NextResponse.json({ unlocked: false, error: 'Invalid class code' }, { status: 400 });
  }

  const user = await getUserFromRequest(request);
  if (user && (await isClassCreator(code, user.id))) {
    return NextResponse.json({ unlocked: true, isCreator: true });
  }

  const pin = request.nextUrl.searchParams.get('pin')?.trim() ?? '';
  if (!pin) {
    return NextResponse.json({ unlocked: false, isCreator: false, pinRequired: true });
  }

  const ok = await verifyTeacherPin(code, pin);
  return NextResponse.json({ unlocked: ok, isCreator: false, pinRequired: !ok });
}
