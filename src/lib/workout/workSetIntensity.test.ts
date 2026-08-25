import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  appendIntensityCite,
  formatWorkSetIntensity,
  lastWorkSet,
  lastWorkSetIntensity,
  readWorkSetIntensity,
  sessionLastWorkSetIntensity,
} from '@/lib/workout/workSetIntensity';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

describe('readWorkSetIntensity', () => {
  it('reads rpe10 and rir when present', () => {
    assert.deepEqual(readWorkSetIntensity({ rpe10: 9, rir: 1, rpe: 'hard' }), {
      rpe10: 9,
      rir: 1,
    });
  });

  it('does not invent a 1–10 from categorical hard', () => {
    assert.deepEqual(readWorkSetIntensity({ rpe: 'hard', reps: 5 }), {});
    assert.equal(formatWorkSetIntensity(readWorkSetIntensity({ rpe: 'hard' })), null);
  });

  it('drops out-of-range and empty', () => {
    assert.deepEqual(readWorkSetIntensity({ rpe10: 11, rir: 6 }), {});
    assert.deepEqual(readWorkSetIntensity({}), {});
  });
});

describe('lastWorkSetIntensity', () => {
  it('quotes the last work set RPE 9', () => {
    assert.equal(
      lastWorkSetIntensity([
        { kind: 'warmup', reps: 8, weight: 40, rpe10: 4 },
        { kind: 'normal', reps: 5, weight: 100, rpe10: 9 },
      ]),
      'RPE 9'
    );
  });

  it('quotes RIR when that is what they logged', () => {
    assert.equal(
      lastWorkSetIntensity([{ kind: 'normal', reps: 5, weight: 100, rir: 1 }]),
      'RIR 1'
    );
  });

  it('joins both when both are present', () => {
    assert.equal(
      lastWorkSetIntensity([{ kind: 'normal', reps: 5, weight: 100, rpe10: 9, rir: 1 }]),
      'RPE 9 · RIR 1'
    );
  });

  it('warmup-only and empty invent nothing', () => {
    assert.equal(lastWorkSetIntensity([{ kind: 'warmup', reps: 8, rpe10: 9 }]), null);
    assert.equal(lastWorkSetIntensity([]), null);
    assert.equal(lastWorkSetIntensity(undefined), null);
  });

  it('does not walk back when the last work set is empty', () => {
    assert.equal(
      lastWorkSetIntensity([
        { kind: 'normal', reps: 5, weight: 80, rpe10: 9 },
        { kind: 'normal', reps: 5, weight: 80 },
      ]),
      null
    );
  });

  it('skips a trailing 0-rep leftover', () => {
    assert.equal(
      lastWorkSetIntensity([
        { kind: 'normal', reps: 5, weight: 80, rpe10: 8 },
        { kind: 'normal', reps: 0, weight: 80 },
      ]),
      'RPE 8'
    );
  });
});

describe('sessionLastWorkSetIntensity', () => {
  it('uses the last exercise that actually has a work set', () => {
    assert.equal(
      sessionLastWorkSetIntensity([
        { sets: [{ reps: 5, weight: 60, rpe10: 7 }] },
        { sets: [{ reps: 5, weight: 100, rpe10: 9 }] },
      ]),
      'RPE 9'
    );
  });

  it('empty session invents nothing', () => {
    assert.equal(sessionLastWorkSetIntensity([]), null);
    assert.equal(sessionLastWorkSetIntensity([{ sets: [{ kind: 'warmup', reps: 8 }] }]), null);
  });
});

describe('appendIntensityCite', () => {
  it('appends when present and leaves empty lines alone', () => {
    assert.equal(appendIntensityCite('From last Wed · set 3', 'RPE 9'), 'From last Wed · set 3 · RPE 9');
    assert.equal(appendIntensityCite('From last Wed · set 3', null), 'From last Wed · set 3');
    assert.equal(appendIntensityCite(null, null), null);
    assert.equal(appendIntensityCite(null, 'RPE 9'), 'RPE 9');
  });
});

describe('lastWorkSet', () => {
  it('skips warmup', () => {
    const last = lastWorkSet([
      { kind: 'warmup' as const, reps: 8 },
      { kind: 'normal' as const, reps: 5 },
    ]);
    assert.equal(last?.reps, 5);
  });
});

describe('intensity cite wiring — no invent, no autoreg', () => {
  it('adjacency and vs-last import the helper, not coach progression', () => {
    const adj = read('src/lib/workout/setRowAdjacency.ts');
    const vs = read('src/lib/workout/vsLastSet.ts');
    const wed = read('src/lib/coach/nextDayFromLogs.ts');
    assert.match(adj, /appendIntensityCite|lastWorkSetIntensity|workSetIntensity/);
    assert.match(vs, /appendIntensityCite|lastWorkSetIntensity|workSetIntensity/);
    assert.match(wed, /sessionLastWorkSetIntensity|workSetIntensity/);
    assert.doesNotMatch(adj, /nextTargets|allHard|Juggernaut/);
    assert.doesNotMatch(vs, /nextTargets|allHard/);
  });
});
