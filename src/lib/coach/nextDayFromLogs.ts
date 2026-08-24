/**
 * Wednesday from their logs — a stable next-day session cite.
 *
 * Walks the athlete's own named live diary (tombstones / 0-rep excluded).
 * Same diary + same now window ⇒ same Wednesday. A live Coach plan that
 * already owns the next calendar day wins. Empty invents nothing.
 * Does not call generateWeek, pick catalog work, or open a shop.
 */

import type { CompletedWorkoutLog } from '@/types';
import type { CoachPlan, PlanSession } from '@/lib/coach/types';
import {
  templateFromCompletedLog,
  type HistoryRetrainTemplate,
} from '@/lib/workout/historyRetrain';

export type NextDayFromLogsNow = {
  weekStart: string;
  dayOffset: number;
};

export type NextDayCite = {
  name: string;
  source: 'logs' | 'plan';
  template?: HistoryRetrainTemplate;
  planSessionId?: string;
};

function isPerformedSet(set: { reps?: number }): boolean {
  return (set.reps ?? 0) > 0;
}

function isLiveLog(log: CompletedWorkoutLog): boolean {
  if (log.deletedAt) return false;
  return (log.exercises ?? []).some((ex) => (ex.sets ?? []).some(isPerformedSet));
}

function sessionName(log: CompletedWorkoutLog): string | null {
  const name = log.workoutName?.trim() || null;
  return name || null;
}

function nameKey(name: string): string {
  return name.trim().toLowerCase();
}

function liveNamedLogs(history: readonly CompletedWorkoutLog[]): CompletedWorkoutLog[] {
  return history
    .filter((log) => isLiveLog(log) && sessionName(log))
    .slice()
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt));
}

function planOwnsNextDay(plan: CoachPlan | null | undefined, now: NextDayFromLogsNow): PlanSession | null {
  if (!plan || plan.weekStart !== now.weekStart) return null;
  const pending = plan.sessions
    .filter((s) => s.status !== 'done' && s.status !== 'missed')
    .filter((s) => s.dayOffset > now.dayOffset)
    .slice()
    .sort((a, b) => a.dayOffset - b.dayOffset);
  const next = pending[0];
  if (!next?.name?.trim()) return null;
  return next;
}

function rotationKeys(logs: CompletedWorkoutLog[]): string[] {
  const keys: string[] = [];
  const seen = new Set<string>();
  for (const log of logs) {
    const name = sessionName(log);
    if (!name) continue;
    const key = nameKey(name);
    if (seen.has(key)) continue;
    seen.add(key);
    keys.push(key);
  }
  return keys;
}

function displayNameFor(logs: CompletedWorkoutLog[], key: string): string {
  for (let i = logs.length - 1; i >= 0; i--) {
    const name = sessionName(logs[i]!);
    if (name && nameKey(name) === key) return name;
  }
  return key;
}

function nextKeyFromRotation(logs: CompletedWorkoutLog[], rotation: string[]): string {
  const used = new Set<string>();
  for (const log of logs) {
    const name = sessionName(log);
    if (!name) continue;
    if (used.size === rotation.length) used.clear();
    used.add(nameKey(name));
  }
  return rotation.find((key) => !used.has(key)) ?? rotation[0]!;
}

function templateForName(
  history: readonly CompletedWorkoutLog[],
  key: string
): HistoryRetrainTemplate | undefined {
  const newestFirst = history
    .filter((log) => isLiveLog(log))
    .slice()
    .sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1));
  for (const log of newestFirst) {
    const name = sessionName(log);
    if (!name || nameKey(name) !== key) continue;
    const template = templateFromCompletedLog(log);
    if (template) return template;
  }
  return undefined;
}

/**
 * Stable next-day cite from the diary they already have.
 * `now` is only used to ask whether a live plan owns the next calendar day.
 */
export function nextDayFromLogs(input: {
  history: readonly CompletedWorkoutLog[];
  plan?: CoachPlan | null;
  now: NextDayFromLogsNow;
}): NextDayCite | null {
  const owned = planOwnsNextDay(input.plan, input.now);
  if (owned) {
    return {
      name: owned.name.trim(),
      source: 'plan',
      planSessionId: owned.id,
    };
  }

  const named = liveNamedLogs(input.history);
  const rotation = rotationKeys(named);
  if (rotation.length < 2) return null;

  const key = nextKeyFromRotation(named, rotation);
  const name = displayNameFor(named, key);
  const template = templateForName(input.history, key);

  return template ? { name, source: 'logs', template } : { name, source: 'logs' };
}
