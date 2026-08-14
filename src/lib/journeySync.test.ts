import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { mergeJourneyStates } from './journeySync.ts';
import type { JourneyState } from '@/lib/missionJourney';

const base = (): JourneyState => ({
  phase: 'basic',
  iDay: { startedAt: 'a', acceptedMissionAt: 'b', completedAt: 'c' },
  basic: { workout: true, fuel: false, move: false, mind: false, learn: false },
  readiness: { parq: false, streakMet: false, winScoreSeen: false },
});

describe('mergeJourneyStates', () => {
  it('takes farthest phase', () => {
    const a = base();
    a.phase = 'basic';
    const b = base();
    b.phase = 'commissioned';
    b.commissionedAt = '2026-07-01';
    const m = mergeJourneyStates(a, b);
    assert.equal(m.phase, 'commissioned');
    assert.equal(m.commissionedAt, '2026-07-01');
  });

  it('ORs basic milestones from both sides', () => {
    const a = base();
    a.basic.workout = true;
    a.basic.fuel = false;
    const b = base();
    b.basic.workout = false;
    b.basic.fuel = true;
    const m = mergeJourneyStates(a, b);
    assert.equal(m.basic.workout, true);
    assert.equal(m.basic.fuel, true);
  });

  it('keeps earliest iDay timestamps when either side set', () => {
    const a = base();
    a.iDay = { startedAt: 't1', acceptedMissionAt: undefined, completedAt: undefined };
    const b = base();
    b.iDay = { startedAt: undefined, acceptedMissionAt: 't2', completedAt: 't3' };
    const m = mergeJourneyStates(a, b);
    assert.equal(m.iDay.startedAt, 't1');
    assert.equal(m.iDay.acceptedMissionAt, 't2');
    assert.equal(m.iDay.completedAt, 't3');
  });

  it('ORs readiness milestones and keeps earlier commissionedAt', () => {
    const a = base();
    a.phase = 'readiness';
    a.readiness = { parq: true, streakMet: false, winScoreSeen: true };
    const b = base();
    b.phase = 'commissioned';
    b.commissionedAt = '2026-06-01T00:00:00Z';
    b.readiness = { parq: false, streakMet: true, winScoreSeen: false };
    const m = mergeJourneyStates(a, b);
    assert.equal(m.phase, 'commissioned');
    assert.equal(m.readiness.parq, true);
    assert.equal(m.readiness.streakMet, true);
    assert.equal(m.readiness.winScoreSeen, true);
    assert.equal(m.commissionedAt, '2026-06-01T00:00:00Z');
  });

  it('is commutative for phase and milestones', () => {
    const a = base();
    a.phase = 'basic';
    a.basic = { workout: true, fuel: true, move: false, mind: false, learn: false };
    const b = base();
    b.phase = 'readiness';
    b.basic = { workout: false, fuel: false, move: true, mind: true, learn: true };
    b.readiness = { parq: true, streakMet: false, winScoreSeen: true };
    const ab = mergeJourneyStates(a, b);
    const ba = mergeJourneyStates(b, a);
    assert.equal(ab.phase, ba.phase);
    assert.deepEqual(ab.basic, ba.basic);
    assert.deepEqual(ab.readiness, ba.readiness);
  });
});

it('sign-in path asks the storage planner instead of always merge+push', () => {
  const src = readFileSync(join(import.meta.dirname, 'journeySync.ts'), 'utf8');
  assert.match(src, /planSignInStorage/);
  assert.match(src, /stripRestrictedHealthLocal/);
  assert.match(src, /replace-from-cloud/);
});
