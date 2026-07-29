import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  buildPushNotificationJson,
  isStalePushStatus,
  type PushPayload,
} from '@/lib/pushPayload';

export type { PushPayload };
export type PushSendResult = 'sent' | 'no_subscription' | 'failed';

export function isPushConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() &&
      process.env.VAPID_PRIVATE_KEY?.trim() &&
      process.env.VAPID_SUBJECT?.trim()
  );
}

/**
 * Send to one anonymous device by endpoint.
 *
 * Anonymous rows have `user_id is null`, so the by-user query below can never reach
 * them — which was the whole reason a lapsed athlete without an account had no
 * return channel at all. See docs/RETURN_LOOP_PLAN.md.
 */
export async function sendAnonymousPush(
  admin: SupabaseClient,
  endpoint: string,
  payload: PushPayload
): Promise<PushSendResult> {
  if (!isPushConfigured()) return 'no_subscription';

  const { data: rows, error } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('endpoint', endpoint)
    .limit(1);

  if (error || !rows?.length) return 'no_subscription';
  return deliver(admin, rows, payload);
}

export async function sendNudgePush(
  admin: SupabaseClient,
  userId: string,
  payload: PushPayload
): Promise<PushSendResult> {
  if (!isPushConfigured()) return 'no_subscription';

  const { data: rows, error } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId);

  if (error || !rows?.length) return 'no_subscription';
  return deliver(admin, rows, payload);
}

type SubscriptionRow = { id: string; endpoint: string; p256dh: string; auth: string };

async function deliver(
  admin: SupabaseClient,
  rows: SubscriptionRow[],
  payload: PushPayload
): Promise<PushSendResult> {
  let webpush: typeof import('web-push');
  try {
    webpush = await import('web-push');
  } catch {
    return 'failed';
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const body = buildPushNotificationJson(payload);
  let anySent = false;

  for (const row of rows) {
    try {
      await webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: { p256dh: row.p256dh, auth: row.auth },
        },
        body
      );
      anySent = true;
      await admin
        .from('push_subscriptions')
        .update({ last_push_at: new Date().toISOString() })
        .eq('id', row.id);
    } catch (err) {
      const statusCode =
        err && typeof err === 'object' && 'statusCode' in err
          ? Number((err as { statusCode?: number }).statusCode)
          : undefined;
      if (isStalePushStatus(statusCode)) {
        await admin.from('push_subscriptions').delete().eq('id', row.id);
      }
    }
  }

  return anySent ? 'sent' : 'failed';
}
