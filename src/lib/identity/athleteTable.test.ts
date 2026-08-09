/**
 * Athlete interests table — picks-from-sets only (S3 / C5 prep).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ATHLETE_TABLE_ROWS,
  athleteTableFilledCount,
  picksForRow,
  resolveAthleteTablePicks,
} from '../../../packages/mw-core/src/identity/athleteTable';
import {
  DEFAULT_ATHLETE_PAGE_CONFIG,
  resolveAthletePageConfig,
} from '../../../packages/mw-core/src/identity/athleteProfile';
import { DEFAULT_PAGE_KIT_ID } from '../../../packages/mw-core/src/identity/pageKits';

describe('athlete table catalog', () => {
  it('defines four rows with non-empty pick sets and no free-text slots', () => {
    assert.equal(ATHLETE_TABLE_ROWS.length, 4);
    for (const row of ATHLETE_TABLE_ROWS) {
      assert.ok(row.picks.length >= 2, `${row.id} needs real choices`);
      for (const pick of row.picks) {
        assert.match(pick, /^[a-z][a-z0-9-]*$/, `pick id shape: ${pick}`);
      }
    }
    assert.ok(
      !ATHLETE_TABLE_ROWS.some((r) => r.id === 'anthem' || r.id === 'bio'),
      'anthem/bio free-text rows must not ship until C5 public rules exist'
    );
  });

  it('resolve drops unknown rows and bad picks, keeps good ones', () => {
    const resolved = resolveAthleteTablePicks({
      trainingStyle: 'strength',
      homeGym: 'not-a-real-pick',
      goToLift: 'deadlift',
      workingOn: '',
      bio: 'hello strangers',
      nonsense: 'x',
    });
    assert.equal(resolved.trainingStyle, 'strength');
    assert.equal(resolved.homeGym, null);
    assert.equal(resolved.goToLift, 'deadlift');
    assert.equal(resolved.workingOn, null);
    assert.equal('bio' in resolved, false);
    assert.equal('nonsense' in resolved, false);
  });

  it('filled count ignores null and missing', () => {
    assert.equal(athleteTableFilledCount({}), 0);
    assert.equal(
      athleteTableFilledCount({ trainingStyle: 'hybrid', homeGym: null }),
      1
    );
  });

  it('picksForRow matches the catalog', () => {
    assert.ok(picksForRow('trainingStyle').includes('strength'));
  });
});

describe('athlete page config resolve', () => {
  it('defaults are safe and clampable', () => {
    const resolved = resolveAthletePageConfig(null, 1);
    assert.equal(resolved.kitId, DEFAULT_PAGE_KIT_ID);
    assert.deepEqual(resolved.table, {});
    assert.equal(DEFAULT_ATHLETE_PAGE_CONFIG.kitId, DEFAULT_PAGE_KIT_ID);
  });

  it('clamps a hand-edited kit and table together', () => {
    const resolved = resolveAthletePageConfig(
      {
        kitId: 'forged-kit',
        table: { trainingStyle: 'power', goToLift: 'hacked' },
      },
      10
    );
    assert.equal(resolved.kitId, DEFAULT_PAGE_KIT_ID);
    assert.equal(resolved.table.trainingStyle, 'power');
    assert.equal(resolved.table.goToLift, null);
  });
});
