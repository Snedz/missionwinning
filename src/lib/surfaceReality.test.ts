/**
 * Does parking actually park anything?
 *
 * `surface.test.ts` is thorough about `isSurfaceEnabled` and `isPathEnabled` — but
 * every one of its cases checks `SURFACE_PATHS` against itself. "every surface
 * declares at least one path" validates the table using the table. Nothing asserted
 * that the declaration matched the app, and two things had drifted out from under it:
 *
 *   - `scheduleLeaderboardPush` ran on every completed workout while `/leaderboard`
 *     404s, serializing the athlete's whole history into the outbox each time.
 *   - `MilitaryReadinessSection` rendered on `/benchmarks` (a live secondary pillar)
 *     with no america guard, while its sibling on the same page had one.
 *
 * This is the fourth suite in this repo found pointing at its own assumptions rather
 * than at the product (`.129` sitemap, `.157` a11y routes, `.162` viewport,
 * `.165` gate port). The check here is deliberately crude — it reads source text —
 * because the alternative is rendering React in a node test, and a grep that fails
 * loudly beats an integration harness nobody runs.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { SURFACE_PATHS, isSurfaceEnabled, type Surface } from '@/lib/surface';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

/**
 * Components belonging to a parked surface that render on a route the surface does
 * not own. Each must consult its surface before returning markup.
 */
const MUST_SELF_GATE: { file: string; gate: string; why: string }[] = [
  {
    file: 'src/components/benchmarks/MilitaryReadinessSection.tsx',
    gate: 'isAmericaTrackEnabled',
    why: 'renders on /benchmarks, which the america surface does not own',
  },
  {
    file: 'src/components/fitness-test/PresidentialFitnessSection.tsx',
    gate: 'isAmericaTrackEnabled',
    why: 'renders on /benchmarks, which the america surface does not own',
  },
];

test('a parked surface renders nothing on routes it does not own', () => {
  for (const { file, gate, why } of MUST_SELF_GATE) {
    const src = read(file);
    assert.ok(
      src.includes(gate),
      `${file} ${why} — it must call ${gate}()`
    );
    assert.match(
      src,
      new RegExp(`if\\s*\\(!\\s*${gate}\\(\\)\\)\\s*return null`),
      `${file} imports ${gate} but does not bail on it — importing a guard is not using one`
    );
  }
});

/**
 * Work queued for a parked surface is work nobody can see the result of, and here it
 * also cost unbounded device storage. Enqueue sites must check the surface.
 */
const MUST_GATE_ENQUEUE: { file: string; fn: string; surface: string }[] = [
  {
    file: 'src/lib/leaderboardSync.ts',
    fn: 'scheduleLeaderboardPush',
    surface: 'leaderboard',
  },
];

test('nothing is queued for a parked surface', () => {
  for (const { file, fn, surface } of MUST_GATE_ENQUEUE) {
    const src = read(file);
    const body = src.slice(src.indexOf(`export function ${fn}`));
    assert.ok(
      body.includes(`isSurfaceEnabled('${surface}')`),
      `${fn} in ${file} enqueues without checking isSurfaceEnabled('${surface}')`
    );
  }
});

/**
 * If a surface is on, its pages are reachable, and reachable pages get swept by axe.
 *
 * `.157` widened the a11y route list from four signed-in screens to thirteen, but it
 * was never cross-checked against the surface registry — so four of the eight
 * surfaces that are ON by default had no axe coverage at all: benchmarks, guidebook,
 * calculators and programs. `/benchmarks` was excluded by a comment that called it
 * parked; it is a SECONDARY pillar and serves 200. `/calculators` is public even
 * while the private gate is up, so anyone could reach a page nothing had ever
 * checked.
 *
 * Deriving this from `SURFACE_PATHS` rather than restating a list is the whole point:
 * turning a surface on now drags its a11y coverage along with it.
 */
test('every enabled surface has at least one page under axe', () => {
  const spec = read('tests/e2e/a11y.spec.ts');
  const missing: string[] = [];

  for (const [surface, paths] of Object.entries(SURFACE_PATHS) as [Surface, readonly string[]][]) {
    if (!isSurfaceEnabled(surface)) continue;
    if (!paths.some((p) => spec.includes(`'${p}'`))) missing.push(`${surface} (${paths.join(', ')})`);
  }

  assert.deepEqual(
    missing,
    [],
    `enabled surfaces with no route in tests/e2e/a11y.spec.ts: ${missing.join(' · ')}`
  );
});

/** The mirror: a route the suite skips as "parked" must genuinely be parked. */
test('nothing is excluded from axe on a false parked claim', () => {
  const spec = read('tests/e2e/a11y.spec.ts');
  for (const [surface, paths] of Object.entries(SURFACE_PATHS) as [Surface, readonly string[]][]) {
    if (isSurfaceEnabled(surface)) continue;
    for (const p of paths) {
      assert.ok(
        !spec.includes(`'${p}'`),
        `${p} is in the a11y list but ${surface} is parked — it would 404 and the sweep would be testing an error page`
      );
    }
  }
});

/**
 * The bug the comment in leaderboardSync.ts described and the code then committed:
 * it claimed the snapshot was computed at enqueue "because queuing an entire workout
 * history would bloat device storage", then enqueued the entire workout history.
 */
test('the leaderboard outbox payload is a snapshot, not a whole history', () => {
  const src = read('src/lib/leaderboardSync.ts');
  const start = src.indexOf("enqueue('leaderboard.push'");
  assert.notEqual(start, -1, 'expected a leaderboard.push enqueue to exist');
  const call = src.slice(start, start + 300);

  // `workoutHistory` may legitimately appear as an *argument* to the snapshot
  // computation. What must never appear is it being queued as a payload field —
  // the shorthand `{ workoutHistory, ... }` or an explicit `workoutHistory:` key.
  assert.ok(
    !/\{\s*workoutHistory\b/.test(call) && !/\bworkoutHistory\s*:/.test(call),
    `leaderboard.push must not queue workoutHistory as a payload field — it grows without bound. Got: ${call.slice(0, 120)}`
  );
  assert.ok(
    call.includes('computeLocalLeaderboardSnapshot'),
    'the snapshot must be computed at enqueue, as sync/INDEX.md documents'
  );
});
