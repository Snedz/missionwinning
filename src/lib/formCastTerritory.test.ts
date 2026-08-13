/**
 * Representation ≠ service territory.
 *
 * MEDIA.md names who appears in stills. src/lib/legal/supportedRegions.ts names
 * where the hosted product is available. A caption, filename, or www hero that
 * treats a blocked country as a launch market is the defect this guard is for.
 *
 * Closed slogan list: a regex keyed to one spelling only ever tested that
 * spelling. These are the founder-named examples plus the blocked-market
 * “available in …” forms. Documenting the *block* (“Europe is not a hosted
 * market”) is allowed; implying we operate there is not.
 *
 * Spec files may quote the slogans as forbidden examples. Product copy, alt,
 * captions, filenames, and www heroes may not contain them.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { FORM_PACK_CAPTION } from '@/lib/formCast';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const SPEC = [
  'docs/MEDIA.md',
  'docs/MEDIA_CAST_PLAN.md',
  'src/lib/formCast.ts',
  'src/lib/formCastRoster.ts',
] as const;

const PUBLIC_MEDIA_DIRS = [
  'public/form',
  'public/learn',
  'public/photo',
  'public/art',
  'public/social',
] as const;

/** Slogans that imply we host in a blocked country. Closed list — see file header. */
const FORBIDDEN_LAUNCH = [
  'riyadh gym',
  'paris launch',
  'available in germany',
  'jakarta',
  'toronto hosted',
  'launch in saudi',
  'available in indonesia',
  'available in malaysia',
  'available in turkey',
  'gulf launch',
  'available in canada',
  'available in ukraine',
  'available in europe',
];

/** Quoted spans are founder-named *counterexamples*, not operational copy. */
function stripQuoted(src: string): string {
  return src.replace(/[“”"][^“”"]*[“”"]/g, ' ');
}

function sloganHits(haystack: string, file: string): string[] {
  const lower = haystack.toLowerCase();
  const hits: string[] = [];
  for (const slogan of FORBIDDEN_LAUNCH) {
    if (lower.includes(slogan)) hits.push(`${file}: "${slogan}"`);
  }
  return hits;
}

function walkFiles(dir: string, acc: string[] = []): string[] {
  const abs = path.join(root, dir);
  let entries: ReturnType<typeof readdirSync>;
  try {
    entries = readdirSync(abs);
  } catch {
    return acc;
  }
  for (const name of entries) {
    const rel = `${dir}/${name}`;
    const st = statSync(path.join(root, rel));
    if (st.isDirectory()) walkFiles(rel, acc);
    else acc.push(rel);
  }
  return acc;
}

test('MEDIA.md states representation is not service territory', () => {
  const src = read('docs/MEDIA.md');
  assert.match(src, /representation ≠ service territory/i);
  assert.match(src, /supportedRegions\.ts/);
  assert.match(src, /Cast is multicultural\. Country availability is/);
});

test('media specs do not imply blocked-country operations', () => {
  const hits: string[] = [];
  for (const file of SPEC) {
    hits.push(...sloganHits(stripQuoted(read(file)), file));
  }
  assert.deepEqual(hits, [], 'blocked-market launch copy in media specs:\n  ' + hits.join('\n  '));
});

test('form captions, filenames, and www media paths do not imply blocked markets', () => {
  const hits = sloganHits(FORM_PACK_CAPTION, 'FORM_PACK_CAPTION');
  for (const dir of PUBLIC_MEDIA_DIRS) {
    for (const file of walkFiles(dir)) {
      hits.push(...sloganHits(file, file));
    }
  }
  assert.deepEqual(
    hits,
    [],
    'blocked-market launch copy in captions or media paths:\n  ' + hits.join('\n  ')
  );
});
