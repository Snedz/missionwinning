import { NextRequest, NextResponse } from 'next/server';
import { verifyTeacherPin } from '@/lib/schoolClassServer';
import { normalizeClassCode } from '@/lib/schoolClass';

/** Verify teacher PIN for class dashboard access. */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code: raw } = await context.params;
  const code = normalizeClassCode(raw);
  const pin = request.nextUrl.searchParams.get('pin')?.trim() ?? '';
  if (!code) {
    return NextResponse.json({ ok: false, error: 'Invalid class code' }, { status: 400 });
  }
  if (!pin) {
    return NextResponse.json({ ok: false, error: 'PIN required' }, { status: 400 });
  }

  const ok = await verifyTeacherPin(code, pin);
  return NextResponse.json({ ok });
}
