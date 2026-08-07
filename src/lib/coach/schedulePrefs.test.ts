/**
 * The clamp is the feature.
 *
 * `daysPerWeek` reaches the plan engine, which sizes a training week from it.
 * The stored value is a raw string in `localStorage` — editable by hand, shared
 * across app versions, and occasionally garbage. A `0` would generate an empty
 * week; a `14` would generate a week that cannot be trained. So the read path
 * accepts only 2–6 and otherwise falls back to a default chosen by experience,
 * and the write path clamps before storing.
 *
 * Both halves are asserted here because they fail differently: a broken read
 * corrupts a plan for an athlete whose storage was already odd, while a broken
 * write corrupts it for everyone from the moment they touch the slider.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw, writeJson, writeRaw, __resetForTests } from '@/lib/storage/safeStorage';
import {
  defaultDaysPerWeek,
  loadDaysPerWeek,
  loadPreferredDays,
  saveDaysPerWeek,
  savePreferredDays,
} from '@/lib/coach/schedulePrefs';

beforeEach(() => __resetForTests());

describe('defaultDaysPerWeek', () => {
  it('scales with experience, and treats anything unrecognised as a beginner', () => {
    assert.equal(defaultDaysPerWeek('advanced'), 5);
    assert.equal(defaultDaysPerWeek('intermediate'), 4);
    assert.equal(defaultDaysPerWeek('beginner'), 3);
    // The conservative default matters: an unknown string must not be read as
    // "experienced" and hand a novice a five-day week.
    for (const odd of ['', 'ADVANCED', 'pro', 'unknown', 'elite']) {
      assert.equal(defaultDaysPerWeek(odd), 3, `"${odd}" must fall back to the beginner default`);
    }
  });
});

describe('loadDaysPerWeek', () => {
  it('returns a stored value inside the accepted range', () => {
    for (const n of [2, 3, 4, 5, 6]) {
      __resetForTests();
      writeRaw(STORAGE_KEYS.daysPerWeek, String(n));
      assert.equal(loadDaysPerWeek('beginner'), n);
    }
  });

  it('rejects an out-of-range stored value and uses the experience default', () => {
    for (const bad of ['0', '1', '7', '99', '-3']) {
      __resetForTests();
      writeRaw(STORAGE_KEYS.daysPerWeek, bad);
      assert.equal(
        loadDaysPerWeek('advanced'),
        5,
        `stored "${bad}" is untrainable and must not survive the read`
      );
    }
  });

  it('rejects a non-numeric stored value rather than propagating NaN', () => {
    for (const junk of ['', 'four', 'null', '{}']) {
      __resetForTests();
      writeRaw(STORAGE_KEYS.daysPerWeek, junk);
      const days = loadDaysPerWeek('intermediate');
      assert.ok(Number.isFinite(days), `"${junk}" produced a non-finite ${days}`);
      assert.equal(days, 4);
    }
  });

  it('falls back to the stored experience when the caller names none', () => {
    writeRaw(STORAGE_KEYS.experience, 'advanced');
    assert.equal(loadDaysPerWeek(), 5);
  });

  it('lets an explicit experience argument win over stored experience', () => {
    writeRaw(STORAGE_KEYS.experience, 'advanced');
    assert.equal(
      loadDaysPerWeek('beginner'),
      3,
      'the caller knows the current onboarding answer; storage may be stale'
    );
  });

  it('defaults to beginner when neither a value nor an experience is known', () => {
    assert.equal(loadDaysPerWeek(), 3);
  });
});

describe('saveDaysPerWeek', () => {
  it('clamps to the trainable range in both directions before storing', () => {
    saveDaysPerWeek(99);
    assert.equal(readRaw(STORAGE_KEYS.daysPerWeek), '6');

    saveDaysPerWeek(0);
    assert.equal(readRaw(STORAGE_KEYS.daysPerWeek), '2');

    saveDaysPerWeek(-5);
    assert.equal(readRaw(STORAGE_KEYS.daysPerWeek), '2');
  });

  it('round-trips a legal value through the read path unchanged', () => {
    saveDaysPerWeek(4);
    assert.equal(loadDaysPerWeek('advanced'), 4, 'a saved value must beat the experience default');
  });
});

describe('loadPreferredDays / savePreferredDays', () => {
  it('round-trips valid weekday indices', () => {
    savePreferredDays([1, 3, 5]);
    assert.deepEqual(loadPreferredDays(), [1, 3, 5]);
  });

  it('drops indices outside a week on the way in', () => {
    savePreferredDays([-1, 0, 6, 7, 42]);
    assert.deepEqual(loadPreferredDays(), [0, 6], 'only 0–6 are weekdays');
  });

  it('drops non-numbers on the way out, whatever storage holds', () => {
    // Storage is shared with older builds and hand-edits; a string index would
    // otherwise reach the plan engine and silently match no day.
    writeJson(STORAGE_KEYS.preferredDays, [1, '2', null, 3, {}, 4.5, 9]);
    assert.deepEqual(loadPreferredDays(), [1, 3, 4.5]);
  });

  it('returns an empty list when storage holds something that is not a list', () => {
    writeJson(STORAGE_KEYS.preferredDays, { monday: true });
    assert.deepEqual(loadPreferredDays(), []);
    __resetForTests();
    assert.deepEqual(loadPreferredDays(), []);
  });
});
