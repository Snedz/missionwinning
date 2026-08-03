import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { coachAdaptReentryIsPrescribed } from './coachAdaptReentry.ts';

describe('coachAdaptReentryIsPrescribed', () => {
  it('is false without todayOffset', () => {
    assert.equal(
      coachAdaptReentryIsPrescribed(
        {
          sessions: [
            {
              id: 'a',
              dayOffset: 0,
              name: 'A',
              kind: 'strength',
              focusGroups: [],
              estMinutes: 40,
              status: 'planned',
              exercises: [{ exerciseId: 'squat', sets: 3, reps: 5, weight: 100 }],
            },
          ],
        },
        undefined
      ),
      false
    );
  });

  it('is true when today has a live session with exercises', () => {
    assert.equal(
      coachAdaptReentryIsPrescribed(
        {
          sessions: [
            {
              id: 'a',
              dayOffset: 1,
              name: 'Upper',
              kind: 'strength',
              focusGroups: ['chest'],
              estMinutes: 45,
              status: 'planned',
              exercises: [{ exerciseId: 'bench', sets: 3, reps: 8, weight: 60 }],
            },
          ],
        },
        1
      ),
      true
    );
  });

  it('is false when today is already done', () => {
    assert.equal(
      coachAdaptReentryIsPrescribed(
        {
          sessions: [
            {
              id: 'a',
              dayOffset: 2,
              name: 'Done',
              kind: 'strength',
              focusGroups: [],
              estMinutes: 40,
              status: 'done',
              exercises: [{ exerciseId: 'row', sets: 3, reps: 8, weight: 50 }],
            },
          ],
        },
        2
      ),
      false
    );
  });

  it('is false when today has no exercises', () => {
    assert.equal(
      coachAdaptReentryIsPrescribed(
        {
          sessions: [
            {
              id: 'a',
              dayOffset: 0,
              name: 'Empty',
              kind: 'recovery',
              focusGroups: [],
              estMinutes: 20,
              status: 'planned',
              exercises: [],
            },
          ],
        },
        0
      ),
      false
    );
  });
});
