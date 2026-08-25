import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { CompletedWorkoutLog, SavedWorkout, WorkoutExerciseTemplate } from '@/types';
import { nextDayFromLogs } from '@/lib/coach/nextDayFromLogs';
import { runTodayPrimaryAction } from '@/lib/todayPrimaryAction.ts';
import { resolveActiveEmptyStart } from './resolveActiveEmptyStart.ts';
import {
  decideSavedWrite,
  honorCiteStart,
  pickHonoredStart,
  routineFromSession,
} from './honorSavedRoutine.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

const DAY = 24 * 60 * 60 * 1000;
const T0 = Date.parse('2026-08-17T10:00:00.000Z');

function sets(
  exerciseId: string,
  rows: { reps: number; weight: number }[]
): WorkoutExerciseTemplate {
  return { exerciseId, sets: rows };
}

function saved(
  over: Partial<SavedWorkout> & Pick<SavedWorkout, 'id' | 'name'>
): SavedWorkout {
  return {
    createdAt: new Date(T0).toISOString(),
    exercises: [sets('bench-press', [{ reps: 5, weight: 100 }])],
    ...over,
  };
}

function log(
  over: Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'id' | 'workoutName'>
): CompletedWorkoutLog {
  return {
    startedAt: new Date(T0).toISOString(),
    completedAt: new Date(T0 + 3600_000).toISOString(),
    durationSeconds: 3600,
    totalVolume: 1000,
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: [{ reps: 5, weight: 100 }],
      },
    ],
    ...over,
  };
}

const PPL: SavedWorkout[] = [
  saved({
    id: 's-push',
    name: 'Push',
    createdAt: new Date(T0).toISOString(),
    exercises: [
      sets('bench-press', [{ reps: 5, weight: 80 }]),
      sets('ohp', [{ reps: 8, weight: 40 }]),
    ],
  }),
  saved({
    id: 's-pull',
    name: 'Pull',
    createdAt: new Date(T0 + DAY).toISOString(),
    exercises: [sets('barbell-row', [{ reps: 8, weight: 70 }])],
  }),
  saved({
    id: 's-legs',
    name: 'Legs',
    createdAt: new Date(T0 + 2 * DAY).toISOString(),
    exercises: [sets('squat', [{ reps: 5, weight: 120 }])],
  }),
];

const HISTORY_PUSH_PULL: CompletedWorkoutLog[] = [
  log({
    id: 'h-push',
    workoutName: 'Push',
    completedAt: new Date(T0 + 3 * DAY).toISOString(),
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: [{ reps: 5, weight: 90 }],
      },
    ],
  }),
  log({
    id: 'h-pull',
    workoutName: 'Pull',
    completedAt: new Date(T0 + 4 * DAY).toISOString(),
    exercises: [
      {
        exerciseId: 'pull-ups',
        sets: [{ reps: 8, weight: 0 }],
      },
    ],
  }),
];

const NOW = { weekStart: '2026-08-17', dayOffset: 0 };

const READINESS = {
  Chest: { days: 5, statusKey: 'todayReadinessPrime' as const },
  Back: { days: 5, statusKey: 'todayReadinessPrime' as const },
  Legs: { days: 5, statusKey: 'todayReadinessPrime' as const },
  Shoulders: { days: 5, statusKey: 'todayReadinessPrime' as const },
  Arms: { days: 5, statusKey: 'todayReadinessPrime' as const },
  Core: { days: 5, statusKey: 'todayReadinessPrime' as const },
};

describe('routineFromSession / decideSavedWrite', () => {
  it('empty name or no lifts invents nothing', () => {
    assert.equal(routineFromSession({ name: '  ', exercises: [sets('bench-press', [{ reps: 5, weight: 80 }])] }), null);
    assert.equal(routineFromSession({ name: 'Push', exercises: [] }), null);
    assert.equal(routineFromSession({ name: 'Push', exercises: [sets('', [{ reps: 5, weight: 80 }])] }), null);
    assert.equal(decideSavedWrite([], { name: '', exercises: [] }).kind, 'empty');
  });

  it('same-name save without replace does not silent-wipe or append', () => {
    const decision = decideSavedWrite(PPL, {
      name: 'push',
      exercises: [sets('incline-press', [{ reps: 8, weight: 50 }])],
    });
    assert.equal(decision.kind, 'needs-replace');
    if (decision.kind !== 'needs-replace') return;
    assert.equal(decision.existingId, 's-push');
    assert.equal(decision.draft.exercises[0]?.exerciseId, 'incline-press');
  });

  it('replace flag updates that row; new name adds', () => {
    const replace = decideSavedWrite(
      PPL,
      { name: 'Push', exercises: [sets('dips', [{ reps: 8, weight: 0 }])] },
      { replace: true }
    );
    assert.equal(replace.kind, 'replace');
    if (replace.kind !== 'replace') return;
    assert.equal(replace.existingId, 's-push');

    const add = decideSavedWrite(PPL, {
      name: 'Upper',
      exercises: [sets('bench-press', [{ reps: 5, weight: 80 }])],
    });
    assert.equal(add.kind, 'add');
  });

  it('save keeps a shared group; orphan invents none', () => {
    const kept = routineFromSession({
      name: 'PPL circuit',
      exercises: [
        { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 80 }], supersetGroup: 'g1' },
        { exerciseId: 'barbell-row', sets: [{ reps: 8, weight: 70 }], supersetGroup: 'g1' },
        { exerciseId: 'curl', sets: [{ reps: 10, weight: 20 }] },
      ],
    });
    assert.ok(kept);
    assert.equal(kept!.exercises[0]?.supersetGroup, 'g1');
    assert.equal(kept!.exercises[1]?.supersetGroup, 'g1');
    assert.equal(kept!.exercises[2]?.supersetGroup, undefined);

    const orphan = routineFromSession({
      name: 'Solo',
      exercises: [
        { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 80 }], supersetGroup: 'lonely' },
      ],
    });
    assert.ok(orphan);
    assert.equal(orphan!.exercises[0]?.supersetGroup, undefined);
  });
});

describe('pickHonoredStart — save then Start uses their routine', () => {
  it('one saved routine is the Start, not last log / Just Go', () => {
    const start = pickHonoredStart({
      saved: [PPL[0]!],
      history: HISTORY_PUSH_PULL,
    });
    assert.ok(start);
    assert.equal(start!.name, 'Push');
    assert.deepEqual(
      start!.exercises.map((e) => e.exerciseId),
      ['bench-press', 'ohp']
    );
    assert.equal(start!.exercises[0]?.sets[0]?.weight, 80);
  });

  it('PPL notebook unused slot is next — Push then Pull logged ⇒ Legs', () => {
    const start = pickHonoredStart({
      saved: PPL,
      history: HISTORY_PUSH_PULL,
    });
    assert.equal(start?.id, 's-legs');
    assert.equal(start?.name, 'Legs');
    assert.equal(start?.exercises[0]?.exerciseId, 'squat');
  });
});

const HISTORY_PPL_LOGS: CompletedWorkoutLog[] = [
  log({
    id: 'h-legs-old',
    workoutName: 'Legs',
    completedAt: new Date(T0).toISOString(),
    exercises: [
      {
        exerciseId: 'deadlift',
        sets: [{ reps: 5, weight: 140 }],
      },
    ],
  }),
  ...HISTORY_PUSH_PULL,
];

describe('Wednesday cite does not overwrite a saved PPL', () => {
  it('honorCiteStart returns notebook Legs, not the log-shape cite', () => {
    const cite = nextDayFromLogs({ history: HISTORY_PPL_LOGS, now: NOW });
    assert.equal(cite?.name, 'Legs');
    assert.equal(cite?.source, 'logs');
    assert.equal(cite?.template?.exercises[0]?.exerciseId, 'deadlift');

    const start = honorCiteStart({
      cite,
      saved: PPL,
      history: HISTORY_PPL_LOGS,
    });
    assert.equal(start?.source, 'saved');
    if (start?.source !== 'saved') return;
    assert.equal(start.routine.name, 'Legs');
    assert.equal(start.routine.exercises[0]?.exerciseId, 'squat');
    assert.notEqual(start.routine.exercises[0]?.exerciseId, cite?.template?.exercises[0]?.exerciseId);
  });

  it('no saved routine still starts the log cite', () => {
    const cite = nextDayFromLogs({ history: HISTORY_PPL_LOGS, now: NOW });
    const start = honorCiteStart({
      cite,
      saved: [],
      history: HISTORY_PPL_LOGS,
    });
    assert.equal(start?.source, 'logs');
    if (start?.source !== 'logs') return;
    assert.equal(start.name, cite?.template?.name);
    assert.equal(start.exercises[0]?.exerciseId, 'deadlift');
  });
});

describe('thin history does not overwrite a saved notebook', () => {
  it('two named logs invent no Wednesday; honorCiteStart still returns saved', () => {
    const cite = nextDayFromLogs({ history: HISTORY_PUSH_PULL, now: NOW });
    assert.equal(cite, null);
    const start = honorCiteStart({
      cite,
      saved: PPL,
      history: HISTORY_PUSH_PULL,
    });
    assert.equal(start?.source, 'saved');
    if (start?.source !== 'saved') return;
    assert.equal(start.routine.exercises[0]?.exerciseId, 'squat');
  });
});

describe('empty history invents no program', () => {
  it('empty saved + empty history ⇒ null / Train empty', () => {
    assert.equal(pickHonoredStart({ saved: [], history: [] }), null);
    assert.equal(honorCiteStart({ cite: null, saved: [], history: [] }), null);
    assert.deepEqual(resolveActiveEmptyStart([]), { kind: 'empty' });
    assert.equal(nextDayFromLogs({ history: [], now: NOW }), null);
  });

  it('empty history with a saved routine still honors the notebook', () => {
    const start = pickHonoredStart({ saved: [PPL[0]!], history: [] });
    assert.equal(start?.name, 'Push');
  });
});

describe('runTodayPrimaryAction honors saved before Just Go / last', () => {
  it('save then Start uses their routine', async () => {
    const started: { name: string; ids: string[]; workoutId?: string }[] = [];
    await runTodayPrimaryAction({
      hasActiveWorkout: false,
      action: {
        label: 'Start',
        description: '',
        href: '/active',
        phase: 'commissioned',
        stepLabel: '',
        progressPct: 100,
      },
      recommendedFocus: { group: 'Chest', statusKey: 'todayReadinessPrime' },
      readiness: READINESS,
      history: HISTORY_PUSH_PULL,
      savedWorkouts: PPL,
      units: 'metric',
      equipment: 'full-gym',
      includeColdStart: true,
      startWorkout: (name, exercises, workoutId) => {
        started.push({
          name,
          ids: exercises.map((e) => e.exerciseId),
          workoutId,
        });
      },
      navigate: () => {},
    });
    assert.equal(started.length, 1);
    assert.equal(started[0]?.name, 'Legs');
    assert.deepEqual(started[0]?.ids, ['squat']);
    assert.equal(started[0]?.workoutId, 's-legs');
  });
});

describe('resolveActiveEmptyStart honors saved', () => {
  it('saved notebook wins over repeat last', () => {
    const start = resolveActiveEmptyStart(HISTORY_PUSH_PULL, PPL);
    assert.equal(start.kind, 'saved');
    if (start.kind !== 'saved') return;
    assert.equal(start.name, 'Legs');
    assert.equal(start.exercises[0]?.exerciseId, 'squat');
  });

  it('no saved still repeats last', () => {
    const start = resolveActiveEmptyStart(HISTORY_PUSH_PULL, []);
    assert.equal(start.kind, 'repeat_last');
  });
});

describe('honorSavedRoutine refuses shop / generate / silent wipe', () => {
  it('helper does not import generateWeek, Just Go, or catalog pick', () => {
    const src = read('src/lib/workout/honorSavedRoutine.ts');
    assert.doesNotMatch(src, /generateWeek/);
    assert.doesNotMatch(src, /justGoSession|buildJustGoSession/);
    assert.doesNotMatch(src, /from '@\/data\/exercises'/);
    assert.doesNotMatch(src, /from '@\/data\/programTemplates'/);
    assert.match(src, /pickHonoredStart/);
    assert.match(src, /honorCiteStart/);
  });

  it('Today Start wires saved before coach peek / Just Go', () => {
    const src = read('src/lib/todayPrimaryAction.ts');
    const fn = src.slice(src.indexOf('export async function runTodayPrimaryAction'));
    const honorAt = fn.indexOf('pickHonoredStart(');
    const coachAt = fn.indexOf('loadCoachTodayOptional(');
    const justGoAt = fn.indexOf('buildJustGoSession');
    assert.ok(honorAt >= 0, 'Today Start never calls pickHonoredStart');
    assert.ok(coachAt > honorAt, 'honor must run before Coach peek');
    assert.ok(justGoAt > honorAt, 'honor must run before Just Go');
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /startWorkoutFromStore\(name, exercises, workoutId\)/);
  });

  it('Wednesday outline Start goes through honorCiteStart', () => {
    const cite = read('src/components/coach/CoachNextDayCite.tsx');
    assert.match(cite, /honorCiteStart\(/);
    assert.doesNotMatch(cite, /startWorkout\(cite\.template/);
  });

  it('save doors confirm before write', () => {
    const door = read('src/components/workout/SaveHonoredRoutineDoor.tsx');
    assert.match(door, /data-testid="save-honored-confirm"/);
    assert.match(door, /onConfirm/);
    const builder = read('src/page-components/BuilderPage.tsx');
    assert.match(builder, /SaveHonoredRoutineDoor/);
    assert.doesNotMatch(
      builder.slice(builder.indexOf('const handleSave'), builder.indexOf('const handleStart')),
      /addSavedWorkout\(\{/
    );
  });

  it('swap/skip path still does not write saved or plan', () => {
    const src = read('src/lib/workout/sessionExerciseOnce.ts');
    assert.doesNotMatch(src, /savedWorkouts|addSavedWorkout|replaceSavedWorkout/);
    assert.doesNotMatch(src, /swapExerciseInPlan|savePlan|generateWeek/);
  });
});
