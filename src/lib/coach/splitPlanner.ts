import type { MuscleGroup } from '@/lib/muscleGroups';
import { MAJOR_GROUPS } from '@/lib/muscleGroups';
import type { SplitDay } from '@/lib/coach/types';
import { localWeekKey } from '@/lib/time/localDate';

const ALL_GROUPS: MuscleGroup[] = [...MAJOR_GROUPS];

const PUSH: MuscleGroup[] = ['Chest', 'Shoulders', 'Arms'];
const PULL: MuscleGroup[] = ['Back', 'Arms'];
const LEGS: MuscleGroup[] = ['Legs', 'Core'];
const UPPER: MuscleGroup[] = ['Chest', 'Back', 'Shoulders', 'Arms'];
const LOWER: MuscleGroup[] = ['Legs', 'Core'];

function fullBody(): SplitDay {
  return { kind: 'strength', focusGroups: ALL_GROUPS, nameKey: 'coachSessionFullBody' };
}

function recoveryDay(): SplitDay {
  return { kind: 'recovery', focusGroups: ['Core', 'Back'], nameKey: 'coachSessionRecovery' };
}

function conditioningDay(): SplitDay {
  return { kind: 'conditioning', focusGroups: ALL_GROUPS, nameKey: 'coachSessionConditioning' };
}

function pushDay(): SplitDay {
  return { kind: 'strength', focusGroups: PUSH, nameKey: 'coachSessionPush' };
}

function pullDay(): SplitDay {
  return { kind: 'strength', focusGroups: PULL, nameKey: 'coachSessionPull' };
}

function legsDay(): SplitDay {
  return { kind: 'strength', focusGroups: LEGS, nameKey: 'coachSessionLegs' };
}

function upperDay(): SplitDay {
  return { kind: 'strength', focusGroups: UPPER, nameKey: 'coachSessionUpper' };
}

function lowerDay(): SplitDay {
  return { kind: 'strength', focusGroups: LOWER, nameKey: 'coachSessionLower' };
}

function injectRecoveryIfNeeded(
  days: SplitDay[],
  goalId: string,
  assessmentRisk?: string
): SplitDay[] {
  if (goalId !== 'mobility' && assessmentRisk !== 'high') return days;
  const idx = Math.min(2, days.length - 1);
  const copy = [...days];
  copy[idx] = recoveryDay();
  return copy;
}

/** Readiness/strain-aware split adjustments (premium plan depth). */
export function applyFatigueToSplit(
  days: SplitDay[],
  signals?: { readiness: number; strain: number; recovery: number }
): SplitDay[] {
  if (!signals) return days;
  const split = [...days];

  if (signals.readiness < 40 || signals.strain >= 70) {
    const idx = Math.min(1, split.length - 1);
    if (split[idx]?.kind === 'strength') {
      split[idx] = recoveryDay();
    }
  }

  if (signals.strain >= 85) {
    for (let i = split.length - 1; i >= 0; i--) {
      if (split[i].kind === 'strength') {
        split[i] = recoveryDay();
        break;
      }
    }
  }

  return split;
}

function swapConditioningIfNeeded(days: SplitDay[], goalId: string): SplitDay[] {
  if (goalId !== 'endurance' && goalId !== 'fat_loss') return days;
  const copy = [...days];
  const lastIdx = copy.length - 1;
  if (lastIdx >= 0 && copy[lastIdx].kind === 'strength') {
    copy[lastIdx] = conditioningDay();
  }
  return copy;
}

export function chooseSplit(
  daysPerWeek: number,
  experience: string,
  goalId: string,
  assessmentRisk?: string,
  bodySignals?: { readiness: number; strain: number; recovery: number }
): SplitDay[] {
  const d = Math.max(2, Math.min(6, daysPerWeek));
  let split: SplitDay[];

  if (d === 2) {
    split = [fullBody(), fullBody()];
  } else if (d === 3) {
    if (experience === 'beginner') {
      split = [fullBody(), fullBody(), fullBody()];
    } else {
      split = [pushDay(), pullDay(), legsDay()];
    }
  } else if (d === 4) {
    split = [upperDay(), lowerDay(), upperDay(), lowerDay()];
  } else if (d === 5) {
    split = [pushDay(), pullDay(), legsDay(), upperDay(), conditioningDay()];
  } else {
    split = [pushDay(), pullDay(), legsDay(), upperDay(), lowerDay(), conditioningDay()];
  }

  split = injectRecoveryIfNeeded(split, goalId, assessmentRisk);
  split = applyFatigueToSplit(split, bodySignals);
  split = swapConditioningIfNeeded(split, goalId);
  return split;
}

function defaultPreferredOffsets(count: number): number[] {
  const patterns: Record<number, number[]> = {
    2: [0, 3],
    3: [0, 2, 4],
    4: [0, 1, 3, 5],
    5: [0, 1, 2, 4, 5],
    6: [0, 1, 2, 3, 4, 5],
  };
  return patterns[count] ?? patterns[3];
}

function sharesFocus(a: MuscleGroup[], b: MuscleGroup[]): boolean {
  return a.some((g) => b.includes(g));
}

/**
 * Spread `count` sessions evenly across `available` day offsets (already sorted).
 * When the week is short (e.g. only Sunday left), we place as many as fit — one
 * per remaining day — rather than inventing past days that would immediately
 * read as "missed".
 */
export function packOffsetsIntoAvailable(count: number, available: number[]): number[] {
  if (available.length === 0 || count <= 0) return [];
  const n = Math.min(count, available.length);
  if (n === 1) return [available[0]!];
  if (n === available.length) return available.slice();

  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.round((i * (available.length - 1)) / (n - 1));
    out.push(available[idx]!);
  }
  // Dedupe if rounding collided, then fill next free slots.
  const unique: number[] = [];
  for (const o of out) {
    if (!unique.includes(o)) unique.push(o);
  }
  for (const a of available) {
    if (unique.length >= n) break;
    if (!unique.includes(a)) unique.push(a);
  }
  return unique.sort((a, b) => a - b);
}

/**
 * Map a split onto calendar day offsets.
 *
 * `notBeforeOffset` (0–6) is how far into the week we already are. Preferred
 * days that have already passed are dropped; the split is re-packed into the
 * remaining days so a Sunday I-Day never seeds Mon/Wed/Fri as instant misses.
 */
export function mapToCalendar(
  split: SplitDay[],
  preferredDays: number[],
  _weekStart: string,
  notBeforeOffset = 0
): { day: SplitDay; dayOffset: number }[] {
  const count = split.length;
  const floor = Math.max(0, Math.min(6, notBeforeOffset));
  const available = Array.from({ length: 7 - floor }, (_, i) => floor + i);
  if (available.length === 0) return [];

  const preferredFuture = preferredDays.filter((d) => d >= floor).sort((a, b) => a - b);
  let offsets: number[];
  if (preferredFuture.length >= count) {
    offsets = preferredFuture.slice(0, count);
  } else if (preferredFuture.length > 0) {
    // Keep future preferences, fill the rest evenly in the window.
    const need = Math.min(count, available.length);
    offsets = [...preferredFuture];
    for (const a of packOffsetsIntoAvailable(need, available)) {
      if (offsets.length >= need) break;
      if (!offsets.includes(a)) offsets.push(a);
    }
    offsets = offsets.sort((a, b) => a - b).slice(0, need);
  } else if (floor === 0) {
    offsets = defaultPreferredOffsets(count);
  } else {
    offsets = packOffsetsIntoAvailable(count, available);
  }

  // Clip to remaining week if a default pattern still sits in the past.
  offsets = offsets.filter((o) => o >= floor);
  if (offsets.length < Math.min(count, available.length)) {
    offsets = packOffsetsIntoAvailable(count, available);
  }

  // Avoid back-to-back same focus groups when possible
  const days = split.slice(0, offsets.length);
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 1; i < days.length; i++) {
      if (
        offsets[i]! - offsets[i - 1]! === 1 &&
        sharesFocus(days[i]!.focusGroups, days[i - 1]!.focusGroups) &&
        days[i]!.kind === 'strength' &&
        days[i - 1]!.kind === 'strength'
      ) {
        const swapIdx = offsets.findIndex((o, j) => j > i && o - offsets[i - 1]! > 1);
        if (swapIdx > i) {
          const tmp = offsets[i]!;
          offsets[i] = offsets[swapIdx]!;
          offsets[swapIdx] = tmp;
        }
      }
    }
  }

  return days.map((day, i) => ({
    day,
    dayOffset: offsets[i] ?? available[Math.min(i, available.length - 1)]!,
  }));
}

export function sessionNameFromKey(nameKey: string, focusGroups: MuscleGroup[]): string {
  const labels: Record<string, string> = {
    coachSessionFullBody: 'Full Body Strength',
    coachSessionPush: 'Push Strength',
    coachSessionPull: 'Pull Strength',
    coachSessionLegs: 'Lower Body Strength',
    coachSessionUpper: 'Upper Body Strength',
    coachSessionLower: 'Lower Body Strength',
    coachSessionRecovery: 'Recovery & Mobility',
    coachSessionConditioning: 'Conditioning Circuit',
  };
  return labels[nameKey] ?? `${focusGroups[0] ?? 'Training'} Session`;
}

/**
 * Local Monday key.
 *
 * This anchored to local noon before calling `toISOString()`, which reads as a
 * fix and covers every offset strictly inside ±12 — but not UTC+13 or UTC+14.
 * Verified under `TZ=Pacific/Kiritimati`: it returned the previous Monday at
 * every hour of the day.
 */
export function currentWeekStart(): string {
  return localWeekKey();
}

export function todayDayOffset(weekStart: string, todayIso?: string): number {
  const start = new Date(`${weekStart}T12:00:00`);
  const now = todayIso ? new Date(`${todayIso}T12:00:00`) : new Date();
  now.setHours(12, 0, 0, 0);
  const diff = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return Math.max(0, Math.min(6, diff));
}

/**
 * Day offset for *scheduling into* a week. Unlike `todayDayOffset`, returns 0
 * when `today` is outside the week (tests and rollover fixtures) so we still
 * materialise a full Mon–Sun pattern. Inside the week, past days are skipped.
 */
export function scheduleFromOffset(weekStart: string, todayIso: string): number {
  const start = new Date(`${weekStart}T12:00:00`);
  const now = new Date(`${todayIso}T12:00:00`);
  now.setHours(12, 0, 0, 0);
  const diff = Math.floor((now.getTime() - start.getTime()) / 86400000);
  if (diff < 0 || diff > 6) return 0;
  return diff;
}
