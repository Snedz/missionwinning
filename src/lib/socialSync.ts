/**
 * Signed-in Mission Server writes through the durable outbox.
 *
 * Guests never enqueue. Missing table / 401 finish the op (fail open to local).
 * 5xx and 429 retry. No raw fetch from the page.
 */

import { enqueue, registerHandler } from '@/lib/sync/outbox';
import {
  isSocialMessagePayload,
  type SocialMessagePayload,
} from '@/lib/social/cloud';
import { isPresenceStatus, type PresenceStatus } from '@/lib/social/types';

export type SessionProbe = () => Promise<{ user?: { id?: string } } | null>;

export type SocialPresencePayload = {
  status: PresenceStatus;
  callSign: string;
};

export type SocialReportPayload = {
  messageId: string;
  reason: 'spam' | 'abuse' | 'other';
};

export function socialDeliveryDone(status: number): boolean {
  if (status === 408 || status === 429) return false;
  if (status >= 200 && status < 300) return true;
  if (status >= 400 && status < 500) return true;
  return false;
}

export function isSocialPresencePayload(p: unknown): p is SocialPresencePayload {
  if (!p || typeof p !== 'object') return false;
  const r = p as Record<string, unknown>;
  return isPresenceStatus(r.status) && typeof r.callSign === 'string' && r.callSign.trim().length > 0;
}

export function isSocialReportPayload(p: unknown): p is SocialReportPayload {
  if (!p || typeof p !== 'object') return false;
  const r = p as Record<string, unknown>;
  return (
    typeof r.messageId === 'string' &&
    r.messageId.length > 0 &&
    (r.reason === 'spam' || r.reason === 'abuse' || r.reason === 'other')
  );
}

async function postJson(url: string, body: unknown): Promise<boolean> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return false;
  }
  return socialDeliveryDone(res.status);
}

async function defaultProbe(): Promise<{ user?: { id?: string } } | null> {
  try {
    const { getSession } = await import('@/lib/supabase');
    return getSession();
  } catch {
    return null;
  }
}

export function enqueueSocialMessage(payload: SocialMessagePayload): void {
  if (!isSocialMessagePayload(payload)) return;
  enqueue('social.message', `social:${payload.id}`, payload);
}

export async function enqueueSocialMessageIfSignedIn(
  payload: SocialMessagePayload,
  probe?: SessionProbe
): Promise<void> {
  const session = probe ? await probe() : await defaultProbe();
  if (!session?.user?.id) return;
  enqueueSocialMessage(payload);
}

export function enqueueSocialPresence(payload: SocialPresencePayload): void {
  if (!isSocialPresencePayload(payload)) return;
  enqueue('social.presence', 'social:presence', payload);
}

export async function enqueueSocialPresenceIfSignedIn(
  payload: SocialPresencePayload,
  probe?: SessionProbe
): Promise<void> {
  const session = probe ? await probe() : await defaultProbe();
  if (!session?.user?.id) return;
  enqueueSocialPresence(payload);
}

export function enqueueSocialReport(payload: SocialReportPayload): void {
  if (!isSocialReportPayload(payload)) return;
  enqueue('social.report', `social:report:${payload.messageId}`, payload);
}

export function registerSocialSyncHandler(): void {
  registerHandler('social.message', async (payload) => {
    if (!isSocialMessagePayload(payload)) return true;
    return postJson('/api/social/messages', payload);
  });
  registerHandler('social.presence', async (payload) => {
    if (!isSocialPresencePayload(payload)) return true;
    return postJson('/api/social/presence', payload);
  });
  registerHandler('social.report', async (payload) => {
    if (!isSocialReportPayload(payload)) return true;
    return postJson('/api/social/reports', payload);
  });
}
