/**
 * Native shell hub ingest (HealthKit / Health Connect / Google Fit).
 * Auth: session | Rate: 20/min | Body: wearableHubIngestSchema
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { parseJsonBody, wearableHubIngestSchema } from '@/lib/apiSchemas';
import { clientIp } from '@/lib/clientIp';
import { rateLimitAsync } from '@/lib/rateLimit';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';
import { insertSamples, markSynced, samplesToActivityHints } from '@/lib/wearables/connections';
import { getWearablesAdmin } from '@/lib/wearables/connections';
import { isWearablesEnabled } from '@/lib/wearables/flags';
import { normalizeHubSamples } from '@/lib/wearables/hubs';

export const POST = withApiLogging('wearables/hub-ingest', async (req: NextRequest) => {
  const limited = await rateLimitAsync(`wearables-hub:${clientIp(req)}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  if (!isWearablesEnabled()) {
    return NextResponse.json({ error: 'Wearables disabled', code: 'disabled' }, { status: 404 });
  }

  const user = await getUserFromRequest(req);
  if (!user?.id) {
    return NextResponse.json({ error: 'Sign in required', code: 'auth_required' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = parseJsonBody(wearableHubIngestSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const samples = normalizeHubSamples(parsed.data.source, parsed.data.samples);
  const { inserted, error } = await insertSamples(user.id, samples);
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  const admin = getWearablesAdmin();
  if (admin) {
    await admin.from('wearable_connections').upsert(
      {
        user_id: user.id,
        provider: parsed.data.source,
        status: 'connected',
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: { via: 'hub_ingest' },
      },
      { onConflict: 'user_id,provider' }
    );
  }
  await markSynced(user.id, parsed.data.source);

  return NextResponse.json({
    ok: true,
    inserted,
    activityHints: samplesToActivityHints(samples),
  });
});
