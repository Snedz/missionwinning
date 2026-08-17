/**
 * Learn vs-pages are unpublished. Named compare copy lives in ops/intel/seo/.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'path';
import {
  LEARN_VS_CSV_CELL,
  LEARN_VS_PAGE_IDS,
  LEARN_VS_PAGES,
} from '@/data/learnVsPages';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';
import { CONTENT_FLOORS } from '@/lib/contentFloors';

const root = path.join(import.meta.dirname, '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

describe('learn vs-pages unpublished', () => {
  it('ships an empty catalog', () => {
    assert.deepEqual([...LEARN_VS_PAGE_IDS], []);
    assert.equal(LEARN_VS_PAGES.length, 0);
  });

  it('does not keep named compare routes on disk', () => {
    const guide = path.join(root, 'app/guide');
    const dirs = readdirSync(guide, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    assert.ok(dirs.every((n) => !n.startsWith('mission-winning-vs-')));
  });

  it('CSV copy is generic workout-CSV language', () => {
    assert.match(LEARN_VS_CSV_CELL, /workout CSV/);
    assert.doesNotMatch(LEARN_VS_CSV_CELL, /vs /);
  });

  it('magazine floors are unchanged', () => {
    assert.equal(BEYOND_THE_BASICS_CHAPTERS.length, CONTENT_FLOORS.guidebookFreeChapters);
    assert.equal(CONTENT_FLOORS.guidebookFreeChapters, 6);
    assert.equal(CONTENT_FLOORS.learnPremiumSections, 24);
  });

  it('sitemap still imports the empty catalog', () => {
    const src = read('app/sitemap.ts');
    assert.match(src, /LEARN_VS_PAGES/);
  });

  it('next.config redirects the old vs path pattern', () => {
    const src = read('next.config.js');
    assert.match(src, /mission-winning-vs-:slug/);
    assert.match(src, /\/welcome/);
  });
});
