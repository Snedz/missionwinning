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

test('Talk sits after this week’s session, not above the strip', () => {
  const src = page();
  const jsx = src.slice(src.lastIndexOf('return ('));
  const open = jsx.split('<details')[0];
  const week = open.indexOf('<WeekStrip');
  const sheet = open.indexOf('mode="sheet"');
  const live = open.indexOf('<CoachLiveVoice');
  assert.ok(week >= 0, 'week strip is on first paint');
  assert.ok(sheet >= 0, 'today’s session sheet is on first paint');
  assert.ok(live >= 0, 'live talk is on the main Coach surface');
  assert.ok(live > week, 'Talk sits after the week strip');
  assert.ok(live > sheet, 'Talk sits after this week’s session sheet');
  assert.doesNotMatch(jsx.split('<details')[1] ?? '', /<CoachLiveVoice\b/, 'Talk is not in Show all');
});

test('Talk is ready when the page is ready — a missing week is not a missing coach', () => {
  const src = page();
  assert.equal((src.match(/<CoachLiveVoice\b/g) || []).length, 1, 'one Talk mount');
  assert.match(
    src,
    /\{!loading \? \(\s*<CoachLiveVoice\b/,
    'Talk mounts on !loading, not only inside plan && !locked'
  );
});

test('session cards still live in the grid, sheet mode uses the boss helper', () => {
  const src = grid();
  assert.match(src, /coachSheetSessions/);
  assert.match(src, /mode\?:\s*'week'\s*\|\s*'sheet'/);
  const pageSrc = page();
  assert.match(pageSrc, /CoachPlanSessionGrid/);
  assert.doesNotMatch(pageSrc, /<PlanSessionCard/);
});
