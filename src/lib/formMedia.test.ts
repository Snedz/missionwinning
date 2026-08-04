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

test('getFormGuideOrCues prefers form pack video over still for pilot ids', () => {
  const guide = getFormGuideOrCues('push-ups');
  assert.ok(guide?.mediaUrl?.includes('/form/push-ups/side.mp4'), guide?.mediaUrl);
  assert.equal(guide?.mediaType, 'video');
  assert.equal(guide?.mediaPosterUrl, '/form/push-ups/side.webp');
});

test('resolveFormPackMedia returns video when FORM_PACK_VIDEO_IDS has id', () => {
  const pack = resolveFormPackMedia('air-squat');
  assert.equal(pack?.mediaType, 'video');
  assert.equal(pack?.mediaUrl, '/form/air-squat/side.mp4');
  assert.equal(pack?.mediaPosterUrl, '/form/air-squat/side.webp');
});

test('formPackSidePosterPath is stable', () => {
  assert.equal(formPackSidePosterPath('air-squat'), '/form/air-squat/side.webp');
});
