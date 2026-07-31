/**
 * Cron: journey nudges + beta invite day-2/7 + checkout recovery.
 * Auth: CRON_SECRET | See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { Resend } from 'resend';
import {
  collectAnonymousNudgeCandidates,
  collectNudgeCandidates,
  markAnonymousNudged,
  markNudged,
} from '@/lib/nudgeServer';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { isPushConfigured, sendAnonymousPush, sendNudgePush } from '@/lib/pushServer';
import {
  day2Body,
  day7Body,
  selectInviteFollowupCandidates,
  type InviteFollowupRow,
} from '@/lib/inviteFollowups';
import {
  recoveryEmailBody,
  selectCheckoutRecoveryCandidates,
  type CheckoutRecoveryRow,
} from '@/lib/checkoutRecovery';
import {
  leadUnsubscribeUrl,
  sendTransactionalEmail,
  siteUrl,
} from '@/lib/emailServer';
import type { JourneyState } from '@/lib/missionJourney';

/*
 * `.211` — Vercel's default is 10s (Hobby) / 15s (Pro), and this route sends
 * emails serially. At ~300ms per Resend call, 50 candidates blows the limit; the
 * function is killed, `markNudged` never runs, and the next daily run re-sends to
 * everyone already emailed. Each timeout widens the duplicate window.
 */
export const maxDuration = 300;

export const dynamic = 'force-dynamic';

async function loadUnsubscribedEmails(
  admin: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  emails: string[]
): Promise<Set<string>> {
  const unsub = new Set<string>();
  if (!emails.length) return unsub;
  try {
    const { data } = await admin
      .from('leads')
      .select('email, unsubscribed_at')
      .in('email', emails)
      .not('unsubscribed_at', 'is', null)
      .limit(500);
    for (const row of data ?? []) {
      if (row.email) unsub.add(String(row.email).toLowerCase());
    }
  } catch {
    /* leads.unsubscribed_at may be missing — non-fatal */
  }
  return unsub;
}

async function collectInviteCandidates(): Promise<{
  candidates: ReturnType<typeof selectInviteFollowupCandidates>;
  considered: number;
}> {
  const admin = getSupabaseAdmin();
  if (!admin) return { candidates: [], considered: 0 };

  const { data: invites, error } = await admin
    .from('beta_invites')
    .select(
      'id, label, email, created_at, signed_up_user_id, day2_sent_at, day7_sent_at'
    )
    .not('email', 'is', null)
    .limit(500);

  if (error || !invites) return { candidates: [], considered: 0 };

  const userIds = invites
    .map((r) => r.signed_up_user_id as string | null)
    .filter((id): id is string => Boolean(id));

  const workoutByUser = new Map<string, boolean>();
  if (userIds.length) {
    const { data: profiles } = await admin
      .from('profiles')
      .select('id, journey_state')
      .in('id', userIds);
    for (const p of profiles ?? []) {
      const js = p.journey_state as JourneyState | null;
      workoutByUser.set(p.id as string, Boolean(js?.basic?.workout));
    }
  }

  const rows: InviteFollowupRow[] = invites.map((r) => ({
    id: r.id as string,
    label: (r.label as string) || '',
    email: (r.email as string | null) ?? null,
    created_at: r.created_at as string,
    signed_up_user_id: (r.signed_up_user_id as string | null) ?? null,
    day2_sent_at: (r.day2_sent_at as string | null) ?? null,
    day7_sent_at: (r.day7_sent_at as string | null) ?? null,
    firstWorkout: r.signed_up_user_id
      ? workoutByUser.get(r.signed_up_user_id as string) ?? false
      : false,
  }));

  let candidates = selectInviteFollowupCandidates(rows);
  const emails = candidates.map((c) => c.email);
  const unsub = await loadUnsubscribedEmails(admin, emails);
  candidates = candidates.filter((c) => !unsub.has(c.email));

  return { candidates, considered: rows.length };
}

async function collectRecoveryCandidates(): Promise<{
  candidates: ReturnType<typeof selectCheckoutRecoveryCandidates>;
  considered: number;
}> {
  const admin = getSupabaseAdmin();
  if (!admin) return { candidates: [], considered: 0 };

  const cutoff = new Date(Date.now() - 3600_000).toISOString();
  const { data, error } = await admin
    .from('checkout_recovery')
    .select('id, session_id, email, plan, expired_at, recovery_sent_at')
    .is('recovery_sent_at', null)
    .lte('expired_at', cutoff)
    .limit(100);

  if (error || !data) return { candidates: [], considered: 0 };

  const rows = data as CheckoutRecoveryRow[];
  const emails = rows.map((r) => r.email.toLowerCase());
  const unsub = await loadUnsubscribedEmails(admin, emails);
  const candidates = selectCheckoutRecoveryCandidates(rows, Date.now(), unsub);
  return { candidates, considered: rows.length };
}

/**
 * Daily retention + invite follow-ups + checkout recovery (Vercel cron).
 * Auth: `Authorization: Bearer ${CRON_SECRET}`
 * `?dryRun=1` lists candidates without sending.
 */
export const GET = withApiLogging('cron/nudges', async (request: NextRequest) => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ ok: false, error: 'CRON_SECRET not configured' }, { status: 503 });
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1';

  let result;
  try {
    result = await collectNudgeCandidates();
  } catch (e) {
    console.error('nudge cron', e);
    return NextResponse.json({ ok: false, error: 'candidate collection failed' }, { status: 500 });
  }

  const inviteResult = await collectInviteCandidates();
  const recoveryResult = await collectRecoveryCandidates();

  const pushReady = isPushConfigured();

  // Anonymous devices are collected even when push is unconfigured so `dryRun`
  // reports the real cohort size rather than silently zero.
  let anonResult: Awaited<ReturnType<typeof collectAnonymousNudgeCandidates>> = {
    considered: 0,
    candidates: [],
  };
  try {
    anonResult = await collectAnonymousNudgeCandidates();
  } catch (e) {
    console.error('anonymous nudge collection', e);
  }
  let pushSubscribed = 0;
  if (pushReady) {
    try {
      const admin = getSupabaseAdmin();
      const userIds = [...new Set(result.candidates.map((c) => c.userId))];
      if (userIds.length && admin) {
        const { count } = await admin
          .from('push_subscriptions')
          .select('id', { count: 'exact', head: true })
          .in('user_id', userIds);
        pushSubscribed = count ?? 0;
      }
    } catch {
      pushSubscribed = 0;
    }
  }

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      considered: result.considered,
      candidates: result.candidates.map((c) => ({ kind: c.kind, subject: c.subject })),
      inviteFollowups: {
        considered: inviteResult.considered,
        candidates: inviteResult.candidates.map((c) => ({
          kind: c.kind,
          email: c.email.slice(0, 3) + '…',
          label: c.label,
        })),
      },
      checkoutRecovery: {
        considered: recoveryResult.considered,
        candidates: recoveryResult.candidates.map((c) => ({
          email: c.email.slice(0, 3) + '…',
          plan: c.plan,
        })),
      },
      pushConfigured: pushReady,
      pushSubscribed,
      anonymous: {
        considered: anonResult.considered,
        candidates: anonResult.candidates.map((c) => ({
          kind: c.kind,
          device: c.deviceId.slice(0, 8) + '…',
        })),
      },
    });
  }

  // Anonymous push runs BEFORE the Resend check. It needs no email provider, and
  // returning 503 first would mean the athletes with no account — the ones with no
  // other channel at all — are the only ones silenced by a missing email key.
  const admin = getSupabaseAdmin();
  let anonPushed = 0;
  if (pushReady && admin && anonResult.candidates.length) {
    const delivered: string[] = [];
    for (const c of anonResult.candidates) {
      const r = await sendAnonymousPush(admin, c.endpoint, {
        title: c.title,
        body: c.body,
        url: '/log?src=push',
      });
      if (r === 'sent') {
        delivered.push(c.endpoint);
        anonPushed += 1;
      }
    }
    await markAnonymousNudged(delivered);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: 'Email not configured', anonPushed },
      { status: 503 }
    );
  }
  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM || 'Mission Winning <onboarding@resend.dev>';
  const site = siteUrl();

  const sent: string[] = [];
  const failed: string[] = [];
  let pushed = 0;
  const pushAdmin = pushReady ? admin : null;

  for (const c of result.candidates) {
    const { error } = await resend.emails.send({
      from,
      to: c.email,
      subject: c.subject,
      text: c.body,
    });
    if (error) {
      console.error('nudge send failed', c.kind, error.message);
      failed.push(c.userId);
    } else {
      sent.push(c.userId);
      if (pushAdmin) {
        const firstLine = c.body.split('\n').find((l) => l.trim()) || c.subject;
        const pr = await sendNudgePush(pushAdmin, c.userId, {
          title: c.subject,
          body: firstLine.slice(0, 140),
          url: '/log?src=push',
        });
        if (pr === 'sent') pushed += 1;
      }
    }
  }
  await markNudged(sent);

  let inviteSent = 0;
  let inviteFailed = 0;
  for (const c of inviteResult.candidates) {
    const content = c.kind === 'day2' ? day2Body(c.label, site) : day7Body(c.label, site);
    const unsub = leadUnsubscribeUrl(c.email);
    const text = `${content.text}\n\nUnsubscribe: ${unsub}`;
    const r = await sendTransactionalEmail({
      to: c.email,
      subject: content.subject,
      text,
      tags: [{ name: 'kind', value: `invite_${c.kind}` }],
    });
    if (!r.ok && !r.skipped) {
      inviteFailed += 1;
      continue;
    }
    if (r.skipped) {
      // Still mark so we don't hammer when Resend is off? Prefer not mark on skip.
      continue;
    }
    if (admin) {
      const col = c.kind === 'day2' ? 'day2_sent_at' : 'day7_sent_at';
      await admin
        .from('beta_invites')
        .update({ [col]: new Date().toISOString() })
        .eq('id', c.id)
        .is(col, null);
    }
    inviteSent += 1;
  }

  let recoverySent = 0;
  let recoveryFailed = 0;
  for (const c of recoveryResult.candidates) {
    const content = recoveryEmailBody(site, c.plan);
    const unsub = leadUnsubscribeUrl(c.email);
    const text = `${content.text}\n\nUnsubscribe: ${unsub}`;
    const r = await sendTransactionalEmail({
      to: c.email,
      subject: content.subject,
      text,
      tags: [{ name: 'kind', value: 'checkout_recovery' }],
    });
    if (!r.ok && !r.skipped) {
      recoveryFailed += 1;
      continue;
    }
    if (r.skipped) continue;
    if (admin) {
      await admin
        .from('checkout_recovery')
        .update({ recovery_sent_at: new Date().toISOString() })
        .eq('id', c.id)
        .is('recovery_sent_at', null);
    }
    recoverySent += 1;
  }

  return NextResponse.json({
    ok: true,
    considered: result.considered,
    sent: sent.length,
    failed: failed.length,
    pushed,
    inviteSent,
    inviteFailed,
    recoverySent,
    recoveryFailed,
    anonConsidered: anonResult.considered,
    anonPushed,
  });
});
