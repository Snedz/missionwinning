/**
 * Mobile Coach adapt — mark session done / bump revision.
 * Auth: mobile access (Bearer / cookie / gate)
 * Rate: 30/min/IP
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { hasMobileAppAccess, allowMobileCoachBootstrap } from '@/lib/mobileAccess';
import { applySessionDone, type CoachPlan } from '@/lib/mobileCoachApi';
import { mobileCoachAdaptBodySchema, parseJsonBody } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';

export const POST = withApiLogging('mobile/coach/adapt', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`mobile-coach-adapt:${ip}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  // Allow bootstrap in public mode so offline clients can adapt without sign-in
  if (process.env.PRIVATE_MODE === 'true') {
    if (!(await hasMobileAppAccess(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else if (!(await allowMobileCoachBootstrap(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(mobileCoachAdaptBodySchema, raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const plan = parsed.data.plan as unknown as CoachPlan;
  const payload = applySessionDone(plan, parsed.data.sessionId);
  return NextResponse.json(payload);
});
