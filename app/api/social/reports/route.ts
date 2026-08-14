/**
 * Report another athlete's Garage message.
 * Auth: session. Rate: 10/min. Cannot report a message you own (enforced in insert + check).
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { getUserFromRequest, getUserScopedClient } from '@/lib/supabaseRequestAuth';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { parseJsonBody, socialReportBodySchema } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { isMissingRelation } from '@/lib/social/cloud';

export const POST = withApiLogging('social/reports', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`social-reports:${ip}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(socialReportBodySchema, raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const scoped = getUserScopedClient(request);
  if (!scoped) return NextResponse.json({ ok: true, stored: false });

  const { data: owned, error: lookupError } = await scoped
    .from('social_messages')
    .select('user_id')
    .eq('id', parsed.data.messageId)
    .maybeSingle();

  if (lookupError) {
    if (isMissingRelation(lookupError)) {
      return NextResponse.json({ ok: true, stored: false });
    }
    console.error('[social/reports] lookup %s', lookupError.code ?? 'unknown');
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }

  if (owned && (owned as { user_id?: string }).user_id === user.id) {
    return NextResponse.json({ error: 'cannot_report_own' }, { status: 400 });
  }

  const { error } = await scoped.from('social_message_reports').insert({
    user_id: user.id,
    message_id: parsed.data.messageId,
    reason: parsed.data.reason ?? 'other',
  });

  if (error) {
    if (isMissingRelation(error)) return NextResponse.json({ ok: true, stored: false });
    if (error.code === '23505') return NextResponse.json({ ok: true, stored: true });
    console.error('[social/reports] insert %s', error.code ?? 'unknown');
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, stored: true });
});
