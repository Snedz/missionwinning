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

test('getFormGuideOrCues prefers form pack still when videos demoted', () => {
  const guide = getFormGuideOrCues('push-ups');
  assert.ok(guide?.mediaUrl?.includes('/form/push-ups/side.webp'), guide?.mediaUrl);
  assert.equal(guide?.mediaType, 'image');
});

test('quality reset: no form pack videos wired', () => {
  const pack = resolveFormPackMedia('air-squat');
  assert.equal(pack?.mediaType, 'image');
  assert.equal(pack?.mediaUrl, '/form/air-squat/side.webp');
});

test('Form Director regen re-wires burpees and box-jump stills', () => {
  assert.equal(resolveFormPackMedia('burpees')?.mediaUrl, '/form/burpees/side.webp');
  assert.equal(resolveFormPackMedia('box-jump')?.mediaUrl, '/form/box-jump/side.webp');
});

test('formPackSidePosterPath is stable', () => {
  assert.equal(formPackSidePosterPath('air-squat'), '/form/air-squat/side.webp');
});
