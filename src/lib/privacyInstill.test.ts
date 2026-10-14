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

test('week_logged device rows stay inside the line they were drawn on', () => {
  // The accountless week-rollup (2026-10-09) let a guest write one ISO week key so the
  // north-star metric could finally see the product's actual user. Three properties have
  // to hold together or the change stops being the narrow thing it claimed to be:
  //
  //   1. consent is a SERVER-side fact, never something the caller asserts;
  //   2. no public RLS policy appears, because that would be a free enumeration API;
  //   3. the user-facing page says so in words a person would understand.
  //
  // Any one of these can be satisfied by accident. That is why they are pinned together.

  const route = read('app/api/metrics/week-logged/route.ts');
  assert.match(route, /push_subscriptions/);
  assert.match(route, /resolveWeekLoggedOwner/);
  // The consent lookup must fail closed: an unreachable admin client is "no consent".
  assert.match(route, /if \(!admin\) return false/);
  assert.match(route, /getUserFromRequest/);

  const migration = read('supabase/migrations/20261009_week_logged_device_owners.sql');
  assert.doesNotMatch(migration, /create\s+policy/i);
  assert.match(migration, /revoke all on function public\.mw_week4_retention_weekly/);
  // RLS is enabled once, when the table is created. The device-keyed migration must not
  // weaken it, so the invariant is split across the two files rather than asserted twice.
  assert.doesNotMatch(migration, /disable\s+row\s+level\s+security/i);
  assert.match(read('supabase/migrations/20260813_week_logged.sql'), /enable row level security/i);

  const help = read('docs/help/privacy-and-data.md');
  assert.match(help, /Training-week rollup/);
  assert.match(help, /turn(ed)? on reminders|turn on reminders/i);
  // The promise this migration rests on: no workout detail leaves the device.
  assert.match(help, /exercises, sets, weights|exercise, set, weight/i);

  const status = read('docs/security/PROGRAM_STATUS.md');
  assert.match(status, /week_logged` device-keyed rows/);
});
