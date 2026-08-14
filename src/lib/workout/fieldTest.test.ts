import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractFieldTestEvents,
  FIELD_TEST_GARAGE_ID,
  FIELD_TEST_OFFICIAL_IDS,
  FIELD_TEST_SKIP_PREFIX,
  FIELD_TEST_WORKOUT_NAME,
  fieldTestSessionTemplate,
  fieldTestSkipNote,
  hasFieldTestSignature,
  isFieldTestLog,
  isFieldTestSkipNote,
  parseFieldTestParam,
  shouldStartFieldTestSession,
  stripFieldTestFromSearch,
} from '@/lib/workout/fieldTest';

const officialIds = Object.values(FIELD_TEST_OFFICIAL_IDS);

function ex(
  id: string,
  sets: Array<{ reps: number; weight: number; completed?: boolean; kind?: string }> = [],
  note?: string
) {
  return { exerciseId: id, sets, note };
}

describe('fieldTestSessionTemplate', () => {
  it('has the five official ids in order', () => {
    const session = fieldTestSessionTemplate();
    assert.equal(session.name, FIELD_TEST_WORKOUT_NAME);
    assert.deepEqual(
      session.exercises.map((e) => e.exerciseId),
      officialIds
    );
    assert.equal(session.exercises[0]?.sets[0]?.reps, 3);
    assert.ok(!session.exercises.some((e) => e.exerciseId === FIELD_TEST_GARAGE_ID));
  });
});

describe('garage + skip', () => {
  it('garage swap changes only SDC', () => {
    const session = fieldTestSessionTemplate();
    const swapped = session.exercises.map((e) =>
      e.exerciseId === FIELD_TEST_OFFICIAL_IDS.sdc
        ? { ...e, exerciseId: FIELD_TEST_GARAGE_ID }
        : e
    );
    assert.equal(swapped[2]?.exerciseId, FIELD_TEST_GARAGE_ID);
    assert.deepEqual(
      swapped.filter((_, i) => i !== 2).map((e) => e.exerciseId),
      officialIds.filter((id) => id !== FIELD_TEST_OFFICIAL_IDS.sdc)
    );
    const events = extractFieldTestEvents(swapped, { namedFieldTest: true });
    assert.equal(events.find((e) => e.slot === 'sdc')?.status, 'garage');
  });

  it('skip writes the prefix and yields unscored', () => {
    const note = fieldTestSkipNote('knee');
    assert.ok(note.startsWith(FIELD_TEST_SKIP_PREFIX));
    assert.equal(isFieldTestSkipNote(note), true);
    const events = extractFieldTestEvents(
      [
        ex(FIELD_TEST_OFFICIAL_IDS.mdl, [{ reps: 3, weight: 140, completed: true }]),
        ex(FIELD_TEST_OFFICIAL_IDS.hrp, [{ reps: 20, weight: 0, completed: true }]),
        ex(FIELD_TEST_OFFICIAL_IDS.sdc, [{ reps: 0, weight: 0, completed: false }], note),
        ex(FIELD_TEST_OFFICIAL_IDS.plk, [{ reps: 90, weight: 0, completed: true }]),
        ex(FIELD_TEST_OFFICIAL_IDS.run, [{ reps: 1320, weight: 0, completed: true }]),
      ],
      { namedFieldTest: true }
    );
    assert.equal(events.find((e) => e.slot === 'sdc')?.status, 'skipped');
    assert.equal(events.find((e) => e.slot === 'sdc')?.raw, null);
  });

  it('named field test missing SDC after finish is skipped', () => {
    const events = extractFieldTestEvents(
      [
        ex(FIELD_TEST_OFFICIAL_IDS.mdl, [{ reps: 3, weight: 140 }]),
        ex(FIELD_TEST_OFFICIAL_IDS.hrp, [{ reps: 20, weight: 0 }]),
        ex(FIELD_TEST_OFFICIAL_IDS.plk, [{ reps: 90, weight: 0 }]),
        ex(FIELD_TEST_OFFICIAL_IDS.run, [{ reps: 1320, weight: 0 }]),
      ],
      { namedFieldTest: true }
    );
    assert.equal(events.find((e) => e.slot === 'sdc')?.status, 'skipped');
  });
});

describe('isFieldTestLog', () => {
  it('matches name or signature; Just Go / starters are not field tests', () => {
    assert.equal(
      isFieldTestLog({ workoutName: FIELD_TEST_WORKOUT_NAME, exercises: [] }),
      true
    );
    assert.equal(
      isFieldTestLog({
        workoutName: 'Custom',
        exercises: officialIds.map((id) => ex(id, [{ reps: 1, weight: 0 }])),
      }),
      true
    );
    assert.equal(
      isFieldTestLog({
        workoutName: 'Custom',
        exercises: officialIds
          .filter((id) => id !== FIELD_TEST_OFFICIAL_IDS.sdc)
          .map((id) => ex(id, [{ reps: 1, weight: 0 }]))
          .concat([ex(FIELD_TEST_GARAGE_ID, [{ reps: 120, weight: 0 }])]),
      }),
      true
    );
    assert.equal(
      isFieldTestLog({
        workoutName: 'Just Go — Legs',
        exercises: [
          ex('deadlift', [{ reps: 5, weight: 100 }]),
          ex('plank', [{ reps: 60, weight: 0 }]),
          ex('squats', [{ reps: 8, weight: 60 }]),
        ],
      }),
      false
    );
    assert.equal(hasFieldTestSignature([ex('deadlift'), ex('plank')]), false);
  });
});

describe('fieldTest query', () => {
  it('parses and strips fieldTest=1', () => {
    assert.equal(parseFieldTestParam('?fieldTest=1'), true);
    assert.equal(parseFieldTestParam(new URLSearchParams('fieldTest=1')), true);
    assert.equal(parseFieldTestParam('?exercise=deadlift'), false);
    assert.equal(stripFieldTestFromSearch('?fieldTest=1&exercise=deadlift'), '?exercise=deadlift');
    assert.equal(shouldStartFieldTestSession(false), true);
    assert.equal(shouldStartFieldTestSession(true), false);
  });
});
