/**
 * Optional private session note on a finished History
 * log (`.1046`).
 *
 * Live already has `normalizeSessionNote` /
 * `attachSessionNote` / `SESSION_NOTE_MAX` 500
 * (`.983`). History detail has Name `.1007`
 * and Duration `.1035` and did not edit
 * `sessionNote`. Same finished log. Same id.
 * Empty is valid (clear) — field absent,
 * never required. Over-cap truncates at 500.
 * Not a lift note. Not a pin. Own Save.
 * Does not rewrite sets / lift notes /
 * duration / name. Pure: no store.
 */

import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';
import {
  findFinishedSession,
  normalizeSessionId,
} from '@/lib/workout/deleteFinishedSession';
import { attachSessionNote, normalizeSessionNote } from '@/lib/workout/sessionNote';

export type PatchFinishedSessionNoteDecision =
  | { kind: 'empty' }
  | { kind: 'noop' }
  | { kind: 'apply'; sessionId: string; note: string | undefined };

export type PatchFinishedSessionNoteApply = {
  history: CompletedWorkoutLog[];
  next: CompletedWorkoutLog;
};

function liveSessionIds(live: ActiveWorkout | null | undefined): Set<string> {
  const ids = new Set<string>();
  if (!live) return ids;
  const clientId = normalizeSessionId(live.clientId);
  const workoutId = normalizeSessionId(live.workoutId);
  if (clientId) ids.add(clientId);
  if (workoutId) ids.add(workoutId);
  return ids;
}

function isClearRaw(raw: unknown): boolean {
  if (raw === null || raw === undefined) return true;
  return typeof raw === 'string' && raw.trim() === '';
}

/**
 * Empty id → empty. Non-string junk → empty.
 * Blank / null / undefined clears unless
 * already omitted (noop). Live-open / missing
 * / tomb → noop. Same normalized text → noop.
 */
export function decidePatchFinishedSessionNote(input: {
  sessionId: unknown;
  note: unknown;
  history?: readonly CompletedWorkoutLog[] | null;
  live?: ActiveWorkout | null;
}): PatchFinishedSessionNoteDecision {
  const sessionId = normalizeSessionId(input.sessionId);
  if (!sessionId) return { kind: 'empty' };
  const raw = input.note;
  const clear = isClearRaw(raw);
  if (!clear && typeof raw !== 'string') return { kind: 'empty' };
  if (liveSessionIds(input.live).has(sessionId)) return { kind: 'noop' };
  const found = findFinishedSession(input.history, sessionId);
  if (!found) return { kind: 'noop' };
  const parsed = normalizeSessionNote(raw);
  const current = normalizeSessionNote(found.sessionNote);
  if (clear) {
    if (current === undefined) return { kind: 'noop' };
    return { kind: 'apply', sessionId: found.id, note: undefined };
  }
  if (current === parsed) return { kind: 'noop' };
  return { kind: 'apply', sessionId: found.id, note: parsed };
}

export function applyPatchFinishedSessionNote(input: {
  sessionId: unknown;
  note: unknown;
  history?: readonly CompletedWorkoutLog[] | null;
  live?: ActiveWorkout | null;
  now?: string;
}): PatchFinishedSessionNoteApply | null {
  const decision = decidePatchFinishedSessionNote(input);
  if (decision.kind !== 'apply') return null;
  const history = Array.isArray(input.history) ? input.history : [];
  const now = input.now ?? new Date().toISOString();
  let next: CompletedWorkoutLog | null = null;
  const mapped = history.map((log) => {
    if (!log || normalizeSessionId(log.id) !== decision.sessionId) return log;
    const edited = attachSessionNote(
      {
        ...log,
        updatedAt: now,
        revision: (typeof log.revision === 'number' ? log.revision : 1) + 1,
      },
      decision.note
    );
    next = edited;
    return edited;
  });
  if (!next) return null;
  return { history: mapped, next };
}
