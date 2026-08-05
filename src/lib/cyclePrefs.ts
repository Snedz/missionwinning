/**
 * Opt-in menstrual-cycle coaching preferences — local-first, educational only.
 *
 * Not medical diagnosis, fertility tracking, or a gate on free logging.
 * Off by default. Soft readiness bias only when enabled with a period start date.
 */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';
import { localDateKey } from '@/lib/time/localDate';

export const CYCLE_PREFS_KEY = STORAGE_KEYS.cyclePrefs;

export type CyclePrefs = {
  enabled: boolean;
  /** Local YYYY-MM-DD of last period start. */
  lastPeriodStart?: string;
  /** Typical cycle length in days, clamped 21–45. Default 28 when estimating. */
  typicalLengthDays?: number;
};

export type CyclePhase =
  | 'menstrual'
  | 'follicular'
  | 'ovulatory'
  | 'luteal'
  | 'unknown';

const DEFAULT_LENGTH = 28;
const MIN_LENGTH = 21;
const MAX_LENGTH = 45;

export function defaultCyclePrefs(): CyclePrefs {
  return { enabled: false };
}

function isDateKey(s: unknown): s is string {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function clampCycleLength(n: unknown): number {
  if (typeof n !== 'number' || !Number.isFinite(n)) return DEFAULT_LENGTH;
  return Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, Math.round(n)));
}

export function normalizeCyclePrefs(raw: unknown): CyclePrefs {
  if (!raw || typeof raw !== 'object') return defaultCyclePrefs();
  const o = raw as Record<string, unknown>;
  const prefs: CyclePrefs = {
    enabled: o.enabled === true,
  };
  if (isDateKey(o.lastPeriodStart)) prefs.lastPeriodStart = o.lastPeriodStart;
  if (o.typicalLengthDays != null) prefs.typicalLengthDays = clampCycleLength(o.typicalLengthDays);
  return prefs;
}

export function loadCyclePrefs(): CyclePrefs {
  return normalizeCyclePrefs(readJson<unknown>(CYCLE_PREFS_KEY, null));
}

export function saveCyclePrefs(prefs: CyclePrefs): boolean {
  return writeJson(CYCLE_PREFS_KEY, normalizeCyclePrefs(prefs));
}

/**
 * Day index within the cycle (1-based), or null when estimation is impossible.
 * Pure: inject `todayKey` for tests (no date literals in fixtures — relative only).
 */
export function cycleDayIndex(
  prefs: CyclePrefs,
  todayKey: string = localDateKey()
): number | null {
  if (!prefs.enabled || !prefs.lastPeriodStart || !isDateKey(todayKey)) return null;
  const start = parseLocalDateKey(prefs.lastPeriodStart);
  const today = parseLocalDateKey(todayKey);
  if (!start || !today) return null;
  const ms = today.getTime() - start.getTime();
  if (ms < 0) return null;
  const length = clampCycleLength(prefs.typicalLengthDays ?? DEFAULT_LENGTH);
  const dayOffset = Math.floor(ms / 86_400_000);
  return (dayOffset % length) + 1;
}

/**
 * Educational heuristic phase windows (not clinical staging):
 * days 1–5 menstrual, 6–13 follicular, 14–16 ovulatory, 17–end luteal.
 */
export function estimateCyclePhase(
  prefs: CyclePrefs,
  todayKey: string = localDateKey()
): CyclePhase {
  const day = cycleDayIndex(prefs, todayKey);
  if (day == null) return 'unknown';
  if (day <= 5) return 'menstrual';
  if (day <= 13) return 'follicular';
  if (day <= 16) return 'ovulatory';
  return 'luteal';
}

/**
 * Soft readiness bias for coach body scores (capped, educational).
 * Menstrual −8, late luteal (day ≥ length − 3) −5, else 0.
 * Composes with mind check-in ±15; never replaces history-based readiness.
 */
export function cycleReadinessBias(
  prefs: CyclePrefs,
  todayKey: string = localDateKey()
): number {
  const day = cycleDayIndex(prefs, todayKey);
  if (day == null) return 0;
  const length = clampCycleLength(prefs.typicalLengthDays ?? DEFAULT_LENGTH);
  const phase = estimateCyclePhase(prefs, todayKey);
  if (phase === 'menstrual') return -8;
  if (phase === 'luteal' && day >= length - 3) return -5;
  return 0;
}

/** i18n key for optional Today / coach cue copy. */
export function cycleCueMessageKey(phase: CyclePhase): string | null {
  switch (phase) {
    case 'menstrual':
      return 'cycleCueMenstrual';
    case 'follicular':
      return 'cycleCueFollicular';
    case 'ovulatory':
      return 'cycleCueOvulatory';
    case 'luteal':
      return 'cycleCueLuteal';
    default:
      return null;
  }
}

export function cyclePhaseLabelKey(phase: CyclePhase): string {
  switch (phase) {
    case 'menstrual':
      return 'cyclePhaseMenstrual';
    case 'follicular':
      return 'cyclePhaseFollicular';
    case 'ovulatory':
      return 'cyclePhaseOvulatory';
    case 'luteal':
      return 'cyclePhaseLuteal';
    default:
      return 'cyclePhaseUnknown';
  }
}

function parseLocalDateKey(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) {
    return null;
  }
  return date;
}
