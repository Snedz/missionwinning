import type { MuscleGroup } from '@/lib/muscleGroups';
import { MAJOR_GROUPS } from '@/lib/muscleGroups';
import type { SplitDay } from '@/lib/coach/types';

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

export function mapToCalendar(
  split: SplitDay[],
  preferredDays: number[],
  _weekStart: string
): { day: SplitDay; dayOffset: number }[] {
  const count = split.length;
  const offsets =
    preferredDays.length >= count
      ? [...preferredDays].sort((a, b) => a - b).slice(0, count)
      : defaultPreferredOffsets(count);

  // Avoid back-to-back same focus groups when possible
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 1; i < split.length; i++) {
      if (
        offsets[i] - offsets[i - 1] === 1 &&
        sharesFocus(split[i].focusGroups, split[i - 1].focusGroups) &&
        split[i].kind === 'strength' &&
        split[i - 1].kind === 'strength'
      ) {
        const swapIdx = offsets.findIndex((o, j) => j > i && o - offsets[i - 1] > 1);
        if (swapIdx > i) {
          const tmp = offsets[i];
          offsets[i] = offsets[swapIdx];
          offsets[swapIdx] = tmp;
        }
      }
    }
  }

  return split.map((day, i) => ({
    day,
    dayOffset: offsets[i] ?? i,
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

export function currentWeekStart(): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

export function todayDayOffset(weekStart: string): number {
  const start = new Date(`${weekStart}T12:00:00`);
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  const diff = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return Math.max(0, Math.min(6, diff));
}
