import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  FORM_PACK_ALIASES,
  FORM_PACK_SIDE_IDS,
  FORM_PACK_VIDEO_IDS,
  formPackLibraryPosterUrl,
  formPackSidePosterPath,
  resolveFormPackMedia,
} from '@/lib/formMedia';

const publicForm = path.join(import.meta.dirname, '..', '..', 'public', 'form');

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
    'box-jump',
    'kettlebell-swing',
    'deadlift',
    'romanian-deadlift',
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

test('regen stills stay still-only until a new loop passes', () => {
  for (const id of ['front-squat', 'burpees', 'thruster', 'lunges'] as const) {
    assert.equal(FORM_PACK_VIDEO_IDS.has(id), false, id);
    const pack = resolveFormPackMedia(id);
    assert.ok(pack, id);
    assert.equal(pack?.mediaType, 'image', id);
  }
});

test('method aliases resolve to the parent pack, never a pattern path', () => {
  const squat = resolveFormPackMedia('20-rep-squat');
  const parent = resolveFormPackMedia('squats');
  assert.ok(squat);
  assert.equal(squat?.mediaUrl, parent?.mediaUrl);
  const poster = formPackLibraryPosterUrl('20-rep-squat');
  assert.ok(poster);
  assert.equal(poster.includes('/form/pattern-'), false);
  assert.equal(formPackLibraryPosterUrl('not-a-real-lift'), null);
});

test('every alias target is a wired side pack; every alias key is distinct', () => {
  const keys = Object.keys(FORM_PACK_ALIASES);
  assert.equal(new Set(keys).size, keys.length);
  for (const [from, to] of Object.entries(FORM_PACK_ALIASES)) {
    assert.ok(FORM_PACK_SIDE_IDS.has(to), `${from} → missing target ${to}`);
    assert.equal(FORM_PACK_ALIASES[to], undefined, `${to} must not itself be an alias`);
  }
});

test('every SIDE_IDS pack has a still on disk; pattern dirs stay out of SIDE_IDS', () => {
  for (const id of FORM_PACK_SIDE_IDS) {
    const side = path.join(publicForm, id, 'side.webp');
    const casts = existsSync(path.join(publicForm, id))
      ? readdirSync(path.join(publicForm, id)).filter((f) => /^cast-[a-d]\.webp$/.test(f))
      : [];
    assert.ok(
      existsSync(side) || casts.length > 0,
      `${id} is wired but has no side.webp or cast still`
    );
  }
  const dirs = readdirSync(publicForm, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  for (const dir of dirs) {
    if (dir.startsWith('pattern-')) {
      assert.equal(FORM_PACK_SIDE_IDS.has(dir), false, dir);
    }
  }
});

test('alias keys exist in the full catalog', async () => {
  const { EXERCISES, ensureFullExerciseCatalog } = await import('@/data/exercises');
  await ensureFullExerciseCatalog();
  const ids = new Set(EXERCISES.map((e) => e.id));
  for (const key of Object.keys(FORM_PACK_ALIASES)) {
    assert.ok(ids.has(key), `alias ${key} is not a catalog id`);
  }
});

test('library poster is never a shared pattern raster', () => {
  assert.equal(formPackLibraryPosterUrl('incline-bench'), null);
  assert.equal(formPackLibraryPosterUrl('farmers-walk-dbs'), null);
  assert.equal(formPackLibraryPosterUrl('wall-ball'), null);
  const hip = formPackLibraryPosterUrl('hip-thrust');
  assert.ok(hip);
  assert.equal(hip.includes('/form/pattern-'), false);
  assert.equal(hip, '/form/hip-thrust/side.webp');
});

test('cast packs are still-only even when a legacy loop file exists', () => {
  for (const id of ['push-ups', 'pull-ups'] as const) {
    const pack = resolveFormPackMedia(id);
    assert.equal(pack?.mediaType, 'image', id);
    assert.match(pack?.mediaUrl ?? '', new RegExp(`^/form/${id}/cast-[a-d]\\.webp$`), id);
  }
});

test('landmine-press stays still or video; landmine-squat and row still-only', () => {
  assert.ok(resolveFormPackMedia('landmine-press'));
  const squat = resolveFormPackMedia('landmine-squat');
  assert.equal(squat?.mediaType, 'image');
  const row = resolveFormPackMedia('landmine-row');
  assert.equal(row?.mediaType, 'image');
  assert.equal(row?.mediaUrl, '/form/landmine-row/side.webp');
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
