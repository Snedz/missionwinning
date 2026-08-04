/**
 * Rest timer helpers — Strong/Hevy-style smart defaults.
 *
 * `.292` — one fallback everywhere. The store used to default `startRestTimer()`
 * to **30s** while this module and the rest dock initial state used **90s**. A
 * bare `startRestTimer()` (or a future caller that omits seconds) was half a
 * Hevy rest — wrong for compounds and inconsistent with the preset strip.
 */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';

export const REST_PRESETS = [60, 90, 120, 180] as const;
export type RestPreset = (typeof REST_PRESETS)[number];

/** Single fallback when no user preset and no exercise suggestion applies. */
export const FALLBACK_REST_SECONDS = 90;

const DEFAULT_REST_KEY = STORAGE_KEYS.defaultRestSec;

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

/** Active log rest: named exercise uses shared resolver, else the 90s fallback. */
export function restSecondsForExercise(exerciseName: string | undefined, fallback = 90): number {
  return exerciseName ? resolveRestSeconds(exerciseName) : fallback;
}
