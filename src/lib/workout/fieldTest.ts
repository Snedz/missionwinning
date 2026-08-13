/**
 * Five-event field test — free logger session.
 *
 * Inspired by the Army 5-event battery (internal only). Public name is
 * Field test / Five-event field test. Scoring lives in fieldTestScore.ts.
 */

import type { WorkoutExerciseTemplate } from '@/types';
import { countsTowardVolume } from '@/lib/workout/setKind';
import type { FieldTestScaleEventId } from '@/data/fieldTestAcftScales';

export const FIELD_TEST_WORKOUT_NAME = 'Five-event field test';
export const FIELD_TEST_SKIP_PREFIX = 'field-test:skip:';
export const FIELD_TEST_QUERY = 'fieldTest';
export const FIELD_TEST_GARAGE_ID = 'field-shuttle-carry';

export const FIELD_TEST_OFFICIAL_IDS = {
  mdl: 'deadlift',
  hrp: 'hand-release-push-up',
  sdc: 'sprint-drag-carry',
  plk: 'plank',
  run: 'two-mile-run',
} as const;

export const FIELD_TEST_SLOTS: readonly FieldTestScaleEventId[] = [
  'mdl',
  'hrp',
  'sdc',
  'plk',
  'run',
];

export type FieldTestEventStatus = 'official' | 'garage' | 'skipped' | 'missing';

export type FieldTestRawEvent = {
  slot: FieldTestScaleEventId;
  raw: number | null;
  status: FieldTestEventStatus;
};

type FieldTestExercise = {
  exerciseId: string;
  sets: Array<{
    reps: number;
    weight: number;
    kind?: string;
    completed?: boolean;
  }>;
  note?: string;
};

type FieldTestNamed = {
  workoutName?: string;
  exercises?: FieldTestExercise[];
};

function setIsWorking(set: FieldTestExercise['sets'][number]): boolean {
  if (set.completed === false) return false;
  return countsTowardVolume(set.kind);
}

function workingSets(ex: FieldTestExercise | undefined): FieldTestExercise['sets'] {
  return ex?.sets.filter(setIsWorking) ?? [];
}

export function isFieldTestSkipNote(note: string | undefined | null): boolean {
  return typeof note === 'string' && note.startsWith(FIELD_TEST_SKIP_PREFIX);
}

export function fieldTestSkipNote(existing?: string): string {
  if (isFieldTestSkipNote(existing)) return existing ?? FIELD_TEST_SKIP_PREFIX;
  return `${FIELD_TEST_SKIP_PREFIX}${existing ?? ''}`;
}

export function isFieldTestSdcSlot(exerciseId: string): boolean {
  return (
    exerciseId === FIELD_TEST_OFFICIAL_IDS.sdc || exerciseId === FIELD_TEST_GARAGE_ID
  );
}

export function fieldTestSessionTemplate(): {
  name: string;
  exercises: WorkoutExerciseTemplate[];
} {
  return {
    name: FIELD_TEST_WORKOUT_NAME,
    exercises: [
      { exerciseId: FIELD_TEST_OFFICIAL_IDS.mdl, sets: [{ reps: 3, weight: 0 }] },
      { exerciseId: FIELD_TEST_OFFICIAL_IDS.hrp, sets: [{ reps: 0, weight: 0 }] },
      { exerciseId: FIELD_TEST_OFFICIAL_IDS.sdc, sets: [{ reps: 0, weight: 0 }] },
      { exerciseId: FIELD_TEST_OFFICIAL_IDS.plk, sets: [{ reps: 0, weight: 0 }] },
      { exerciseId: FIELD_TEST_OFFICIAL_IDS.run, sets: [{ reps: 0, weight: 0 }] },
    ],
  };
}

export function hasFieldTestSignature(exercises: FieldTestExercise[]): boolean {
  const ids = new Set(exercises.map((ex) => ex.exerciseId));
  const officialNonSdc = (
    ['mdl', 'hrp', 'plk', 'run'] as const
  ).every((slot) => ids.has(FIELD_TEST_OFFICIAL_IDS[slot]));
  if (!officialNonSdc) return false;
  return ids.has(FIELD_TEST_OFFICIAL_IDS.sdc) || ids.has(FIELD_TEST_GARAGE_ID);
}

export function isFieldTestLog(log: FieldTestNamed): boolean {
  if (log.workoutName === FIELD_TEST_WORKOUT_NAME) return true;
  return hasFieldTestSignature(log.exercises ?? []);
}

function findById(
  exercises: FieldTestExercise[],
  id: string
): FieldTestExercise | undefined {
  return exercises.find((ex) => ex.exerciseId === id);
}

function bestRaw(
  slot: FieldTestScaleEventId,
  sets: FieldTestExercise['sets']
): number | null {
  if (sets.length === 0) return null;
  if (slot === 'mdl') {
    const threes = sets.filter((s) => s.reps === 3);
    const pool = threes.length > 0 ? threes : sets;
    return Math.max(...pool.map((s) => s.weight));
  }
  if (slot === 'hrp' || slot === 'plk') {
    return Math.max(...sets.map((s) => s.reps));
  }
  const times = sets.map((s) => s.reps).filter((n) => n > 0);
  if (times.length === 0) return null;
  return Math.min(...times);
}

function slotFromExercise(
  slot: FieldTestScaleEventId,
  ex: FieldTestExercise | undefined,
  status: FieldTestEventStatus
): FieldTestRawEvent {
  const sets = workingSets(ex);
  return {
    slot,
    raw: bestRaw(slot, sets),
    status,
  };
}

/**
 * Read the five slots from a session or completed log.
 *
 * A named field test that finished without SDC/garage (store drops empty
 * exercises) is `skipped`, not a different product.
 */
export function extractFieldTestEvents(
  exercises: FieldTestExercise[],
  opts?: { namedFieldTest?: boolean }
): FieldTestRawEvent[] {
  const named = opts?.namedFieldTest === true;
  return FIELD_TEST_SLOTS.map((slot) => {
    if (slot === 'sdc') {
      const garage = findById(exercises, FIELD_TEST_GARAGE_ID);
      if (garage) return slotFromExercise(slot, garage, 'garage');
      const official = findById(exercises, FIELD_TEST_OFFICIAL_IDS.sdc);
      if (official) {
        const sets = workingSets(official);
        if (isFieldTestSkipNote(official.note) && sets.length === 0) {
          return { slot, raw: null, status: 'skipped' };
        }
        if (sets.length === 0) {
          return {
            slot,
            raw: null,
            status: isFieldTestSkipNote(official.note) ? 'skipped' : 'missing',
          };
        }
        return slotFromExercise(slot, official, 'official');
      }
      return {
        slot,
        raw: null,
        status: named ? 'skipped' : 'missing',
      };
    }

    const official = findById(exercises, FIELD_TEST_OFFICIAL_IDS[slot]);
    if (!official) return { slot, raw: null, status: 'missing' };
    const sets = workingSets(official);
    if (isFieldTestSkipNote(official.note) && sets.length === 0) {
      return { slot, raw: null, status: 'skipped' };
    }
    if (sets.length === 0) return { slot, raw: null, status: 'missing' };
    return slotFromExercise(slot, official, 'official');
  });
}

export function parseFieldTestParam(
  source: URLSearchParams | string | null | undefined
): boolean {
  if (source == null || source === '') return false;
  const params =
    typeof source === 'string'
      ? new URLSearchParams(source.startsWith('?') ? source.slice(1) : source)
      : source;
  const raw = params.get(FIELD_TEST_QUERY)?.trim() ?? '';
  return raw === '1' || raw.toLowerCase() === 'true';
}

export function stripFieldTestFromSearch(search: string): string {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  params.delete(FIELD_TEST_QUERY);
  const q = params.toString();
  return q ? `?${q}` : '';
}

export function shouldStartFieldTestSession(hasLoggedWork: boolean): boolean {
  return !hasLoggedWork;
}
