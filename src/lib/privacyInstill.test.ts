/**
 * Phase 3 — instill the privacy/security program so the next agent cannot skip it.
 *
 * Discover, do not enumerate: walk the paths that already burned us. Dedicated
 * suites still own the mutant-killing cases; this file fails if the recipe,
 * INDEX routing, or a burned spelling disappears.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(import.meta.dirname, '../..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');

function walkTs(dir: string, out: string[] = []): string[] {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of entries) {
    if (ent.name === 'node_modules' || ent.name === '.git') continue;
    const p = join(dir, ent.name);
    if (ent.isDirectory()) walkTs(p, out);
    else if (/\.(ts|tsx)$/.test(ent.name) && !/\.(test|routetest)\.tsx?$/.test(ent.name)) {
      out.push(p);
    }
  }
  return out;
}

test('INDEX and the recipe still route the framework program', () => {
  const index = read('INDEX.md');
  assert.match(index, /Framework program \/ DSAR \/ health-data bucket/);
  assert.match(index, /docs\/security\/PROGRAM_STATUS\.md/);
  assert.match(index, /docs\/compliance\/controls\.yaml/);

  const recipe = read('docs/AGENT_RECIPES.md');
  assert.match(recipe, /Touching auth \/ PII \/ webhooks \/ LLM \/ health flags/);
  assert.match(recipe, /PROGRAM_STATUS\.md/);
  assert.match(recipe, /LEGAL_SAFETY\.md/);
  assert.match(recipe, /privacyInstill\.test\.ts/);
  assert.match(recipe, /Never/);
  assert.match(recipe, /SOC 2/);
  assert.match(recipe, /Flip `PRIVATE_MODE`/);
  assert.doesNotMatch(recipe, /we are SOC 2 certified/i);
});

test('help privacy copy matches opt-in + DNT — not “analytics may run”', () => {
  const help = read('docs/help/privacy-and-data.md');
  assert.match(help, /Do Not Track/);
  assert.match(help, /stay \*\*off\*\* until you allow them/i);
  assert.doesNotMatch(help, /analytics may run/i);
});

test('account delete/export never forward a client deviceId into the executor', () => {
  const dir = join(root, 'app/api/account');
  const routes = walkTs(dir);
  assert.ok(
    routes.some((p) => p.endsWith(`${join('delete', 'route.ts')}`) || /delete\/route\.ts$/.test(p)),
    'account delete route disappeared — the guard is blind'
  );
  const leaks = routes.filter((p) => {
    const src = readFileSync(p, 'utf8');
    return /deleteAccount\([^)]*deviceId/.test(src) || /exportAccountData\([^)]*deviceId/.test(src);
  });
  assert.deepEqual(
    leaks.map((p) => relative(root, p).replaceAll('\\', '/')),
    [],
    `client deviceId forwarded: ${leaks.join(', ')}`
  );
});

test('Vercel access allow is not x-country-code', () => {
  const src = read('src/lib/legal/supportedRegions.ts');
  assert.match(src, /ACCESS_ALLOW_ON_VERCEL = \['x-vercel-ip-country'\]/);
  const allowLine = src.match(/ACCESS_ALLOW_ON_VERCEL = \[[^\]]+\]/)?.[0] ?? '';
  assert.doesNotMatch(allowLine, /x-country-code/);
  assert.doesNotMatch(allowLine, /cf-ipcountry/);
});

test('planner and mobile Coach do not grow a second PRIVATE_MODE string compare', () => {
  const files = [
    ...walkTs(join(root, 'src/lib/coach')),
    ...walkTs(join(root, 'packages/mw-core/src')),
    join(root, 'src/lib/mobileAccess.ts'),
  ];
  assert.ok(files.length > 3, 'planner walk found almost nothing — the guard is blind');
  const secondGate = /PRIVATE_MODE\s*===\s*['"]true['"]/;
  const hits = files.filter((p) => secondGate.test(readFileSync(p, 'utf8')));
  assert.deepEqual(
    hits.map((p) => relative(root, p).replaceAll('\\', '/')),
    [],
    `second PRIVATE_MODE compare: ${hits.join(', ')}`
  );
});

test('assessment health-bucket suite is still the discover guard', () => {
  const src = read('src/lib/healthDataBucket.test.ts');
  assert.match(src, /saveNutritionEntry/);
  assert.match(src, /AssessmentsPage/);
  assert.match(src, /persistParqScreen/);
});
