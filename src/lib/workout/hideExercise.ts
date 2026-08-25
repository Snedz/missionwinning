/**
 * Hide this exercise from the library (`.1004`).
 *
 * Custom + merge-dupes still leave a noisy Add list. They hide a
 * name so it stops appearing in Add / search / picker. Hidden is
 * not deleted: past sets, PRs, notes, and a merge source stay.
 * A hidden movement already in a live session stays on that
 * session. Unhide restores the name. Empty / missing /
 * already-hidden invents nothing. Do not auto-hide lookalikes.
 * Pure: no store.
 */

import { EXERCISES } from '@/data/exercises';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';
import {
  exerciseDisplayName,
  loadCustomExercises,
  type CustomExercise as NamedCustom,
} from '@/lib/workout/customExercise';
import { collectKnownExerciseIds } from '@/lib/workout/mergeExercises';
import type { CompletedWorkoutLog } from '@/types';

export type HideExerciseDecision =
  | { kind: 'empty' }
  | { kind: 'noop' }
  | { kind: 'hide'; id: string };

export type UnhideExerciseDecision =
  | { kind: 'empty' }
  | { kind: 'noop' }
  | { kind: 'unhide'; id: string };

export type HiddenExerciseRow = { id: string; name: string };

export function normalizeHideId(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.trim();
}

export function decideHideExercise(input: {
  id: unknown;
  knownIds: Iterable<string>;
  hiddenIds: Iterable<string>;
}): HideExerciseDecision {
  const id = normalizeHideId(input.id);
  if (!id) return { kind: 'empty' };
  const known = new Set(
    [...input.knownIds].map(normalizeHideId).filter(Boolean)
  );
  if (!known.has(id)) return { kind: 'noop' };
  const hidden = new Set(
    [...input.hiddenIds].map(normalizeHideId).filter(Boolean)
  );
  if (hidden.has(id)) return { kind: 'noop' };
  return { kind: 'hide', id };
}

export function decideUnhideExercise(input: {
  id: unknown;
  hiddenIds: Iterable<string>;
}): UnhideExerciseDecision {
  const id = normalizeHideId(input.id);
  if (!id) return { kind: 'empty' };
  const hidden = new Set(
    [...input.hiddenIds].map(normalizeHideId).filter(Boolean)
  );
  if (!hidden.has(id)) return { kind: 'noop' };
  return { kind: 'unhide', id };
}

function cleanHiddenIds(ids: Iterable<string>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of ids) {
    const id = normalizeHideId(raw);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export function applyHideExercise(input: {
  id: unknown;
  knownIds: Iterable<string>;
  hiddenIds: Iterable<string>;
}): string[] | null {
  const decision = decideHideExercise(input);
  if (decision.kind !== 'hide') return null;
  return cleanHiddenIds([...input.hiddenIds, decision.id]);
}

export function applyUnhideExercise(input: {
  id: unknown;
  hiddenIds: Iterable<string>;
}): string[] | null {
  const decision = decideUnhideExercise(input);
  if (decision.kind !== 'unhide') return null;
  return cleanHiddenIds([...input.hiddenIds].filter((row) => row !== decision.id));
}

export function omitHiddenExercises<T extends { id: string }>(
  rows: readonly T[],
  hiddenIds: Iterable<string>
): T[] {
  const hidden = new Set(
    [...hiddenIds].map(normalizeHideId).filter(Boolean)
  );
  if (hidden.size === 0) return [...rows];
  return rows.filter((row) => !hidden.has(row.id));
}

export function isExerciseHidden(
  id: unknown,
  hiddenIds: Iterable<string>
): boolean {
  const trimmed = normalizeHideId(id);
  if (!trimmed) return false;
  return [...hiddenIds].map(normalizeHideId).includes(trimmed);
}

export function loadHiddenExerciseIds(): string[] {
  const raw = readJson<unknown>(STORAGE_KEYS.hiddenExercises, []);
  if (!Array.isArray(raw)) return [];
  return cleanHiddenIds(
    raw.filter((item): item is string => typeof item === 'string')
  );
}

export function persistHiddenExerciseIds(ids: readonly string[]): boolean {
  return writeJson(STORAGE_KEYS.hiddenExercises, cleanHiddenIds(ids));
}

export function knownIdsForHide(input: {
  catalog?: readonly { id: string }[];
  customs?: readonly { id: string }[];
  history?: readonly CompletedWorkoutLog[];
  live?: readonly { exerciseId: string }[] | null;
} = {}): string[] {
  return collectKnownExerciseIds({
    catalog: input.catalog ?? EXERCISES,
    customs: input.customs ?? loadCustomExercises(),
    history: input.history,
    live: input.live,
  });
}

export function listHiddenExercises(input: {
  hiddenIds?: Iterable<string>;
  catalog?: readonly { id: string; name: string }[];
  customs?: readonly Pick<NamedCustom, 'id' | 'name'>[];
} = {}): HiddenExerciseRow[] {
  const hiddenIds = cleanHiddenIds(input.hiddenIds ?? loadHiddenExerciseIds());
  const catalog = input.catalog ?? EXERCISES;
  const customs = input.customs ?? loadCustomExercises();
  const out: HiddenExerciseRow[] = [];
  for (const id of hiddenIds) {
    const name =
      customs.find((row) => row.id === id)?.name ??
      catalog.find((row) => row.id === id)?.name ??
      exerciseDisplayName(id) ??
      id;
    out.push({ id, name });
  }
  return out;
}

/** Persist hide when decide says hide. Empty / missing / already-hidden no-ops. */
export function hideExerciseNow(
  id: unknown,
  extra: { live?: readonly { exerciseId: string }[] | null } = {}
): boolean {
  const hiddenIds = loadHiddenExerciseIds();
  const next = applyHideExercise({
    id,
    knownIds: knownIdsForHide({ live: extra.live }),
    hiddenIds,
  });
  if (!next) return false;
  persistHiddenExerciseIds(next);
  return true;
}

/** Persist unhide when decide says unhide. Empty / not-hidden invents nothing. */
export function unhideExerciseNow(id: unknown): boolean {
  const next = applyUnhideExercise({
    id,
    hiddenIds: loadHiddenExerciseIds(),
  });
  if (!next) return false;
  persistHiddenExerciseIds(next);
  return true;
}
