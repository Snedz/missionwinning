/**
 * Push subscribe / unsubscribe — the return channel for athletes without accounts.
 * Auth: optional session | Rate: 10/min/IP | Schema: pushSubscribeBodySchema
 * See: app/api/INDEX.md, docs/RETURN_LOOP_PLAN.md, src/lib/pushClient.ts
 *
 * Why a server route rather than the client's own RLS upsert: an anonymous row has
 * `user_id is null`, so `auth.uid() = user_id` is null and every policy on the table
 * denies it. The alternative — a public RLS policy — would let anyone enumerate or
 * overwrite device rows. One service-role route is the smaller surface.
 *
 * Signed in and signed out take the SAME path. That is deliberate: two paths to the
 * same table is how a device ends up subscribed twice, or opted in once and reachable
 * never.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';
import { clientIp } from '@/lib/clientIp';
import { rateLimitAsync } from '@/lib/rateLimit';
import {
  parseJsonBody,
  pushSubscribeBodySchema,
  pushUnsubscribeBodySchema,
} from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { buildSubscriptionRow } from '@/lib/pushSubscriptionRow';

/** Resolve the signed-in user, if there is one. Absence is normal, not an error. */
async function optionalUserId(request: NextRequest): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  const accessToken = extractSupabaseAccessToken(request.cookies);
  if (!accessToken) return null;

  try {
    const supabase = createClient(url, anon);
    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);
    return user?.id ?? null;
  } catch {
    return null;
  }
}

async function limit(request: NextRequest, bucket: string) {
  const ip = clientIp(request);
  const limited = await rateLimitAsync(`${bucket}:${ip}`, 10, 60_000);
  if (limited.ok) return null;
  return NextResponse.json(
    { ok: false, error: 'Too many requests' },
    { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
  );
}

export const POST = withApiLogging('push/subscribe', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request, 4 * 1024);
  if (oversized) return oversized;

  const limited = await limit(request, 'push-subscribe');
  if (limited) return limited;

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: 'Sync not configured' }, { status: 503 });
  }

  const raw = await request.json().catch(() => ({}));
  const parsed = parseJsonBody(pushSubscribeBodySchema, raw ?? {});
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }
  const body = parsed.data;

  const userId = await optionalUserId(request);

  // onConflict endpoint, not (user_id, device_id): the browser owns the endpoint and
  // re-subscribing the same browser must update in place. Signing in later re-posts
  // the same endpoint with a user_id, which is exactly how the row gets linked.
  const { error } = await admin
    .from('push_subscriptions')
    .upsert(buildSubscriptionRow({ ...body, userId }), { onConflict: 'endpoint' });

  if (error) {
    console.error('push subscribe', error.message);
    return NextResponse.json({ ok: false, error: 'Could not save subscription' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, linked: Boolean(userId) });
});

/**
 * Unsubscribe by endpoint. The endpoint URL is itself the capability — it is long,
 * opaque and issued by the push service to one browser — so possessing it is the
 * authorization to drop it. That is the same trust model web-push itself uses.
 */
export const DELETE = withApiLogging('push/unsubscribe', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request, 2 * 1024);
  if (oversized) return oversized;

  const limited = await limit(request, 'push-unsubscribe');
  if (limited) return limited;

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: 'Sync not configured' }, { status: 503 });
  }

  const raw = await request.json().catch(() => ({}));
  const parsed = parseJsonBody(pushUnsubscribeBodySchema, raw ?? {});
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const { error } = await admin
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', parsed.data.endpoint);

  if (error) {
    console.error('push unsubscribe', error.message);
    return NextResponse.json({ ok: false, error: 'Could not remove subscription' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
});
