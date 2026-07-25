/**
 * Strength standards — bodyweight-multiple ladders per lift and sex.
 *
 * Values are the handoff's (Calculator Strength Standards mockup, rebrand
 * 2026-07-25): population-level conventions for adult barbell lifts at full
 * range of motion. Kilograms internally; convert at the display edge.
 * Multi-rep sets convert to an estimated single via Epley — the same math as
 * the 1RM calculator, unrounded here so thresholds compare honestly.
 */

export type StandardsSex = 'male' | 'female';
export type StandardsLift = 'squat' | 'bench' | 'deadlift' | 'press';

export const STANDARDS_LEVELS = [
  'Novice',
  'Beginner+',
  'Intermediate',
  'Advanced',
  'Elite',
] as const;
export type StandardsLevel = (typeof STANDARDS_LEVELS)[number];

export const STANDARDS_LIFT_NAMES: Record<StandardsLift, string> = {
  squat: 'Back squat',
  bench: 'Bench press',
  deadlift: 'Deadlift',
  press: 'Overhead press',
};

/** Bodyweight multiples for each level, Novice → Elite. */
export const STANDARDS_LADDER: Record<
  StandardsSex,
  Record<StandardsLift, readonly [number, number, number, number, number]>
> = {
  male: {
    squat: [0.75, 1.25, 1.5, 2.0, 2.5],
    bench: [0.5, 0.75, 1.0, 1.5, 2.0],
    deadlift: [1.0, 1.5, 2.0, 2.5, 3.0],
    press: [0.35, 0.55, 0.8, 1.05, 1.3],
  },
  female: {
    squat: [0.5, 0.75, 1.25, 1.5, 2.0],
    bench: [0.25, 0.5, 0.75, 1.0, 1.4],
    deadlift: [0.5, 1.0, 1.25, 1.75, 2.5],
    press: [0.2, 0.35, 0.5, 0.75, 1.0],
  },
};

/** Unrounded Epley estimated single; a 1-rep set is taken at face value. */
export function e1rmKg(weightKg: number, reps: number): number {
  const r = Math.min(Math.max(Math.round(reps), 1), 12);
  return r <= 1 ? weightKg : weightKg * (1 + r / 30);
}

export type StandardsRow = {
  level: StandardsLevel;
  multiplier: number;
  thresholdKg: number;
  current: boolean;
};

export type StandardsResult = {
  oneRmKg: number;
  /** e1RM as a multiple of bodyweight. */
  ratio: number;
  /** -1 = below the first rung ("Starting"). */
  levelIndex: number;
  levelLabel: StandardsLevel | 'Starting';
  rows: StandardsRow[];
  /** Undefined at the top of the ladder. */
  nextLevel?: StandardsLevel;
  /** Kg still to add to the estimated single to reach nextLevel. */
  toNextKg?: number;
};

export function standardsResult(params: {
  sex: StandardsSex;
  lift: StandardsLift;
  bodyweightKg: number;
  weightKg: number;
  reps: number;
}): StandardsResult {
  const { sex, lift } = params;
  const bodyweightKg = Math.min(Math.max(params.bodyweightKg, 35), 250);
  const weightKg = Math.max(params.weightKg, 1);
  const oneRmKg = e1rmKg(weightKg, params.reps);
  const ladder = STANDARDS_LADDER[sex][lift];

  let levelIndex = -1;
  ladder.forEach((m, i) => {
    if (oneRmKg >= m * bodyweightKg) levelIndex = i;
  });

  const rows: StandardsRow[] = ladder.map((m, i) => ({
    level: STANDARDS_LEVELS[i],
    multiplier: m,
    thresholdKg: m * bodyweightKg,
    current: i === levelIndex,
  }));

  const atTop = levelIndex >= ladder.length - 1;
  const nextIndex = Math.min(levelIndex + 1, ladder.length - 1);

  return {
    oneRmKg,
    ratio: oneRmKg / bodyweightKg,
    levelIndex,
    levelLabel: levelIndex < 0 ? 'Starting' : STANDARDS_LEVELS[levelIndex],
    rows,
    nextLevel: atTop ? undefined : STANDARDS_LEVELS[nextIndex],
    toNextKg: atTop ? undefined : Math.max(ladder[nextIndex] * bodyweightKg - oneRmKg, 0),
  };
}
