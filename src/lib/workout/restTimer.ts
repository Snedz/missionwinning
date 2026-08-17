/**
 * Rest timer helpers — set-table-style smart defaults.
 *
 * `.292` — one fallback everywhere. The store used to default `startRestTimer()`
 * to **30s** while this module and the rest dock initial state used **90s**. A
 * bare `startRestTimer()` (or a future caller that omits seconds) was half a
 * the set-table logger rest — wrong for compounds and inconsistent with the preset strip.
 */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, readRaw, writeJson, writeRaw } from '@/lib/storage/safeStorage';

export const REST_PRESETS = [60, 90, 120, 180] as const;
export type RestPreset = (typeof REST_PRESETS)[number];

/** Single fallback when no user preset and no exercise suggestion applies. */
export const FALLBACK_REST_SECONDS = 90;

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

/** Pick rest duration: user default, or exercise-specific if longer. */
export function resolveRestSeconds(exerciseName: string): number {
  const suggested = getSuggestedRestSeconds(exerciseName);
  const userDefault = loadDefaultRestSeconds();
  return Math.max(suggested, userDefault);
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

function readLastRestMap(): Record<string, number> {
  const raw = readJson<unknown>(LAST_REST_KEY, {});
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, number> = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'number') out[id] = value;
  }
  return out;
}

/** Persist last chosen rest for an exercise. No-op on empty id or non-finite seconds. */
export function rememberLastRest(exerciseId: string, seconds: number): void {
  const id = exerciseId.trim();
  if (!id) return;
  const sec = clampLastRestSeconds(seconds);
  if (sec == null) return;
  const map = readLastRestMap();
  delete map[id];
  map[id] = sec;
  const keys = Object.keys(map);
  if (keys.length > LAST_REST_MAX_EXERCISES) {
    for (const stale of keys.slice(0, keys.length - LAST_REST_MAX_EXERCISES)) {
      delete map[stale];
    }
  }
  writeJson(LAST_REST_KEY, map);
}

/** Stored last rest for this exercise, or null when none / corrupt. */
export function recallLastRest(exerciseId: string): number | null {
  const id = exerciseId.trim();
  if (!id) return null;
  return clampLastRestSeconds(readLastRestMap()[id] ?? NaN);
}

/**
 * Next rest: last rest for this exercise wins; else name heuristic ∪ session default.
 */
export function resolveRestForNextSet(params: {
  exerciseId?: string;
  exerciseName?: string;
}): number {
  if (params.exerciseId) {
    const last = recallLastRest(params.exerciseId);
    if (last != null) return last;
  }
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
