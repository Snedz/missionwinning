/**
 * Victory first paint is the close receipt: stats + lift table + one Next.
 * Feel, share, rewards, debrief live in Show all. (`.956`)
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

test('the Victory house is behind Show all, not on first paint', () => {
  const src = sheet();
  const jsx = src.slice(src.indexOf('return ('));
  const open = jsx.split('<details')[0];
  for (const name of [
    'VictoryFeelStrip',
    'VictoryRewardsLine',
    'VictorySecondaryLinks',
    'SessionDebriefCard',
    'FieldTestReceiptStrip',
    'VictoryBodyDeltaStrip',
  ]) {
    assert.doesNotMatch(open, new RegExp(`<${name}\\b`), `${name} is on first paint`);
  }
  assert.doesNotMatch(open, /handleShare/, 'Share is on first paint');
  assert.match(jsx, /<details/);
  assert.match(jsx, /data-testid="victory-show-all"/);
  assert.match(jsx, /<VictoryFeelStrip\b/);
  assert.match(jsx, /<VictoryRewardsLine\b/);
});

test('first paint is the close receipt and the Next dock', () => {
  const src = sheet();
  const jsx = src.slice(src.indexOf('return ('));
  const open = jsx.split('<details')[0];
  assert.match(open, /<VictoryStatsStrip\b/);
  assert.match(open, /<VictoryReceiptStrip\b/, 'lift table is the keepable close, not Show all');
  assert.match(open, /<SessionJotField\b/, 'session notes sit on the receipt, not Show all');
  assert.equal(
    (jsx.match(/<VictoryReceiptStrip\b/g) ?? []).length,
    1,
    'one session, one receipt'
  );
  assert.match(open, /onSaveReceipt=/);
  assert.match(jsx, /data-testid="victory-next-dock"/);
  assert.match(jsx, /<VictoryNextActionStrip\b/);
});
