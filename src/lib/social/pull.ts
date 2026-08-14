/**
 * Catch-up pulls for signed-in Garage. Fail open to [].
 */

import { rowToGarageMessage, rowToRemotePresence } from './cloud';
import type { GarageMessage, RemotePresence } from './types';

export async function pullChannelMessages(channelId: string): Promise<GarageMessage[]> {
  try {
    const res = await fetch(`/api/social/messages?channel=${encodeURIComponent(channelId)}`, {
      credentials: 'same-origin',
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { messages?: unknown };
    if (!Array.isArray(data.messages)) return [];
    return data.messages.map((row) => rowToGarageMessage(row)).filter((m) => m !== null);
  } catch {
    return [];
  }
}

export async function pullRemotePresence(): Promise<RemotePresence[]> {
  try {
    const res = await fetch('/api/social/presence', { credentials: 'same-origin' });
    if (!res.ok) return [];
    const data = (await res.json()) as { people?: unknown };
    if (!Array.isArray(data.people)) return [];
    return data.people.map(rowToRemotePresence).filter((p) => p !== null);
  } catch {
    return [];
  }
}
