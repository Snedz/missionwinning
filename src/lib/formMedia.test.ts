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
  const guide = getFormGuideOrCues('front-squat');
  assert.ok(guide?.mediaUrl?.includes('/form/front-squat/side.webp'), guide?.mediaUrl);
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
    'overhead-press',
    'deadlift',
  ] as const) {
    const pack = resolveFormPackMedia(id);
    assert.equal(pack?.mediaType, 'video', id);
    assert.equal(pack?.mediaUrl, `/form/${id}/side.mp4`, id);
    assert.equal(pack?.mediaPosterUrl, `/form/${id}/side.webp`, id);
  }
});

test('Form Director packs keep poster paths for still-only heroes', () => {
  assert.equal(resolveFormPackMedia('front-squat')?.mediaUrl, '/form/front-squat/side.webp');
  assert.equal(resolveFormPackMedia('barbell-row')?.mediaUrl, '/form/barbell-row/side.webp');
  assert.equal(resolveFormPackMedia('front-squat')?.mediaType, 'image');
});

test('landmine family still packs are still-only', () => {
  for (const id of ['landmine-press', 'landmine-row', 'landmine-squat'] as const) {
    const pack = resolveFormPackMedia(id);
    assert.equal(pack?.mediaType, 'image', id);
    assert.equal(pack?.mediaUrl, `/form/${id}/side.webp`, id);
  }
});

test('formPackSidePosterPath is stable', () => {
  assert.equal(formPackSidePosterPath('air-squat'), '/form/air-squat/side.webp');
});
