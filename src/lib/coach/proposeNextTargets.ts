import { capLoadJump } from './loadJumpCap.ts';

export type LastLoggedSet = {
  exerciseId: string;
  weight: number | null;
  reps: number | null;
  unit: 'kg' | 'lb';
};

export type ProposedNext = {
  exerciseId: string;
  weight: number | null;
  reps: number | null;
  capped: boolean;
  reason: string;
};

const PROGRESSION_KG = 2.5;
const PROGRESSION_LB = 5;

function isValidExerciseId(id: string | null | undefined): id is string {
  return typeof id === 'string' && id.trim().length > 0;
}

export function proposeNextTargets(last: readonly LastLoggedSet[]): ProposedNext[] {
  // Map to keep last occurrence per exerciseId
  const lastByExercise = new Map<string, LastLoggedSet>();

  for (const set of last) {
    if (!isValidExerciseId(set.exerciseId)) {
      continue;
    }
    // Later entries overwrite earlier ones
    lastByExercise.set(set.exerciseId, set);
  }

  // Preserve first-seen order: iterate original array and track seen
  const seen = new Set<string>();
  const result: ProposedNext[] = [];

  for (const set of last) {
    if (!isValidExerciseId(set.exerciseId)) {
      continue;
    }
    if (seen.has(set.exerciseId)) {
      continue;
    }
    seen.add(set.exerciseId);

    const record = lastByExercise.get(set.exerciseId)!;
    const { weight, reps, unit } = record;

    // Determine weight proposal
    let weightResult: ReturnType<typeof capLoadJump>;
    let repsValue: number | null;

    if (weight === null) {
      weightResult = { weight: null, capped: false, reason: 'no last weight' };
      repsValue = null; // When weight is null, reps must be null per spec
    } else if (!Number.isFinite(weight) || weight < 0) {
      weightResult = { weight: null, capped: false, reason: 'invalid last weight' };
      repsValue = null; // When weight is invalid, reps must be null per spec
    } else {
      const proposed = weight + (unit === 'kg' ? PROGRESSION_KG : PROGRESSION_LB);
      weightResult = capLoadJump({ proposed, lastLogged: weight, unit });
      // Determine reps: valid integer >= 1, else null
      if (typeof reps === 'number' && Number.isInteger(reps) && reps >= 1) {
        repsValue = reps;
      } else {
        repsValue = null;
      }
    }

    result.push({
      exerciseId: set.exerciseId,
      weight: weightResult.weight,
      reps: repsValue,
      capped: weightResult.capped,
      reason: weightResult.reason,
    });
  }

  return result;
}
