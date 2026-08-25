/**
 * In-set PR they actually hit (`.999`).
 *
 * Compare the just-logged WORKING set to prior completed logs of the
 * same exerciseId. Heaviest / most reps / best logged 5 — numbers they
 * already wrote. No prior → empty. First session invents nothing.
 * Not Epley. Not a projected 1RM.
 */

import type { CompletedWorkoutLog, SetRowType } from '@/types';
import { setRowHasWork } from '@/lib/workout/setRowType';

export const IN_SET_PR_WEIGHT_EPS = 0.05;

export const IN_SET_PR_KINDS = ['heaviest', 'most_reps', 'best_logged_5'] as const;
export type InSetPrKind = (typeof IN_SET_PR_KINDS)[number];

export type InSetPrSet = {
  reps?: number;
  weight?: number;
  durationSeconds?: number;
  kind?: string;
  completed?: boolean;
};

export type InSetPrDecision = {
  kinds: InSetPrKind[];
};

export type InSetPrWords = {
  heaviest: string;
  mostReps: string;
  bestLogged5: string;
};

function isPrEligibleSet(set: InSetPrSet | null | undefined): boolean {
  if (!set) return false;
  if (set.kind === 'warmup' || set.kind === 'drop') return false;
  return setRowHasWork(set);
}

function loadOf(set: InSetPrSet): number {
  const w = Number(set.weight);
  return Number.isFinite(w) ? w : 0;
}

function repsOf(set: InSetPrSet): number {
  const r = Number(set.reps);
  return Number.isFinite(r) ? r : 0;
}

function durationOf(set: InSetPrSet): number {
  const d = Number(set.durationSeconds);
  return Number.isFinite(d) ? d : 0;
}

function sameLoad(a: number, b: number): boolean {
  return Math.abs(a - b) < IN_SET_PR_WEIGHT_EPS;
}

function beatsLoad(next: number, prior: number): boolean {
  return next - prior >= IN_SET_PR_WEIGHT_EPS;
}

/** Working sets already in the finished diary for this lift. Tombstones skipped. */
export function collectDiaryWorkingSets(
  history: readonly CompletedWorkoutLog[],
  exerciseId: string
): InSetPrSet[] {
  if (!exerciseId) return [];
  const out: InSetPrSet[] = [];
  for (const log of history) {
    if (log.deletedAt) continue;
    const ex = log.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex) continue;
    for (const set of ex.sets) {
      if (!isPrEligibleSet(set)) continue;
      out.push(set);
    }
  }
  return out;
}

function collectSessionPriors(sets: readonly InSetPrSet[]): InSetPrSet[] {
  const out: InSetPrSet[] = [];
  for (const set of sets) {
    if (set.completed === false) continue;
    if (!isPrEligibleSet(set)) continue;
    out.push(set);
  }
  return out;
}

/**
 * Empty when there is no prior working set of that lift in a finished
 * log — first-ever and first session invent nothing.
 */
export function decideInSetPr(params: {
  exerciseId: string;
  justLogged: InSetPrSet;
  rowType: SetRowType;
  history: readonly CompletedWorkoutLog[];
  sessionPriors?: readonly InSetPrSet[];
}): InSetPrDecision {
  const kinds: InSetPrKind[] = [];
  if (!params.exerciseId) return { kinds };
  if (!isPrEligibleSet(params.justLogged)) return { kinds };

  const diary = collectDiaryWorkingSets(params.history, params.exerciseId);
  if (diary.length === 0) return { kinds };

  const priors = [...diary, ...collectSessionPriors(params.sessionPriors ?? [])];
  const type = params.rowType;
  const just = params.justLogged;

  if (type === 'duration') {
    const hold = durationOf(just);
    const priorHolds = priors.map(durationOf).filter((d) => d > 0);
    if (hold > 0 && priorHolds.length > 0 && hold > Math.max(...priorHolds)) {
      kinds.push('most_reps');
    }
    return { kinds };
  }

  const justLoad = loadOf(just);
  const justReps = repsOf(just);

  if (type === 'assisted') {
    const atLoad = priors.filter((s) => sameLoad(loadOf(s), justLoad));
    if (justReps > 0 && atLoad.length > 0) {
      const maxReps = Math.max(...atLoad.map(repsOf));
      if (justReps > maxReps) kinds.push('most_reps');
    }
    return { kinds };
  }

  const priorLoads = priors.map(loadOf);
  if (type === 'weight') {
    const priorWeighted = priorLoads.filter((w) => w > 0);
    if (justLoad > 0 && priorWeighted.length > 0 && beatsLoad(justLoad, Math.max(...priorLoads))) {
      kinds.push('heaviest');
    }
  } else if (priors.length > 0 && justLoad > 0 && beatsLoad(justLoad, Math.max(...priorLoads, 0))) {
    kinds.push('heaviest');
  }

  const atLoad = priors.filter((s) => sameLoad(loadOf(s), justLoad));
  if (justReps > 0 && atLoad.length > 0) {
    const maxReps = Math.max(...atLoad.map(repsOf));
    if (justReps > maxReps) kinds.push('most_reps');
  }

  if (justReps === 5) {
    const priorFives = priors.filter((s) => repsOf(s) === 5);
    if (priorFives.length > 0 && beatsLoad(justLoad, Math.max(...priorFives.map(loadOf)))) {
      kinds.push('best_logged_5');
    }
  }

  return { kinds };
}

export function formatInSetPrLabel(
  kinds: readonly InSetPrKind[],
  words: InSetPrWords
): string | null {
  if (!kinds.length) return null;
  const parts = kinds.map((k) => {
    if (k === 'heaviest') return words.heaviest;
    if (k === 'most_reps') return words.mostReps;
    return words.bestLogged5;
  });
  return parts.join(' · ');
}

/** One label per current-session set index. Null = no prior / not a beat. */
export function formatInSetPrLabels(
  history: readonly CompletedWorkoutLog[],
  exerciseId: string,
  currentSets: readonly InSetPrSet[],
  rowType: SetRowType,
  words: InSetPrWords
): (string | null)[] {
  return currentSets.map((set, idx) => {
    if (set.completed === false) return null;
    const { kinds } = decideInSetPr({
      exerciseId,
      justLogged: set,
      rowType,
      history,
      sessionPriors: currentSets.slice(0, idx),
    });
    return formatInSetPrLabel(kinds, words);
  });
}
