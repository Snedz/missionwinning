/**
 * List wearable provider status for the signed-in user.
 * Auth: session | Rate: 30/min | Flag: NEXT_PUBLIC_WEARABLES
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { clientIp } from '@/lib/clientIp';
import { rateLimitAsync } from '@/lib/rateLimit';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';
import { listConnections } from '@/lib/wearables/connections';
import { isWearablesEnabled } from '@/lib/wearables/flags';
import { buildProviderStatusList } from '@/lib/wearables/status';

export const GET = withApiLogging('wearables/status', async (req: NextRequest) => {
  const limited = await rateLimitAsync(`wearables-status:${clientIp(req)}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  if (!isWearablesEnabled()) {
    return NextResponse.json({ enabled: false, providers: [] });
  }

  const user = await getUserFromRequest(req);
  if (!user?.id) {
    return NextResponse.json({ error: 'Sign in required', code: 'auth_required' }, { status: 401 });
  }

  const connections = await listConnections(user.id);
  return NextResponse.json({
    enabled: true,
    providers: buildProviderStatusList(connections),
  });
});
