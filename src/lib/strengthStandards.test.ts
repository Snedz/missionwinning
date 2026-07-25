import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { e1rmKg, standardsResult, STANDARDS_LEVELS } from './strengthStandards';

describe('strengthStandards', () => {
  it('takes a single at face value and applies Epley above one rep', () => {
    assert.equal(e1rmKg(100, 1), 100);
    assert.ok(Math.abs(e1rmKg(100, 5) - 116.6667) < 0.001);
  });

  it('clamps reps into 1–12', () => {
    assert.equal(e1rmKg(100, 0), 100);
    assert.equal(e1rmKg(100, 40), e1rmKg(100, 12));
  });

  it('grades the mockup default honestly (male 78kg squat 100×5 → Beginner+)', () => {
    const r = standardsResult({
      sex: 'male',
      lift: 'squat',
      bodyweightKg: 78,
      weightKg: 100,
      reps: 5,
    });
    // e1RM 116.67 clears 1.25×78 = 97.5 but not 1.5×78 = 117.
    assert.equal(r.levelLabel, 'Beginner+');
    assert.equal(r.levelIndex, 1);
    assert.equal(r.nextLevel, 'Intermediate');
    assert.ok(r.toNextKg !== undefined && r.toNextKg > 0.3 && r.toNextKg < 0.4);
    assert.equal(r.rows.filter((row) => row.current).length, 1);
  });

  it('reports Starting below the first rung, with the first rung next', () => {
    const r = standardsResult({
      sex: 'female',
      lift: 'bench',
      bodyweightKg: 60,
      weightKg: 10,
      reps: 3,
    });
    assert.equal(r.levelLabel, 'Starting');
    assert.equal(r.levelIndex, -1);
    assert.equal(r.nextLevel, STANDARDS_LEVELS[0]);
    assert.equal(r.rows.some((row) => row.current), false);
  });

  it('tops out at Elite with no next level', () => {
    const r = standardsResult({
      sex: 'male',
      lift: 'deadlift',
      bodyweightKg: 80,
      weightKg: 250,
      reps: 1,
    });
    assert.equal(r.levelLabel, 'Elite');
    assert.equal(r.nextLevel, undefined);
    assert.equal(r.toNextKg, undefined);
  });

  it('ladders differ by sex and thresholds scale with bodyweight', () => {
    const m = standardsResult({ sex: 'male', lift: 'press', bodyweightKg: 80, weightKg: 50, reps: 1 });
    const f = standardsResult({ sex: 'female', lift: 'press', bodyweightKg: 80, weightKg: 50, reps: 1 });
    assert.notEqual(m.levelIndex, f.levelIndex);
    assert.equal(m.rows[0].thresholdKg, 0.35 * 80);
  });
});
