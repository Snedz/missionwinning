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

test('demoted wrong-exercise stills leave the pack (SVG fallback)', () => {
  // .498: OHP single-arm wrong exercise; pull-ups feet cropped
  assert.equal(resolveFormPackMedia('overhead-press'), null);
  assert.equal(resolveFormPackMedia('pull-ups'), null);
  const ohp = getFormGuideOrCues('overhead-press');
  assert.ok(ohp?.mediaUrl?.includes('/form-guides/overhead-press.svg'), ohp?.mediaUrl);
  const pull = getFormGuideOrCues('pull-ups');
  assert.ok(pull?.mediaUrl?.includes('/form-guides/pull-ups.svg'), pull?.mediaUrl);
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
