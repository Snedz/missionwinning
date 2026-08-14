/**
 * Optional Supabase Realtime broadcast for Mission Server.
 *
 * Feature-flagged (`NEXT_PUBLIC_MISSION_SERVER_REALTIME=1`) and fail-open to
 * local: no flag, no session, missing config, or subscribe errors → stay local.
 * Never opens a WebSocket on a Vercel function. Local store remains source of truth.
 */

import type { GarageMessage } from './types';

export type RealtimeFailReason = 'unconfigured' | 'no-session' | 'subscribe-failed';

export type GarageRealtimeHandle =
  | {
      ok: true;
      send: (message: GarageMessage) => Promise<void>;
      disconnect: () => void;
    }
  | { ok: false; reason: RealtimeFailReason };

export type RealtimeSession = { user?: { id?: string } } | null;

export type RealtimeSubscription = {
  send: (payload: unknown) => Promise<void>;
  disconnect: () => void;
};

export type GarageRealtimeDeps = {
  isConfigured: () => boolean;
  getSession: () => Promise<RealtimeSession>;
  subscribe: (
    topic: string,
    onEvent: (payload: unknown) => void
  ) => Promise<RealtimeSubscription>;
};

async function defaultDeps(): Promise<GarageRealtimeDeps> {
  const { isSupabaseConfigured, getSession, supabase } = await import('@/lib/supabase');
  return {
    isConfigured: isSupabaseConfigured,
    getSession,
    subscribe: async (topic, onEvent) => {
      const ch = supabase.channel(topic);
      ch.on('broadcast', { event: 'message' }, (evt: { payload?: unknown }) => {
        onEvent(evt?.payload);
      });
      await Promise.race([
        new Promise<void>((resolve, reject) => {
          ch.subscribe((status: string) => {
            if (status === 'SUBSCRIBED') resolve();
            if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              reject(new Error(status));
            }
          });
        }),
        new Promise<void>((_, reject) => {
          setTimeout(() => reject(new Error('timeout')), 3000);
        }),
      ]);
      return {
        send: async (payload) => {
          await ch.send({ type: 'broadcast', event: 'message', payload });
        },
        disconnect: () => {
          void supabase.removeChannel(ch);
        },
      };
    },
  };
}

export function isMissionServerRealtimeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MISSION_SERVER_REALTIME === '1';
}

export async function connectGarageRealtime(
  onRemote: (payload: unknown) => void,
  deps?: GarageRealtimeDeps
): Promise<GarageRealtimeHandle> {
  try {
    if (!deps && !isMissionServerRealtimeEnabled()) {
      return { ok: false, reason: 'unconfigured' };
    }
    const d = deps ?? (await defaultDeps());
    if (!d.isConfigured()) return { ok: false, reason: 'unconfigured' };
    const session = await d.getSession();
    const userId = session?.user?.id;
    if (!userId) return { ok: false, reason: 'no-session' };

    const topic = `mw-garage-${userId}`;
    const sub = await d.subscribe(topic, onRemote);
    return {
      ok: true,
      send: async (message) => {
        try {
          await sub.send(message);
        } catch {
          // Fan-out is best-effort. Local persist already happened.
        }
      },
      disconnect: () => {
        try {
          sub.disconnect();
        } catch {
          // ignore
        }
      },
    };
  } catch {
    return { ok: false, reason: 'subscribe-failed' };
  }
}
