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
    'docs/archive/log/LOG-rotate-912-for-927.md',
    'docs/archive/INDEX.md',
    'docs/archive/CONTEXT-now-2026-07-30.md',
    'docs/applications/README.md',
    'docs/gauntlet/INDEX.md',
    'docs/design/INDEX.md',
    'docs/design/concepts/05-exquisite.html',
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

test('archive rotation history survives the strategy deny (exact-match, not prefix)', () => {
  // CONTEXT.md is denied at the root only; archived snapshots must still ship.
  assert.equal(isDenied('docs/archive/CONTEXT-now-2026-07-30.md'), false);
  assert.equal(isDenied('docs/archive/log/LOG-rotate-912-for-927.md'), false);
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

test('selectSnapshotPaths is deny, not allow — unknown product files survive', () => {
  const selected = selectSnapshotPaths([
    'src/lib/brandNewModule.ts',
    'PLAN.md',
    'ops/secret.md',
    'docs/gauntlet/foo.png',
  ]);
  assert.deepEqual(selected, ['src/lib/brandNewModule.ts']);
});

test('a mutant that lets PLAN.md through is red', () => {
  const selected = selectSnapshotPaths(['PLAN.md', 'src/lib/x.ts']);
  assert.equal(selected.includes('PLAN.md'), false);
});
