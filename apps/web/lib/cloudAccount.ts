'use client';

import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import { create } from 'zustand';
import { enqueue, flush, getState, hasPendingOperation, msUntilNextAttempt, registerHandler, retryStuck } from '@/lib/sync/outbox';
import { readRaw, remove, writeRaw } from '@/lib/storage/safeStorage';
import { createWorkoutCloud, withClientId, workoutIsAhead } from '@/lib/sync/workoutCloud';
import { cloudRowId, mapCloudToLocal } from '@/lib/workout/workoutMerge';
import type { CoachPlan } from '@/lib/coach/types';
import type { SavedWorkout } from '@/types';
import { createNotebookCloud } from './notebookCloud';
import { queueWorkout, useNotebook, workoutQueueKey, type WorkoutQueuePayload } from './notebook';

const cloudUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const cloudConfigured = Boolean(cloudUrl && publicKey);

type Phase = 'checking' | 'local' | 'syncing' | 'synced' | 'waiting';
export const useCloudAccount = create<{ phase: Phase; email: string | null; pending: number }>(() => ({
  phase: cloudConfigured ? 'checking' : 'local', email: null, pending: 0,
}));

let auth: SupabaseClient | null = null;
let session: Session | null = null;
let connected = false;
let generation = 0;
let activeRun: Promise<void> | null = null;
let retryTimer: number | undefined;

function transport(current: Session) {
  return createWorkoutCloud({
    url: cloudUrl!, publicKey: publicKey!, userId: current.user.id, accessToken: current.access_token,
  });
}

function contentTransport(current: Session) {
  return createNotebookCloud(createClient(cloudUrl!, publicKey!, {
    accessToken: async () => current.access_token,
  }), current.user.id);
}

function setAccount(next: Session | null) {
  const previous = session?.user.id;
  session = next;
  if (previous !== next?.user.id) {
    generation++;
    window.clearTimeout(retryTimer);
  }
  useNotebook.getState().switchOwner(next?.user.id ?? null);
  useCloudAccount.setState({
    email: next?.user.email ?? null,
    ...(previous !== next?.user.id || !next
      ? { phase: next ? 'waiting' : 'local', pending: 0 }
      : {}),
  });
  if (next && previous !== next.user.id) window.setTimeout(() => void syncAccount(), 0);
}

export function startCloudAccount() {
  if (!cloudUrl || !publicKey || connected) return;
  connected = true;
  try {
    auth = createClient(cloudUrl, publicKey, {
      auth: {
        flowType: 'pkce',
        storage: { getItem: readRaw, setItem: (key, value) => { writeRaw(key, value); }, removeItem: (key) => { remove(key); } },
      },
    });
  } catch {
    useCloudAccount.setState({ phase: 'local' });
    return;
  }

  registerHandler('workout.upsert', async (value) => {
    const payload = value as WorkoutQueuePayload | null;
    const current = session;
    if (!payload || !current || payload.owner !== current.user.id || !payload.log) return false;
    return transport(current).push(await withClientId(payload.log), payload.weightUnit);
  });
  registerHandler('coach.plan', async (value) => {
    const payload = value as { owner: string; plan: CoachPlan } | null;
    const current = session;
    if (!payload || !current || payload.owner !== current.user.id) return false;
    return contentTransport(current).pushPlan(payload.plan);
  });
  registerHandler('routine.upsert', async (value) => {
    const payload = value as { owner: string; id: string; template: SavedWorkout } | null;
    const current = session;
    if (!payload || !current || payload.owner !== current.user.id) return false;
    return contentTransport(current).pushTemplate(payload.id, payload.template);
  });
  auth.auth.onAuthStateChange((_event, next) => { setAccount(next); });

  window.addEventListener('online', () => void syncAccount());
  window.addEventListener('offline', () => {
    window.clearTimeout(retryTimer);
    if (session) useCloudAccount.setState({ phase: 'waiting' });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void syncAccount();
  });
  window.setInterval(() => {
    if (document.visibilityState === 'visible') void syncAccount();
  }, 30_000);
  useNotebook.subscribe((next, previous) => {
    if (next.owner && next.owner === previous.owner && !activeRun &&
      (next.workoutHistory !== previous.workoutHistory || next.plan !== previous.plan || next.savedWorkouts !== previous.savedWorkouts)) {
      window.setTimeout(() => void syncAccount(), 0);
    }
  });
}

export async function sendSignInLink(email: string) {
  if (!auth) return false;
  try {
    const { error } = await auth.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: new URL('/profile', window.location.origin).toString(), shouldCreateUser: false },
    });
    return !error;
  } catch {
    return false;
  }
}

export async function signOutAccount() {
  if (!auth) return false;
  try {
    const { error } = await auth.auth.signOut({ scope: 'local' });
    return !error;
  } catch {
    return false;
  }
}

export function syncAccount(retry = false): Promise<void> {
  const current = session;
  if (!current) return Promise.resolve();
  const owner = current.user.id;
  const queueKey = workoutQueueKey(owner);
  if (retry) retryStuck(queueKey);
  if (activeRun) return activeRun;
  window.clearTimeout(retryTimer);
  const version = generation;
  const isCurrent = () => generation === version && useNotebook.getState().owner === owner;
  const update = (phase: Phase) => {
    if (!isCurrent()) return;
    const { pending, stuck } = getState(queueKey);
    useCloudAccount.setState({ phase, pending: pending + stuck });
  };
  if (!navigator.onLine) {
    update('waiting');
    return Promise.resolve();
  }
  activeRun = run().finally(() => {
    activeRun = null;
    if (!isCurrent() && session) void syncAccount();
  });
  return activeRun;

  async function run() {
    update('syncing');
    try {
      await flush(queueKey, isCurrent);
      if (!isCurrent()) return;
      const cloud = await transport(current!).pull();
      if (!isCurrent() || !useNotebook.getState().mergeCloud(owner, mapCloudToLocal(cloud))) {
        update('waiting');
        return;
      }
      const byClient = new Map(cloud.filter((row) => row.client_id).map((row) => [row.client_id, row]));
      const byRow = new Map(cloud.map((row) => [row.id, row]));
      const { workoutHistory, units } = useNotebook.getState();
      let remaining = false;
      let capacity = Math.max(0, 100 - getState(queueKey).pending - getState(queueKey).stuck);
      for (const local of workoutHistory) {
        const log = await withClientId(local);
        if (!isCurrent()) return;
        const rowId = cloudRowId(log);
        const existing = rowId ? byRow.get(rowId) : log.clientId ? byClient.get(log.clientId) : undefined;
        if (existing ? !workoutIsAhead(log, existing) : rowId) continue;
        if (hasPendingOperation('workout.upsert', log.clientId ?? log.id, queueKey)) continue;
        if (capacity <= 0) { remaining = true; break; }
        queueWorkout(owner, log, units);
        capacity--;
      }
      let contentFailed = false;
      try {
        const content = contentTransport(current!);
        const [cloudPlan, { templates, unsynced }] = await Promise.all([
          content.pullPlan(),
          content.pullTemplates(() => useNotebook.getState().savedWorkouts),
        ]);
        if (!isCurrent()) return;
        const localPlan = useNotebook.getState().plan;
        const pushPlan = localPlan && (!cloudPlan || localPlan.revision > cloudPlan.revision);
        if (!useNotebook.getState().mergeCloudContent(owner, pushPlan ? localPlan : cloudPlan, templates)) {
          contentFailed = true;
        } else {
          if (pushPlan && !hasPendingOperation('coach.plan', 'plan', queueKey)) {
            enqueue('coach.plan', 'plan', { owner, plan: localPlan }, queueKey);
          }
          for (const [id, template] of unsynced) {
            if (hasPendingOperation('routine.upsert', id, queueKey)) continue;
            if (capacity <= 0) { remaining = true; break; }
            enqueue('routine.upsert', id, { owner, id, template }, queueKey);
            capacity--;
          }
        }
      } catch {
        contentFailed = true;
      }
      await flush(queueKey, isCurrent);
      const { pending, stuck } = getState(queueKey);
      update(pending || stuck || remaining || contentFailed ? 'waiting' : 'synced');
      const retryIn = msUntilNextAttempt(queueKey);
      if (isCurrent() && navigator.onLine && retryIn !== null) {
        retryTimer = window.setTimeout(() => {
          if (document.visibilityState === 'visible') void syncAccount();
        }, Math.max(1_000, retryIn));
      }
    } catch {
      update('waiting');
    }
  }
}
