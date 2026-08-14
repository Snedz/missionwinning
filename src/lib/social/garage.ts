/**
 * Seed the one free Garage server. Caps are enforced here so the free limit
 * is real even without channel-create UI.
 */

import {
  DEFAULT_CHANNEL_SLUGS,
  GARAGE_SERVER_ID,
  MAX_CHANNELS,
  MAX_MESSAGES_PER_CHANNEL,
  isPresenceStatus,
  type GarageMessage,
  type GarageServer,
  type MissionServerState,
  type ServerChannel,
} from './types';

export function seedGarageServer(): GarageServer {
  const channels: ServerChannel[] = DEFAULT_CHANNEL_SLUGS.map((slug) => ({
    id: slug,
    slug,
    name: slug,
  }));
  return {
    id: GARAGE_SERVER_ID,
    name: 'Garage',
    channels: channels.slice(0, MAX_CHANNELS),
    members: [{ id: 'self', kind: 'self' }],
    messages: Object.fromEntries(channels.map((c) => [c.id, []])),
  };
}

export function seedMissionServerState(): MissionServerState {
  return { version: 1, server: seedGarageServer(), presence: 'available' };
}

/** Clamp a loaded blob to v1 free limits. Never throws. */
export function clampMissionServerState(raw: unknown): MissionServerState {
  const seeded = seedMissionServerState();
  if (!raw || typeof raw !== 'object') return seeded;
  const rec = raw as Record<string, unknown>;
  if (rec.version !== 1 || !rec.server || typeof rec.server !== 'object') return seeded;
  const server = rec.server as Record<string, unknown>;

  const channelsIn = Array.isArray(server.channels) ? server.channels : [];
  const channels: ServerChannel[] = [];
  const seen = new Set<string>();
  for (const ch of channelsIn) {
    if (!ch || typeof ch !== 'object') continue;
    const c = ch as Record<string, unknown>;
    const id = typeof c.id === 'string' ? c.id.trim() : '';
    const slug = typeof c.slug === 'string' ? c.slug.trim() : id;
    const name = typeof c.name === 'string' ? c.name.trim() : slug;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    channels.push({ id, slug: slug || id, name: name || slug || id });
    if (channels.length >= MAX_CHANNELS) break;
  }
  if (channels.length === 0) return seeded;

  const messagesIn =
    server.messages && typeof server.messages === 'object' && !Array.isArray(server.messages)
      ? (server.messages as Record<string, unknown>)
      : {};
  const messages: GarageServer['messages'] = {};
  for (const ch of channels) {
    const rawList = messagesIn[ch.id];
    const list: unknown[] = Array.isArray(rawList) ? rawList : [];
    const kept = list.filter(isGarageMessage).filter((m) => m.channelId === ch.id);
    messages[ch.id] =
      kept.length > MAX_MESSAGES_PER_CHANNEL
        ? kept.slice(kept.length - MAX_MESSAGES_PER_CHANNEL)
        : kept;
  }

  return {
    version: 1,
    presence: isPresenceStatus(rec.presence) ? rec.presence : 'available',
    server: {
      id: GARAGE_SERVER_ID,
      name: typeof server.name === 'string' && server.name.trim() ? server.name.trim() : 'Garage',
      channels,
      members: [{ id: 'self', kind: 'self' }],
      messages,
    },
  };
}

function isGarageMessage(value: unknown): value is GarageMessage {
  if (!value || typeof value !== 'object') return false;
  const m = value as Record<string, unknown>;
  if (
    typeof m.id !== 'string' ||
    typeof m.channelId !== 'string' ||
    typeof m.authorCallSign !== 'string' ||
    typeof m.body !== 'string' ||
    typeof m.createdAt !== 'string'
  ) {
    return false;
  }
  if (m.kind !== undefined && m.kind !== 'text' && m.kind !== 'nudge') return false;
  if (
    m.authorMissionId !== undefined &&
    m.authorMissionId !== null &&
    typeof m.authorMissionId !== 'string'
  ) {
    return false;
  }
  if (m.origin !== undefined && m.origin !== 'local' && m.origin !== 'remote') return false;
  return true;
}
