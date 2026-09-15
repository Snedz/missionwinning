/**
 * Public snapshot deny list — keep the product, drop scribble.
 * Run: node --test scripts/public-snapshot/deny.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isDenied, isNever, selectSnapshotPaths } from './deny.mjs';

test('keeps product, tests, and archive rotation history', () => {
  const keep = [
    'src/lib/coach/planEngine.ts',
    'src/lib/coach/planEngine.test.ts',
    'tests/e2e/hero-flows.spec.ts',
    'app/(app)/active/page.tsx',
    'packages/mw-core/src/index.ts',
    'apps/android/app/src/main/AndroidManifest.xml',
    'docs/help/getting-started.md',
    'docs/contracts/IDENTITY.md',
    'docs/ARCHITECTURE.md',
    'docs/API.md',
    'README.md',
    'package.json',
    '.env.example',
    '.github/workflows/ci.yml',
    'scripts/export-public-snapshot.mjs',
    'scripts/public-snapshot/deny.mjs',
  ];
  for (const p of keep) {
    assert.equal(isDenied(p), false, `should keep ${p}`);
  }
});

test('drops leftover plans, hop folders, and craft stills', () => {
  const drop = [
    'PLAN.md',
    'IMPROVEMENT_LOG.md',
    'docs/overnight/PLAN.md',
    'docs/places/INDEX.md',
    'docs/plans/PLAN.md',
    'docs/gauntlet/round-1.png',
    'docs/design/variants/a1-modernist.html',
    'docs/design/start-current-390.png',
  ];
  for (const p of drop) {
    assert.equal(isDenied(p), true, `should drop ${p}`);
  }
});

/**
 * Added 2026-09-15. `docs/THESIS.md` was previously asserted KEPT; the exposure
 * audit found it publishing a competitive self-assessment ("no defensible moat")
 * and the region-block policy. It is strategy, so it is now denied and the
 * assertion moved here. If this ever flips back, say why in the commit.
 */
test('drops strategy and operating material', () => {
  const drop = [
    'vision.md',
    'ORCHESTRATION.md',
    'CONTEXT.md',
    'LOG.md',
    'INDEX.md',
    'CLAUDE.md',
    'AGENTS.md',
    'GEMINI.md',
    'docs/THESIS.md',
    'docs/CREATIVE_MONOPOLY.md',
    'seo/competitors/INDEX.md',
    'seo/outreach/PLAN.md',
    'seo/launch/CHECKLIST.md',
    'seo/FOUNDER_SIGNOFF.md',
  ];
  for (const p of drop) {
    assert.equal(isDenied(p), true, `should drop ${p}`);
  }
});

/**
 * The guard is the DEFAULT, not the list. None of these strings appear anywhere
 * in `deny.mjs` — if this test ever goes red, the control has regressed from an
 * allowlist to an enumeration, which is how 826 planning files shipped while
 * this suite stayed green.
 */
test('an unknown strategy doc is denied WITHOUT being named (the default is the guard)', () => {
  for (const p of [
    'docs/BRAND_NEW_STRATEGY.md',
    'docs/Q1_2027_PLAN.md',
    'ORCHESTRATION_V2.md',
    'seo/report.md',
    'docs/archive/CONTEXT-now-2026-07-30.md',
    'docs/archive/log/LOG-rotate-912-for-927.md',
    'docs/archive/INDEX.md',
    'docs/THESIS.md',
    'docs/PLAN.md',
    'docs/gauntlet/INDEX.md',
  ]) {
    assert.equal(isDenied(p), true, `LEAK: ${p} ships by default`);
  }
});

test('docs/archive/ no longer ships — it is the same documents, rotated', () => {
  // Previously asserted KEPT on the claim that budget tests needed it. Verified
  // false: those tests read the working tree, not the snapshot. `docs/archive/`
  // held 771 rotated copies of files this control already denied at the root.
  assert.equal(isDenied('docs/archive/CONTEXT-now-2026-07-30.md'), true);
  assert.equal(isDenied('docs/archive/log/LOG-rotate-912-for-927.md'), true);
  assert.equal(isDenied('CONTEXT.md'), true);
});

test('never copies secrets or ops even if staged', () => {
  assert.equal(isNever('ops/intel/NAME_DENYLIST.md'), true);
  assert.equal(isNever('.hermes/plans/x.md'), true);
  assert.equal(isNever('.env.local'), true);
  assert.equal(isDenied('ops/README.md'), true);
  assert.equal(isDenied('.env.local'), true);
  assert.equal(isDenied('.env.example'), false);
  assert.equal(isNever('.env.example'), false);
});

/**
 * Renamed 2026-09-15. It used to read "is deny, not allow — unknown product files
 * survive", which is now the opposite of the truth: under the allowlist an unnamed
 * file survives only because its *directory* is promoted, never because it was
 * merely not named. A test whose name contradicts the rule it guards is how a
 * control drifts without anyone noticing the suite go red.
 */
test('selectSnapshotPaths is allow-by-prefix — new code ships, new prose does not', () => {
  const selected = selectSnapshotPaths([
    'src/lib/brandNewModule.ts',
    'PLAN.md',
    'ops/secret.md',
    'docs/gauntlet/foo.png',
  ]);
  assert.deepEqual(selected, ['src/lib/brandNewModule.ts']);

  // The paired half of the claim: a brand-new file under a NON-promoted path is
  // refused even though nothing anywhere has ever named it.
  assert.deepEqual(
    selectSnapshotPaths([
      'src/lib/brandNewModule.ts',
      'docs/brandNewDoc.md',
      'seo/brandNewReport.md',
      'brandNewRootFile.md',
    ]),
    ['src/lib/brandNewModule.ts']
  );
});

test('a mutant that lets PLAN.md through is red', () => {
  const selected = selectSnapshotPaths(['PLAN.md', 'src/lib/x.ts']);
  assert.equal(selected.includes('PLAN.md'), false);
});
