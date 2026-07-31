/**
 * Multi-pillar weekly debrief (pure).
 */

import type { CompletedWorkoutLog } from '@/types';
import { buildWeekRecap } from '@/lib/weekRecap';
import { buildMuscleHeatmap } from '@/lib/historyAnalytics';
import type { MindCheckIn } from '@/lib/mindCheckIns';
import type { BodyMetricEntry } from '@/lib/bodyMetrics';
import type { MuscleGroup } from '@/lib/muscleGroups';
import { startOfLocalWeek } from '@/lib/time/localDate';

export type WeeklyDebrief = {
  weekStart: string;
  isFullDebrief: boolean; // Sunday or Monday
  train: {
    sessions: number;
    sets: number;
    volume: number;
  };
  fuel: {
    logDays: number;
    proteinDays: number;
  };
  moveMind: {
    flows: number;
    sessions: number;
  };
  body?: {
    weightDelta?: number | null;
  };
  /** i18n key for next-week focus */
  focusKey: string;
  focusParams?: Record<string, string>;
  undertrainedGroup?: MuscleGroup;
};

export function buildWeeklyDebrief(input: {
  history: CompletedWorkoutLog[];
  /** Optional activity count this week */
  activityCount?: number;
  checkIns?: MindCheckIn[];
  bodyMetrics?: BodyMetricEntry[];
  pillarWins?: { pillar: string; at: string }[];
  proteinDaysThisWeek?: number;
  fuelLogDays?: number;
  moveFlows?: number;
  mindSessions?: number;
  now?: Date;
}): WeeklyDebrief {
  const now = input.now ?? new Date();
  const recap = buildWeekRecap(input.history, now);
  const day = now.getDay(); // 0 Sun, 1 Mon
  const isFullDebrief = day === 0 || day === 1;

  /*
   * `.223` — `prs` is gone, because nothing could ever have supplied it.
   *
   * This block read `(log as { personalRecords?: number }).personalRecords`. That
   * field exists **nowhere else in the repo** — nothing has ever written it — so
   * `prs` was structurally always 0, and the two surfaces spending it were dead on
   * arrival: the recap share card's PR line and the "N PR marks this week" row on
   * the Today recap card. The hand-written `as` cast is precisely what stopped the
   * compiler from pointing at it. `.195`, with the type system silenced on purpose.
   *
   * Counting it honestly is not available here, and the reason is worth recording:
   * `isPersonalRecord` (`workout/workoutPr.ts`, the definition `.208` hardened)
   * runs at log time and `logSet` stores `isPr` on the **active** set — but
   * `CompletedWorkoutLog.exercises[].sets` is a narrower type, `{ reps, weight,
   * kind?, rpe? }`, so **the flag is discarded the moment the session is saved**.
   * The brass chip an athlete earns is not on the record five seconds later.
   *
   * Reviving the line therefore means persisting `isPr` through completion, and
   * that type syncs to `workout_logs` — a schema change with sync-v2 merge and
   * revision consequences, which is a different PR from one about numbers that
   * lie. Deleting is the `.195` default: the recap keeps sessions, sets and
   * volume, all of which are real.
   */

  const heat = buildMuscleHeatmap(input.history, 14);
  let undertrained: MuscleGroup | undefined;
  let minIntensity = Infinity;
  for (const cell of heat) {
    if (cell.intensity < minIntensity) {
      minIntensity = cell.intensity;
      undertrained = cell.group;
    }
  }

  let weightDelta: number | null | undefined;
  if (input.bodyMetrics?.length) {
    const sorted = [...input.bodyMetrics].sort((a, b) => a.date.localeCompare(b.date));
    const withW = sorted.filter((e) => e.weightKg != null);
    if (withW.length >= 2) {
      const a = withW[withW.length - 1].weightKg!;
      const b = withW[0].weightKg!;
      weightDelta = Math.round((a - b) * 10) / 10;
    }
  }

  // Focus rules
  let focusKey = 'debriefFocusKeepConsistency';
  const focusParams: Record<string, string> = {};
  if (recap.sessions === 0) {
    focusKey = 'debriefFocusGetOneSession';
  } else if (recap.sessions >= 4 && minIntensity < 0.25 && undertrained) {
    focusKey = 'debriefFocusUndertrained';
    focusParams.group = undertrained;
  } else if (recap.streak >= 5 && recap.sessions >= 3) {
    focusKey = 'debriefFocusDeloadWatch';
  } else if ((input.proteinDaysThisWeek ?? 0) < 3 && recap.sessions > 0) {
    focusKey = 'debriefFocusFuelProtein';
  } else if (undertrained && minIntensity < 0.4) {
    focusKey = 'debriefFocusUndertrained';
    focusParams.group = undertrained;
  }

  return {
    weekStart: recap.weekStart,
    isFullDebrief,
    train: {
      sessions: recap.sessions,
      sets: recap.totalSets,
      volume: recap.totalVolume,
    },
    fuel: {
      logDays: input.fuelLogDays ?? 0,
      proteinDays: input.proteinDaysThisWeek ?? 0,
    },
    moveMind: {
      flows: input.moveFlows ?? 0,
      sessions: input.mindSessions ?? countMindCheckInsThisWeek(input.checkIns, now),
    },
    body: weightDelta !== undefined ? { weightDelta } : undefined,
    focusKey,
    focusParams: Object.keys(focusParams).length ? focusParams : undefined,
    undertrainedGroup: undertrained,
  };
}

function countMindCheckInsThisWeek(checkIns: MindCheckIn[] | undefined, now: Date): number {
  if (!checkIns?.length) return 0;
  const start = startOfLocalWeek(now).getTime();
  return checkIns.filter((c) => {
    const t = Date.parse(c.date);
    return Number.isFinite(t) && t >= start;
  }).length;
}
