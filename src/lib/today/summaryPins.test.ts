/**
 * Summary pins — Today is a pin grid, not a tour.
 *
 * Cold default is one pin. Never more than four. Lean Today mounts the
 * pin strip and drops encourage / coach-invite (`.891`).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_SUMMARY_PIN_IDS,
  SUMMARY_PIN_MAX,
  clampSummaryPins,
  defaultSummaryPins,
  parseSummaryPinIds,
  resolveSummaryPins,
  type SummaryPin,
} from './summaryPins.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const lean = () =>
  readFileSync(path.join(root, 'src/page-components/HomeTodayLean.tsx'), 'utf8');

test('cold Today gets exactly one start pin', () => {
  const pins = defaultSummaryPins({ lastSessionName: null, hasActiveWorkout: false });
  assert.equal(pins.length, 1);
  assert.equal(pins[0].kind, 'start');
});

test('a last session is the one pin — not a second CTA', () => {
  const pins = defaultSummaryPins({
    lastSessionName: 'Just Go — Chest',
    hasActiveWorkout: false,
  });
  assert.equal(pins.length, 1);
  assert.equal(pins[0].kind, 'last');
  assert.equal(pins[0].sessionName, 'Just Go — Chest');
});

test('an open session labels the pin resume', () => {
  const pins = defaultSummaryPins({
    lastSessionName: 'Just Go — Chest',
    hasActiveWorkout: true,
  });
  assert.equal(pins[0].kind, 'resume');
});

test('clamp never exceeds four', () => {
  const extra: SummaryPin[] = Array.from({ length: 6 }, (_, i) => ({
    id: `p${i}`,
    kind: 'start' as const,
    sessionName: null,
  }));
  assert.equal(clampSummaryPins(extra).length, SUMMARY_PIN_MAX);
  assert.equal(SUMMARY_PIN_MAX, 4);
});

test('HomeTodayLean mounts the pin strip and drops tour chrome', () => {
  const src = lean();
  assert.match(src, /<TodaySummaryPins\b/);
  assert.match(src, /resolveSummaryPins\(/);
  assert.doesNotMatch(src, /todayBasicEncouragement/);
  assert.doesNotMatch(src, /todayCoachInviteMayMount/);
  assert.doesNotMatch(src, /<FirstStepsCard\b/);
});

test('missing storage is the default session pin, not a wallpaper catalog', () => {
  assert.deepEqual(parseSummaryPinIds(null), [...DEFAULT_SUMMARY_PIN_IDS]);
  assert.deepEqual(parseSummaryPinIds('not-json'), [...DEFAULT_SUMMARY_PIN_IDS]);
});

test('an explicit empty list is allowed — 0 pins is honest', () => {
  assert.deepEqual(parseSummaryPinIds('[]'), []);
});

test('unknown and duplicate pin ids are dropped; four is the ceiling', () => {
  assert.deepEqual(parseSummaryPinIds('["session","fuel","session","mind","coach","x"]'), [
    'session',
    'fuel',
    'coach',
  ]);
});

test('resolve keeps session as start/last/resume and adds door pins', () => {
  const pins = resolveSummaryPins({
    ids: ['session', 'fuel', 'coach'],
    lastSessionName: 'Bench',
    hasActiveWorkout: false,
  });
  assert.equal(pins[0].kind, 'last');
  assert.equal(pins[1].kind, 'fuel');
  assert.equal(pins[1].href, '/nutrition');
  assert.equal(pins[2].kind, 'coach');
  assert.equal(pins[2].href, '/coach');
});
