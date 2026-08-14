/**
 * Mission Server messenger — rooms, messages, local presence.
 *
 * Freeze: docs/MISSION_SERVER_MESSENGER_PLAN.md (continues #518).
 * Later horizon (no UI): game.* modules bind the same Mission ID.
 */

export const MAX_SERVERS = 1;
export const MAX_CHANNELS = 4;
export const MAX_MESSAGES_PER_CHANNEL = 200;
export const MAX_MESSAGE_BODY = 2000;

export const DEFAULT_CHANNEL_SLUGS = ['train', 'garage', 'off-topic'] as const;
export type DefaultChannelSlug = (typeof DEFAULT_CHANNEL_SLUGS)[number];

export const GARAGE_SERVER_ID = 'garage-local';

export const PRESENCE_STATUSES = ['available', 'away', 'offline'] as const;
export type PresenceStatus = (typeof PRESENCE_STATUSES)[number];

export type ServerChannel = {
  id: string;
  slug: string;
  name: string;
};

export type ServerMember = {
  id: 'self';
  kind: 'self';
};

export type MessageKind = 'text' | 'nudge';

export type GarageMessage = {
  id: string;
  channelId: string;
  authorCallSign: string;
  /** Athlete Card call-sign `00`–`99` when set. Local only. */
  authorMissionId?: string | null;
  body: string;
  createdAt: string;
  kind?: MessageKind;
};

export type GarageServer = {
  id: typeof GARAGE_SERVER_ID;
  name: string;
  channels: ServerChannel[];
  members: ServerMember[];
  /** channelId → messages, oldest first */
  messages: Record<string, GarageMessage[]>;
};

export type MissionServerState = {
  version: 1;
  server: GarageServer;
  /** Self presence on this device. Never invent other athletes. */
  presence: PresenceStatus;
};

export function isDefaultChannelSlug(value: string): value is DefaultChannelSlug {
  return (DEFAULT_CHANNEL_SLUGS as readonly string[]).includes(value);
}

export function isPresenceStatus(value: unknown): value is PresenceStatus {
  return (
    typeof value === 'string' && (PRESENCE_STATUSES as readonly string[]).includes(value)
  );
}
