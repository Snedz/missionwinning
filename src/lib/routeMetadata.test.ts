/**
 * Every route key produces a real `<title>`.
 *
 * `routeMetadata(key)` is called from ~30 `page.tsx` files, and its argument is
 * typed — so the compiler catches a key that does not exist. What the compiler
 * cannot catch is a key that exists with an **empty or whitespace title**, or a
 * title accidentally blanked during a copy edit: `{ title: '' }` is valid
 * `Metadata`, renders a nameless browser tab, and is invisible until someone
 * looks at a bookmark.
 *
 * So the table is walked rather than sampled, and the optional description is
 * asserted to be omitted rather than set to `undefined` — Next serialises an
 * explicit `description: undefined` differently from an absent key, and a
 * `<meta name="description" content="undefined">` on a public SEO page is worse
 * than no tag at all.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ROUTE_TITLES, routeMetadata, type RouteTitleKey } from '@/lib/routeMetadata';

const KEYS = Object.keys(ROUTE_TITLES) as RouteTitleKey[];

describe('ROUTE_TITLES', () => {
  it('covers enough routes for this guard to mean anything', () => {
    assert.ok(KEYS.length >= 20, `only ${KEYS.length} route titles — did the table shrink?`);
  });

  it('every title is a non-empty, non-whitespace string', () => {
    for (const key of KEYS) {
      const title = ROUTE_TITLES[key];
      assert.equal(typeof title, 'string', `${key}: title must be a string`);
      assert.ok(title.trim().length > 0, `${key}: title is blank — the tab would be nameless`);
      assert.equal(title, title.trim(), `${key}: title has stray whitespace`);
    }
  });
});

describe('routeMetadata', () => {
  it('returns the table title for every key', () => {
    for (const key of KEYS) {
      assert.equal(routeMetadata(key).title, ROUTE_TITLES[key], `${key}: wrong title`);
    }
  });

  it('omits description entirely when none is given', () => {
    for (const key of KEYS) {
      const meta = routeMetadata(key);
      assert.ok(
        !('description' in meta),
        `${key}: description must be absent, not present-and-undefined`
      );
    }
  });

  it('carries a description through when one is given', () => {
    const desc = 'Log a set in seconds, offline, with no account.';
    const meta = routeMetadata(KEYS[0], desc);
    assert.equal(meta.description, desc);
    assert.equal(meta.title, ROUTE_TITLES[KEYS[0]]);
  });

  it('treats an empty description as no description', () => {
    // `description ? … : …` is the branch; an empty string must not become a
    // `<meta content="">` tag.
    assert.ok(!('description' in routeMetadata(KEYS[0], '')));
  });

  it('returns a fresh object per call, so a caller cannot poison the table', () => {
    const a = routeMetadata(KEYS[0]);
    const b = routeMetadata(KEYS[0]);
    assert.notEqual(a, b, 'callers spread this into route exports; it must not be shared');
    (a as { title: string }).title = 'mutated';
    assert.equal(routeMetadata(KEYS[0]).title, ROUTE_TITLES[KEYS[0]]);
  });
});
