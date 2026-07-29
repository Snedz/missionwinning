'use client';

/**
 * Browser web-push subscribe/unsubscribe.
 *
 * SW only registers in production when PRIVATE_MODE is false — ships dark until flip.
 *
 * **No account required.** The free logger needs no sign-up, so the athlete most
 * likely to lapse is anonymous; gating the return channel on a session made that
 * athlete permanently unreachable. Subscriptions are keyed by the stable device id
 * (`getOrCreateDeviceId`) and linked to a user only if one exists. See
 * docs/RETURN_LOOP_PLAN.md.
 *
 * Ordering rule: `Notification.requestPermission()` must never be called down a path
 * that cannot use the result. A granted-then-discarded prompt leaves the site marked
 * "notifications allowed" with nothing able to send one, and the browser will not ask
 * again. Everything that can fail without user input is checked *before* the prompt.
 */

import { getOrCreateDeviceId } from '@/lib/coach/storage';
import { loadDaysPerWeek } from '@/lib/coach/schedulePrefs';
import { track } from '@/lib/analytics';

/**
 * Cadence, never history. The server may know when the athlete last trained and how
 * often they aim to — enough to decide whether a return nudge is due and when it is
 * decent to send one. Sets stay on the device.
 */
export interface PushCadence {
  lastSessionAt?: string | null;
  daysPerWeek?: number;
  /**
   * Did the last session run hot for this athlete. One bit, computed here from the
   * debrief's zone — the load, the sets and the zone itself never leave the device.
   */
  lastSessionHigh?: boolean;
}

export type PushResult = 'ok' | 'unsupported' | 'denied' | 'error';

function vapidPublicKey(): string | null {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || null;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function resolvedTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch {
    return undefined;
  }
}

export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  if (!vapidPublicKey()) return false;
  // Serwist disabled in dev / private mode — avoid false UX
  if (process.env.NODE_ENV !== 'production') return false;
  return true;
}

/**
 * Send a subscription to the server. Idempotent — the route upserts on `endpoint`,
 * so re-posting is how a dropped row heals and how a row gains a `user_id` after
 * sign-in. The session cookie rides along automatically when there is one.
 */
async function postSubscription(
  sub: PushSubscription,
  cadence?: PushCadence
): Promise<boolean> {
  const json = sub.toJSON();
  const endpoint = json.endpoint;
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!endpoint || !p256dh || !auth) return false;

  try {
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint,
        p256dh,
        auth,
        deviceId: getOrCreateDeviceId(),
        lastSessionAt: cadence?.lastSessionAt ?? undefined,
        daysPerWeek: cadence?.daysPerWeek ?? loadDaysPerWeek(),
        timeZone: resolvedTimeZone(),
        lastSessionHigh: cadence?.lastSessionHigh,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function subscribePush(cadence?: PushCadence): Promise<PushResult> {
  // Everything knowable without bothering the user happens first — see the ordering
  // rule at the top of this file.
  if (!isPushSupported()) return 'unsupported';
  const key = vapidPublicKey();
  if (!key) return 'unsupported';

  let reg: ServiceWorkerRegistration;
  try {
    reg = await navigator.serviceWorker.ready;
  } catch {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return 'denied';

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
      });
    }

    // The browser subscription is deliberately kept when the POST fails: it costs
    // nothing, and the next toggle re-posts the same endpoint and heals the row.
    if (!(await postSubscription(sub, cadence))) return 'error';

    track('push_subscribed');
    return 'ok';
  } catch {
    return 'error';
  }
}

export async function unsubscribePush(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;
    const endpoint = sub.endpoint;
    await sub.unsubscribe();
    await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint }),
    });
  } catch {
    /* ignore */
  }
}

export async function hasLocalPushSubscription(): Promise<boolean> {
  if (!isPushSupported()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return Boolean(sub);
  } catch {
    return false;
  }
}

/**
 * Re-post whatever this browser already has, without prompting.
 *
 * Two jobs: heal a server row lost to a failed POST, and attach `user_id` to a
 * subscription that was created anonymously and has since signed in — so nobody is
 * asked to opt in a second time for the same device.
 */
export async function syncPushSubscription(cadence?: PushCadence): Promise<boolean> {
  if (!isPushSupported()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return false;
    return await postSubscription(sub, cadence);
  } catch {
    return false;
  }
}
