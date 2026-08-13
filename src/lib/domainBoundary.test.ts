/**
 * The Log ↔ Social boundary, enforced.
 *
 * `docs/IDENTITY_SOCIAL_PLAN.md` argues that social comparison in this product is
 * an input-integrity attack on the planner rather than a matter of taste, and
 * `docs/DESIGN_PROPOSAL_3.md` §2 maps the build onto a chip flow where every stage
 * has a check that can fail — except stage 6, clock-domain crossing, which had
 * none because there had never been a second domain. This file is that stage.
 *
 * ## Why now, before the feature
 *
 * Every contract below holds today at **zero violations**, which is the only
 * cheap moment to pin one. `.596` is the standing lesson: a documented 16-step
 * gate that ran 18 and omitted the one ratchet breached since `.544`. A boundary
 * that lives only in prose is that defect one layer up, and the failure is silent
 * — a planner that reads rank would never announce itself, the plans would just
 * get quietly worse for the athletes who care most about their standing.
 *
 * ## No exemption mechanism
 *
 * Deliberately absent. `{ why, fixWhen }` scaffolding here would be building the
 * escape hatch before the wall. If a future crossing is legitimate, that PR adds
 * the mechanism and argues for it in review, where someone can disagree — which
 * is the whole point of `.255`'s in-scope-unless-exempted reasoning.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import {
  FIRST_RUN_ROOTS,
  HONOR_TERMINALS,
  LOGGER_FILES,
  PLANNER_ROOTS,
  SOCIAL_DOORS,
  SOCIAL_DOOR_MODULES,
  SOCIAL_ROOTS,
  callIsDiscarded,
  doorSymbolsUsed,
  importsOf,
  reachableFrom,
  reaches,
  resolveSpecifier,
  stripComments,
} from './domainBoundary';

const root = path.join(import.meta.dirname, '..', '..');

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const abs = path.join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.tsx?$/.test(abs)) out.push(path.relative(root, abs).split(path.sep).join('/'));
  }
  return out;
}

const isTest = (p: string) => /\.(test|routetest)\.tsx?$/.test(p);
const PRODUCT_SOURCE = [
  ...walk(path.join(root, 'src')),
  ...walk(path.join(root, 'app')),
  ...walk(path.join(root, 'packages', 'mw-core', 'src')),
].filter((p) => !isTest(p));

/** Memoised, because the walk revisits shared modules from many entry points. */
const cache = new Map<string, string | null>();
function read(file: string): string | null {
  const hit = cache.get(file);
  if (hit !== undefined) return hit;
  let value: string | null = null;
  try {
    const abs = path.join(root, file);
    value = statSync(abs).isFile() ? readFileSync(abs, 'utf8') : null;
  } catch {
    value = null;
  }
  cache.set(file, value);
  return value;
}

const filesUnder = (roots: readonly string[]) =>
  PRODUCT_SOURCE.filter((f) => roots.some((r) => (r.endsWith('/') ? f.startsWith(r) : f === r)));

/**
 * A terminal is past the gate its contract protects, so it is not an entry either
 * — walking *from* Victory or the commissioning ceremony asks a question neither
 * contract poses.
 */
const entriesUnder = (roots: readonly string[]) =>
  filesUnder(roots).filter((f) => !(HONOR_TERMINALS as readonly string[]).includes(f));

const show = (chain: string[]) => chain.join('\n      → ');

// ---------------------------------------------------------------------------
// C1 — the planner is blind to standing
// ---------------------------------------------------------------------------

test('C1: no planner module can reach a social module', () => {
  const offenders: string[] = [];
  for (const file of filesUnder(PLANNER_ROOTS)) {
    const chain = reaches(file, SOCIAL_ROOTS, read);
    if (chain) offenders.push(show(chain));
  }
  assert.deepEqual(
    offenders,
    [],
    `The weekly plan is built from logs alone. A planner that can see rank, points or
board position will eventually plan around them, and nothing downstream would
show it — the plans would simply get worse for the athletes who care most.
Type imports count too: a planner has no reason to name a reward type.
Chains found:\n      ${offenders.join('\n\n      ')}`
  );
});

// ---------------------------------------------------------------------------
// C2 — the logger emits, and never reads
// ---------------------------------------------------------------------------

/** Doors plus the honor beat: where a logging-path walk legitimately stops. */
const LOGGING_PATH_TERMINALS = [...SOCIAL_DOOR_MODULES, ...HONOR_TERMINALS];

/** The Log domain's real closure — every entry, walked, stopping at the terminals. */
function logDomainClosure(): Set<string> {
  const all = new Set<string>();
  for (const entry of [...LOGGER_FILES, ...entriesUnder(PLANNER_ROOTS), ...entriesUnder(FIRST_RUN_ROOTS)]) {
    for (const f of reachableFrom(entry, read, { allow: LOGGING_PATH_TERMINALS })) all.add(f);
  }
  return all;
}

test('C2: the logging path reaches nothing in Social but the doors', () => {
  const offenders: string[] = [];
  for (const file of LOGGER_FILES) {
    const chain = reaches(file, SOCIAL_ROOTS, read, { allow: LOGGING_PATH_TERMINALS });
    if (chain) offenders.push(show(chain));
  }
  assert.deepEqual(
    offenders,
    [],
    `While an athlete is deciding whether to log a set, nothing on screen may depend on
what logging it would do to their standing. Emitting is fine — that is
${SOCIAL_DOOR_MODULES.join(', ')}, and it is one-way. Reading anything back is not.
Chains found:\n      ${offenders.join('\n\n      ')}`
  );
});

test('C2: the Log domain uses only the emit half of each door', () => {
  const closure = logDomainClosure();
  const resolve = (spec: string, from: string) => resolveSpecifier(spec, from, (p) => read(p) !== null);
  const offenders: string[] = [];
  let checked = 0;

  for (const file of closure) {
    const raw = read(file);
    if (raw === null) continue;
    const src = stripComments(raw);
    for (const door of SOCIAL_DOOR_MODULES) {
      for (const name of doorSymbolsUsed(src, file, door, resolve)) {
        checked += 1;
        if (!SOCIAL_DOORS[door].includes(name)) {
          offenders.push(`${file} imports \`${name}\` from ${door} — not an emit`);
        }
      }
    }
  }

  assert.ok(checked > 0, 'no door symbols were examined — the clause parse has stopped matching');
  assert.deepEqual(
    offenders,
    [],
    `A door module exports both halves: \`leaderboardSync\` can push your snapshot *and*
fetch everyone else's. Only the emit half may be reached from the Log domain —
otherwise the wall has a labelled hole in it. Permitted per door:
${SOCIAL_DOOR_MODULES.map((d) => `  ${d}: ${SOCIAL_DOORS[d].join(', ')}`).join('\n')}`
  );
});

test('C2: every emit in the Log domain discards its result', () => {
  const closure = logDomainClosure();
  const resolve = (spec: string, from: string) => resolveSpecifier(spec, from, (p) => read(p) !== null);
  const offenders: string[] = [];
  let callsChecked = 0;

  for (const file of closure) {
    const raw = read(file);
    if (raw === null) continue;
    const src = stripComments(raw);
    for (const door of SOCIAL_DOOR_MODULES) {
      for (const name of doorSymbolsUsed(src, file, door, resolve)) {
        for (const call of src.matchAll(new RegExp(`\\b${name}\\s*\\(`, 'g'))) {
          callsChecked += 1;
          if (!callIsDiscarded(src, call.index)) {
            offenders.push(`${file}: \`${name}(…)\` result is bound, not discarded`);
          }
        }
      }
    }
  }

  assert.ok(callsChecked > 0, 'no emit call sites were examined — the call scan has stopped matching');
  assert.deepEqual(
    offenders,
    [],
    `An emit whose value is kept is a read wearing a write's name: \`applyWorkoutRewards\`
hands back XP gained, badges earned and the level crossed. Call it as a statement
and let Victory be where any of that surfaces.`
  );
});

// ---------------------------------------------------------------------------
// C3 — no other athlete's number is one tap from the logging path
// ---------------------------------------------------------------------------

test('C3: no social route is a primary tab', () => {
  const src = read('src/lib/primaryNav.ts');
  assert.ok(src !== null, 'src/lib/primaryNav.ts has moved — C3 is measuring nothing');

  const block = /MOBILE_TAB_HREFS\s*=\s*\[([^\]]*)\]/.exec(stripComments(src));
  assert.ok(block, 'MOBILE_TAB_HREFS is no longer a literal array — reparse before trusting this test');
  const hrefs = [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);

  assert.ok(hrefs.length >= 3, `only ${hrefs.length} tab hrefs parsed — the extraction has drifted`);
  const social = hrefs.filter((h) =>
    ['/leaderboard', '/club', '/squad', '/profile', '/server'].includes(h)
  );
  assert.deepEqual(
    social,
    [],
    `A primary tab is one tap from every screen including /active. Rank belongs behind
a deliberate navigation, not beside the set row. Found: ${social.join(', ')}`
  );
});

// ---------------------------------------------------------------------------
// C7 — first run never asks who you are
// ---------------------------------------------------------------------------

test('C7: first-run surfaces reach nothing in Social', () => {
  const offenders: string[] = [];
  for (const file of entriesUnder(FIRST_RUN_ROOTS)) {
    const chain = reaches(file, SOCIAL_ROOTS, read, { allow: LOGGING_PATH_TERMINALS });
    if (chain) offenders.push(show(chain));
  }
  assert.deepEqual(
    offenders,
    [],
    `Identity is never the price of reaching a first logged set. CLUB_PLAN holds club
surfaces to journey phase 3, and community onboarding steps were refused twice.
Chains found:\n      ${offenders.join('\n\n      ')}`
  );
});

// ---------------------------------------------------------------------------
// Anti-vacuity — a guard that scans nothing passes everything
// ---------------------------------------------------------------------------

test('the scan actually reaches the product', () => {
  assert.ok(PRODUCT_SOURCE.length > 400, `only ${PRODUCT_SOURCE.length} source files found`);
  assert.equal(PRODUCT_SOURCE.filter(isTest).length, 0, 'test files are being walked as product source');
  assert.ok(PRODUCT_SOURCE.some((f) => f.startsWith('app/')), 'app/ is not being walked');
  assert.ok(
    PRODUCT_SOURCE.some((f) => f.startsWith('packages/mw-core/src/')),
    'packages/mw-core is not being walked — it is excluded from tsconfig, lint and the test glob, so nothing else would notice'
  );

  // Named members, so narrowing a root list to something that still resolves is caught.
  for (const named of [
    'src/lib/coach/progression.ts',
    'src/store/workoutStore.ts',
    'src/lib/rewards/apply.ts',
    'src/lib/rewards/summary.ts',
  ]) {
    assert.ok(read(named) !== null, `${named} has moved — a declaration below is now aimed at nothing`);
  }

  // Every declared root must still match real files, in both directions.
  for (const [label, roots] of [
    ['PLANNER_ROOTS', PLANNER_ROOTS],
    ['SOCIAL_ROOTS', SOCIAL_ROOTS],
    ['FIRST_RUN_ROOTS', FIRST_RUN_ROOTS],
  ] as const) {
    assert.ok(filesUnder(roots).length > 0, `${label} matches no files at all`);
    for (const r of roots) {
      assert.ok(
        filesUnder([r]).length > 0,
        `${label} entry '${r}' matches nothing — a rename dropped it out of scope silently`
      );
    }
  }
  for (const f of [...LOGGER_FILES, ...SOCIAL_DOOR_MODULES, ...HONOR_TERMINALS]) {
    assert.ok(read(f) !== null, `declared path '${f}' does not exist`);
  }
});

test('the resolver resolves, in both directions', () => {
  const fake = (files: Record<string, string>) => (p: string) => files[p] ?? null;

  // Positive: a planner reading a reward summary is a hit, and the chain names both ends.
  assert.deepEqual(
    reaches(
      'src/lib/coach/planEngine.ts',
      SOCIAL_ROOTS,
      fake({
        'src/lib/coach/planEngine.ts': "import { summarizeRewards } from '@/lib/rewards/summary';",
        'src/lib/rewards/summary.ts': '',
      })
    ),
    ['src/lib/coach/planEngine.ts', 'src/lib/rewards/summary.ts']
  );

  // Negative: Social reading Log is the permitted direction and must stay silent.
  assert.equal(
    reaches(
      'src/lib/rewards/summary.ts',
      PLANNER_ROOTS,
      fake({
        'src/lib/rewards/summary.ts': "import { loadDaysPerWeek } from '@/lib/coach/schedulePrefs';",
        'src/lib/coach/schedulePrefs.ts': '',
      }),
      { allow: [] }
    ) !== null,
    true,
    'sanity: with PLANNER_ROOTS as the target this direction *is* a hit — the real guard never asks it'
  );

  // Dynamic imports are followed: missionJourney.ts reaches rewards exactly this way.
  assert.ok(
    reaches(
      'src/lib/a.ts',
      SOCIAL_ROOTS,
      fake({
        'src/lib/a.ts': "void import('@/lib/rewards/apply').then((m) => m.go());",
        'src/lib/rewards/apply.ts': '',
      })
    ),
    'a dynamic import is not being followed'
  );

  // Four hops — proves the walk is not depth-capped the way launchTruth.ts is.
  assert.equal(
    reaches(
      'src/lib/h0.ts',
      SOCIAL_ROOTS,
      fake({
        'src/lib/h0.ts': "import { a } from './h1';",
        'src/lib/h1.ts': "import { b } from './h2';",
        'src/lib/h2.ts': "import { c } from './h3';",
        'src/lib/h3.ts': "import { d } from '@/lib/leaderboard/rank';",
        'src/lib/leaderboard/rank.ts': '',
      })
    )?.length,
    5
  );

  // The emit door is terminal: permitted, and not walked through to what is behind it.
  assert.equal(
    reaches(
      'src/store/workoutStore.ts',
      SOCIAL_ROOTS,
      fake({
        'src/store/workoutStore.ts': "import { applyWorkoutRewards } from '@/lib/rewards/apply';",
        'src/lib/rewards/apply.ts': "import { engine } from '@/lib/rewards/engine';",
        'src/lib/rewards/engine.ts': '',
      }),
      { allow: SOCIAL_DOOR_MODULES }
    ),
    null
  );

  // A re-export is an edge — a barrel is the most natural place for one to hide.
  assert.ok(
    reaches(
      'src/lib/barrel.ts',
      SOCIAL_ROOTS,
      fake({
        'src/lib/barrel.ts': "export { rank } from '@/lib/leaderboard/rank';",
        'src/lib/leaderboard/rank.ts': '',
      })
    ),
    'a re-export is not being treated as an import edge'
  );

  // index resolution, and a bare package specifier resolving to nothing.
  assert.equal(
    resolveSpecifier('@/lib/coach', 'src/lib/a.ts', (p) => p === 'src/lib/coach/index.ts'),
    'src/lib/coach/index.ts'
  );
  assert.equal(resolveSpecifier('react', 'src/lib/a.ts', () => true), null);

  // The lazy-quantifier trap: `export const x = 1;` must not reach the next specifier.
  const edges = importsOf("export const x = 1;\nimport { y } from '@/lib/rewards/summary';", 'src/lib/a.ts');
  assert.deepEqual(
    edges.map((e) => e.spec),
    ['@/lib/rewards/summary'],
    'the from-import gap is crossing a statement terminator'
  );

  // typeOnly is detected, so a future softer rule has something true to read.
  assert.equal(importsOf("import type { A } from '@/lib/rewards/summary';", 'x.ts')[0].typeOnly, true);
  assert.equal(importsOf("import { A } from '@/lib/rewards/summary';", 'x.ts')[0].typeOnly, false);
});

test('callIsDiscarded distinguishes a statement from a binding', () => {
  const at = (src: string, name: string) => src.indexOf(`${name}(`);

  const bare = 'recordWorkoutCompleted(log);\n  applyWorkoutRewards(log, history);';
  assert.equal(callIsDiscarded(bare, at(bare, 'applyWorkoutRewards')), true);

  const bound = 'recordWorkoutCompleted(log);\n  const r = applyWorkoutRewards(log, history);';
  assert.equal(callIsDiscarded(bound, at(bound, 'applyWorkoutRewards')), false);

  const returned = 'function f() {\n  return applyWorkoutRewards(log, history);\n}';
  assert.equal(callIsDiscarded(returned, at(returned, 'applyWorkoutRewards')), false);

  const awaited = 'const r = await applyWorkoutRewards(log, history);';
  assert.equal(callIsDiscarded(awaited, at(awaited, 'applyWorkoutRewards')), false);

  const voided = 'foo();\n  void applyWorkoutRewards(log, history);';
  assert.equal(callIsDiscarded(voided, at(voided, 'applyWorkoutRewards')), true);

  const argument = 'track(applyWorkoutRewards(log, history));';
  assert.equal(callIsDiscarded(argument, at(argument, 'applyWorkoutRewards')), false);
});
