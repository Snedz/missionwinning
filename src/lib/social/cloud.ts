/**
 * Pure mapping between Garage messages and the signed-in cloud shape.
 * No I/O — ServerPage / socialSync / the API route all share this.
 */

import {
  isDefaultChannelSlug,
  isPresenceStatus,
  type DefaultChannelSlug,
  type GarageMessage,
  type RemotePresence,
} from './types';

export type SocialMessagePayload = {
  id: string;
  channelSlug: DefaultChannelSlug;
  body: string;
  kind: 'text' | 'nudge';
  authorCallSign: string;
  authorMissionId: string | null;
  createdAt: string;
};

export function isMissingRelation(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  const code = error.code ?? '';
  if (code === '42P01' || code === 'PGRST205') return true;
  return /does not exist|social_messages|social_presence|social_message_reports/i.test(
    error.message ?? ''
  );
}

export function isSocialMessagePayload(p: unknown): p is SocialMessagePayload {
  if (!p || typeof p !== 'object') return false;
  const r = p as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    r.id.length > 0 &&
    r.id.length <= 80 &&
    isDefaultChannelSlug(String(r.channelSlug ?? '')) &&
    typeof r.body === 'string' &&
    typeof r.authorCallSign === 'string' &&
    typeof r.createdAt === 'string' &&
    (r.kind === undefined || r.kind === 'text' || r.kind === 'nudge') &&
    (r.authorMissionId === undefined ||
      r.authorMissionId === null ||
      (typeof r.authorMissionId === 'string' && /^\d{2}$/.test(r.authorMissionId)))
  );
}

export function messageToPayload(message: GarageMessage): SocialMessagePayload | null {
  if (!isDefaultChannelSlug(message.channelId)) return null;
  return {
    id: message.id,
    channelSlug: message.channelId,
    body: message.body,
    kind: message.kind === 'nudge' ? 'nudge' : 'text',
    authorCallSign: message.authorCallSign,
    authorMissionId: message.authorMissionId ?? null,
    createdAt: message.createdAt,
  };
}

export function rowToGarageMessage(
  row: unknown,
  opts?: { mine?: boolean }
): GarageMessage | null {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;
  const channelSlug =
    typeof r.channel_slug === 'string'
      ? r.channel_slug
      : typeof r.channelId === 'string'
        ? r.channelId
        : typeof r.channelSlug === 'string'
          ? r.channelSlug
          : '';
  if (!isDefaultChannelSlug(channelSlug)) return null;
  if (typeof r.id !== 'string' || typeof r.body !== 'string') return null;
  const authorCallSign =
    typeof r.author_call_sign === 'string'
      ? r.author_call_sign
      : typeof r.authorCallSign === 'string'
        ? r.authorCallSign
        : '';
  if (!authorCallSign) return null;
  const createdAt =
    typeof r.created_at === 'string'
      ? r.created_at
      : typeof r.createdAt === 'string'
        ? r.createdAt
        : '';
  if (!createdAt) return null;
  const missionRaw = r.author_mission_id ?? r.authorMissionId;
  const mine = opts?.mine === true || r.mine === true || r.origin === 'local';
  return {
    id: r.id,
    channelId: channelSlug,
    body: r.body,
    authorCallSign,
    authorMissionId: typeof missionRaw === 'string' ? missionRaw : null,
    createdAt,
    kind: r.kind === 'nudge' ? 'nudge' : 'text',
    origin: mine ? 'local' : 'remote',
  };
}

export function rowToRemotePresence(row: unknown): RemotePresence | null {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;
  const callSign =
    typeof r.call_sign === 'string'
      ? r.call_sign
      : typeof r.callSign === 'string'
        ? r.callSign
        : '';
  const status = r.status;
  const lastSeen =
    typeof r.last_seen === 'string'
      ? r.last_seen
      : typeof r.lastSeen === 'string'
        ? r.lastSeen
        : '';
  if (!callSign || !isPresenceStatus(status) || !lastSeen) return null;
  return { callSign, status, lastSeen };
}
