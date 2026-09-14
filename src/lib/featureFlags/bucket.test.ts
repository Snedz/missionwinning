import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flagBucket } from './bucket';

test('the same flag and subject always land in the same bucket', () => {
  const a = flagBucket('example_staged', 'user-1');
  const b = flagBucket('example_staged', 'user-1');
  assert.equal(a, b);
  assert.ok(a >= 0 && a <= 99);
});

test('different subjects can land in different buckets', () => {
  const buckets = new Set(
    Array.from({ length: 40 }, (_, i) => flagBucket('example_staged', `user-${i}`))
  );
  assert.ok(buckets.size > 1, 'a degenerate hash that maps everyone to one bucket cannot stage a rollout');
});

test('the flag key is part of the hash so two flags do not share a cohort', () => {
  const subject = 'user-stable';
  const same =
    flagBucket('flag-a', subject) === flagBucket('flag-b', subject) &&
    flagBucket('flag-a', 'other') === flagBucket('flag-b', 'other');
  assert.equal(
    same,
    false,
    'if the flag key is dropped from the hash, every flag shares one cohort'
  );
});
