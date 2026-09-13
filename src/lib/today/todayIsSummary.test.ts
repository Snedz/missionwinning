/**
 * /log is the house desk — not Lean Summary and not a dashboard tour.
 *
 * HomePage mounts `<TodayDesk/>` for every journey phase. Lean and
 * Dashboard remain on disk as legacy shells; they are not this route.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const home = () =>
  readFileSync(path.join(root, 'src/page-components/HomePage.tsx'), 'utf8');
const desk = () =>
  readFileSync(path.join(root, 'src/page-components/TodayDesk.tsx'), 'utf8');

test('/log is the house desk in every journey phase', () => {
  const src = home();
  assert.match(src, /<TodayDesk\s*\/>/);
  assert.doesNotMatch(
    src,
    /HomeTodayLean|HomeTodayDashboard/,
    'Today must not swap onto Lean or the dashboard tour'
  );
  assert.doesNotMatch(
    src,
    /needsFullDashboard/,
    'a phase branch that loads the house is the tour'
  );
  assert.doesNotMatch(
    src,
    /phase === 'readiness'|phase === 'commissioned'/,
    'phase may still be read; it must not pick a second Today'
  );

  const d = desk();
  assert.match(d, /isTodayTrainReady\(/);
  assert.match(d, /includeColdStart:\s*true/);
  assert.match(d, /shouldRepeatLastOnToday\(/);
  assert.match(d, /getNextAction\(/);
  assert.doesNotMatch(d, /runTodayPrimaryAction\(/);
});
