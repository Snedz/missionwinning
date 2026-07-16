/** Rest timer helpers — Strong/Hevy-style smart defaults. */

export const REST_PRESETS = [60, 90, 120, 180] as const;
export type RestPreset = (typeof REST_PRESETS)[number];

const DEFAULT_REST_KEY = 'mw_default_rest_sec';

const COMPOUND_KEYWORDS = ['squat', 'deadlift', 'bench', 'press', 'row', 'pullup', 'pull-up', 'clean', 'snatch'];

const ISOLATION_KEYWORDS = ['curl', 'raise', 'fly', 'extension', 'kickback', 'crunch'];

/** Suggested rest seconds based on exercise name heuristics. */
export function getSuggestedRestSeconds(exerciseName: string): number {
  const name = exerciseName.toLowerCase();
  if (COMPOUND_KEYWORDS.some((k) => name.includes(k))) return 180;
  if (ISOLATION_KEYWORDS.some((k) => name.includes(k))) return 60;
  return 90;
}

export function loadDefaultRestSeconds(): number {
  if (typeof window === 'undefined') return 90;
  try {
    const raw = localStorage.getItem(DEFAULT_REST_KEY);
    const n = raw ? parseInt(raw, 10) : NaN;
    if (Number.isFinite(n) && n >= 15 && n <= 600) return n;
  } catch {
    /* ignore */
  }
  return 90;
}

export function saveDefaultRestSeconds(seconds: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEFAULT_REST_KEY, String(Math.max(15, Math.min(600, seconds))));
}

/** Pick rest duration: user default, or exercise-specific if longer. */
export function resolveRestSeconds(exerciseName: string): number {
  const suggested = getSuggestedRestSeconds(exerciseName);
  const userDefault = loadDefaultRestSeconds();
  return Math.max(suggested, userDefault);
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
