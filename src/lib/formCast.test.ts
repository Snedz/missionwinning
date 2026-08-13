import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  FORM_CAST_SETS,
  FORM_PACK_CAPTION,
  formCastHasMarker,
  formPackCastPosterPath,
  pickFormCastIndex,
  pickFormCastStill,
} from '@/lib/formCast';
import { FORM_PACK_SIDE_IDS, resolveFormPackMedia } from '@/lib/formMedia';

const root = path.join(import.meta.dirname, '..', '..');
const publicForm = path.join(root, 'public', 'form');

/**
 * Closed list: identity words that must not leak into movement captions.
 * Closed because a caption guard keyed to one spelling only ever tested that
 * spelling — these are the first-wave region names plus dress markers.
 */
const CAPTION_IDENTITY =
  /\b(black|white|asian|arab|jewish|israeli|korean|japanese|chinese|cantonese|hijab|kippah|tzitzit|race|racial|muslim|hindu)\b/i;

test('caption describes the movement, not the person', () => {
  assert.match(FORM_PACK_CAPTION, /side view/i);
  assert.equal(CAPTION_IDENTITY.test(FORM_PACK_CAPTION), false);
});

test('pickFormCastIndex is deterministic and in range', () => {
  const a = pickFormCastIndex('squats', 4);
  const b = pickFormCastIndex('squats', 4);
  assert.equal(a, b);
  assert.ok(a >= 0 && a < 4);
  assert.notEqual(pickFormCastIndex('squats', 4), pickFormCastIndex('air-squat', 4));
});

test('library cast covers hijab and kippah without putting both on every card', () => {
  const sets = Object.values(FORM_CAST_SETS);
  assert.ok(sets.some((s) => formCastHasMarker(s, 'hijab')));
  assert.ok(sets.some((s) => formCastHasMarker(s, 'kippah')));
});

test('every rostered cast file exists; every cast file is rostered', () => {
  const dirs = readdirSync(publicForm, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const dir of dirs) {
    const files = readdirSync(path.join(publicForm, dir)).filter((f) =>
      /^cast-[a-z0-9]+\.webp$/.test(f)
    );
    if (files.length === 0) {
      assert.equal(
        FORM_CAST_SETS[dir],
        undefined,
        `stale FORM_CAST_SETS entry for ${dir} with no cast files`
      );
      continue;
    }
    const set = FORM_CAST_SETS[dir];
    assert.ok(set, `unreviewed cast files under public/form/${dir}/ — add a roster or delete`);
    const rostered = new Set(set.map((m) => `cast-${m.id}.webp`));
    for (const f of files) {
      assert.ok(rostered.has(f), `unrostered ${dir}/${f}`);
    }
    for (const r of rostered) {
      assert.ok(
        existsSync(path.join(publicForm, dir, r)),
        `missing ${dir}/${r}`
      );
    }
  }
});

test('every FORM_CAST_SETS key is a registered form pack', () => {
  for (const id of Object.keys(FORM_CAST_SETS)) {
    assert.ok(FORM_PACK_SIDE_IDS.has(id), id);
  }
});

test('resolveFormPackMedia picks a squats cast still, still-only, movement caption', () => {
  const picked = pickFormCastStill('squats');
  assert.ok(picked);
  const pack = resolveFormPackMedia('squats');
  assert.ok(pack);
  assert.equal(pack?.mediaType, 'image');
  assert.equal(pack?.mediaUrl, formPackCastPosterPath('squats', picked.id));
  assert.equal(pack?.mediaCaption, FORM_PACK_CAPTION);
  assert.equal(CAPTION_IDENTITY.test(pack?.mediaCaption ?? ''), false);
});
