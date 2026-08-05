import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseSeoExerciseParam,
  seoExerciseSessionTemplate,
  seoExerciseTrainHref,
  shouldAddSeoExerciseToActive,
  shouldStartSeoExerciseSession,
  stripSeoExerciseFromSearch,
  SEO_EXERCISE_QUERY,
} from './seoExerciseBridge';

test('seoExerciseTrainHref pins /active?exercise=id', () => {
  assert.equal(seoExerciseTrainHref('front-squat'), '/active?exercise=front-squat');
  assert.equal(seoExerciseTrainHref('  '), '/active');
  assert.match(seoExerciseTrainHref('a'), new RegExp(`\\?${SEO_EXERCISE_QUERY}=`));
});

test('parseSeoExerciseParam accepts catalog ids only', () => {
  assert.equal(parseSeoExerciseParam('?exercise=bench-press'), 'bench-press');
  assert.equal(parseSeoExerciseParam(new URLSearchParams('exercise=Pull-Ups')), 'pull-ups');
  assert.equal(parseSeoExerciseParam('?exercise=../etc/passwd'), null);
  assert.equal(parseSeoExerciseParam('?exercise='), null);
  assert.equal(parseSeoExerciseParam(null), null);
});

test('shouldStartSeoExerciseSession refuses when work is logged', () => {
  assert.equal(shouldStartSeoExerciseSession({ exerciseId: 'squats', hasLoggedWork: false }), true);
  assert.equal(shouldStartSeoExerciseSession({ exerciseId: 'squats', hasLoggedWork: true }), false);
  assert.equal(shouldStartSeoExerciseSession({ exerciseId: null, hasLoggedWork: false }), false);
});

test('shouldAddSeoExerciseToActive only when session has work and id is new', () => {
  assert.equal(
    shouldAddSeoExerciseToActive({
      exerciseId: 'rdl',
      hasLoggedWork: true,
      activeExerciseIds: ['squats'],
    }),
    true
  );
  assert.equal(
    shouldAddSeoExerciseToActive({
      exerciseId: 'squats',
      hasLoggedWork: true,
      activeExerciseIds: ['squats'],
    }),
    false
  );
  assert.equal(
    shouldAddSeoExerciseToActive({
      exerciseId: 'rdl',
      hasLoggedWork: false,
      activeExerciseIds: [],
    }),
    false
  );
});

test('seoExerciseSessionTemplate matches library single-lift freestyle', () => {
  const t = seoExerciseSessionTemplate('bench-press', 'Bench Press');
  assert.equal(t.name, 'Bench Press');
  assert.deepEqual(t.exercises, [{ exerciseId: 'bench-press', sets: [{ reps: 8, weight: 0 }] }]);
});

test('stripSeoExerciseFromSearch removes only the bridge key', () => {
  assert.equal(stripSeoExerciseFromSearch('?exercise=squats&foo=1'), '?foo=1');
  assert.equal(stripSeoExerciseFromSearch('?exercise=squats'), '');
});

test('ExercisePublicPage primary CTA uses the Train bridge, not bare welcome', () => {
  const { readFileSync } = require('node:fs') as typeof import('node:fs');
  const { join } = require('node:path') as typeof import('node:path');
  const src = readFileSync(
    join(import.meta.dirname, '..', 'page-components', 'ExercisePublicPage.tsx'),
    'utf8'
  );
  assert.match(src, /seoExerciseTrainHref\(exercise\.id\)/);
  assert.match(src, /Log this free/);
  assert.doesNotMatch(
    src,
    /href="\/welcome" className="primary-action/,
    'detail primary must not be generic welcome — that drops the lift id'
  );
});
