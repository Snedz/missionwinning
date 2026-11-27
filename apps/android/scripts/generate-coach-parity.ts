import { readFileSync } from 'node:fs';
import { mock } from 'node:test';
import { buildCoachContextFromInputs } from '@/lib/coach/contextBuilder';
import { generateWeek } from '@/lib/coach/planEngine';
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
const cases = fixture.cases.map(({ id, now, historyId, input }) => {
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
const json = JSON.stringify({ ...fixture, cases }, null, 2)
  .replace(/\{\n\s+"(exerciseId|reps)": [^{}]+\}/g, (record) =>
    JSON.stringify(JSON.parse(record)).replaceAll('":', '": ').replaceAll(',"', ', "'));
process.stdout.write(json + '\n');
