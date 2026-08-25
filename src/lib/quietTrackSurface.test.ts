/**
 * Quiet Track stays on /track. Today / Train / the door stay clean.
 * Measurements stay free. No shame photos. No rings on first paint.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const abs = path.join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.(tsx|ts)$/.test(abs)) out.push(path.relative(root, abs));
  }
  return out;
}

const TRACK_LEAK =
  /quietTrack|BodyMetricsCard|ProgressPhotosCard|bodyMetricsSheet/i;

const FORBIDDEN_SURFACES = [
  'src/page-components/HomeTodayLean.tsx',
  'src/page-components/HomePage.tsx',
  'src/page-components/ActiveWorkoutPage.tsx',
  'src/page-components/MovePage.tsx',
  'src/page-components/LandingPage.tsx',
  'src/lib/gatedWwwHonesty.ts',
  'src/lib/todayPrimaryAction.ts',
  'app/private/GateTeaser.tsx',
  'app/private/PrivateTeaserClient.tsx',
  'app/private/page.tsx',
];

const PREMIUM = /from ['"]@\/lib\/(premium|trial|bundle)/;
const HEALTH_GATE =
  /getCurrentPosition|requestPermission|HealthKit|health\.connect|strain-as-permission/i;

describe('quiet track surface lock', () => {
  it('Today / Train / door do not import quiet track or body-metric UI', () => {
    for (const file of FORBIDDEN_SURFACES) {
      const src = read(file);
      assert.doesNotMatch(src, TRACK_LEAK, `${file} must not carry Quiet Track`);
    }
  });

  it('Today tree does not mount the Track card or photos', () => {
    const allow = new Set([
      'src/lib/today/quietWeekRow.ts',
      'src/lib/today/quietWeekRow.test.ts',
    ]);
    const todayFiles = walk(path.join(root, 'src/components/today')).concat(
      walk(path.join(root, 'src/lib/today'))
    );
    const offenders = todayFiles.filter((f) => !allow.has(f) && TRACK_LEAK.test(read(f)));
    assert.deepEqual(offenders, [], `Today leaked Track log: ${offenders.join(', ')}`);
    const strip = read('src/components/today/TodayQuietWeekStrip.tsx');
    assert.doesNotMatch(strip, /BodyMetricsCard|ProgressPhotosCard|primary-action/);
  });

  it('Track first paint is the metrics log — no rings, no photos, no red action', () => {
    const page = read('src/page-components/TrackPage.tsx');
    const detailsAt = page.indexOf('<details');
    const cardAt = page.indexOf('<BodyMetricsCard');
    assert.notEqual(detailsAt, -1, 'activity / GPS still have a Show more house');
    assert.notEqual(cardAt, -1, 'Quiet Track log is wired');
    assert.ok(cardAt < detailsAt, 'BodyMetricsCard must sit on first paint, not inside Show more');
    assert.doesNotMatch(page, /ProgressPhotosCard/);
    assert.doesNotMatch(page, /ScoreNumeral/);
    assert.doesNotMatch(page, /primary-action/);
    assert.doesNotMatch(page, /Health permission|Allow Health|Connect Apple Health/i);
    assert.doesNotMatch(page, /discord\.com|WeChat|marketplace|Top 8|four-scene/i);
  });

  it('metrics card is free, empty-honest, and not a photo album', () => {
    const src = read('src/components/track/BodyMetricsCard.tsx');
    assert.match(src, /data-testid="quiet-track-log"/);
    assert.match(src, /quietTrackSnapshot|canSaveQuietTrack/);
    assert.match(src, /quiet-track-empty|No number yet/);
    assert.doesNotMatch(src, PREMIUM);
    assert.doesNotMatch(src, HEALTH_GATE);
    assert.doesNotMatch(src, /ProgressPhotos|shame|before.?after/i);
    assert.doesNotMatch(src, /primary-action|bg-primary-fill/);
  });

  it('sheet refuses a blank save', () => {
    const src = read('src/components/track/BodyMetricsSheet.tsx');
    assert.match(src, /canSaveQuietTrack/);
    assert.doesNotMatch(src, PREMIUM);
  });
});
