/**
 * Merge duplicate exercises they named twice (`.1002`).
 *
 * Custom + history + PR split when the same movement was logged
 * under two ids ("Bench" vs "Barbell Bench"). They pick a source
 * and a keeper. Confirm-gated. Cannot be undone. Empty / same-id /
 * missing invents nothing. Do not auto-merge lookalikes.
 * Pure: no store.
 */

import { EXERCISES } from '@/data/exercises';
import type {
  ActiveExerciseLog,
  CompletedWorkoutLog,
  SavedWorkout,
  SetTempo,
} from '@/types';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';
import {
  exerciseDisplayName,
  isCustomExerciseId,
  loadCustomExercises,
  saveCustomExercises,
  type CustomExercise as NamedCustom,
} from '@/lib/workout/customExercise';

export type MergeRestMemory = { work?: number; warmup?: number };

export type MergeExerciseDecision =
  | { kind: 'empty' }
  | { kind: 'noop' }
  | { kind: 'needs-confirm'; sourceId: string; keeperId: string };

export type MergeExerciseApply = {
  history: CompletedWorkoutLog[];
  live: ActiveExerciseLog[] | null;
  customs: NamedCustom[];
  saved: SavedWorkout[];
  rest: Record<string, MergeRestMemory>;
  pins: Record<string, string>;
  tempo: Record<string, SetTempo>;
};

export function normalizeMergeId(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.trim();
}

export function collectKnownExerciseIds(input: {
  catalog?: readonly { id: string }[];
  customs?: readonly { id: string }[];
  history?: readonly CompletedWorkoutLog[];
  live?: readonly { exerciseId: string }[] | null;
  saved?: readonly { exercises: readonly { exerciseId: string }[] }[];
  prefIds?: readonly string[];
}): string[] {
  const ids = new Set<string>();
  for (const row of input.catalog ?? []) {
    const id = normalizeMergeId(row.id);
    if (id) ids.add(id);
  }
  for (const row of input.customs ?? []) {
    const id = normalizeMergeId(row.id);
    if (id) ids.add(id);
  }
  for (const log of input.history ?? []) {
    for (const ex of log.exercises ?? []) {
      const id = normalizeMergeId(ex.exerciseId);
      if (id) ids.add(id);
    }
  }
  for (const ex of input.live ?? []) {
    const id = normalizeMergeId(ex.exerciseId);
    if (id) ids.add(id);
  }
  for (const row of input.saved ?? []) {
    for (const ex of row.exercises ?? []) {
      const id = normalizeMergeId(ex.exerciseId);
      if (id) ids.add(id);
    }
  }
  for (const raw of input.prefIds ?? []) {
    const id = normalizeMergeId(raw);
    if (id) ids.add(id);
  }
  return [...ids];
}

/**
 * Empty / same-id / missing source or keeper invents nothing.
 * A valid pair always needs confirm — never auto-apply, never
 * invent a lookalike match.
 */
export function decideMergeExercises(input: {
  sourceId: unknown;
  keeperId: unknown;
  knownIds: Iterable<string>;
}): MergeExerciseDecision {
  const sourceId = normalizeMergeId(input.sourceId);
  const keeperId = normalizeMergeId(input.keeperId);
  if (!sourceId || !keeperId) return { kind: 'empty' };
  if (sourceId === keeperId) return { kind: 'noop' };
  const known = new Set(
    [...input.knownIds].map(normalizeMergeId).filter(Boolean)
  );
  if (!known.has(sourceId) || !known.has(keeperId)) return { kind: 'noop' };
  return { kind: 'needs-confirm', sourceId, keeperId };
}

export function transferKeyedPref<T>(
  map: Record<string, T>,
  sourceId: string,
  keeperId: string,
  merge: (keeper: T | undefined, source: T) => T = (_keeper, source) =>
    _keeper !== undefined ? _keeper : source
): Record<string, T> {
  const source = map[sourceId];
  const next = { ...map };
  if (source !== undefined) {
    next[keeperId] = merge(map[keeperId], source);
  }
  delete next[sourceId];
  return next;
}

export function mergeRestMemory(
  keeper: MergeRestMemory | undefined,
  source: MergeRestMemory
): MergeRestMemory {
  const work = keeper?.work ?? source.work;
  const warmup = keeper?.warmup ?? source.warmup;
  return {
    ...(work != null ? { work } : {}),
    ...(warmup != null ? { warmup } : {}),
  };
}

function mergeNotes(keeper?: string, source?: string): string | undefined {
  const keep = keeper?.trim();
  if (keep) return keeper;
  const from = source?.trim();
  return from ? source : keep ? keeper : source;
}

/**
 * Source card becomes the keeper, or vanishes if the keeper is
 * already in the list — sets travel. Nothing is dropped.
 */
export function mergeExerciseCards<
  T extends { exerciseId: string; sets: unknown[]; note?: string },
>(exercises: readonly T[], sourceId: string, keeperId: string): T[] {
  const sourceIdx = exercises.findIndex((ex) => ex.exerciseId === sourceId);
  if (sourceIdx < 0) return [...exercises];
  const keeperIdx = exercises.findIndex((ex) => ex.exerciseId === keeperId);
  const source = exercises[sourceIdx];
  if (!source) return [...exercises];
  if (keeperIdx >= 0) {
    const keeper = exercises[keeperIdx];
    if (!keeper) return [...exercises];
    const merged = {
      ...keeper,
      sets: [...keeper.sets, ...source.sets],
      ...(mergeNotes(keeper.note, source.note) !== undefined
        ? { note: mergeNotes(keeper.note, source.note) }
        : {}),
    };
    return exercises
      .map((ex, i) => (i === keeperIdx ? merged : ex))
      .filter((_, i) => i !== sourceIdx);
  }
  return exercises.map((ex, i) =>
    i === sourceIdx ? { ...ex, exerciseId: keeperId } : ex
  );
}

function rewriteHistory(
  history: readonly CompletedWorkoutLog[],
  sourceId: string,
  keeperId: string,
  now: string
): CompletedWorkoutLog[] {
  return history.map((log) => {
    const before = log.exercises ?? [];
    const exercises = mergeExerciseCards(before, sourceId, keeperId);
    const changed =
      exercises.length !== before.length ||
      exercises.some((ex, i) => ex !== before[i]);
    if (!changed) return log;
    return {
      ...log,
      exercises,
      revision: (typeof log.revision === 'number' ? log.revision : 1) + 1,
      updatedAt: now,
    };
  });
}

function rewriteSaved(
  saved: readonly SavedWorkout[],
  sourceId: string,
  keeperId: string
): SavedWorkout[] {
  return saved.map((row) => {
    const before = row.exercises ?? [];
    const exercises = mergeExerciseCards(before, sourceId, keeperId);
    const changed =
      exercises.length !== before.length ||
      exercises.some((ex, i) => ex !== before[i]);
    if (!changed) return row;
    return { ...row, exercises };
  });
}

function dropCustomSource(
  customs: readonly NamedCustom[],
  sourceId: string
): NamedCustom[] {
  return customs.filter((row) => row.id !== sourceId);
}

export function applyMergeExercises(input: {
  sourceId: unknown;
  keeperId: unknown;
  knownIds: Iterable<string>;
  history: readonly CompletedWorkoutLog[];
  live?: readonly ActiveExerciseLog[] | null;
  customs?: readonly NamedCustom[];
  saved?: readonly SavedWorkout[];
  rest?: Record<string, MergeRestMemory>;
  pins?: Record<string, string>;
  tempo?: Record<string, SetTempo>;
  now?: string;
}): MergeExerciseApply | null {
  const decision = decideMergeExercises({
    sourceId: input.sourceId,
    keeperId: input.keeperId,
    knownIds: input.knownIds,
  });
  if (decision.kind !== 'needs-confirm') return null;
  const { sourceId, keeperId } = decision;
  const now = input.now ?? new Date().toISOString();
  return {
    history: rewriteHistory(input.history, sourceId, keeperId, now),
    live: input.live ? mergeExerciseCards(input.live, sourceId, keeperId) : null,
    customs: dropCustomSource(input.customs ?? [], sourceId),
    saved: rewriteSaved(input.saved ?? [], sourceId, keeperId),
    rest: transferKeyedPref(input.rest ?? {}, sourceId, keeperId, mergeRestMemory),
    pins: transferKeyedPref(input.pins ?? {}, sourceId, keeperId),
    tempo: transferKeyedPref(input.tempo ?? {}, sourceId, keeperId),
  };
}

function parseRestMemory(value: unknown): MergeRestMemory | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return { work: value };
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const work = typeof raw.work === 'number' && raw.work > 0 ? raw.work : undefined;
  const warmup = typeof raw.warmup === 'number' && raw.warmup > 0 ? raw.warmup : undefined;
  if (work == null && warmup == null) return null;
  return {
    ...(work != null ? { work } : {}),
    ...(warmup != null ? { warmup } : {}),
  };
}

function readRestMap(): Record<string, MergeRestMemory> {
  const raw = readJson<unknown>(STORAGE_KEYS.lastRestByExercise, {});
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, MergeRestMemory> = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    const parsed = parseRestMemory(value);
    if (id.trim() && parsed) out[id.trim()] = parsed;
  }
  return out;
}

function readPinMap(): Record<string, string> {
  const raw = readJson<unknown>(STORAGE_KEYS.pinnedNoteByExercise, {});
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, string> = {};
  for (const [id, text] of Object.entries(raw as Record<string, unknown>)) {
    const key = id.trim();
    const kept = typeof text === 'string' ? text.trim() : '';
    if (key && kept) out[key] = kept;
  }
  return out;
}

function readTempoMap(): Record<string, SetTempo> {
  const raw = readJson<unknown>(STORAGE_KEYS.lastTempoByExercise, {});
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, SetTempo> = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    const row = value as Record<string, unknown>;
    const ecc = Number(row.ecc);
    const pause = Number(row.pause);
    const con = Number(row.con);
    if (![ecc, pause, con].every((n) => Number.isInteger(n) && n >= 0 && n <= 9)) {
      continue;
    }
    const key = id.trim();
    if (key) out[key] = { ecc, pause, con };
  }
  return out;
}

export function loadMergePrefMaps(): {
  rest: Record<string, MergeRestMemory>;
  pins: Record<string, string>;
  tempo: Record<string, SetTempo>;
} {
  return { rest: readRestMap(), pins: readPinMap(), tempo: readTempoMap() };
}

export function loadMergePrefIds(): string[] {
  const maps = loadMergePrefMaps();
  return [
    ...Object.keys(maps.rest),
    ...Object.keys(maps.pins),
    ...Object.keys(maps.tempo),
  ];
}

export function persistMergedPrefs(next: {
  rest: Record<string, MergeRestMemory>;
  pins: Record<string, string>;
  tempo: Record<string, SetTempo>;
}): void {
  writeJson(STORAGE_KEYS.lastRestByExercise, next.rest);
  writeJson(STORAGE_KEYS.pinnedNoteByExercise, next.pins);
  writeJson(STORAGE_KEYS.lastTempoByExercise, next.tempo);
}

export function persistMergedCustoms(rows: readonly NamedCustom[]): void {
  saveCustomExercises(rows);
}

export function knownIdsForMerge(input: {
  catalog?: readonly { id: string }[];
  customs?: readonly { id: string }[];
  history?: readonly CompletedWorkoutLog[];
  live?: readonly { exerciseId: string }[] | null;
  saved?: readonly { exercises: readonly { exerciseId: string }[] }[];
}): string[] {
  return collectKnownExerciseIds({
    catalog: input.catalog ?? EXERCISES,
    customs: input.customs ?? loadCustomExercises(),
    history: input.history,
    live: input.live,
    saved: input.saved,
    prefIds: loadMergePrefIds(),
  });
}

export type MergeCandidate = { id: string; name: string };

/** Identities they can pick. Never invents a lookalike pair. */
export function listMergeCandidates(input: {
  catalog?: readonly { id: string; name: string }[];
  customs?: readonly { id: string; name: string }[];
  history?: readonly CompletedWorkoutLog[];
  live?: readonly { exerciseId: string }[] | null;
  saved?: readonly { exercises: readonly { exerciseId: string }[] }[];
}): MergeCandidate[] {
  const catalog = input.catalog ?? EXERCISES;
  const customs = input.customs ?? loadCustomExercises();
  const ids = collectKnownExerciseIds({
    catalog,
    customs,
    history: input.history,
    live: input.live,
    saved: input.saved,
    prefIds: loadMergePrefIds(),
  });
  const used = new Set<string>();
  for (const log of input.history ?? []) {
    for (const ex of log.exercises ?? []) {
      const id = normalizeMergeId(ex.exerciseId);
      if (id) used.add(id);
    }
  }
  for (const ex of input.live ?? []) {
    const id = normalizeMergeId(ex.exerciseId);
    if (id) used.add(id);
  }
  for (const row of input.saved ?? []) {
    for (const ex of row.exercises ?? []) {
      const id = normalizeMergeId(ex.exerciseId);
      if (id) used.add(id);
    }
  }
  const out: MergeCandidate[] = [];
  const seen = new Set<string>();
  const push = (id: string, name: string) => {
    if (!id || seen.has(id)) return;
    seen.add(id);
    out.push({ id, name });
  };
  for (const row of customs) {
    if (ids.includes(row.id)) push(row.id, row.name);
  }
  for (const id of used) {
    if (isCustomExerciseId(id) && seen.has(id)) continue;
    push(
      id,
      customs.find((row) => row.id === id)?.name ??
        catalog.find((row) => row.id === id)?.name ??
        exerciseDisplayName(id) ??
        id
    );
  }
  for (const row of catalog) {
    push(row.id, row.name);
  }
  return out;
}

export function filterMergeCandidates(
  rows: readonly MergeCandidate[],
  query: string
): MergeCandidate[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...rows];
  return rows.filter(
    (row) =>
      row.name.toLowerCase().includes(q) || row.id.toLowerCase().includes(q)
  );
}
