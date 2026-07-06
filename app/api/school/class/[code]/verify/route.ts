/**
 * Verify teacher PIN for class.
 * Auth: gate | Rate: 5/min/IP | Schema: schoolPinBodySchema
 * See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { verifyTeacherPin } from '@/lib/schoolClassServer';
import { normalizeClassCode } from '@/lib/schoolClass';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { parseJsonBody, schoolPinBodySchema } from '@/lib/apiSchemas';

async function handleVerify(
  request: NextRequest,
  rawCode: string,
  pin: string
): Promise<NextResponse> {
  const code = normalizeClassCode(rawCode);
  if (!code) {
    return NextResponse.json({ ok: false, error: 'Invalid class code' }, { status: 400 });
  }
  if (!pin) {
    return NextResponse.json({ ok: false, error: 'PIN required' }, { status: 400 });
  }

  const ip = clientIp(request);
  const rl = await rateLimitAsync(`school-pin:${ip}:${code}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many attempts' },
      { status: 429, headers: rl.retryAfterSec ? { 'Retry-After': String(rl.retryAfterSec) } : {} }
    );
  }

  const ok = await verifyTeacherPin(code, pin);
  return NextResponse.json({ ok });
}

/** Verify teacher PIN for class dashboard access. */
export const POST = withApiLogging('school/class/[code]/verify', async(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) => {
  const { code: raw } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 });
  }
  const parsed = parseJsonBody(schoolPinBodySchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }
  return handleVerify(request, raw, parsed.data.pin.trim());
});

/** @deprecated Use POST with JSON body — PIN in query strings may leak via logs. */
export const GET = withApiLogging('school/class/[code]/verify', async(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) => {
  const { code: raw } = await context.params;
  const pin = request.nextUrl.searchParams.get('pin')?.trim() ?? '';
  return handleVerify(request, raw, pin);
});
