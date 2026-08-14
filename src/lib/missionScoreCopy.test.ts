/**
 * Trap term: athlete-facing copy says Mission Score, not Win Score.
 *
 * H0-5. Keys (`landingFreeWinScore`, `winScoreSeen`) stay. The storage field
 * is not this test. The leftover product name is.
 *
 * Discover, do not enumerate files. A list of Locales.ts names cannot see the
 * next defaultValue or guidebook body.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, acc);
    } else {
      acc.push(full);
    }
  }
  return acc;
}

function leftover(dir: string, keep: (rel: string) => boolean): string[] {
  const hits: string[] = [];
  for (const full of walk(path.join(root, dir))) {
    const rel = path.relative(root, full).split(path.sep).join('/');
    if (!keep(rel)) continue;
    const src = readFileSync(full, 'utf8');
    if (src.includes('Win Score')) hits.push(rel);
  }
  return hits;
}

test('athlete copy does not say Win Score', () => {
  const hits = [
    ...leftover('src', (rel) => {
      if (rel.endsWith('.test.ts') || rel.endsWith('.routetest.ts')) return false;
      return /\.(ts|tsx|json|md)$/.test(rel);
    }),
    ...leftover('app', (rel) => {
      if (rel.endsWith('.test.ts') || rel.endsWith('.routetest.ts')) return false;
      return /\.(ts|tsx|js|mjs)$/.test(rel);
    }),
    ...leftover('scripts', (rel) => /generate-.*\.mjs$/.test(rel)),
    ...leftover('public/locales', (rel) => rel.endsWith('.json')),
  ];
  assert.deepEqual(
    hits,
    [],
    `leftover “Win Score” (rename the string, keep keys / winScoreSeen):\n  ${hits.join('\n  ')}`
  );
});
