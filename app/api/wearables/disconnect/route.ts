/**
 * Disconnect a wearable provider and optionally delete synced samples.
 * Auth: session | Rate: 10/min | Body: wearableDisconnectSchema
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { parseJsonBody, wearableDisconnectSchema } from '@/lib/apiSchemas';
import { clientIp } from '@/lib/clientIp';
import { rateLimitAsync } from '@/lib/rateLimit';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';
import { disconnectProvider } from '@/lib/wearables/connections';
import { isWearablesEnabled } from '@/lib/wearables/flags';
import type { WearableProviderId } from '@/lib/wearables/types';

export const POST = withApiLogging('wearables/disconnect', async (req: NextRequest) => {
  const limited = await rateLimitAsync(`wearables-disconnect:${clientIp(req)}`, 10, 60_000);
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
  const parsed = parseJsonBody(wearableDisconnectSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const result = await disconnectProvider(
    user.id,
    parsed.data.provider as WearableProviderId,
    parsed.data.deleteSamples
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
});
