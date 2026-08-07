/**
 * Guidebook progress, measured against the catalog it claims to describe.
 *
 * The numbers here render as "12 of 47 · 26%" on `/learn/guide` and drive the
 * Continue card on Today. Two ways they can lie, both silent:
 *
 *   - **A stale total.** Hardcoding "47" anywhere makes the percentage drift the
 *     moment a section is added, so `totalSections` is derived here from
 *     `BEYOND_THE_BASICS_CHAPTERS` and asserted against a fresh reduction of the
 *     same catalog rather than a literal.
 *   - **A completed set that outgrew the book.** Section ids persist in
 *     `localStorage` forever; chapters get rewritten. An id that no longer
 *     exists must not count toward `done`, or a reader who finished an older
 *     edition is shown progress above 100%.
 *
 * `getContinueChapter` is the one with an ordering contract: it must return the
 * *first* unread section in catalog order, because that is the reading order the
 * book is written in.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { writeJson, __resetForTests } from '@/lib/storage/safeStorage';
import {
  getChapterProgress,
  getContinueChapter,
  getGuidebookStats,
  loadGuidebookProgress,
  saveGuidebookProgress,
} from '@/lib/guidebookProgress';

const CHAPTERS = BEYOND_THE_BASICS_CHAPTERS;
const ALL_SECTION_IDS = CHAPTERS.flatMap((c) => c.sections.map((s) => s.id));

beforeEach(() => __resetForTests());

describe('catalog preconditions', () => {
  it('has chapters with sections, or every assertion below is vacuous', () => {
    assert.ok(CHAPTERS.length >= 2, `need >= 2 chapters, have ${CHAPTERS.length}`);
    assert.ok(ALL_SECTION_IDS.length >= 5, `need >= 5 sections, have ${ALL_SECTION_IDS.length}`);
    assert.equal(new Set(ALL_SECTION_IDS).size, ALL_SECTION_IDS.length, 'section ids must be unique');
  });
});

describe('getGuidebookStats', () => {
  it('counts nothing read as zero, with the catalog total', () => {
    const stats = getGuidebookStats(new Set());
    assert.equal(stats.done, 0);
    assert.equal(stats.totalSections, ALL_SECTION_IDS.length);
    assert.equal(stats.pct, 0);
  });

  it('counts everything read as 100%', () => {
    const stats = getGuidebookStats(new Set(ALL_SECTION_IDS));
    assert.equal(stats.done, ALL_SECTION_IDS.length);
    assert.equal(stats.pct, 100);
  });

  it('counts a partial read exactly, and rounds the percentage', () => {
    const half = ALL_SECTION_IDS.slice(0, Math.floor(ALL_SECTION_IDS.length / 2));
    const stats = getGuidebookStats(new Set(half));
    assert.equal(stats.done, half.length);
    assert.equal(stats.pct, Math.round((half.length / ALL_SECTION_IDS.length) * 100));
  });

  it('ignores ids the book no longer contains', () => {
    const ghosts = new Set(['deleted-section-a', 'deleted-section-b']);
    const stats = getGuidebookStats(ghosts);
    assert.equal(stats.done, 0, 'a removed section must not count as read');
    assert.equal(stats.pct, 0);

    // And mixed with real ones, only the real ones count.
    const mixed = getGuidebookStats(new Set([...ghosts, ALL_SECTION_IDS[0]]));
    assert.equal(mixed.done, 1);
    assert.ok(mixed.pct <= 100, 'progress can never exceed the book');
  });
});

describe('getChapterProgress', () => {
  it('returns zeros for a chapter id that does not exist', () => {
    assert.deepEqual(getChapterProgress('no-such-chapter', new Set()), { done: 0, total: 0, pct: 0 });
  });

  it('reports a real chapter against its own section count, not the book total', () => {
    const chapter = CHAPTERS[0];
    assert.ok(chapter.sections.length > 0, 'precondition: first chapter has sections');

    const empty = getChapterProgress(chapter.id, new Set());
    assert.equal(empty.total, chapter.sections.length);
    assert.equal(empty.done, 0);

    const full = getChapterProgress(chapter.id, new Set(chapter.sections.map((s) => s.id)));
    assert.equal(full.done, chapter.sections.length);
    assert.equal(full.pct, 100);
  });

  it('does not credit a chapter for sections read in another chapter', () => {
    const [first, second] = CHAPTERS;
    const readSecond = new Set(second.sections.map((s) => s.id));
    assert.equal(getChapterProgress(first.id, readSecond).done, 0);
  });
});

describe('getContinueChapter', () => {
  it('starts a new reader at the very first section', () => {
    const next = getContinueChapter(new Set());
    assert.ok(next);
    assert.equal(next.chapter.id, CHAPTERS[0].id);
    assert.equal(next.section.id, CHAPTERS[0].sections[0].id);
  });

  it('returns null once every section is read — nothing left to continue', () => {
    assert.equal(getContinueChapter(new Set(ALL_SECTION_IDS)), null);
  });

  it('returns the first unread section in catalog order, not merely an unread one', () => {
    // Read everything except the last two sections; the answer must be the
    // earlier of the two, which is what "continue reading" means.
    const unread = ALL_SECTION_IDS.slice(-2);
    const completed = new Set(ALL_SECTION_IDS.filter((id) => !unread.includes(id)));
    const next = getContinueChapter(completed);
    assert.ok(next);
    assert.equal(next.section.id, unread[0]);
  });

  it('skips a fully-read first chapter and moves to the next', () => {
    const first = CHAPTERS[0];
    const next = getContinueChapter(new Set(first.sections.map((s) => s.id)));
    assert.ok(next);
    assert.notEqual(next.chapter.id, first.id, 'a finished chapter must not be offered again');
  });
});

describe('loadGuidebookProgress', () => {
  it('reads persisted ids back as a set', () => {
    const ids = ALL_SECTION_IDS.slice(0, 2);
    writeJson(STORAGE_KEYS.guidebookProgress, ids);
    const loaded = loadGuidebookProgress();
    assert.equal(loaded.size, ids.length);
    for (const id of ids) assert.ok(loaded.has(id));
  });

  it('starts empty when nothing is stored', () => {
    assert.equal(loadGuidebookProgress().size, 0);
  });

  it('is a no-op save without a document — the guard the SSR path relies on', () => {
    // Node has no `window`, which is precisely the environment the early return
    // exists for: a render on the server must not attempt to persist or to
    // dispatch a DOM event.
    assert.equal(typeof globalThis.window, 'undefined', 'precondition: no window in this runtime');
    assert.doesNotThrow(() => saveGuidebookProgress(new Set(ALL_SECTION_IDS)));
    assert.equal(loadGuidebookProgress().size, 0, 'nothing may be written without a window');
  });
});
