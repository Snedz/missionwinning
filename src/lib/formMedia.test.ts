import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FORM_PACK_SIDE_IDS,
  formPackSidePosterPath,
  resolveFormPackMedia,
} from '@/lib/formMedia';
import { getFormGuideOrCues } from '@/lib/formGuides';

test('pilot pack ids resolve to /form/{id}/side.webp', () => {
  assert.ok(FORM_PACK_SIDE_IDS.has('push-ups'));
  const pack = resolveFormPackMedia('push-ups');
  assert.ok(pack);
  assert.equal(pack!.mediaUrl, '/form/push-ups/side.webp');
  assert.equal(pack!.mediaType, 'image');
});

test('unknown exercise has no form pack', () => {
  assert.equal(resolveFormPackMedia('not-a-real-lift'), null);
});

test('getFormGuideOrCues prefers form pack over legacy SVG for pilot ids', () => {
  const guide = getFormGuideOrCues('push-ups');
  assert.ok(guide?.mediaUrl?.includes('/form/push-ups/side.webp'), guide?.mediaUrl);
  assert.equal(guide?.mediaType, 'image');
});

test('formPackSidePosterPath is stable', () => {
  assert.equal(formPackSidePosterPath('air-squat'), '/form/air-squat/side.webp');
});
