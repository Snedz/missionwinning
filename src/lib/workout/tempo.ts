/**
 * Optional set tempo — eccentric / pause / concentric seconds (`.734`).
 *
 * Display is `e-p-c` (e.g. `3-1-1`). Each phase is an integer 0–9. Empty is
 * valid. Tempo never blocks Log set and never feeds coach load / rewards.
 */

import type { SetTempo } from '@/types';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';

export const TEMPO_MIN = 0;
export const TEMPO_MAX = 9;
export const LAST_TEMPO_CAP = 80;

const TEMPO_STRING_RE = /^[0-9]-[0-9]-[0-9]$/;

function phaseOk(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= TEMPO_MIN && n <= TEMPO_MAX;
}

function asTempo(ecc: unknown, pause: unknown, con: unknown): SetTempo | undefined {
  if (!phaseOk(ecc) || !phaseOk(pause) || !phaseOk(con)) return undefined;
  return { ecc, pause, con };
}

/**
 * Boundary parse. Empty / omitted → `undefined`. Out of range, 4-count strings,
 * bare `311`, and NaN are dropped — never clamped into a tempo the athlete
 * did not give.
 */
export function parseOptionalTempo(value: unknown): SetTempo | undefined {
  if (value == null) return undefined;
  if (typeof value === 'boolean' || typeof value === 'number') return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim().replace(/[–—]/g, '-').replace(/\//g, '-');
    if (trimmed === '') return undefined;
    if (!TEMPO_STRING_RE.test(trimmed)) return undefined;
    const [ecc, pause, con] = trimmed.split('-').map((p) => Number(p));
    return asTempo(ecc, pause, con);
  }
  if (typeof value !== 'object' || Array.isArray(value)) return undefined;
  const o = value as Record<string, unknown>;
  return asTempo(o.ecc, o.pause, o.con);
}

export function formatTempo(tempo: SetTempo): string {
  return `${tempo.ecc}-${tempo.pause}-${tempo.con}`;
}

export function temposEqual(a: SetTempo | undefined, b: SetTempo | undefined): boolean {
  if (!a || !b) return a === b;
  return a.ecc === b.ecc && a.pause === b.pause && a.con === b.con;
}

function readMap(): Record<string, SetTempo> {
  const raw = readJson<Record<string, unknown>>(STORAGE_KEYS.lastTempoByExercise, {});
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, SetTempo> = {};
  for (const [id, value] of Object.entries(raw)) {
    const tempo = parseOptionalTempo(value);
    if (id && tempo) out[id] = tempo;
  }
  return out;
}

export function rememberLastTempo(exerciseId: string, tempo: SetTempo): void {
  const parsed = parseOptionalTempo(tempo);
  if (!exerciseId.trim() || !parsed) return;
  const next = readMap();
  delete next[exerciseId];
  next[exerciseId] = parsed;
  const ids = Object.keys(next);
  if (ids.length > LAST_TEMPO_CAP) {
    for (const id of ids.slice(0, ids.length - LAST_TEMPO_CAP)) delete next[id];
  }
  writeJson(STORAGE_KEYS.lastTempoByExercise, next);
}

export function recallLastTempo(exerciseId: string): SetTempo | undefined {
  if (!exerciseId) return undefined;
  return readMap()[exerciseId];
}

type TempoSet = { completed?: boolean; tempo?: SetTempo };
type TempoExercise = { exerciseId: string; sets: TempoSet[] };
type TempoHistory = { exercises: TempoExercise[] };

function lastTempoInSets(sets: readonly TempoSet[] | undefined): SetTempo | undefined {
  if (!sets) return undefined;
  for (let i = sets.length - 1; i >= 0; i--) {
    const tempo = parseOptionalTempo(sets[i]?.tempo);
    if (tempo) return tempo;
  }
  return undefined;
}

/**
 * Prefill order: last completed set of this exercise in the live session →
 * device map → newest history set with a tempo.
 */
export function lastTempoForExercise(
  exerciseId: string,
  sessionSets?: readonly TempoSet[],
  history?: readonly TempoHistory[]
): SetTempo | undefined {
  const fromSession = lastTempoInSets(sessionSets);
  if (fromSession) return fromSession;
  const remembered = recallLastTempo(exerciseId);
  if (remembered) return remembered;
  if (!history) return undefined;
  for (const log of history) {
    for (const ex of log.exercises ?? []) {
      if (ex.exerciseId !== exerciseId) continue;
      const found = lastTempoInSets(ex.sets);
      if (found) return found;
    }
  }
  return undefined;
}
