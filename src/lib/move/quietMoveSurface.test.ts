/**
 * Quiet Move stays on /move. Today / Train / the door stay Start-only.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const abs = path.join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.(tsx|ts)$/.test(abs)) out.push(path.relative(root, abs));
  }
  return out;
}

const QUIET_LEAK =
  /quietMove|QuietMove|mw_quiet_move_log|moveQuietLog|Easy walk or easy session/i;

const FORBIDDEN_SURFACES = [
  'src/page-components/HomeTodayLean.tsx',
  'src/page-components/HomePage.tsx',
  'src/page-components/ActiveWorkoutPage.tsx',
  'src/page-components/LandingPage.tsx',
  'src/lib/gatedWwwHonesty.ts',
  'src/lib/todayPrimaryAction.ts',
  'src/lib/today/quietWeekGlance.ts',
  'app/private/GateTeaser.tsx',
  'app/private/PrivateTeaserClient.tsx',
  'app/private/page.tsx',
];

describe('quiet Move surface lock', () => {
  it('Today / Train / door / week strip do not import quiet Move', () => {
    for (const file of FORBIDDEN_SURFACES) {
      const src = read(file);
      assert.doesNotMatch(src, QUIET_LEAK, `${file} must not carry quiet Move`);
      assert.doesNotMatch(src, /geolocation|getCurrentPosition|HealthKit/i, file);
    }
  });

  it('Move page mounts the quiet log on first paint, not a red Start', () => {
    const page = read('src/page-components/MovePage.tsx');
    const cardAt = page.indexOf('<QuietMoveLogCard');
    const flowsAt = page.indexOf('id="move-flows"');
    assert.notEqual(cardAt, -1, 'QuietMoveLogCard is wired');
    assert.notEqual(flowsAt, -1, 'flows house stays');
    assert.ok(cardAt < flowsAt, 'quiet log is first paint, before the flow grid');
    assert.doesNotMatch(page, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(page, /geolocation|getCurrentPosition|HealthKit/i);
  });

  it('quiet card is outline, optional numbers, no ring / GPS / feed', () => {
    const src = read('src/components/move/QuietMoveLogCard.tsx');
    assert.match(src, /data-testid="quiet-move-log"/);
    assert.match(src, /data-testid="quiet-move-log-submit"/);
    assert.match(src, /moveQuietLog|Log/);
    assert.match(src, /variant="outline"/);
    assert.match(src, /useEffect/);
    assert.doesNotMatch(
      src,
      /typeof window !== 'undefined' \? localDateKey/
    );
    assert.doesNotMatch(src, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(src, /geolocation|getCurrentPosition|watchPosition|HealthKit/i);
    assert.doesNotMatch(src, /ScoreNumeral|MeterBar|progress-ring|habitWeek|fuelStreak/i);
    assert.doesNotMatch(src, /activityLog|logActivity|logPillarWin|workoutHistory/);
    assert.doesNotMatch(src, /discord\.com|wechat|place order/i);
  });

  it('today tree still has no Quiet Move card', () => {
    const allow = new Set([
      'src/lib/today/quietWeekRow.ts',
      'src/lib/today/quietWeekRow.test.ts',
    ]);
    const todayFiles = walk(path.join(root, 'src/components/today')).concat(
      walk(path.join(root, 'src/lib/today'))
    );
    const offenders = todayFiles.filter((f) => !allow.has(f) && QUIET_LEAK.test(read(f)));
    assert.deepEqual(offenders, [], `Today leaked quiet Move: ${offenders.join(', ')}`);
    const strip = read('src/components/today/TodayQuietWeekStrip.tsx');
    assert.doesNotMatch(strip, /QuietMoveLogCard|primary-action/);
  });

  it('private door stays the tight lock — no four-scene, no Move', () => {
    const door = read('app/private/PrivateTeaserClient.tsx');
    assert.doesNotMatch(door, /four-scene|FourScene|CinematicWww/);
    assert.doesNotMatch(door, QUIET_LEAK);
  });
});
