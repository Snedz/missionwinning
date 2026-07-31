/**
 * Privacy-first Android weekly heartbeat.
 * Body: { installId (uuid), weekKey (YYYY-Www), appVersion? }
 * No email, no workout data. Service-role upsert only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { z } from 'zod';
import { parseJsonBody } from '@/lib/apiSchemas';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const bodySchema = z.object({
  installId: z.string().uuid(),
  weekKey: z.string().regex(/^\d{4}-W\d{2}$/).max(12),
  appVersion: z.string().max(40).optional(),
});

export const POST = withApiLogging('mobile/telemetry', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`mobile-telemetry:${ip}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } },
    );
  }

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(bodySchema, raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { installId, weekKey, appVersion } = parsed.data;
  const admin = getSupabaseAdmin();
  if (!admin) {
    // Accept silently so clients do not retry-storm when admin is unset in dev
    return NextResponse.json({ ok: true, stored: false });
  }

  const { error } = await admin.from('android_telemetry_heartbeats').upsert(
    {
      install_id: installId,
      week_key: weekKey,
      app_version: appVersion ?? null,
    },
    { onConflict: 'install_id,week_key' },
  );

  if (error) {
    // `.211` — opaque to the client, detailed in the server log.
    console.error('[mobile/telemetry] %s', error.message);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, stored: true });
});
