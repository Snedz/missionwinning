/**
 * Rest timer helpers — set-table-style smart defaults.
 *
 * `.292` — one fallback everywhere. The store used to default `startRestTimer()`
 * to **30s** while this module and the rest dock initial state used **90s**. A
 * bare `startRestTimer()` (or a future caller that omits seconds) was half a
 * the set-table logger rest — wrong for compounds and inconsistent with the preset strip.
 *
 * `.995` — rest duration lives on the exercise. Two lanes: warmup and work.
 * A stored number is work (legacy). Warmup never inherits the work 3:00.
 */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, readRaw, writeJson, writeRaw } from '@/lib/storage/safeStorage';

export const REST_PRESETS = [60, 90, 120, 180] as const;
export type RestPreset = (typeof REST_PRESETS)[number];

/** Work vs warmup rest on one lift (`.995`). Drop still zeros. */
export type RestLane = 'work' | 'warmup';

/** Warmup rest when that lane has never been set — never the work 3:00. */
export const WARMUP_FALLBACK_SECONDS = 60;

/** Single fallback when no user preset and no exercise suggestion applies. */
export const FALLBACK_REST_SECONDS = 90;

/** Warmup sets rest the warmup lane; everything else (incl. failure) is work. */
export function restLaneFromKind(kind: string | undefined): RestLane {
  return kind === 'warmup' ? 'warmup' : 'work';
}

const DEFAULT_REST_KEY = STORAGE_KEYS.defaultRestSec;
const LAST_REST_KEY = STORAGE_KEYS.lastRestByExercise;

/** Drop oldest ids when the per-exercise map would grow without bound. */
export const LAST_REST_MAX_EXERCISES = 80;

const LAST_REST_MIN_SECONDS = 15;
const LAST_REST_MAX_SECONDS = 600;

const COMPOUND_KEYWORDS = ['squat', 'deadlift', 'bench', 'press', 'row', 'pullup', 'pull-up', 'clean', 'snatch'];

const ISOLATION_KEYWORDS = ['curl', 'raise', 'fly', 'extension', 'kickback', 'crunch'];

/** Suggested rest seconds based on exercise name heuristics. */
export function getSuggestedRestSeconds(exerciseName: string): number {
  const name = exerciseName.toLowerCase();
  if (COMPOUND_KEYWORDS.some((k) => name.includes(k))) return 180;
  if (ISOLATION_KEYWORDS.some((k) => name.includes(k))) return 60;
  return FALLBACK_REST_SECONDS;
}

export function loadDefaultRestSeconds(): number {
  const raw = readRaw(DEFAULT_REST_KEY);
  const n = raw ? parseInt(raw, 10) : NaN;
  if (Number.isFinite(n) && n >= 15 && n <= 600) return n;
  return FALLBACK_REST_SECONDS;
}

export function saveDefaultRestSeconds(seconds: number): void {
  writeRaw(DEFAULT_REST_KEY, String(Math.max(15, Math.min(600, seconds))));
}

/**
 * Work-rest fallback when this lift has no stored work lane.
 * Named compound / isolation hints win. Global default is only the
 * fallback for names without a hint — not a second home (`.995`).
 */
export function resolveRestSeconds(exerciseName: string): number {
  const suggested = getSuggestedRestSeconds(exerciseName);
  if (suggested !== FALLBACK_REST_SECONDS) return suggested;
  return loadDefaultRestSeconds();
}

/**
 * Seconds to start the dock with.
 * Explicit positive duration wins (capped, not floored — short rests are valid);
 * otherwise the athlete's saved default (or FALLBACK_REST_SECONDS).
 */
export function resolveStartRestSeconds(seconds?: number): number {
  if (typeof seconds === 'number' && Number.isFinite(seconds) && seconds > 0) {
    return Math.min(600, Math.max(1, Math.round(seconds)));
  }
  return loadDefaultRestSeconds();
}

export function formatRestClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m <= 0) return `${s}s`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function restProgress(initialSeconds: number, remaining: number): number {
  if (initialSeconds <= 0) return 0;
  return Math.max(0, Math.min(1, remaining / initialSeconds));
}

/**
 * Outdoor glance: last seconds before "Go" should read as urgency without
 * reading the digits (accent on ink ground). Pure so RestTimerBar and tests
 * share one threshold.
 */
export const REST_FINAL_SECONDS = 10;

export function isRestFinalSeconds(remaining: number): boolean {
  return Number.isFinite(remaining) && remaining > 0 && remaining <= REST_FINAL_SECONDS;
}

/** Final-seconds dock: hide preset chips so Skip is the only bright CTA. */
export function shouldShowRestPresets(remaining: number): boolean {
  return !isRestFinalSeconds(remaining);
}

/**
 * When rest ends (skip or timer hit 0), re-scroll the next set into view —
 * nextSet identity often does not change, so the nextSet effect alone won't fire.
 */
export function shouldScrollAfterRestEnds(wasActive: boolean, isActive: boolean): boolean {
  return wasActive === true && isActive === false;
}

/** Active log rest: named exercise uses shared resolver, else the 90s fallback. */
export function restSecondsForExercise(exerciseName: string | undefined, fallback = 90): number {
  return exerciseName ? resolveRestSeconds(exerciseName) : fallback;
}

function clampLastRestSeconds(seconds: number): number | null {
  if (!Number.isFinite(seconds)) return null;
  return Math.max(LAST_REST_MIN_SECONDS, Math.min(LAST_REST_MAX_SECONDS, Math.round(seconds)));
}

type ExerciseRestMemory = { work?: number; warmup?: number };

function parseRestMemory(value: unknown): ExerciseRestMemory | null {
  if (typeof value === 'number') {
    const work = clampLastRestSeconds(value);
    return work == null ? null : { work };
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const work = typeof raw.work === 'number' ? clampLastRestSeconds(raw.work) : null;
  const warmup = typeof raw.warmup === 'number' ? clampLastRestSeconds(raw.warmup) : null;
  if (work == null && warmup == null) return null;
  return {
    ...(work != null ? { work } : {}),
    ...(warmup != null ? { warmup } : {}),
  };
}

function readLastRestMap(): Record<string, ExerciseRestMemory> {
  const raw = readJson<unknown>(LAST_REST_KEY, {});
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, ExerciseRestMemory> = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    const parsed = parseRestMemory(value);
    if (parsed) out[id] = parsed;
  }
  return out;
}

function writeLastRestMap(map: Record<string, ExerciseRestMemory>): void {
  const keys = Object.keys(map);
  if (keys.length > LAST_REST_MAX_EXERCISES) {
    for (const stale of keys.slice(0, keys.length - LAST_REST_MAX_EXERCISES)) {
      delete map[stale];
    }
  }
  writeJson(LAST_REST_KEY, map);
}

/** Persist last chosen rest for an exercise lane. No-op on empty id or non-finite seconds. */
export function rememberLastRest(
  exerciseId: string,
  seconds: number,
  lane: RestLane = 'work'
): void {
  const id = exerciseId.trim();
  if (!id) return;
  const sec = clampLastRestSeconds(seconds);
  if (sec == null) return;
  const map = readLastRestMap();
  const prev = map[id] ?? {};
  delete map[id];
  map[id] = { ...prev, [lane]: sec };
  writeLastRestMap(map);
}

/** Stored last rest for this exercise lane, or null when none / corrupt. */
export function recallLastRest(exerciseId: string, lane: RestLane = 'work'): number | null {
  const id = exerciseId.trim();
  if (!id) return null;
  const mem = readLastRestMap()[id];
  if (!mem) return null;
  return mem[lane] ?? null;
}

/**
 * Next rest: last rest for this exercise + lane wins.
 * Work falls back to name heuristic ∪ session default.
 * Warmup falls back to 60s — never the work 3:00 (`.995`).
 */
export function resolveRestForNextSet(params: {
  exerciseId?: string;
  exerciseName?: string;
  lane?: RestLane;
}): number {
  const lane = params.lane ?? 'work';
  if (params.exerciseId) {
    const last = recallLastRest(params.exerciseId, lane);
    if (last != null) return last;
  }
  if (lane === 'warmup') return WARMUP_FALLBACK_SECONDS;
  return restSecondsForExercise(params.exerciseName);
}

/** Skip / stop never persist leftover seconds. Named so the skip test cannot be vacuous. */
export function shouldRememberRestOnSkip(): boolean {
  return false;
}

/**
 * +15s that grows the started duration → remember the new remaining.
 * Mid-countdown +15s below the initial does not rewrite last rest.
 */
export function rememberedRestAfterAdjust(params: {
  previousInitial: number;
  nextRemaining: number;
}): number | null {
  if (!Number.isFinite(params.nextRemaining) || !Number.isFinite(params.previousInitial)) {
    return null;
  }
  if (params.nextRemaining > params.previousInitial) {
    return clampLastRestSeconds(params.nextRemaining);
  }
  return null;
}
