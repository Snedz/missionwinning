/**
 * Device-local Mission Server store. Source of truth; realtime is optional fan-out.
 */

import { readJson, writeJson } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readChatCallSign } from './callSign';
import { clampMissionServerState, seedMissionServerState } from './garage';
import {
  MAX_MESSAGE_BODY,
  MAX_MESSAGES_PER_CHANNEL,
  type GarageMessage,
  type MissionServerState,
} from './types';

export type PostMessageResult =
  | { ok: true; message: GarageMessage; state: MissionServerState }
  | { ok: false; reason: 'empty' | 'too-long' | 'unknown-channel' };

function newMessageId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function loadMissionServer(): MissionServerState {
  const raw = readJson<unknown>(STORAGE_KEYS.missionServer, null);
  if (raw == null) {
    const seeded = seedMissionServerState();
    writeJson(STORAGE_KEYS.missionServer, seeded);
    return seeded;
  }
  return clampMissionServerState(raw);
}

export function saveMissionServer(state: MissionServerState): boolean {
  return writeJson(STORAGE_KEYS.missionServer, clampMissionServerState(state));
}

export function messagesForChannel(state: MissionServerState, channelId: string): GarageMessage[] {
  return state.server.messages[channelId] ?? [];
}

export function postLocalMessage(
  channelId: string,
  body: string,
  opts?: { authorCallSign?: string; createdAt?: string; id?: string }
): PostMessageResult {
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, reason: 'empty' };
  if (trimmed.length > MAX_MESSAGE_BODY) return { ok: false, reason: 'too-long' };

  const state = loadMissionServer();
  const channel = state.server.channels.find((c) => c.id === channelId);
  if (!channel) return { ok: false, reason: 'unknown-channel' };

  const message: GarageMessage = {
    id: opts?.id ?? newMessageId(),
    channelId,
    authorCallSign: (opts?.authorCallSign ?? readChatCallSign()).trim() || readChatCallSign(),
    body: trimmed.slice(0, MAX_MESSAGE_BODY),
    createdAt: opts?.createdAt ?? new Date().toISOString(),
  };

  const existing = state.server.messages[channelId] ?? [];
  if (existing.some((m) => m.id === message.id)) {
    return { ok: true, message, state };
  }

  const nextList = [...existing, message];
  const trimmedList =
    nextList.length > MAX_MESSAGES_PER_CHANNEL
      ? nextList.slice(nextList.length - MAX_MESSAGES_PER_CHANNEL)
      : nextList;

  const next: MissionServerState = {
    ...state,
    server: {
      ...state.server,
      messages: { ...state.server.messages, [channelId]: trimmedList },
    },
  };
  saveMissionServer(next);
  return { ok: true, message, state: next };
}

/** Merge a remote broadcast if it looks like a v1 message. Never throws. */
export function ingestRemoteMessage(raw: unknown): MissionServerState | null {
  if (!raw || typeof raw !== 'object') return null;
  const m = raw as Record<string, unknown>;
  if (
    typeof m.id !== 'string' ||
    typeof m.channelId !== 'string' ||
    typeof m.authorCallSign !== 'string' ||
    typeof m.body !== 'string' ||
    typeof m.createdAt !== 'string'
  ) {
    return null;
  }
  const result = postLocalMessage(m.channelId, m.body, {
    id: m.id,
    authorCallSign: m.authorCallSign,
    createdAt: m.createdAt,
  });
  return result.ok ? result.state : null;
}
