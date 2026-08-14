/**
 * Super Bundle Learn sequence (`.705`) — premium Ch11–12.
 *
 * Discovers catalog text rather than importing `server-only` premiumChapters.
 * Collision freeze: free guidebook / Learn paths / magazine stay untouched.
 *
 * Mutants this suite is built to kill:
 * - delete `one-stack` or `one-week-sequence` from premiumChapters.ts
 * - drop `diataxis:` on a pch11/pch12 section
 * - add those ids to chapters.ts / learnPaths.ts (steal #496 / #479)
 * - leave PREMIUM_LEARN_SECTION_COUNT at 16
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';
import { FREE_LEARN_PATHS } from '@/data/learnPaths';
import { MAGAZINE_META } from '@/data/guidebook/magazineMeta';
import { CONTENT_FLOORS } from '@/lib/contentFloors';
import { PREMIUM_LEARN_SECTION_COUNT } from '@/data/premiumInventory';
import { getContentInventory } from '@/lib/contentInventory';

const root = join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');

const FREE_CHAPTER_IDS = [
  'human-performance',
  'movement-mechanics',
  'programming-tuning',
  'getting-started-mw',
  'nutrition-recovery',
  'assessments-progress',
] as const;

const SEQUENCE_CHAPTER_IDS = ['one-week-sequence', 'one-stack'] as const;
const SEQUENCE_SECTION_IDS = [
  'pch11-s1',
  'pch11-s2',
  'pch11-s3',
  'pch11-s4',
  'pch12-s1',
  'pch12-s2',
  'pch12-s3',
  'pch12-s4',
] as const;
const DIATAXIS = ['tutorial', 'how-to', 'explanation', 'reference'] as const;

function premiumSrc(): string {
  return read('src/data/guidebook/premiumChapters.ts');
}

function windowAfterId(src: string, id: string, size = 900): string {
  const needle = `id: '${id}'`;
  const i = src.indexOf(needle);
  assert.ok(i >= 0, `missing id ${id}`);
  return src.slice(i, i + size);
}

describe('one-sequence Super Bundle Learn', () => {
  it('premium catalog contains the two sequence chapters and eight sections', () => {
    const src = premiumSrc();
    for (const id of SEQUENCE_CHAPTER_IDS) {
      assert.ok(src.includes(`id: '${id}'`), `missing chapter ${id}`);
    }
    for (const id of SEQUENCE_SECTION_IDS) {
      assert.ok(src.includes(`id: '${id}'`), `missing section ${id}`);
    }
  });

  it('sequence sections declare a closed Diataxis set', () => {
    const src = premiumSrc();
    const seen = new Set<string>();
    for (const id of SEQUENCE_SECTION_IDS) {
      const win = windowAfterId(src, id);
      const m = /diataxis:\s*'([^']+)'/.exec(win);
      assert.ok(m, `${id} has no diataxis field in the following ~900 chars`);
      assert.ok((DIATAXIS as readonly string[]).includes(m[1]), `${id} diataxis ${m[1]} is not in the closed set`);
      seen.add(m[1]);
    }
    for (const role of DIATAXIS) {
      assert.ok(seen.has(role), `Diataxis role ${role} never appears on Ch11–12`);
    }
  });

  it('does not collide with free guidebook, Learn paths, or magazine', () => {
    const forbidden = ['one-week-sequence', 'one-stack', 'pch11-', 'pch12-'];
    for (const file of [
      'src/data/guidebook/chapters.ts',
      'src/data/learnPaths.ts',
      'src/data/guidebook/magazineMeta.ts',
    ]) {
      const src = read(file);
      for (const token of forbidden) {
        assert.ok(!src.includes(token), `${file} contains ${token} — that collides with #496/#479/.680`);
      }
    }
    assert.deepEqual(
      BEYOND_THE_BASICS_CHAPTERS.map((c) => c.id),
      [...FREE_CHAPTER_IDS]
    );
    assert.equal(FREE_LEARN_PATHS.length, 10);
    const mag = JSON.stringify(MAGAZINE_META);
    for (const token of forbidden) {
      assert.ok(!mag.includes(token), `magazine meta contains ${token}`);
    }
  });

  it('premium section id count matches inventory + floor (24)', () => {
    const src = premiumSrc();
    const n = [...src.matchAll(/\bid:\s*'pch\d+-s\d+'/g)].length;
    assert.equal(n, 24);
    assert.equal(n, PREMIUM_LEARN_SECTION_COUNT);
    assert.equal(n, CONTENT_FLOORS.learnPremiumSections);
    assert.equal(n, getContentInventory().learn.premiumSections);
  });

  it('originality log names every new section', () => {
    const log = read('docs/guidebook-originality-log.md');
    for (const id of SEQUENCE_SECTION_IDS) {
      assert.ok(log.includes(id), `originality log missing ${id}`);
    }
  });

  it('sequence bodies stay original MW voice (no Win Score / trial / ISSA / PRIVATE_MODE)', () => {
    const src = premiumSrc();
    const start = src.indexOf("id: 'one-week-sequence'");
    assert.ok(start >= 0);
    const slice = src.slice(start);
    assert.doesNotMatch(slice, /Win Score/);
    assert.doesNotMatch(slice, /\btrial\b/i);
    assert.doesNotMatch(slice, /PRIVATE_MODE/);
    assert.doesNotMatch(slice, /ISSA/);
    assert.doesNotMatch(slice, /wearable required/i);
  });

  it('CourseReader mounts GuideSectionExtras so tables/checklists render', () => {
    const src = read('src/components/learn/CourseReader.tsx');
    assert.match(src, /GuideSectionExtras/);
  });
});
