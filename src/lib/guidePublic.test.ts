/**
 * Chapter-to-chapter navigation, proven against the catalog rather than a copy.
 *
 * `getGuideChapter` is what the public `/guide/[id]` pages use to draw their
 * prev/next links. The failure it must not have is an off-by-one at the ends:
 * a `prev` on the first chapter or a `next` on the last is a link to
 * `undefined`, which renders as a dead control on an SEO surface.
 *
 * Every expectation below is derived from `BEYOND_THE_BASICS_CHAPTERS` — no
 * chapter id is written into this file. A test that hardcodes "the first
 * chapter is `getting-started`" starts passing for the wrong reason the day the
 * guidebook is reordered, which is exactly when this navigation breaks.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getGuideChapter } from '@/lib/guidePublic';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';

const CHAPTERS = BEYOND_THE_BASICS_CHAPTERS;

describe('getGuideChapter', () => {
  it('the catalog is big enough for prev/next to mean anything', () => {
    // Asserted, not skipped past: with one chapter the edge cases below would
    // silently prove nothing.
    assert.ok(CHAPTERS.length >= 3, `need >= 3 chapters to test both ends, have ${CHAPTERS.length}`);
  });

  it('returns null for an id no chapter carries', () => {
    const unknown = 'not-a-chapter-id-at-all';
    assert.ok(!CHAPTERS.some((c) => c.id === unknown), 'precondition: the probe id is absent');
    assert.equal(getGuideChapter(unknown), null);
    assert.equal(getGuideChapter(''), null);
  });

  it('the first chapter has no prev and the true next', () => {
    const first = CHAPTERS[0];
    const res = getGuideChapter(first.id);
    assert.ok(res, 'the first chapter must resolve');
    assert.equal(res.chapter.id, first.id);
    assert.equal(res.prev, undefined, 'nothing precedes the first chapter');
    assert.equal(res.next?.id, CHAPTERS[1].id);
  });

  it('the last chapter has the true prev and no next', () => {
    const last = CHAPTERS[CHAPTERS.length - 1];
    const res = getGuideChapter(last.id);
    assert.ok(res, 'the last chapter must resolve');
    assert.equal(res.chapter.id, last.id);
    assert.equal(res.prev?.id, CHAPTERS[CHAPTERS.length - 2].id);
    assert.equal(res.next, undefined, 'nothing follows the last chapter');
  });

  it('every chapter resolves to itself with its true catalog neighbours', () => {
    CHAPTERS.forEach((chapter, i) => {
      const res = getGuideChapter(chapter.id);
      assert.ok(res, `${chapter.id} must resolve`);
      assert.equal(res.chapter.id, chapter.id, `${chapter.id} resolved to another chapter`);
      assert.equal(
        res.prev?.id,
        i > 0 ? CHAPTERS[i - 1].id : undefined,
        `${chapter.id}: wrong prev`
      );
      assert.equal(
        res.next?.id,
        i < CHAPTERS.length - 1 ? CHAPTERS[i + 1].id : undefined,
        `${chapter.id}: wrong next`
      );
    });
  });

  it('walking next from the first chapter reaches the last, visiting each once', () => {
    // Catches a neighbour rule that is locally right but globally broken —
    // a cycle, or a chain that stops early.
    const seen: string[] = [];
    let cursor: string | undefined = CHAPTERS[0].id;
    while (cursor) {
      assert.ok(!seen.includes(cursor), `cycle detected at ${cursor}`);
      seen.push(cursor);
      cursor = getGuideChapter(cursor)?.next?.id;
    }
    assert.deepEqual(seen, CHAPTERS.map((c) => c.id));
  });
});
