/**
 * Mission Server v1 — garage text rooms.
 *
 * Freeze: docs/MISSION_SERVER_V1_PLAN.md
 */

export const MAX_SERVERS = 1;
export const MAX_CHANNELS = 4;
export const MAX_MESSAGES_PER_CHANNEL = 200;
export const MAX_MESSAGE_BODY = 2000;

export const DEFAULT_CHANNEL_SLUGS = ['train', 'garage', 'off-topic'] as const;
export type DefaultChannelSlug = (typeof DEFAULT_CHANNEL_SLUGS)[number];

export const GARAGE_SERVER_ID = 'garage-local';

export type ServerChannel = {
  id: string;
  slug: string;
  name: string;
};

export type ServerMember = {
  id: 'self';
  kind: 'self';
};

export type GarageMessage = {
  id: string;
  channelId: string;
  authorCallSign: string;
  body: string;
  createdAt: string;
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
};

export function isDefaultChannelSlug(value: string): value is DefaultChannelSlug {
  return (DEFAULT_CHANNEL_SLUGS as readonly string[]).includes(value);
}
