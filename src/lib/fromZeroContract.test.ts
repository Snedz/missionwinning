/**
 * From-zero shell contract. Fails on the House floor and on Coach auto-mint.
 *
 * Athlete grammar: Start · Log · Generate. Chrome is PathShell.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { isJourneyBypassPath } from '@/lib/publicRoutes';

const root = path.join(import.meta.dirname, '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

test('signed-in layout mounts PathShell, not House', () => {
  const src = stripComments(read('app/(app)/layout.tsx'));
  assert.match(src, /PathShell/);
  assert.doesNotMatch(src, /HouseShell/);
  assert.doesNotMatch(src, /AppLayout/);
});

test('PathShell is word nav for Start / Log / Generate, not a house floor', () => {
  const src = stripComments(read('src/components/zero/PathShell.tsx'));
  assert.match(src, /JourneyGuard/);
  assert.match(src, /JourneySyncBoot/);
  assert.match(src, /SCREEN_DOCK_HOST_ID/);
  assert.match(src, /CONSENT_BANNER_HOST_ID/);
  assert.match(src, /['"]\/log['"]/);
  assert.match(src, /['"]\/active['"]/);
  assert.match(src, /['"]\/coach['"]/);
  assert.match(src, /['"]\/history['"]/);
  assert.match(src, /navToday/);
  assert.match(src, /navTrain/);
  assert.match(src, /navCoachTab/);
  assert.match(src, /navHistory/);
  assert.doesNotMatch(src, /HouseIconRail|HouseMore|HouseSecondRail|HouseGuide|CommissioningCeremony/);
  assert.doesNotMatch(src, /['"]\/library['"]|['"]\/server['"]|['"]\/nutrition['"]|['"]\/profile['"]/);
});

test('Coach and History are not I-Day walls', () => {
  assert.equal(isJourneyBypassPath('/log'), true);
  assert.equal(isJourneyBypassPath('/active'), true);
  assert.equal(isJourneyBypassPath('/coach'), true);
  assert.equal(isJourneyBypassPath('/history'), true);
});

test('refresh does not mint a week on empty storage', () => {
  const src = stripComments(read('src/hooks/useCoachPlan.ts'));
  const refresh = src.slice(src.indexOf('const refresh = useCallback'), src.indexOf('const generate = useCallback'));
  assert.ok(refresh.includes('if (!existing)'));
  const empty = refresh.slice(
    refresh.indexOf('if (!existing)'),
    refresh.indexOf('if (existing.weekStart')
  );
  assert.doesNotMatch(empty, /generateWeek/);
  assert.doesNotMatch(src, /auto:\s*true/);
  assert.match(src, /const generate = useCallback/, 'Generate tap stays the week door');
});

test('Finish keeps the open session clientId', () => {
  const src = stripComments(read('src/store/workoutStore.ts'));
  const complete = src.slice(
    src.indexOf('completeActiveWorkout:'),
    src.indexOf('const isFirstWorkout')
  );
  assert.match(complete, /clientId:\s*activeWorkout\.clientId/);
  assert.doesNotMatch(complete, /clientId:\s*newClientId\(\)/);
});
