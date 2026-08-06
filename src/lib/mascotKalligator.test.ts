import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');

const POSES = ['idle', 'invite', 'celebrate'] as const;

test('Kalligator mascot kit files exist', () => {
  for (const pose of POSES) {
    const p = path.join(root, 'public', 'brand', 'mascot', `kalligator-${pose}.webp`);
    assert.ok(existsSync(p), p);
  }
  assert.ok(existsSync(path.join(root, 'public', 'brand', 'mascot', 'kalligator-mark.svg')));
});

test('Scout assets are retired', () => {
  for (const pose of POSES) {
    assert.ok(
      !existsSync(path.join(root, 'public', 'brand', 'mascot', `scout-${pose}.webp`)),
      `scout-${pose} should be removed`
    );
  }
});

test('product surfaces wire Kalligator paths', () => {
  const victory = readFileSync(
    path.join(root, 'src/components/workout/WorkoutVictorySheet.tsx'),
    'utf8'
  );
  const history = readFileSync(path.join(root, 'src/page-components/HistoryPage.tsx'), 'utf8');
  assert.match(victory, /kalligator-celebrate\.webp/);
  assert.doesNotMatch(victory, /scout-celebrate/);
  assert.match(history, /kalligator-invite\.webp/);
  assert.doesNotMatch(history, /scout-invite/);
});
