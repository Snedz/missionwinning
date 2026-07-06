/**
 * Teacher dashboard unlock check — creator or PIN.
 * Auth: session + optional PIN | Rate: 5/min/IP
 * See: app/api/INDEX.md, src/lib/schoolClassAccess.ts
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { canAccessTeacherDashboard } from '@/lib/schoolClassServer';
import { normalizeClassCode } from '@/lib/schoolClass';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { parseJsonBody, schoolPinBodySchema } from '@/lib/apiSchemas';

/** Check teacher dashboard access — creator bypass or valid PIN (POST body). */
export const POST = withApiLogging('school/class/[code]/access', async(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) => {
  const { code: raw } = await context.params;
  const code = normalizeClassCode(raw);
  if (!code) {
    return NextResponse.json({ unlocked: false, error: 'Invalid class code' }, { status: 400 });
  }

  const ip = clientIp(request);
  const rl = await rateLimitAsync(`school-access:${ip}:${code}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { unlocked: false, error: 'Too many attempts' },
      { status: 429, headers: rl.retryAfterSec ? { 'Retry-After': String(rl.retryAfterSec) } : {} }
    );
  }

  let pin = '';
  try {
    const body = await request.json();
    const parsed = parseJsonBody(schoolPinBodySchema.partial(), body);
    if (parsed.ok && parsed.data.pin) {
      pin = parsed.data.pin.trim();
    }
  } catch {
    pin = '';
  }

  const user = await getUserFromRequest(request);
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
});

/** Creator-only quick check without PIN in URL. */
export const GET = withApiLogging('school/class/[code]/access', async(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) => {
  const { code: raw } = await context.params;
  const code = normalizeClassCode(raw);
  if (!code) {
    return NextResponse.json({ unlocked: false, error: 'Invalid class code' }, { status: 400 });
  }

  const user = await getUserFromRequest(request);
  const access = await canAccessTeacherDashboard(code, user?.id ?? null, null);

  return NextResponse.json({
    unlocked: access.unlocked,
    isCreator: access.isCreator,
    pinRequired: !access.unlocked,
  });
});
