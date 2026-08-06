import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  journalReflectMayMount,
  REFLECT_WINDOW_HOURS,
} from '@/lib/today/journalReflectMount';

/** ISO stamp `hours` before (negative: after) the injected clock — no literals. */
function savedAtHoursAgo(now: Date, hours: number): string {
  return new Date(now.getTime() - hours * 3_600_000).toISOString();
}

describe('journalReflectMayMount', () => {
  const now = new Date();

  it('prompts for a fresh entry with no words', () => {
    assert.equal(
      journalReflectMayMount({ savedAt: savedAtHoursAgo(now, 2), workoutName: 'Push' }, now),
      true
    );
    assert.equal(
      journalReflectMayMount(
        { savedAt: savedAtHoursAgo(now, 2), workoutName: 'Push', fragments: [] },
        now
      ),
      true,
      'an empty fragments array is still an unanswered invitation'
    );
  });

  it('never prompts once the athlete has written', () => {
    assert.equal(
      journalReflectMayMount(
        { savedAt: savedAtHoursAgo(now, 2), workoutName: 'Push', fragments: ['felt strong'] },
        now
      ),
      false
    );
  });

  it('retires when the window passes', () => {
    assert.equal(
      journalReflectMayMount(
        { savedAt: savedAtHoursAgo(now, REFLECT_WINDOW_HOURS - 1), workoutName: 'Push' },
        now
      ),
      true
    );
    assert.equal(
      journalReflectMayMount(
        { savedAt: savedAtHoursAgo(now, REFLECT_WINDOW_HOURS + 1), workoutName: 'Push' },
        now
      ),
      false
    );
  });

  it('ignores null, future stamps, and unparseable stamps', () => {
    assert.equal(journalReflectMayMount(null, now), false);
    assert.equal(
      journalReflectMayMount(
        { savedAt: savedAtHoursAgo(now, -1), workoutName: 'Push' },
        now
      ),
      false,
      'clock skew is not a session'
    );
    assert.equal(
      journalReflectMayMount({ savedAt: 'not-a-date', workoutName: 'Push' }, now),
      false
    );
  });
});
