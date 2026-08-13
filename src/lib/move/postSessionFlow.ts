/**
 * Post-session Move seam (S6) — map muscles just trained to one free flow.
 *
 * Tiny on purpose: Victory / `/active` must not value-import `MOBILITY_FLOWS`
 * (catalog bodies blow the logger bundle). Ids are literals; a colocated test
 * asserts each still exists on the free catalog.
 *
 * No mobility score. No premium / video library. Post-session only (recovery
 * and joint-care flows, not pre-lift primers).
 */

export type PostSessionFlowPick = {
  flowId: string;
  flowName: string;
  muscle: string;
  href: string;
};

export type LoggedExerciseMuscles = {
  muscleGroups?: readonly string[] | null;
  sets: readonly { reps: number; kind?: string }[];
};

/** Dominant-muscle → free `MOBILITY_FLOWS` id (see postSessionFlow.test.ts). */
export const POST_SESSION_FLOW_BY_MUSCLE: Readonly<
  Record<string, { id: string; name: string }>
> = {
  Legs: { id: 'post-leg-day', name: 'Post-Leg-Day Recovery' },
  Back: { id: 'tspine-opener', name: 'T-Spine Opener' },
  Chest: { id: 'tspine-opener', name: 'T-Spine Opener' },
  Shoulders: { id: 'shoulder-cars', name: 'Shoulder CARs Flow' },
  Arms: { id: 'wrist-elbow-care', name: 'Wrist & Elbow Care' },
  Core: { id: 'lateral-line', name: 'Lateral Line' },
  Cardio: { id: 'post-run-cooldown', name: 'Post-Run Cooldown' },
  'Full Body': { id: 'recovery-wind-down', name: 'Recovery Wind-Down' },
};

/** Tie-break when two groups share the vote — compound movers first. */
export const POST_SESSION_MUSCLE_TIE_BREAK: readonly string[] = [
  'Legs',
  'Back',
  'Chest',
  'Shoulders',
  'Arms',
  'Core',
  'Full Body',
  'Cardio',
];

function hasWorkingSet(sets: LoggedExerciseMuscles['sets']): boolean {
  return sets.some((s) => (s.kind ?? 'normal') !== 'warmup' && Number(s.reps) > 0);
}

export function workingMuscleGroupsFromLog(
  exercises: readonly LoggedExerciseMuscles[]
): string[][] {
  return exercises
    .filter((ex) => hasWorkingSet(ex.sets))
    .map((ex) => [...(ex.muscleGroups ?? [])]);
}

export function dominantTrainedMuscle(groupsPerExercise: readonly string[][]): string | null {
  const votes = new Map<string, number>();
  for (const groups of groupsPerExercise) {
    const seen = new Set<string>();
    for (const raw of groups) {
      const muscle = String(raw);
      if (!POST_SESSION_FLOW_BY_MUSCLE[muscle] || seen.has(muscle)) continue;
      seen.add(muscle);
      votes.set(muscle, (votes.get(muscle) ?? 0) + 1);
    }
  }
  if (votes.size === 0) return null;

  let best: string | null = null;
  let bestVotes = 0;
  for (const muscle of POST_SESSION_MUSCLE_TIE_BREAK) {
    const n = votes.get(muscle) ?? 0;
    if (n > bestVotes) {
      best = muscle;
      bestVotes = n;
    }
  }
  return best;
}

export function moveFlowHref(flowId: string): string {
  return `/move?flow=${encodeURIComponent(flowId)}`;
}

export function pickPostSessionMoveFlow(
  groupsPerExercise: readonly string[][]
): PostSessionFlowPick | null {
  const muscle = dominantTrainedMuscle(groupsPerExercise);
  if (!muscle) return null;
  const flow = POST_SESSION_FLOW_BY_MUSCLE[muscle];
  if (!flow) return null;
  return {
    flowId: flow.id,
    flowName: flow.name,
    muscle,
    href: moveFlowHref(flow.id),
  };
}
