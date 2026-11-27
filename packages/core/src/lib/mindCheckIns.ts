/**
 * Daily mind / readiness check-ins — device storage is the single source of truth.
 * Shared by Mind DailyCheckIn + Active session pre-check sheet.
 */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';
import { mergeBehaviors, normalizeBehaviors, type BehaviorEntry } from '@/lib/behaviors';
import { localDateKey } from '@/lib/time/localDate';

export const MIND_CHECKINS_KEY = STORAGE_KEYS.mindCheckIns;
/**
 * Ninety days, not thirty.
 *
 * Behavior correlations need paired observations on both sides of a split, and
 * at three or four sessions a week a thirty-day window can never reach the
 * threshold — the feature would have silently promised something the storage
 * cap made impossible. Local-only data; the cost of the larger window is a few
 * kilobytes.
 */
const MAX_ENTRIES = 90;

export type MindCheckIn = {
  date: string; // YYYY-MM-DD local
  sleep: number; // 1–5
  mood: number;
  stress: number;
  energy: number;
  /** Optional muscle soreness 1–5 (Wave 11). */
  soreness?: number;
  /**
   * The behavior journal for this day (`.190`) — counts, times and yes/no
   * answers, which is why it cannot live among the 1–5 ratings above.
   */
  behaviors?: BehaviorEntry;
  note?: string;
};

/** Local calendar date — one implementation, in `time/localDate.ts`. */
export function todayCheckInDate(now = new Date()): string {
  return localDateKey(now);
}

function clampRating(n: number): number {
  if (!Number.isFinite(n)) return 3;
  return Math.min(5, Math.max(1, Math.round(n)));
}

/**
 * Rebuilds a check-in field by field — and that is the hazard worth naming.
 *
 * This is a **whitelist**, not a spread, and `loadCheckIns` maps every stored
 * entry through it. A field that exists in storage but is not named here is
 * destroyed on the next read, with no error anywhere. `upsertTodayPartial`
 * below has the same property. Adding a field means editing both.
 */
export function normalizeCheckIn(raw: Partial<MindCheckIn> & { date: string }): MindCheckIn {
  return {
    date: raw.date,
    sleep: clampRating(raw.sleep ?? 3),
    mood: clampRating(raw.mood ?? 3),
    stress: clampRating(raw.stress ?? 3),
    energy: clampRating(raw.energy ?? 3),
    soreness:
      raw.soreness != null && Number.isFinite(raw.soreness)
        ? clampRating(raw.soreness)
        : undefined,
    // Not clampRating: behaviors are counts, times and booleans. Zero servings
    // is a real answer, and the 1–5 clamp would rewrite it to 1.
    behaviors: normalizeBehaviors(raw.behaviors),
    note: raw.note?.trim() || undefined,
  };
}

export function loadCheckIns(): MindCheckIn[] {
  const all = readJson<MindCheckIn[]>(MIND_CHECKINS_KEY, []);
  if (!Array.isArray(all)) return [];
  return all.filter((c) => c && typeof c.date === 'string').map((c) => normalizeCheckIn(c));
}

export function getTodayCheckIn(now = new Date()): MindCheckIn | null {
  const today = todayCheckInDate(now);
  return loadCheckIns().find((c) => c.date === today) ?? null;
}

/** True when today's entry has the core fields (session sheet can treat as done). */
export function isTodayCheckInComplete(now = new Date()): boolean {
  const t = getTodayCheckIn(now);
  if (!t) return false;
  return [t.sleep, t.mood, t.stress, t.energy].every((n) => n >= 1 && n <= 5);
}

export function saveCheckIn(data: MindCheckIn): MindCheckIn {
  const normalized = normalizeCheckIn(data);
  const all = loadCheckIns().filter((c) => c.date !== normalized.date);
  writeJson(MIND_CHECKINS_KEY, [normalized, ...all].slice(0, MAX_ENTRIES));
  return normalized;
}

/**
 * Merge partial fields into today's check-in (creates if missing).
 * Session sheet uses this for soreness/sleep/motivation without wiping mood/stress.
 *
 * Same whitelist hazard as `normalizeCheckIn`: this enumerates every field it
 * preserves. A victory-sheet reply chip writes one energy rating through here,
 * so an unlisted field would be erased by a tap the athlete makes hours after
 * logging it.
 */
export function upsertTodayPartial(
  partial: Partial<Omit<MindCheckIn, 'date'>>,
  now = new Date()
): MindCheckIn {
  const today = todayCheckInDate(now);
  const existing = getTodayCheckIn(now);
  return saveCheckIn(
    normalizeCheckIn({
      date: today,
      sleep: partial.sleep ?? existing?.sleep ?? 3,
      mood: partial.mood ?? existing?.mood ?? 3,
      stress: partial.stress ?? existing?.stress ?? 3,
      energy: partial.energy ?? existing?.energy ?? 3,
      soreness: partial.soreness ?? existing?.soreness,
      behaviors: mergeBehaviors(partial.behaviors, existing?.behaviors),
      note: partial.note !== undefined ? partial.note : existing?.note,
    })
  );
}

/**
 * Subjective readiness delta in points, clamped to ±maxAbs.
 * Pure — used by computeBodyScores.
 */
export type ReadinessFactor = 'sleep' | 'soreness' | 'energy' | 'stress';

/** One rule that fired, with what the athlete actually entered. */
export interface ReadinessReason {
  factor: ReadinessFactor;
  /** Signed contribution to the readiness delta. */
  points: number;
  /** The 1–5 they gave — so the UI can say "you rated sleep 2/5". */
  rating: number;
}

type Rule = {
  factor: ReadinessFactor;
  points: number;
  when: (c: ReadinessInput) => boolean;
  rating: (c: ReadinessInput) => number;
};

type ReadinessInput = Pick<MindCheckIn, 'sleep' | 'stress' | 'energy' | 'soreness'>;

/**
 * The single rule table behind both the number and the explanation.
 *
 * `checkInReadinessDelta` and `checkInReasons` are computed from *this*, rather than
 * one restating the other. The whole point of surfacing "session trimmed because you
 * rated sleep 2/5" is that the sentence is true; a threshold duplicated in a UI string
 * is a sentence that goes on being displayed after the rule beneath it changes.
 *
 * Values unchanged from the original inline implementation — this was a refactor to
 * make the reasoning legible, not a re-tuning of the model.
 */
const READINESS_RULES: Rule[] = [
  { factor: 'sleep', points: -6, when: (c) => c.sleep <= 2, rating: (c) => c.sleep },
  { factor: 'sleep', points: +3, when: (c) => c.sleep >= 4, rating: (c) => c.sleep },
  {
    factor: 'soreness',
    points: -6,
    when: (c) => c.soreness != null && c.soreness >= 4,
    rating: (c) => c.soreness ?? 0,
  },
  {
    factor: 'soreness',
    points: +2,
    when: (c) => c.soreness != null && c.soreness <= 2,
    rating: (c) => c.soreness ?? 0,
  },
  { factor: 'energy', points: -4, when: (c) => c.energy <= 2, rating: (c) => c.energy },
  { factor: 'energy', points: +2, when: (c) => c.energy >= 4, rating: (c) => c.energy },
  { factor: 'stress', points: -3, when: (c) => c.stress >= 4, rating: (c) => c.stress },
];

/**
 * Why readiness moved, strongest effect first.
 *
 * Empty when nothing fired — a middling day has no story, and inventing one
 * ("your energy was average!") is noise dressed as insight.
 */
export function checkInReasons(
  checkIn: ReadinessInput | null | undefined
): ReadinessReason[] {
  if (!checkIn) return [];
  return READINESS_RULES.filter((r) => r.when(checkIn))
    .map((r) => ({ factor: r.factor, points: r.points, rating: r.rating(checkIn) }))
    .sort((a, b) => Math.abs(b.points) - Math.abs(a.points));
}

export function checkInReadinessDelta(
  checkIn: ReadinessInput | null | undefined,
  maxAbs = 15
): number {
  const delta = checkInReasons(checkIn).reduce((sum, r) => sum + r.points, 0);
  return Math.min(maxAbs, Math.max(-maxAbs, delta));
}
