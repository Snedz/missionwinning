/**
 * The reward strings an athlete actually sees reach the exported English packs.
 *
 * This read `public/locales/en/today.json` by name until `.606`, and it passed
 * for the wrong reason: the committed export was **stale**. `rewardTodayTitle`
 * is authored in `rewardsLocales.ts`, which the exporter writes to
 * `rewards.json`; it was only in `today.json` because nobody had safely
 * re-exported since the namespaces moved — the same drift `.252` fixed in the
 * exporter and could not retroactively fix in the committed files. Re-exporting
 * for the `athlete` namespace is what surfaced it.
 *
 * The list also spans namespaces — `whatsNewBulletRewardsTitle` comes from
 * `whatsNewLocales`, never from `today` — so **pinning any single filename was
 * always wrong**. Scanning every English pack states the real requirement: the
 * string reached the shipped English catalogue, wherever its namespace lands.
 * A key that moves between namespaces is then a non-event, which is the point;
 * a key that vanishes still fails.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const EN_DIR = join(import.meta.dirname, '..', '..', '..', 'public/locales/en');

/** Every key in the exported English packs, with the file that carries it. */
function exportedEnglish(): Map<string, string> {
  const out = new Map<string, string>();
  const files = readdirSync(EN_DIR).filter((f) => f.endsWith('.json'));
  for (const file of files) {
    const json = JSON.parse(readFileSync(join(EN_DIR, file), 'utf8')) as Record<string, unknown>;
    for (const [k, v] of Object.entries(json)) {
      if (typeof v === 'string' && !out.has(k)) out.set(k, file);
    }
  }
  return out;
}

test('the exported English packs carry the core reward* athlete strings', () => {
  const byKey = exportedEnglish();

  // Anti-vacuity: an empty or unreadable export directory would pass every
  // `has` below trivially if the loop above threw and were caught somewhere.
  assert.ok(byKey.size > 500, `only ${byKey.size} exported English keys found — the scan is not reaching the packs`);

  const missing: string[] = [];
  const empty: string[] = [];
  for (const k of [
    'rewardTodayTitle',
    'rewardWeeklyGoal',
    'rewardVictoryXp',
    'rewardProfileTitle',
    'rewardRank1',
    'rewardRank10',
    'rewardBadgeFirstBlood',
    'rewardBadgeFirstBloodDesc',
    'rewardBadgeSpectrumDesc',
    'whatsNewBulletRewardsTitle',
    'whatsNewBulletRewardsBody',
  ]) {
    const file = byKey.get(k);
    if (!file) {
      missing.push(k);
      continue;
    }
    const json = JSON.parse(readFileSync(join(EN_DIR, file), 'utf8')) as Record<string, string>;
    if (!json[k]?.length) empty.push(`${k} (${file})`);
  }

  assert.deepEqual(
    missing,
    [],
    'a reward string never reached the exported English packs — run `npm run export-locales`'
  );
  assert.deepEqual(empty, [], 'a reward string exported as an empty value');
});
