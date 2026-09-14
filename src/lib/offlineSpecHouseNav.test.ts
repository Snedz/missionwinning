/**
 * Offline @gate first case must keep leftover Log set after
 * `setOffline`. A hard `goto('/active')` while offline is the CI miss
 * (#941): navigation cache can serve HTML without the compose tree, so
 * Log set is not in the DOM. Same leftover class as `.1070` Hero.
 *
 * Compose-bar Today after `setOffline` is also the stale tour: Train
 * unmounts the floor, and `router.push('/log')` still hits Serwist,
 * which serves the `/offline` fallback. Mid-session leftover stays on
 * the open compose.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const spec = readFileSync(path.join(root, 'tests/e2e/offline.spec.ts'), 'utf8');

function firstCase(): string {
  const start = spec.indexOf("a set logged offline survives");
  const end = spec.indexOf("a hard load with no network");
  assert.ok(start >= 0 && end > start, 'offline.spec first case bounds missing');
  return spec.slice(start, end);
}

test('offline first case keeps leftover Log set after setOffline, not goto /active', () => {
  const body = firstCase();
  assert.match(body, /setOffline\(true\)/);
  assert.match(body, /startEmptyActiveWorkout/);
  assert.match(body, /dismissHouseOverlays/);
  assert.match(body, /logSetButton|log\( set\)\?/);
  assert.doesNotMatch(
    body,
    /setOffline\(true\)[\s\S]*await page\.goto\(\s*['"]\/active['"]/,
    'hard goto /active after setOffline is the stale tour — stay on leftover Log set'
  );
  assert.doesNotMatch(
    body,
    /setOffline\(true\)[\s\S]*composeBarToday/,
    'compose-bar Today after setOffline serves /offline — stay on the open compose'
  );
  assert.doesNotMatch(
    body,
    /setOffline\(true\)[\s\S]*todayStart/,
    'Today Start after setOffline is not mid-session leftover — stay on Train'
  );
});
