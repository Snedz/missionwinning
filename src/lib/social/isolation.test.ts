/**
 * Chat never sits on Today or Train first paint.
 *
 * Discover the Today tree and the logger files rather than listing widgets:
 * a new Today card that imported the messenger would otherwise be invisible
 * to a hand-maintained allowlist.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { LOGGER_FILES, reaches } from '@/lib/domainBoundary';

const root = path.join(import.meta.dirname, '..', '..', '..');

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(path.join(root, dir));
  } catch {
    return out;
  }
  for (const name of entries) {
    const rel = `${dir}/${name}`;
    const st = statSync(path.join(root, rel));
    if (st.isDirectory()) walk(rel, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.(test|routetest)\.(ts|tsx)$/.test(name)) out.push(rel);
  }
  return out;
}

const read = (file: string): string | null => {
  try {
    return readFileSync(path.join(root, file), 'utf8');
  } catch {
    return null;
  }
};

const CHAT_ROOTS = ['src/lib/social/', 'src/components/social/'] as const;

const TODAY_TRAIN_ENTRIES = [
  'src/page-components/HomePage.tsx',
  'src/page-components/ActiveWorkoutPage.tsx',
  ...LOGGER_FILES,
  ...walk('src/components/today'),
];

test('chat is not imported from Today or Train first-paint trees', () => {
  const seen = new Set<string>();
  const offenders: string[] = [];
  for (const file of TODAY_TRAIN_ENTRIES) {
    if (seen.has(file)) continue;
    seen.add(file);
    assert.ok(read(file) !== null, `${file} is in the isolation scan but missing`);
    const chain = reaches(file, CHAT_ROOTS, read);
    if (chain) offenders.push(chain.join(' → '));
  }
  assert.ok(seen.size >= 8, `isolation scan only reached ${seen.size} files — discovery drifted`);
  assert.deepEqual(
    offenders,
    [],
    `Speech never owns first paint; chat is not a Today tab or a set-log row.\n${offenders.join('\n')}`
  );
});

test('isolation scan includes HomePage, ActiveWorkoutPage, and today/', () => {
  assert.ok(TODAY_TRAIN_ENTRIES.includes('src/page-components/HomePage.tsx'));
  assert.ok(TODAY_TRAIN_ENTRIES.includes('src/page-components/ActiveWorkoutPage.tsx'));
  assert.ok(
    TODAY_TRAIN_ENTRIES.some((f) => f.startsWith('src/components/today/')),
    'today/ widgets must be discovered, not listed'
  );
});
