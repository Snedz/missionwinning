/**
 * Signed-in PFT result persist. Service-role insert only.
 * Auth: session | Rate: 20/min/IP | Schema: pftResultBodySchema
 * overall_tier is computed server-side. class_code is never taken from the client.
 * See: app/api/INDEX.md, docs/API.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { parseJsonBody, pftResultBodySchema } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { storePftResult } from '@/lib/pftResultServer';

export const POST = withApiLogging('pft/results', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`pft-results:${ip}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(pftResultBodySchema, raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const result = await storePftResult(user.id, {
    id: parsed.data.id,
    completedAt: parsed.data.completedAt,
    age: parsed.data.age,
    sex: parsed.data.sex,
    mode: parsed.data.mode,
    results: parsed.data.events,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: result.status });
  }
  return NextResponse.json({ ok: true, stored: result.stored });
});
