import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  FORM_PATTERN_IDS,
  formPatternPath,
  inferFormPattern,
  resolvePatternMediaUrl,
  PATTERN_MEDIA_CAPTION,
} from '@/lib/formPatterns';
import { getFormGuideOrCues } from '@/lib/formGuides';

const root = path.join(import.meta.dirname, '..', '..');

test('every pattern has legacy SVG; raster patterns resolve to form still', () => {
  for (const id of FORM_PATTERN_IDS) {
    assert.ok(
      existsSync(path.join(root, 'public', 'form-guides', `pattern-${id}.svg`)),
      `missing pattern-${id}.svg`
    );
  }
  for (const id of FORM_PATTERN_IDS) {
    assert.equal(formPatternPath(id), `/form/pattern-${id}/side.webp`);
    assert.ok(
      existsSync(path.join(root, 'public', 'form', `pattern-${id}`, 'side.webp')),
      `missing form/pattern-${id}/side.webp`
    );
  }
});

test('inferFormPattern maps common families', () => {
  assert.equal(inferFormPattern('incline-bench'), 'push');
  assert.equal(inferFormPattern('hammer-curl'), 'isolation');
  assert.equal(inferFormPattern('trap-bar-deadlift'), 'hinge');
  assert.equal(inferFormPattern('bulgarian-split-squat'), 'squat');
  assert.equal(inferFormPattern('ring-row'), 'pull');
  assert.equal(inferFormPattern('hollow-hold'), 'core');
  assert.equal(inferFormPattern('farmer-carry'), 'loco');
});

test('inferFormPattern routes landmine family by movement', () => {
  assert.equal(inferFormPattern('landmine-press'), 'push');
  assert.equal(inferFormPattern('landmine-single-arm-press'), 'push');
  assert.equal(inferFormPattern('landmine-row'), 'pull');
  assert.equal(inferFormPattern('landmine-meadows-row'), 'pull');
  assert.equal(inferFormPattern('landmine-squat'), 'squat');
  assert.equal(inferFormPattern('landmine-thruster'), 'squat');
  assert.equal(inferFormPattern('landmine-reverse-lunge'), 'squat');
  assert.equal(inferFormPattern('landmine-hack-squat'), 'squat');
  assert.equal(inferFormPattern('landmine-rdl'), 'hinge');
  assert.equal(inferFormPattern('landmine-rotation'), 'core');
  assert.equal(inferFormPattern('landmine-antirotation-press'), 'core');
});

test('form pack still wins over pattern for structured guides', () => {
  // front-squat has a Form Index pack (.477 video); must not fall through to pattern SVG
  const guide = getFormGuideOrCues('front-squat');
  assert.ok(guide?.mediaUrl?.includes('/form/front-squat/side.'), guide?.mediaUrl);
  assert.ok(guide?.mediaType === 'video' || guide?.mediaType === 'image', guide?.mediaType);
  // OHP demoted from form pack (.498 wrong-exercise still) → legacy SVG
  const ohp = getFormGuideOrCues('overhead-press');
  assert.ok(
    ohp?.mediaUrl?.includes('/form-guides/overhead-press.svg') ||
      ohp?.mediaUrl?.includes('/form/overhead-press/'),
    ohp?.mediaUrl
  );
  assert.equal(ohp?.mediaType, 'image');
});

test('long-tail cues attach honest pattern caption', () => {
  // incline-bench has cues in enrichment path via getExerciseById after catalog load
  const guide = getFormGuideOrCues('incline-bench', {
    exercise: {
      id: 'incline-bench',
      name: 'Incline Bench Press',
      muscleGroups: ['Chest', 'Shoulders'],
      cues: 'Bench 30–45°, retract scapulae, bar to upper chest.',
    },
  });
  assert.ok(guide);
  assert.equal(guide?.mediaUrl, resolvePatternMediaUrl('incline-bench', {
    id: 'incline-bench',
    name: 'Incline Bench Press',
    muscleGroups: ['Chest', 'Shoulders'],
  }));
  assert.equal(guide?.mediaCaption, PATTERN_MEDIA_CAPTION);
  assert.match(guide!.mediaUrl!, /pattern-push\/side\.webp$/);
});

test('pattern caption states shared art honestly', () => {
  assert.match(PATTERN_MEDIA_CAPTION, /Shared movement pattern/i);
});
