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
              dayOffset: 0,
              status: 'planned',
              exercises: [{ exerciseId: 'squat' }],
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
              dayOffset: 1,
              status: 'planned',
              exercises: [{ exerciseId: 'bench' }],
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
              dayOffset: 2,
              status: 'done',
              exercises: [{ exerciseId: 'row' }],
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
              dayOffset: 0,
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
