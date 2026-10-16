import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  acceptNextTargets,
  type AcceptedTarget,
  type ProposedTarget,
} from './nextTargetAccept';

test('empty proposed → ok false, reason empty proposal, current unchanged', () => {
  const current: AcceptedTarget[] = [
    { exerciseId: 'bench-press', weight: 60, reps: 8, acceptedAt: '2024-01-15T10:00:00Z' },
  ];
  const result = acceptNextTargets(current, [], '2024-01-16T10:00:00Z');

  assert.equal(result.ok, false);
  assert.equal(result.reason, 'empty proposal');
  assert.deepEqual(result.targets, current);
});

test('one valid proposed into empty current → ok true, one target with acceptedAt', () => {
  const proposed: ProposedTarget[] = [
    { exerciseId: 'squats', weight: 80, reps: 5 },
  ];
  const result = acceptNextTargets([], proposed, '2024-01-16T10:00:00Z');

  assert.equal(result.ok, true);
  assert.equal(result.targets.length, 1);
  assert.equal(result.targets[0].exerciseId, 'squats');
  assert.equal(result.targets[0].weight, 80);
  assert.equal(result.targets[0].reps, 5);
  assert.equal(result.targets[0].acceptedAt, '2024-01-16T10:00:00Z');
});

test('proposed updates an existing exerciseId weight/reps and refreshes acceptedAt', () => {
  const current: AcceptedTarget[] = [
    { exerciseId: 'bench-press', weight: 60, reps: 8, acceptedAt: '2024-01-15T10:00:00Z' },
  ];
  const proposed: ProposedTarget[] = [
    { exerciseId: 'bench-press', weight: 65, reps: 6 },
  ];
  const result = acceptNextTargets(current, proposed, '2024-01-16T12:00:00Z');

  assert.equal(result.ok, true);
  assert.equal(result.targets.length, 1);
  assert.equal(result.targets[0].exerciseId, 'bench-press');
  assert.equal(result.targets[0].weight, 65);
  assert.equal(result.targets[0].reps, 6);
  assert.equal(result.targets[0].acceptedAt, '2024-01-16T12:00:00Z');
});

test('proposed with both weight and reps null is skipped; if all skipped → ok false no valid targets', () => {
  const current: AcceptedTarget[] = [
    { exerciseId: 'bench-press', weight: 60, reps: 8, acceptedAt: '2024-01-15T10:00:00Z' },
  ];
  const proposed: ProposedTarget[] = [
    { exerciseId: 'deadlift', weight: null, reps: null },
  ];
  const result = acceptNextTargets(current, proposed, '2024-01-16T10:00:00Z');

  assert.equal(result.ok, false);
  assert.equal(result.reason, 'no valid targets');
  assert.deepEqual(result.targets, current);
});

test('invalid acceptedAt → ok false, current unchanged', () => {
  const current: AcceptedTarget[] = [
    { exerciseId: 'bench-press', weight: 60, reps: 8, acceptedAt: '2024-01-15T10:00:00Z' },
  ];
  const proposed: ProposedTarget[] = [
    { exerciseId: 'squats', weight: 80, reps: 5 },
  ];
  const result = acceptNextTargets(current, proposed, 'not-a-date');

  assert.equal(result.ok, false);
  assert.equal(result.reason, 'invalid acceptedAt');
  assert.deepEqual(result.targets, current);
});

test('weight negative or reps 0 skipped; a second valid row still applies (ok true)', () => {
  const proposed: ProposedTarget[] = [
    { exerciseId: 'bad-weight', weight: -10, reps: 5 },
    { exerciseId: 'bad-reps', weight: 100, reps: 0 },
    { exerciseId: 'good-lift', weight: 80, reps: 5 },
  ];
  const result = acceptNextTargets([], proposed, '2024-01-16T10:00:00Z');

  assert.equal(result.ok, true);
  assert.equal(result.targets.length, 1);
  assert.equal(result.targets[0].exerciseId, 'good-lift');
  assert.equal(result.targets[0].weight, 80);
  assert.equal(result.targets[0].reps, 5);
});
