/**
 * Durable outbox for every write that leaves this device.
 *
 * Replaces four independent "debounce a push and hope" modules (coachSync,
 * journeySync, leaderboardSync, pftSync) plus the fire-and-forget cloud write in
 * workoutStore, none of which survived the tab closing. `fuelCoach/fuelSync` is
 * deliberately not here: its "push" writes to device storage, not a network, so
 * there is no transient failure to retry. A session logged in a car park with no signal is the normal case here,
 * so queued work has to outlive the page.
 *
 * Contract:
 * - `enqueue` persists immediately and never throws.
 * - Ops are retried with exponential backoff until a handler reports success.
 * - Nothing is ever dropped for failing. After `MAX_ATTEMPTS` an op goes `stuck`
 *   and waits for an explicit `retryStuck()` — losing a workout is not an option.
 * - Handlers are registered rather than imported so this module stays free of
 *   Supabase and DOM dependencies (and testable under `tsx --test`).
 */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';

export type OutboxKind =
  | 'workout.upsert'
  | 'coach.plan'
  | 'journey.state'
  | 'leaderboard.push'
  | 'pft.push';

export interface OutboxOp {
  id: string;
  kind: OutboxKind;
  /**
   * Collapses superseded work: enqueuing the same key replaces the pending op.
   * Latest-state pushes (a coach plan, a journey snapshot) share one key per kind;
   * per-entity writes (a workout) key on the entity id so none are lost.
   */
  dedupeKey: string;
  payload: unknown;
  attempts: number;
  nextAttemptAt: number;
  createdAt: number;
  stuck?: boolean;
  lastError?: string;
}

/** Resolve true when the write landed. Returning false or throwing schedules a retry. */
export type OutboxHandler = (payload: unknown) => Promise<boolean>;

export const MAX_ATTEMPTS = 12;
const BASE_DELAY_MS = 5_000;
const MAX_DELAY_MS = 10 * 60_000;
/** Hard ceiling so a pathological loop cannot grow storage without bound. */
const MAX_QUEUE = 500;

const handlers = new Map<OutboxKind, OutboxHandler>();
const changeListeners = new Set<(state: OutboxState) => void>();

let clock: () => number = () => Date.now();
let jitter: () => number = () => Math.random();
let flushing = false;

export interface OutboxState {
  pending: number;
  stuck: number;
  oldestCreatedAt: number | null;
}

function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `op-${clock()}-${Math.floor(jitter() * 1e9).toString(36)}`;
}

function load(): OutboxOp[] {
  const ops = readJson<OutboxOp[]>(STORAGE_KEYS.outbox, []);
  if (!Array.isArray(ops)) return [];
  // Tolerate hand-edited or partially written payloads.
  return ops.filter(
    (op): op is OutboxOp =>
      !!op &&
      typeof op.id === 'string' &&
      typeof op.kind === 'string' &&
      typeof op.dedupeKey === 'string' &&
      typeof op.attempts === 'number'
  );
}

function save(ops: OutboxOp[]): void {
  writeJson(STORAGE_KEYS.outbox, ops.slice(0, MAX_QUEUE));
}

function summarize(ops: OutboxOp[]): OutboxState {
  const pending = ops.filter((o) => !o.stuck).length;
  const stuck = ops.length - pending;
  const oldest = ops.reduce<number | null>(
    (min, o) => (min === null || o.createdAt < min ? o.createdAt : min),
    null
  );
  return { pending, stuck, oldestCreatedAt: oldest };
}

function emit(ops: OutboxOp[]): void {
  const state = summarize(ops);
  for (const listener of changeListeners) {
    try {
      listener(state);
    } catch {
      /* a broken subscriber must not break sync */
    }
  }
}

export function registerHandler(kind: OutboxKind, handler: OutboxHandler): void {
  handlers.set(kind, handler);
}

export function subscribe(listener: (state: OutboxState) => void): () => void {
  changeListeners.add(listener);
  listener(summarize(load()));
  return () => changeListeners.delete(listener);
}

export function getState(): OutboxState {
  return summarize(load());
}

/** One waiting item, for display. */
export interface PendingItem {
  kind: OutboxKind;
  createdAt: number;
  stuck: boolean;
}

/**
 * The queue as a list, oldest first — for the offline screen's "waiting to
 * sync" rows. `getState` answers "how many"; this answers "which", and it is
 * exported here rather than having the page re-parse `STORAGE_KEYS.outbox` so
 * the queue keeps exactly one reader.
 *
 * Payloads are deliberately not returned: they carry user data, and nothing
 * that displays a queue needs to see inside the envelope.
 */
export function listPending(): PendingItem[] {
  return load()
    .slice()
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((o) => ({ kind: o.kind, createdAt: o.createdAt, stuck: !!o.stuck }));
}

/** Queue a write. Persists synchronously; safe to call from a store action. */
export function enqueue(kind: OutboxKind, dedupeKey: string, payload: unknown): void {
  const ops = load();
  const now = clock();
  const existingIdx = ops.findIndex((o) => o.kind === kind && o.dedupeKey === dedupeKey);
  const op: OutboxOp = {
    // Always a fresh id: an in-flight flush identifies its op by id, so a
    // replacement is invisible to it and cannot be acked away by the old request.
    id: newId(),
    kind,
    dedupeKey,
    payload,
    // Replacing a superseded op resets its backoff — the payload is new work.
    attempts: 0,
    nextAttemptAt: now,
    createdAt: existingIdx >= 0 ? ops[existingIdx].createdAt : now,
  };
  if (existingIdx >= 0) ops[existingIdx] = op;
  else ops.push(op);
  save(ops);
  emit(ops);
}

function backoffDelay(attempts: number): number {
  const exponential = Math.min(BASE_DELAY_MS * 2 ** attempts, MAX_DELAY_MS);
  // Jitter avoids a thundering herd when many tabs come back online together.
  return Math.round(exponential * (0.75 + jitter() * 0.5));
}

/**
 * Attempt every due op once. Safe to call often — concurrent calls collapse.
 * Returns the number of ops that completed.
 */
export async function flush(): Promise<number> {
  if (flushing) return 0;
  flushing = true;
  let completed = 0;
  try {
    const due = load().filter((op) => !op.stuck && op.nextAttemptAt <= clock());
    for (const op of due) {
      const handler = handlers.get(op.kind);
      if (!handler) continue; // handler not registered yet on this surface

      let ok = false;
      let error: string | undefined;
      try {
        ok = await handler(op.payload);
      } catch (e) {
        error = e instanceof Error ? e.message : 'handler threw';
      }

      // Re-read: a newer enqueue may have replaced this op (new id) while the
      // request was in flight. Not finding our id means our work is obsolete.
      const ops = load();
      const idx = ops.findIndex((o) => o.id === op.id);
      if (idx < 0) continue;
      const current = ops[idx];

      if (ok) {
        ops.splice(idx, 1);
        completed += 1;
      } else {
        const attempts = current.attempts + 1;
        ops[idx] = {
          ...current,
          attempts,
          nextAttemptAt: clock() + backoffDelay(attempts),
          stuck: attempts >= MAX_ATTEMPTS,
          lastError: error,
        };
      }
      save(ops);
      emit(ops);
    }
  } finally {
    flushing = false;
  }
  return completed;
}

/** Re-arm ops that exhausted their attempts (user asked, or a fresh sign-in). */
export function retryStuck(): void {
  const ops = load().map((op) =>
    op.stuck ? { ...op, stuck: false, attempts: 0, nextAttemptAt: clock() } : op
  );
  save(ops);
  emit(ops);
}

/** Milliseconds until the next op is due, or null when the queue is idle. */
export function msUntilNextAttempt(): number | null {
  const times = load()
    .filter((o) => !o.stuck)
    .map((o) => o.nextAttemptAt);
  if (!times.length) return null;
  return Math.max(0, Math.min(...times) - clock());
}

/** Test-only hooks. */
export function __setClockForTests(fn: () => number): void {
  clock = fn;
}
export function __setJitterForTests(fn: () => number): void {
  jitter = fn;
}
export function __resetForTests(): void {
  handlers.clear();
  changeListeners.clear();
  clock = () => Date.now();
  jitter = () => Math.random();
  flushing = false;
  save([]);
}
