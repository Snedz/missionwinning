/**
 * Signed-in weekly logger rollup (ISO week).
 * Auth: session. Rate: 20/min/IP. Body: Zod weekLoggedBodySchema.
 * Guests have no business here — 401. No PII beyond auth.uid.
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { parseJsonBody, weekLoggedBodySchema } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';

export const POST = withApiLogging('metrics/week-logged', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`week-logged:${ip}`, 20, 60_000);
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
  const parsed = parseJsonBody(weekLoggedBodySchema, raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ ok: true, stored: false });
  }

  const { error } = await admin.from('week_logged').upsert(
    {
      user_id: user.id,
      iso_week: parsed.data.isoWeek,
    },
    { onConflict: 'user_id,iso_week' }
  );

  if (error) {
    console.error('[metrics/week-logged] %s', error.message);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, stored: true });
});
