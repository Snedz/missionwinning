/**
 * Waitlist / lead capture — service-role insert only.
 * Auth: gate | Rate: 5/min/IP | Schema: leadsBodySchema
 * See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { leadsBodySchema, parseJsonBody } from '@/lib/apiSchemas';
import {
  leadUnsubscribeUrl,
  sendTransactionalEmail,
  siteUrl,
} from '@/lib/emailServer';

const CONFIRM_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

async function maybeSendLeadConfirmation(email: string, source: string): Promise<void> {
  const admin = getSupabaseAdmin();
  if (!admin) return;

  try {
    const since = new Date(Date.now() - CONFIRM_COOLDOWN_MS).toISOString();
    const { data: recent } = await admin
      .from('leads')
      .select('id, confirmed_at, unsubscribed_at')
      .ilike('email', email)
      .not('confirmed_at', 'is', null)
      .gte('confirmed_at', since)
      .limit(1);

    if (recent && recent.length > 0) return;

    const { data: unsub } = await admin
      .from('leads')
      .select('id')
      .ilike('email', email)
      .not('unsubscribed_at', 'is', null)
      .limit(1);
    if (unsub && unsub.length > 0) return;

    const unsubUrl = leadUnsubscribeUrl(email);
    const result = await sendTransactionalEmail({
      to: email,
      subject: 'You’re on the Mission Winning list',
      text: [
        'Thanks for joining the Mission Winning list.',
        '',
        'You’re in for launch notes and the free offline workout path — free core forever, no account required to log.',
        '',
        `Open the app: ${siteUrl()}/welcome`,
        `Your interest tag: ${source}`,
        '',
        'We will not spam. One launch note when we go public, then only if you stay opted in.',
        '',
        `Unsubscribe: ${unsubUrl}`,
        '',
        '— Mission Winning',
      ].join('\n'),
      tags: [{ name: 'kind', value: 'lead-confirm' }],
    });

    if (result.ok && !result.skipped) {
      await admin
        .from('leads')
        .update({ confirmed_at: new Date().toISOString() })
        .ilike('email', email)
        .is('confirmed_at', null);
    }
  } catch (err) {
    console.error('lead confirmation email failed (non-blocking):', err);
  }
}

/** Coaching / feedback lead capture with IP rate limit (PROTECTION P1). */
export const POST = withApiLogging('leads', async (req: NextRequest) => {
  const ip = clientIp(req);

  const limited = await rateLimitAsync(`leads:${ip}`, 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many submissions. Try again shortly.' },
      {
        status: 429,
        headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) },
      }
    );
  }

  const raw = await req.json().catch(() => null);
  const parsed = parseJsonBody(leadsBodySchema, raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const source = String(
    parsed.data.source || parsed.data.package_interest || 'general'
  ).slice(0, 100);
  const email = parsed.data.email.trim().slice(0, 320);

  const payload: Record<string, unknown> = {
    name: String(parsed.data.name || 'Anonymous').slice(0, 200),
    email,
    goals: String(parsed.data.goals || '').slice(0, 2000),
    current_training: '',
    package_interest: source,
  };

  if (parsed.data.referrer) {
    payload.referrer = String(parsed.data.referrer).slice(0, 500);
  }
  if (parsed.data.utm && Object.keys(parsed.data.utm).length > 0) {
    payload.utm = parsed.data.utm;
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ ok: true, localOnly: true }, { status: 202 });
  }

  const { error } = await admin.from('leads').insert(payload);
  if (error) {
    // Retry without optional growth columns if migration not applied yet.
    if (error.message?.includes('utm') || error.message?.includes('referrer') || error.code === 'PGRST204') {
      const fallback = {
        name: payload.name,
        email: payload.email,
        goals: payload.goals,
        current_training: '',
        package_interest: source,
      };
      const { error: err2 } = await admin.from('leads').insert(fallback);
      if (err2) {
        console.error('leads insert error:', err2);
        return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
      }
    } else {
      console.error('leads insert error:', error);
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
    }
  }

  // Never block the HTTP response on email.
  void maybeSendLeadConfirmation(email, source);

  return NextResponse.json({ ok: true });
});
