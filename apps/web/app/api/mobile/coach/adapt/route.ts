/**
 * Mobile Coach adapt — mark session done / bump revision.
 * Auth: mobile access (Bearer / cookie / gate)
 * Rate: 30/min/IP
 */
import { NextRequest, NextResponse } from 'next/server';
import { clientIp, rejectOversizedBody, withApiLogging } from '../../../../../lib/mobile/http';
import { rateLimitAsync } from '../../../../../lib/mobile/rateLimit';
import { allowMobileCoachBootstrap } from '../../../../../lib/mobile/auth';
import { applySessionDone, type CoachPlan } from '../../../../../lib/mobile/coach';
import { mobileCoachAdaptBodySchema, parseJsonBody } from '../../../../../lib/mobile/schemas';

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

  if (!(await allowMobileCoachBootstrap(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(mobileCoachAdaptBodySchema, raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const plan = parsed.data.plan as unknown as CoachPlan;
  const payload = applySessionDone(plan, parsed.data.sessionId);
  return NextResponse.json(payload);
});
