/**
 * Crew is a signed-in More room. If it lands on the rail, Today, or a clinic
 * costume, this file goes red.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { HOUSE_RAIL_HREFS } from '@/components/house/houseNav';
import { MOBILE_TAB_HREFS } from '@/lib/primaryNav';
import { RAIL_GROUPS } from '@/lib/navConfig';
import { MORE_SHEET_TIER_HREFS } from '@/lib/moreSheetTiers';

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
    else if (/\.(ts|tsx|css)$/.test(name) && !/\.(test|routetest)\.(ts|tsx)$/.test(name)) out.push(rel);
  }
  return out;
}

const read = (file: string) => readFileSync(path.join(root, file), 'utf8');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

const CREW_FILES = [
  ...walk('src/lib/crew'),
  ...walk('src/components/crew'),
  'src/page-components/CrewPage.tsx',
  'app/(app)/crew/page.tsx',
];

/**
 * Closed list: spellings a reviewer would cite as "this is a dog hospital
 * or a molecule designer." Product/ops copy must not carry them.
 */
const CLINIC_OR_LAB = [
  /\bmilo\b/i,
  /\btreatment room\b/i,
  /\bdos(e|ing|ed)\b/i,
  /\bsedat/i,
  /\bmolecule\b/i,
  /\bdocking\b/i,
  /\bbinding score/i,
  /\bgene sequence/i,
  /\bcompound\b/i,
  /\bassay\b/i,
  /\bsynthesis\b/i,
  /\btox\b/i,
  /\bpatient\b/i,
  /\bclinic\b/i,
  /\bSCA\b/,
  /\bLX-7\b/i,
  /\bGX-\d/i,
  /\bvital[s]?\b/i,
  /\bbpm\b/i,
  /\bSpO2\b/i,
];

/**
 * Charter labels may quote the clip (Tox / Vitals / dose / docking stores).
 * Those strings live only in seats.ts. Everywhere else they are engines.
 */
const CHARTER_FILE = 'src/lib/crew/seats.ts';

const ENGINE_ONLY = [
  /\btreatment room\b/i,
  /\bmilo\b/i,
  /\bmolecule\b/i,
  /\bbinding score/i,
  /\bgene sequence/i,
  /\bcompound\b/i,
  /\bassay\b/i,
  /\bsynthesis\b/i,
  /\bpatient\b/i,
  /\bclinic\b/i,
  /\bSCA\b/,
  /\bLX-7\b/i,
  /\bGX-\d/i,
  /\bbpm\b/i,
  /\bSpO2\b/i,
];

test('crew files exist and stay product/ops — no clinic or lab chrome', () => {
  assert.ok(CREW_FILES.includes('src/lib/crew/machine.ts'));
  assert.ok(CREW_FILES.includes('src/page-components/CrewPage.tsx'));
  assert.ok(CREW_FILES.includes(CHARTER_FILE));
  const seats = read(CHARTER_FILE);
  assert.match(seats, /never ranks a candidate/);
  assert.match(seats, /never calls a dose/);
  assert.match(seats, /never goes without you/);
  const hits: string[] = [];
  for (const file of CREW_FILES) {
    const src = stripComments(read(file));
    const list = file === CHARTER_FILE ? ENGINE_ONLY : CLINIC_OR_LAB;
    for (const re of list) {
      if (re.test(src)) hits.push(`${file} ~ ${re}`);
    }
  }
  assert.deepEqual(hits, [], `clinic/lab chrome leaked:\n${hits.join('\n')}`);
});

test('/crew is More only — never rail, never dock, never first paint', () => {
  assert.ok(!Object.values(HOUSE_RAIL_HREFS).includes('/crew' as never));
  assert.ok(!MOBILE_TAB_HREFS.includes('/crew' as never));
  assert.ok(!RAIL_GROUPS.flatMap((g) => g.hrefs).includes('/crew'));
  const nav = read('src/components/house/houseNav.ts');
  assert.doesNotMatch(nav, /['"]\/crew['"]/);
  const rail = read('src/components/house/HouseIconRail.tsx');
  assert.doesNotMatch(rail, /['"]\/crew['"]/);
  const today = read('src/page-components/HomePage.tsx') + read('src/page-components/TodayDesk.tsx');
  assert.doesNotMatch(today, /CrewPage|@\/lib\/crew|['"]\/crew['"]/);
  const you = MORE_SHEET_TIER_HREFS.find((t) => t.id === 'you');
  assert.ok(you?.hrefs.includes('/crew'), '/crew must be a You-tier More row');
  const houseMore = read('src/components/house/HouseMore.tsx');
  assert.match(houseMore, /['"]\/crew['"]/);
  assert.doesNotMatch(houseMore, /from ['"]@\/lib\/crew|from ['"]@\/page-components\/CrewPage/);
  const server = read('src/page-components/ServerPage.tsx');
  assert.doesNotMatch(server, /CrewPage|@\/lib\/crew/);
});

test('logSet stays ungated — crew does not touch the logger', () => {
  const store = read('src/store/workoutStore.ts');
  assert.match(store, /logSet:\s*\(/);
  const crew = walk('src/lib/crew').concat(['src/page-components/CrewPage.tsx']);
  for (const file of crew) {
    const src = read(file);
    assert.doesNotMatch(src, /logSet|firstSetUngated|premiumServer/, file);
  }
});
