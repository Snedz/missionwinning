/**
 * Sync samples from a connected OAuth wearable provider.
 * Auth: session | Rate: 8/min | Body: wearableSyncSchema
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { parseJsonBody, wearableSyncSchema } from '@/lib/apiSchemas';
import { clientIp } from '@/lib/clientIp';
import { rateLimitAsync } from '@/lib/rateLimit';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';
import {
  insertSamples,
  listConnections,
  markSynced,
  samplesToActivityHints,
} from '@/lib/wearables/connections';
import { getOAuthCredentials, isWearablesEnabled } from '@/lib/wearables/flags';
import { getOAuthAdapter, isOAuthProviderId } from '@/lib/wearables/oauthProviders';

export const POST = withApiLogging('wearables/sync', async (req: NextRequest) => {
  const limited = await rateLimitAsync(`wearables-sync:${clientIp(req)}`, 8, 60_000);
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
  const parsed = parseJsonBody(wearableSyncSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const provider = parsed.data.provider;
  if (!isOAuthProviderId(provider)) {
    return NextResponse.json({ error: 'Unknown OAuth provider' }, { status: 400 });
  }

  const creds = getOAuthCredentials(provider);
  if (!creds) {
    return NextResponse.json({ error: 'Provider not configured', code: 'not_configured' }, { status: 503 });
  }

  const connections = await listConnections(user.id);
  const conn = connections.find((c) => c.provider === provider && c.status === 'connected');
  if (!conn?.access_token) {
    return NextResponse.json({ error: 'Not connected', code: 'not_connected' }, { status: 400 });
  }

  const adapter = getOAuthAdapter(provider);
  let accessToken = conn.access_token;

  if (
    conn.token_expires_at &&
    Date.parse(conn.token_expires_at) < Date.now() + 60_000 &&
    conn.refresh_token &&
    adapter.refresh
  ) {
    try {
      const refreshed = await adapter.refresh({
        clientId: creds.clientId,
        clientSecret: creds.clientSecret,
        refreshToken: conn.refresh_token,
      });
      accessToken = refreshed.accessToken;
      const { upsertOAuthConnection } = await import('@/lib/wearables/connections');
      await upsertOAuthConnection({ userId: user.id, provider, tokens: refreshed });
    } catch {
      return NextResponse.json({ error: 'Token refresh failed', code: 'refresh_failed' }, { status: 401 });
    }
  }

  const sinceIso =
    parsed.data.sinceIso ||
    conn.last_sync_at ||
    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  let samples;
  try {
    samples = await adapter.syncSince({ accessToken, sinceIso });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Sync failed', code: 'sync_failed' },
      { status: 502 }
    );
  }

  const { inserted, error } = await insertSamples(user.id, samples);
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  await markSynced(user.id, provider);

  return NextResponse.json({
    ok: true,
    inserted,
    activityHints: samplesToActivityHints(samples),
  });
});
