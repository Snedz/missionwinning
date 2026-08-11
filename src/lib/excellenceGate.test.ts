import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

import {
  EXCELLENCE_RESULT_PATH,
  KNOWN_TOP_LEVELS,
  allowsSurfaceShip,
  blockedSurfacePaths,
  classifyPath,
  readExcellenceOverride,
  readExcellenceStatus,
  topLevelClassificationGaps,
} from './excellenceGate';

const root = path.join(import.meta.dirname, '..', '..');

test('RESULT file exists with parseable status (bootstrap)', () => {
  const abs = path.join(root, EXCELLENCE_RESULT_PATH);
  assert.equal(existsSync(abs), true, `${EXCELLENCE_RESULT_PATH} must exist`);
  const status = readExcellenceStatus(readFileSync(abs, 'utf8'));
  assert.ok(
    status === 'unscored' || status === 'pass' || status === 'fail',
    `status must be one of three, got ${status}`
  );
});

test('readExcellenceStatus: pass / fail / unscored', () => {
  assert.equal(readExcellenceStatus('- **status:** pass\n'), 'pass');
  assert.equal(readExcellenceStatus('- **status:** fail\n'), 'fail');
  assert.equal(readExcellenceStatus('- **status:** unscored\n'), 'unscored');
  assert.equal(readExcellenceStatus('status: pass\n'), 'pass');
});

test('readExcellenceStatus: missing or unknown → unscored (fail closed)', () => {
  const warns: string[] = [];
  assert.equal(readExcellenceStatus('# no status', (m) => warns.push(m)), 'unscored');
  assert.equal(readExcellenceStatus('- **status:** yes\n', (m) => warns.push(m)), 'unscored');
  assert.ok(warns.some((w) => w.includes('yes')));
});

test('allowsSurfaceShip: only pass or override', () => {
  assert.equal(allowsSurfaceShip('pass', false), true);
  assert.equal(allowsSurfaceShip('fail', false), false);
  assert.equal(allowsSurfaceShip('unscored', false), false);
  assert.equal(allowsSurfaceShip('unscored', true), true);
  assert.equal(allowsSurfaceShip('fail', true), true);
});

test('classifyPath: wedge routes and workout trees', () => {
  assert.equal(classifyPath('app/(app)/active/page.tsx'), 'wedge');
  assert.equal(classifyPath('app/(app)/log/page.tsx'), 'wedge');
  assert.equal(classifyPath('app/(app)/coach/page.tsx'), 'wedge');
  assert.equal(classifyPath('src/components/workout/ActiveSetOptionsMenu.tsx'), 'wedge');
  assert.equal(classifyPath('src/lib/workout/workoutVictory.ts'), 'wedge');
  assert.equal(classifyPath('src/components/today/TodayDashboardHeader.tsx'), 'wedge');
  assert.equal(classifyPath('src/components/journey/FirstStepsCard.tsx'), 'wedge');
  assert.equal(classifyPath('src/lib/coach/planEngine.ts'), 'wedge');
  assert.equal(classifyPath('src/page-components/ActiveWorkoutPage.tsx'), 'wedge');
  assert.equal(classifyPath('src/page-components/HomePage.tsx'), 'wedge');
  assert.equal(classifyPath('src/page-components/CoachPage.tsx'), 'wedge');
  assert.equal(classifyPath('packages/mw-core/src/index.ts'), 'wedge');
  assert.equal(classifyPath('src/store/activeWorkout.ts'), 'wedge');
  assert.equal(classifyPath('src/lib/sync/outbox.ts'), 'wedge');
  assert.equal(classifyPath('src/lib/storage/safeStorage.ts'), 'wedge');
  assert.equal(classifyPath('app/api/coach/daily-insight/route.ts'), 'wedge');
});

test('classifyPath: surface defaults and coach voice/chat', () => {
  assert.equal(classifyPath('app/(app)/america/page.tsx'), 'surface');
  assert.equal(classifyPath('src/page-components/AmericaPage.tsx'), 'surface');
  assert.equal(classifyPath('src/i18n/en.ts'), 'surface');
  assert.equal(classifyPath('app/api/coach/chat/route.ts'), 'surface');
  assert.equal(classifyPath('app/api/coach/plan-voice/route.ts'), 'surface');
  assert.equal(classifyPath('apps/android/app/src/main/AndroidManifest.xml'), 'surface');
});

test('classifyPath: infra bootstrap paths', () => {
  assert.equal(classifyPath(EXCELLENCE_RESULT_PATH), 'infra');
  assert.equal(classifyPath('src/lib/excellenceGate.ts'), 'infra');
  assert.equal(classifyPath('src/lib/excellenceGate.test.ts'), 'infra');
  assert.equal(classifyPath('scripts/check-excellence-gate.ts'), 'infra');
  assert.equal(classifyPath('scripts/gate.mjs'), 'infra');
  assert.equal(classifyPath('ORCHESTRATION.md'), 'infra');
  assert.equal(classifyPath('src/lib/buildInfo.ts'), 'infra');
  assert.equal(classifyPath('apps/android/FOUNDER_ACCEPT.md'), 'infra');
});

test('mutants A–E: blockedSurfacePaths policy', () => {
  // A: surface + unscored → blocked
  assert.deepEqual(
    blockedSurfacePaths(['src/page-components/AmericaPage.tsx'], 'unscored', false),
    ['src/page-components/AmericaPage.tsx']
  );
  // B: wedge + unscored → not blocked
  assert.deepEqual(
    blockedSurfacePaths(['src/lib/workout/workoutVictory.ts'], 'unscored', false),
    []
  );
  // C: surface + fail → blocked
  assert.deepEqual(
    blockedSurfacePaths(['src/i18n/en.ts'], 'fail', false),
    ['src/i18n/en.ts']
  );
  // D: surface + pass → allowed
  assert.deepEqual(
    blockedSurfacePaths(['src/page-components/AmericaPage.tsx'], 'pass', false),
    []
  );
  // E: surface + unscored + override → allowed
  assert.deepEqual(
    blockedSurfacePaths(['src/page-components/AmericaPage.tsx'], 'unscored', true),
    []
  );
});

test('readExcellenceOverride: trailer, PR body, CI ignores env', () => {
  assert.equal(
    readExcellenceOverride({
      commitMessages: ['fix: x\n\nExcellence-Override: hotfix'],
      isCI: true,
    }),
    true
  );
  assert.equal(
    readExcellenceOverride({
      commitMessages: ['no trailer'],
      prBody: 'Excellence-Override: squash reason',
      isCI: true,
    }),
    true
  );
  assert.equal(
    readExcellenceOverride({
      commitMessages: ['no trailer'],
      envOverride: true,
      isCI: true,
    }),
    false
  );
  assert.equal(
    readExcellenceOverride({
      commitMessages: ['no trailer'],
      envOverride: true,
      isCI: false,
    }),
    true
  );
  assert.equal(
    readExcellenceOverride({
      commitMessages: ['Excellence-Override:'],
      isCI: false,
    }),
    false
  );
});

test('staleness: KNOWN_TOP_LEVELS matches discovered tree (mutant F)', () => {
  const { missingFromMap, staleInMap } = topLevelClassificationGaps(root);
  assert.deepEqual(
    missingFromMap,
    [],
    `Add new top-levels to KNOWN_TOP_LEVELS in excellenceGate.ts: ${missingFromMap.join(', ')}`
  );
  assert.deepEqual(
    staleInMap,
    [],
    `Remove stale KNOWN_TOP_LEVELS entries: ${staleInMap.join(', ')}`
  );
  // Synthetic: a never-seen key is not in the map
  assert.equal(Object.prototype.hasOwnProperty.call(KNOWN_TOP_LEVELS, 'app/(app)/newthing'), false);
});
