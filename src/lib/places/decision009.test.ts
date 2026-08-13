/**
 * Decision 009 refuse list — product source must not ship the refused mechanics.
 * PLAN.md may name them; this scans code, not docs.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');

const FORBIDDEN = [
  /gym\s*wars?/i,
  /pin\s*takeover/i,
  /\braids?\b/i,
  /discord\.com/i,
  /public\s*ranks?/i,
  /\blikes\b/i,
  /workout\s*feed/i,
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx)$/.test(name) && !name.endsWith('.test.ts')) out.push(p);
  }
  return out;
}

test('places product source does not ship Decision 009 refuses', () => {
  const files = [
    ...walk(path.join(root, 'src/lib/places')),
    path.join(root, 'src/page-components/ExplorePlacesPage.tsx'),
    path.join(root, 'app/(app)/explore/page.tsx'),
  ];
  const hits: string[] = [];
  for (const file of files) {
    let src: string;
    try {
      src = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    for (const re of FORBIDDEN) {
      if (re.test(src)) hits.push(`${path.relative(root, file)} ~ ${re}`);
    }
  }
  assert.deepEqual(hits, [], `refused mechanic leaked into product source:\n  ${hits.join('\n  ')}`);
});
