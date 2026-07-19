'use client';

/**
 * Browser web-push subscribe/unsubscribe.
 * SW only registers in production when PRIVATE_MODE is false — ships dark until flip.
 */

import { supabase } from '@/lib/supabase';
import { track } from '@/lib/analytics';

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

export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  if (!vapidPublicKey()) return false;
  // Serwist disabled in dev / private mode — avoid false UX
  if (process.env.NODE_ENV !== 'production') return false;
  return true;
}

export async function subscribePush(): Promise<'ok' | 'unsupported' | 'denied' | 'error'> {
  if (!isPushSupported()) return 'unsupported';
  const key = vapidPublicKey();
  if (!key) return 'unsupported';

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return 'denied';

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
      });
    }

    const json = sub.toJSON();
    const endpoint = json.endpoint;
    const p256dh = json.keys?.p256dh;
    const auth = json.keys?.auth;
    if (!endpoint || !p256dh || !auth) return 'error';

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 'error';

    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: user.id,
        endpoint,
        p256dh,
        auth,
      },
      { onConflict: 'endpoint' }
    );
    if (error) return 'error';

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
    if (sub) {
      const endpoint = sub.endpoint;
      await sub.unsubscribe();
      await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
    }
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
