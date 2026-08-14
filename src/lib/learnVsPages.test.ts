/**
 * Learn vs-pages: catalog ids, originality, honest counts.
 *
 * Discover LEARN_VS_PAGES rather than restating bodies. A mutant that claims
 * Fitbod “3 workouts then lock” or that Strong/Hevy CSV export is live must die.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'path';
import {
  LEARN_VS_CSV_CELL,
  LEARN_VS_PAGE_IDS,
  LEARN_VS_PAGES,
  learnVsPublicHref,
} from '@/data/learnVsPages';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';
import { CONTENT_FLOORS } from '@/lib/contentFloors';
import { learnVsArticleJsonLd } from '@/lib/learnVsPages';

const root = path.join(import.meta.dirname, '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function catalogBlob(): string {
  return JSON.stringify(LEARN_VS_PAGES);
}

function words(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function pageByCompetitor(name: 'Strong' | 'Hevy' | 'Fitbod') {
  const page = LEARN_VS_PAGES.find((p) => p.competitor === name);
  assert.ok(page, `missing vs-page for ${name}`);
  return page;
}

describe('learn vs-pages catalog', () => {
  it('ships exactly the three ChatGPT-shaped ids', () => {
    assert.deepEqual(
      LEARN_VS_PAGES.map((p) => p.id),
      [...LEARN_VS_PAGE_IDS]
    );
    assert.deepEqual(
      [...LEARN_VS_PAGE_IDS],
      [
        'mission-winning-vs-strong',
        'mission-winning-vs-hevy',
        'mission-winning-vs-fitbod',
      ]
    );
    for (const page of LEARN_VS_PAGES) {
      assert.equal(learnVsPublicHref(page.id), `/guide/${page.id}`);
      assert.equal(page.title, `Mission Winning vs ${page.competitor}`);
    }
  });

  it('each catalog id has a static public route', () => {
    for (const page of LEARN_VS_PAGES) {
      const rel = `app/guide/${page.id}/page.tsx`;
      assert.equal(existsSync(path.join(root, rel)), true, `missing ${rel}`);
      assert.match(read(rel), new RegExp(page.id));
      assert.match(read(rel), /force-static/);
    }
  });

  it('leads stay citation-length (40–60 words)', () => {
    for (const page of LEARN_VS_PAGES) {
      const n = words(page.lead);
      assert.ok(n >= 40 && n <= 60, `${page.id} lead is ${n} words`);
    }
  });

  it('JSON-LD marks every page free', () => {
    for (const page of LEARN_VS_PAGES) {
      const ld = learnVsArticleJsonLd(page, 'https://www.missionwinning.com');
      assert.equal(ld['@type'], 'Article');
      assert.equal(ld.isAccessibleForFree, true);
      assert.equal(ld.headline, page.title);
      assert.equal(
        ld.url,
        `https://www.missionwinning.com${learnVsPublicHref(page.id)}`
      );
    }
  });
});

describe('learn vs-pages honesty', () => {
  it('CSV import is live and Strong/Hevy export is not claimed live', () => {
    assert.match(LEARN_VS_CSV_CELL, /Import of Strong\/Hevy CSV is live/);
    assert.match(LEARN_VS_CSV_CELL, /planned \(not on this build\)/);
    const blob = catalogBlob();
    assert.match(blob, /JSON device backup is live/);
    assert.doesNotMatch(blob, /CSV export is live/i);
    assert.doesNotMatch(blob, /round-trip/i);
    for (const page of LEARN_VS_PAGES) {
      const cells = page.sections.flatMap((s) => s.table?.rows.flat() ?? []);
      assert.ok(
        cells.some((c) => c.includes(LEARN_VS_CSV_CELL)),
        `${page.id} table missing shared CSV cell`
      );
    }
  });

  it('founder intel errata appear as facts, not the false versions', () => {
    const strong = JSON.stringify(pageByCompetitor('Strong'));
    const hevy = JSON.stringify(pageByCompetitor('Hevy'));
    const fitbod = JSON.stringify(pageByCompetitor('Fitbod'));

    assert.match(strong, /three templates/i);
    assert.match(strong, /not locked/i);

    assert.match(hevy, /[Ss]ocial is free/);

    assert.match(fitbod, /seven-day trial/i);
    assert.match(fitbod, /is false/);
    assert.doesNotMatch(fitbod, /3 workouts then lock/i);
    assert.doesNotMatch(fitbod, /locks after three/i);
  });

  it('voice stays wedge — no praise-page or everything-app pitch', () => {
    const blob = catalogBlob();
    assert.doesNotMatch(blob, /WeChat/i);
    assert.doesNotMatch(blob, /MySpace/i);
    assert.doesNotMatch(blob, /everything app/i);
    assert.doesNotMatch(blob, /civilization/i);
    assert.doesNotMatch(blob, /#1\b/);
    assert.doesNotMatch(blob, /ChatGPT recommends/i);
    assert.doesNotMatch(blob, /we're live|we are live|open beta/i);
    assert.doesNotMatch(blob, /\/bundle/);
    assert.doesNotMatch(blob, /in-app Feed to match/i);
    assert.match(blob, /Train Anywhere\. Win Daily/);
    assert.match(blob, /never for sale|not for sale/);
  });

  it('counts stay honest — vs-pages are not magazine chapters', () => {
    assert.equal(LEARN_VS_PAGES.length, 3);
    assert.equal(BEYOND_THE_BASICS_CHAPTERS.length, CONTENT_FLOORS.guidebookFreeChapters);
    assert.equal(CONTENT_FLOORS.guidebookFreeChapters, 6);
    assert.equal(CONTENT_FLOORS.learnPremiumSections, 16);
    assert.ok(
      !BEYOND_THE_BASICS_CHAPTERS.some((c) =>
        (LEARN_VS_PAGE_IDS as readonly string[]).includes(c.id)
      ),
      'vs ids leaked into Beyond the Basics'
    );
  });
});

describe('learn vs-pages wiring', () => {
  it('sitemap maps the catalog rather than a private URL list', () => {
    const src = read('app/sitemap.ts');
    assert.match(src, /LEARN_VS_PAGES/);
    assert.match(src, /learnVsPublicHref/);
    assert.match(src, /learnVsEntries/);
  });

  it('guide index lists vs-pages from the catalog', () => {
    const src = read('src/page-components/GuidePublicIndexPage.tsx');
    assert.match(src, /LEARN_VS_PAGES/);
    assert.match(src, /learnVsPublicHref/);
    assert.doesNotMatch(src, /CH \{String\(page\.number\)/);
  });

  it('collision freeze — vs catalog does not edit sibling Learn drafts', () => {
    const src = read('src/data/learnVsPages.ts');
    assert.doesNotMatch(src, /programming-tuning/);
    assert.doesNotMatch(src, /\bsb-0\b/);
    assert.doesNotMatch(src, /one-week-sequence|one-stack/);
    assert.doesNotMatch(src, /magazineMeta/);
    assert.doesNotMatch(src, /from '\.\/chapters'/);
  });
});
