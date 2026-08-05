import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FORM_PACK_SIDE_IDS,
  formPackSidePosterPath,
  resolveFormPackMedia,
} from '@/lib/formMedia';
import { getFormGuideOrCues } from '@/lib/formGuides';

test('pilot pack ids are registered', () => {
  assert.ok(FORM_PACK_SIDE_IDS.has('push-ups'));
  assert.ok(FORM_PACK_SIDE_IDS.has('air-squat'));
});

test('unknown exercise has no form pack', () => {
  assert.equal(resolveFormPackMedia('not-a-real-lift'), null);
});

test('still-only packs stay image when not in VIDEO_IDS', () => {
  // front-squat is looped (.477); OHP remains still-only
  const guide = getFormGuideOrCues('overhead-press');
  assert.ok(guide?.mediaUrl?.includes('/form/overhead-press/side.webp'), guide?.mediaUrl);
  assert.equal(guide?.mediaType, 'image');
});

test('loop pilot packs resolve to video with poster', () => {
  for (const id of [
    'air-squat',
    'glute-bridge',
    'push-ups',
    'plank',
    'lunges',
    'box-jump',
    'burpees',
    'kettlebell-swing',
    'thruster',
    'deadlift',
    'romanian-deadlift',
    'front-squat',
    'barbell-row',
    'bench-press',
    'landmine-press',
  ] as const) {
    const pack = resolveFormPackMedia(id);
    assert.equal(pack?.mediaType, 'video', id);
    assert.equal(pack?.mediaUrl, `/form/${id}/side.mp4`, id);
    assert.equal(pack?.mediaPosterUrl, `/form/${id}/side.webp`, id);
  }
});

test('stills without PASS loop stay image', () => {
  // OHP behind-head FAIL; pull-ups head-crop at top FAIL — hang still only
  for (const id of ['overhead-press', 'pull-ups'] as const) {
    const pack = resolveFormPackMedia(id);
    assert.equal(pack?.mediaType, 'image', id);
    assert.equal(pack?.mediaUrl, `/form/${id}/side.webp`, id);
  }
});

test('Form Director still-only heroes keep poster paths', () => {
  assert.equal(resolveFormPackMedia('overhead-press')?.mediaUrl, '/form/overhead-press/side.webp');
  assert.equal(resolveFormPackMedia('overhead-press')?.mediaType, 'image');
  assert.equal(resolveFormPackMedia('pull-ups')?.mediaType, 'image');
});

test('landmine siblings without pilot loop stay still-only', () => {
  for (const id of ['landmine-row', 'landmine-squat'] as const) {
    const pack = resolveFormPackMedia(id);
    assert.equal(pack?.mediaType, 'image', id);
    assert.equal(pack?.mediaUrl, `/form/${id}/side.webp`, id);
  }
});

test('formPackSidePosterPath is stable', () => {
  assert.equal(formPackSidePosterPath('air-squat'), '/form/air-squat/side.webp');
});
