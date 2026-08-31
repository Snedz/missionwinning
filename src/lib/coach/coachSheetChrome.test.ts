/**
 * Coach first paint is empty + Generate, or this week's session (`.1062`).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const page = () =>
  readFileSync(path.join(root, 'page-components', 'CoachPage.tsx'), 'utf8');
const grid = () =>
  readFileSync(
    path.join(root, 'components', 'coach', 'CoachPlanSessionGrid.tsx'),
    'utf8'
  );

test('leftover hops stay off /coach', () => {
  const src = page();
  const jsx = src.slice(src.lastIndexOf('return ('));
  for (const name of [
    'CoachVoiceCard',
    'CoachLoadBand',
    'CoachLogCite',
    'CoachManageSheet',
    'CoachLiveVoice',
    'WeekStrip',
    'CoachChatPanel',
    'CoachAdaptBanner',
    'CoachNextDayCite',
  ]) {
    assert.doesNotMatch(jsx, new RegExp(`<${name}\\b`), `${name} is leftover on Coach`);
  }
  assert.doesNotMatch(jsx, /<details/);
  assert.doesNotMatch(jsx, /data-testid="coach-show-all"/);
});

test('first paint is Generate or this week’s session', () => {
  const src = page();
  const jsx = src.slice(src.lastIndexOf('return ('));
  assert.doesNotMatch(jsx, /<WeekStrip\b/);
  assert.doesNotMatch(jsx, /coach-week-dose/);
  assert.match(jsx, /mode="sheet"/);
  assert.doesNotMatch(jsx, /mode="week"/);
  assert.match(jsx, /data-testid="coach-generate-dock"/);
});

test('session cards still live in the grid, sheet mode uses the boss helper', () => {
  const src = grid();
  assert.match(src, /coachSheetSessions/);
  assert.match(src, /mode\?:\s*'week'\s*\|\s*'sheet'/);
  const pageSrc = page();
  assert.match(pageSrc, /CoachPlanSessionGrid/);
  assert.doesNotMatch(pageSrc, /<PlanSessionCard/);
});
