import { NextRequest, NextResponse } from 'next/server';
import { canAccessTeacherDashboard } from '@/lib/schoolClassServer';
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
  const pin = request.nextUrl.searchParams.get('pin')?.trim() ?? '';
  const access = await canAccessTeacherDashboard(code, user?.id ?? null, pin || null);

  if (!access.unlocked) {
    return NextResponse.json({
      unlocked: false,
      isCreator: false,
      pinRequired: true,
    });
  }

  return NextResponse.json({
    unlocked: true,
    isCreator: access.isCreator,
    pinRequired: false,
  });
}
