/**
 * Explore is a quiet Account / More door — never a Today block.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

const TODAY_FILES = [
  'src/page-components/HomePage.tsx',
  'src/page-components/HomeTodayLean.tsx',
  'src/page-components/HomeTodayDashboard.tsx',
  'src/lib/todayPrimaryAction.ts',
  ...walk(path.join(root, 'src/components/today')).map((p) => path.relative(root, p)),
  ...walk(path.join(root, 'src/lib/today')).map((p) => path.relative(root, p)),
];

test('Explore does not sit on Today', () => {
  const hits: string[] = [];
  for (const rel of TODAY_FILES) {
    const src = readFileSync(path.join(root, rel), 'utf8');
    if (/\/explore\b/.test(src) || /\bnavExplore\b/.test(src) || /Explore places/.test(src)) {
      hits.push(rel);
    }
  }
  assert.deepEqual(hits, [], `Today must not link Explore:\n  ${hits.join('\n  ')}`);
});

test('Explore is wired as a quiet More door, not a tab or Account tour', () => {
  const account = readFileSync(path.join(root, 'src/page-components/AccountPage.tsx'), 'utf8');
  assert.doesNotMatch(account, /\/explore/);

  const quiet = readFileSync(path.join(root, 'src/lib/moreSheetTiers.ts'), 'utf8');
  assert.match(quiet, /href: '\/explore'/);

  const primary = readFileSync(path.join(root, 'src/lib/primaryNav.ts'), 'utf8');
  assert.doesNotMatch(primary, /\/explore/);

  const rail = readFileSync(path.join(root, 'src/lib/navConfig.ts'), 'utf8');
  const groups = rail.slice(rail.indexOf('export const RAIL_GROUPS'));
  assert.doesNotMatch(groups, /\/explore/);
});
