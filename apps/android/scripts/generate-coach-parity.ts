import { readFileSync } from 'node:fs';
import { mock } from 'node:test';
import { ensureFullExerciseCatalog, EXERCISES } from '@/data/exercises';
import { buildCoachContextFromInputs } from '@/lib/coach/contextBuilder';
import { equipmentMatches } from '@/lib/coach/equipment';
import { generateWeek } from '@/lib/coach/planEngine';
import { loadBands } from '@/lib/coach/load';
import { nextTargets } from '@/lib/coach/progression';
import { localDateKey, localWeekKey } from '@/lib/time/localDate';
import { displayToKg, kgToDisplay, type UnitsPref } from '@/lib/units';
import type { CompletedWorkoutLog } from '@/types';

type Unit = 'kg' | 'lb';
type Exercise = CompletedWorkoutLog['exercises'][number];
type Log = Omit<CompletedWorkoutLog, 'exercises'> & {
  weightUnit?: Unit;
  exercises: Array<Omit<Exercise, 'sets'> & { sets: Array<Exercise['sets'][number] & { weightUnit?: Unit }> }>;
};
type Input = {
  equipment: string;
  daysPerWeek: number;
  units: UnitsPref;
  revision: number;
};

const fixturePath = new URL('../core/data/src/test/resources/coach-parity.json', import.meta.url);
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as {
  version: number;
  timeZone: string;
  histories: Record<string, Log[]>;
  cases: Array<{ id: string; now: string; historyId: string; input: Input }>;
};

function historyInUnits(history: Log[], units: UnitsPref): CompletedWorkoutLog[] {
  const fallback = units === 'imperial' ? 'lb' : 'kg';
  return history.filter((log) => !log.deletedAt).map(({ weightUnit, ...log }) => {
    const exercises = log.exercises.map((exercise) => ({
      ...exercise,
      sets: exercise.sets.map(({ weightUnit: setUnit, ...set }) => ({
        ...set,
        weight: Math.round(kgToDisplay(displayToKg(set.weight,
          (setUnit ?? weightUnit ?? fallback) === 'lb' ? 'imperial' : 'metric'), units) * 100) / 100,
      })),
    }));
    const totalVolume = exercises.flatMap((exercise) => exercise.sets)
      .reduce((sum, set) => sum + set.reps * set.weight, 0);
    return { ...log, exercises, totalVolume };
  });
}

process.env.TZ = fixture.timeZone;
function seedCases() {
  for (const [id, expected] of [['lateral-raise-db', true], ['dumbbell-fly', false], ['banded-dislocate', false]] as const) {
    const exercise = EXERCISES.find((entry) => entry.id === id);
    if (!exercise || equipmentMatches(exercise, 'dumbbells') !== expected) {
      throw new Error('Regenerate starter fixtures with the dumbbells-and-floor web planner from #1139.');
    }
  }
  return fixture.cases.map(({ id, now, historyId, input }) => {
    const date = new Date(now);
    mock.timers.enable({ apis: ['Date'], now: date });
    try {
      const ctx = buildCoachContextFromInputs({
        ...input, history: historyInUnits(fixture.histories[historyId], input.units),
        experience: 'beginner', goal: 'goal:strength', preferredDays: [], seedId: 'local', includeCheckIn: false,
      });
      const expectedPlan = generateWeek(ctx, localWeekKey(date), input.revision, localDateKey(date));
      return { id, now, historyId, input, expectedPlan };
    } finally {
      mock.timers.reset();
    }
  });
}

const now = '2026-05-18T12:00:00.000Z';
const push = 'push-ups';
const lift = 'lunges';
const assisted = 'fedb-band-assisted-pull-up';
type Set = Log['exercises'][number]['sets'][number];
const set = (reps: number, weight = 0, rpe?: Set['rpe'], kind?: Set['kind']): Set =>
  ({ reps, weight, rpe, kind });
function workout(day: number, sets: Set[], exerciseId = lift, extras: Partial<Log> = {}): Log {
  const at = `2026-05-${String(day).padStart(2, '0')}T10:00:00.000Z`;
  return {
    id: `${day}-${exerciseId}`, workoutName: 'Parity workout', startedAt: at, completedAt: at,
    durationSeconds: 1200, totalVolume: 0, weightUnit: 'kg',
    exercises: [{ exerciseId, sets }], ...extras,
  };
}
function progression(id: string, history: Log[], exerciseId = lift, units: UnitsPref = 'metric') {
  const normalized = historyInUnits(history, units).filter((log) => log.completedAt <= now);
  const zone = loadBands(normalized, new Date(now)).zone;
  return {
    id, now, exerciseId, units, workoutId: normalized[0].id, history,
    expected: nextTargets(exerciseId, normalized, units, 'strength', 'beginner', zone),
  };
}
const progressionCases = () => [
  progression('unrated-bodyweight-gains-a-rep', [workout(18, [set(4)], push)], push),
  progression('easy-bodyweight-gains-two-reps', [workout(18, [set(4, 0, 'easy')], push)], push),
  progression('bodyweight-hard-deload', [workout(18, [set(6, 0, 'hard')], push)], push),
  progression('bodyweight-deload-below-goal-floor', [workout(18, [set(3, 0, 'hard')], push)], push),
  progression('bodyweight-flat-deload', [18, 16, 14].map((day) => workout(day, [set(6)], push)), push),
  progression('unrated-weighted-hold', [workout(18, [set(6, 30)])]),
  progression('weighted-rpe-reps', [workout(18, [set(5, 30, 'med'), set(4, 20)])]),
  progression('percent-load-up', [workout(18, [set(6, 50, 'easy')])]),
  progression('percent-load-capped-at-limit', [workout(18, [set(3, 100, 'easy')])]),
  progression('percent-hard-hold', [workout(18, [set(6, 30, 'hard'), set(6, 25, 'hard'), set(6, 25, 'easy')])]),
  progression('percent-deload-imperial', [workout(18, [set(6, 25, 'hard'), set(6, 25, 'hard')])], lift, 'imperial'),
  progression('percent-deload-below-historical-max', [workout(18, [set(6, 20, 'hard')]), workout(16, [set(1, 100)])]),
  progression('absolute-load-up-no-e1rm', [workout(18, [set(15, 20, 'easy')])]),
  progression('absolute-hard-deload-no-e1rm', [workout(18, [set(15, 20, 'hard')])]),
  progression('absolute-deload-rounding-ceiling', [workout(18, [set(15, 4.5, 'hard')])]),
  { ...progression('deload-keeps-logged-assistance', [
    workout(18, [set(6, 30, 'hard')], assisted), workout(16, [set(1, 50)], assisted),
  ], assisted), androidExerciseId: 'assisted-pullup' },
  progression('weighted-flat-deload', [18, 16, 14].map((day) => workout(day, [set(6, 40)]))),
  progression('weighted-plateau-deload', [35, 30, 35, 30, 50]
    .map((weight, i) => workout(18 - i * 2, [set(6, weight)]))),
  progression('recent-pr-blocks-false-stall', [42, 40, 40, 30, 30]
    .map((weight, i) => workout(18 - i * 2, [set(6, weight)]))),
  progression('high-load-caps-progression', [
    workout(18, [set(4, 25, 'easy')], lift, { durationSeconds: 5400 }),
    workout(1, [set(5)], push),
  ]),
  progression('failure-and-drop-can-count-as-working-sets', [
    workout(18, [set(8, 100, 'hard', 'warmup'), set(4, 30), set(4, 60, 'med', 'failure'), set(4, 25, 'med', 'drop')]),
  ]),
  progression('ignores-deleted-and-future-workouts', [
    workout(19, [set(5, 150)]),
    workout(18, [set(5, 100)], lift, { id: 'deleted', deletedAt: now }),
    workout(18, [set(5, 25), set(5, 30, 'med', 'warmup')]),
  ]),
];
async function main() {
  const progressionMode = process.argv.includes('--progression');
  if (progressionMode) await ensureFullExerciseCatalog();
  const output = progressionMode
    ? { version: 1, timeZone: fixture.timeZone, progressions: progressionCases() }
    : { ...fixture, cases: seedCases() };
  const json = JSON.stringify(output, null, 2)
    .replace(/\{\n\s+"(exerciseId|reps)": [^{}]+\}/g, (record) =>
      JSON.stringify(JSON.parse(record)).replaceAll('":', '": ').replaceAll(',"', ', "'));
  process.stdout.write(json + '\n');
}
void main();
