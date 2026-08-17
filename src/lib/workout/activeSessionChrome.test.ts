/**
 * Live session first paint is name + table + rest.
 * Coach tip, Cue me, and plates live in overflow. Speech does not own Train.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

const chrome = () => read('src/components/workout/ActiveSessionChrome.tsx');
const page = () => read('src/page-components/ActiveWorkoutPage.tsx');

test('header first paint is the name, not plates or a coach lecture', () => {
  const src = chrome();
  const header = src.slice(src.indexOf('sticky top-0'), src.indexOf('{menuOpen &&'));
  assert.match(header, /workoutName/);
  assert.doesNotMatch(header, /onOpenPlateCalc/, 'plates are on first paint');
  assert.doesNotMatch(header, /coachTip/, 'coach tip is on first paint');
  assert.doesNotMatch(header, /cueSlot/, 'Cue me is on first paint');
  assert.match(src, /onOpenPlateCalc/);
  assert.match(src, /activeCoachTipKind/);
});

test('plates and the coach tip live in the overflow, not the header', () => {
  const src = chrome();
  const menu = src.slice(src.indexOf('{menuOpen &&'));
  assert.match(menu, /onOpenPlateCalc/);
  assert.match(menu, /coachTip/);
});

test('Active page does not import speech, and extras sit in Show all', () => {
  const src = page();
  assert.doesNotMatch(src, /@\/components\/speech|@\/lib\/speech/);
  assert.doesNotMatch(src, /ActiveTrainCues/);
  const open = src.slice(src.indexOf('<ActiveSessionChrome'), src.indexOf('<details'));
  assert.doesNotMatch(open, /<LiveHeartRate\b/, 'heart rate is on first paint');
  assert.doesNotMatch(open, /<SessionJotField\b/, 'jot is on first paint');
  assert.match(src, /data-testid="active-show-all"/);
  assert.match(src, /<LiveHeartRate\b/);
  assert.match(src, /<SessionJotField\b/);
});

test('header is name plus a compact elapsed/sets line, not a poster timer', () => {
  const src = chrome();
  const header = src.slice(src.indexOf('sticky top-0'), src.indexOf('{menuOpen &&'));
  assert.match(header, /formatDuration\(elapsedSeconds\)/);
  assert.match(header, /completedSets/);
  assert.doesNotMatch(header, /text-\[30px\]/, 'poster numerals are on first paint');
  assert.doesNotMatch(src, /sessionSetsProgressPct/, 'progress meter competes with the table');
});

test('first paint still has the table and rest dock', () => {
  const src = page();
  const open = src.slice(src.indexOf('<ActiveSessionChrome'), src.indexOf('<details'));
  assert.match(open, /<ActiveExerciseList\b/);
  assert.match(src, /ActiveSessionDock|RestTimerBar/);
});
