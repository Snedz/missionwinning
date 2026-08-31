/**
 * Victory first paint is title + stats + one Next. Leftover hops stay off
 * the overlay (`.1061`).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const sheet = () =>
  readFileSync(
    path.join(
      import.meta.dirname,
      '..',
      '..',
      'components',
      'workout',
      'WorkoutVictorySheet.tsx'
    ),
    'utf8'
  );

test('leftover hops stay off the overlay', () => {
  const src = sheet();
  const jsx = src.slice(src.indexOf('return ('));
  for (const name of [
    'VictoryFeelStrip',
    'VictoryRewardsLine',
    'VictorySecondaryLinks',
    'SessionDebriefCard',
    'FieldTestReceiptStrip',
    'VictoryBodyDeltaStrip',
    'VictoryReceiptStrip',
    'SessionJotField',
  ]) {
    assert.doesNotMatch(jsx, new RegExp(`<${name}\\b`), `${name} is leftover on Victory`);
  }
  assert.doesNotMatch(jsx, /handleShare/);
  assert.doesNotMatch(jsx, /<details/);
  assert.doesNotMatch(jsx, /data-testid="victory-show-all"/);
});

test('first paint is stats and the Next dock', () => {
  const src = sheet();
  const jsx = src.slice(src.indexOf('return ('));
  assert.match(jsx, /<VictoryStatsStrip\b/);
  assert.match(jsx, /data-testid="victory-next-dock"/);
  assert.match(jsx, /<VictoryNextActionStrip\b/);
});
