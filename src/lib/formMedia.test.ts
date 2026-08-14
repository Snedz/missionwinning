import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FORM_PACK_SIDE_IDS,
  formPackSidePosterPath,
  resolveFormPackMedia,
} from '@/lib/formMedia';

test('pilot pack ids are registered', () => {
  assert.ok(FORM_PACK_SIDE_IDS.has('push-ups'));
  assert.ok(FORM_PACK_SIDE_IDS.has('air-squat'));
});

test('unknown exercise has no form pack', () => {
  assert.equal(resolveFormPackMedia('not-a-real-lift'), null);
});

test('OHP form pack is still-only after .540 re-QA', () => {
  const pack = resolveFormPackMedia('overhead-press');
  assert.ok(pack);
  assert.equal(pack?.mediaType, 'image');
  assert.equal(pack?.mediaUrl, '/form/overhead-press/side.webp');
});

test('loop pilot packs resolve to video with poster', () => {
  for (const id of [
    'air-squat',
    'glute-bridge',
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

test('cast packs are still-only even when a legacy loop file exists', () => {
  for (const id of ['push-ups', 'pull-ups'] as const) {
    const pack = resolveFormPackMedia(id);
    assert.equal(pack?.mediaType, 'image', id);
    assert.match(pack?.mediaUrl ?? '', new RegExp(`^/form/${id}/cast-[a-d]\\.webp$`), id);
  }
});

test('landmine-press stays still or video; landmine-squat still-only; row demoted', () => {
  assert.ok(resolveFormPackMedia('landmine-press'));
  const squat = resolveFormPackMedia('landmine-squat');
  assert.equal(squat?.mediaType, 'image');
  assert.equal(resolveFormPackMedia('landmine-row'), null);
});

test('landmine siblings without pilot loop stay still-only', () => {
  for (const id of ['landmine-squat'] as const) {
    const pack = resolveFormPackMedia(id);
    assert.equal(pack?.mediaType, 'image', id);
    assert.equal(pack?.mediaUrl, `/form/${id}/side.webp`, id);
  }
});

test('formPackSidePosterPath is stable', () => {
  assert.equal(formPackSidePosterPath('air-squat'), '/form/air-squat/side.webp');
});
