/**
 * C5 prep — public projection carries only picks + derived numbers.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ATHLETE_PUBLIC_PROJECTION_KEYS,
  buildAthletePublicProjection,
  publicProjectionExtraKeys,
} from '../../../packages/mw-core/src/identity/publicProjection';

describe('buildAthletePublicProjection', () => {
  it('emits only the closed key set', () => {
    const proj = buildAthletePublicProjection({
      callSign: 'Ada',
      callSignNumber: 7,
      kitId: 'field',
      table: { trainingStyle: 'strength', bio: 'secret' },
      badgeIds: ['first_blood'],
      rankTitle: 'Operator',
      level: 4,
    });
    assert.deepEqual(
      Object.keys(proj).sort(),
      [...ATHLETE_PUBLIC_PROJECTION_KEYS].sort()
    );
    assert.equal(publicProjectionExtraKeys(proj).length, 0);
    assert.equal(proj.callSignNumberLabel, '07');
    assert.equal(proj.table.trainingStyle, 'strength');
    assert.equal('bio' in proj.table, false);
  });

  it('clamps forged kit and out-of-range number', () => {
    const proj = buildAthletePublicProjection({
      callSign: 'Ada',
      callSignNumber: 100,
      kitId: 'not-real',
      level: 1,
    });
    assert.equal(proj.kitId, 'default');
    assert.equal(proj.callSignNumber, null);
    assert.equal(proj.callSignNumberLabel, null);
  });

  it('locks poster kit until tier 3', () => {
    const low = buildAthletePublicProjection({
      callSign: 'Ada',
      kitId: 'poster',
      level: 2,
    });
    assert.equal(low.kitId, 'default');
    const high = buildAthletePublicProjection({
      callSign: 'Ada',
      kitId: 'poster',
      level: 8,
    });
    assert.equal(high.kitId, 'poster');
  });

  it('detects a mutant free-text field on the projection object', () => {
    const forged = {
      ...buildAthletePublicProjection({ callSign: 'Ada' }),
      bio: 'hello strangers',
    };
    assert.ok(publicProjectionExtraKeys(forged).includes('bio'));
  });
});
