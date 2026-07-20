/**
 * Mobile Coach plan — seed/generate for Android (mw-core).
 * Auth: public when not PRIVATE_MODE; else mobile Bearer/cookie/gate
 * Rate: 30/min/IP
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { allowMobileCoachBootstrap } from '@/lib/mobileAccess';
import { buildMobileCoachPlan } from '@/lib/mobileCoachApi';
import { mobileCoachPlanBodySchema, parseJsonBody, parseQuery } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { z } from 'zod';

const getQuerySchema = z.object({
  equipment: z.enum(['bodyweight', 'dumbbells', 'full-gym']).optional(),
  adaptDemo: z.enum(['0', '1', 'true', 'false']).optional(),
});

export const GET = withApiLogging('mobile/coach/plan', async (request: NextRequest) => {
  const ip = clientIp(request);
  const limited = await rateLimitAsync(`mobile-coach-plan:${ip}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  if (!(await allowMobileCoachBootstrap(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const q = parseQuery(getQuerySchema, request.nextUrl.searchParams);
  if (!q.ok) return NextResponse.json({ error: q.error }, { status: 400 });

  const withAdaptDemo = q.data.adaptDemo === '1' || q.data.adaptDemo === 'true';
  const payload = buildMobileCoachPlan({
    equipment: q.data.equipment ?? 'bodyweight',
    withAdaptDemo,
  });
  return NextResponse.json(payload);
});

export const POST = withApiLogging('mobile/coach/plan', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`mobile-coach-plan:${ip}`, 30, 60_000);
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
  const parsed = parseJsonBody(mobileCoachPlanBodySchema, raw ?? {});
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const payload = buildMobileCoachPlan({
    equipment: parsed.data.equipment,
    withAdaptDemo: parsed.data.withAdaptDemo,
    revision: parsed.data.revision,
  });
  return NextResponse.json(payload);
});
