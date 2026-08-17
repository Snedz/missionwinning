/**
 * Coach first paint is this week's session. The house lives in Show all.
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

test('the week house is behind Show all, not on first paint', () => {
  const src = page();
  const jsx = src.slice(src.lastIndexOf('return ('));
  const open = jsx.split('<details')[0];
  for (const name of [
    'CoachVoiceCard',
    'CoachLoadBand',
    'CoachLogCite',
    'CoachManageSheet',
  ]) {
    assert.doesNotMatch(open, new RegExp(`<${name}\\b`), `${name} is on first paint`);
  }
  assert.match(jsx, /<details/);
  assert.match(jsx, /<CoachVoiceCard\b/);
  assert.match(jsx, /<CoachLoadBand\b/);
  assert.match(jsx, /<CoachLogCite\b/);
  assert.match(jsx, /<CoachChatPanel\b/);
});

test('first paint is the week strip plus the one session', () => {
  const src = page();
  const jsx = src.slice(src.lastIndexOf('return ('));
  const open = jsx.split('<details')[0];
  assert.match(open, /<WeekStrip\b/);
  assert.match(open, /coach-week-dose/);
  assert.match(open, /mode="sheet"/);
  assert.match(jsx, /mode="week"/);
});

test('session cards still live in the grid, sheet mode uses the boss helper', () => {
  const src = grid();
  assert.match(src, /coachSheetSessions/);
  assert.match(src, /mode\?:\s*'week'\s*\|\s*'sheet'/);
  const pageSrc = page();
  assert.match(pageSrc, /CoachPlanSessionGrid/);
  assert.doesNotMatch(pageSrc, /<PlanSessionCard/);
});
