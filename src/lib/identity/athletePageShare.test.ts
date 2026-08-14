import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildAthletePublicProjection } from '../../../packages/mw-core/src/identity/publicProjection';
import {
  buildAthletePageShareData,
  humanizePickId,
  tablePicksLine,
} from './athletePageShare';

describe('buildAthletePageShareData', () => {
  it('titles from call sign + number and never invents a zero session row', () => {
    const proj = buildAthletePublicProjection({
      callSign: 'Ada',
      callSignNumber: 7,
      rankTitle: 'Operator',
      level: 4,
      table: { trainingStyle: 'strength', goToLift: 'deadlift' },
      badgeIds: ['first_blood'],
    });
    const card = buildAthletePageShareData(proj, { sessions: 0, daysTrained: 0 });
    assert.equal(card.title, '07  Ada');
    assert.equal(card.kicker, 'ATHLETE PAGE');
    assert.ok(!card.stats.some((s) => s.label === 'Sessions'));
    assert.ok(!card.stats.some((s) => s.label === 'Rank'));
    assert.ok(!card.stats.some((s) => s.label === 'Tier'));
    assert.match(card.prLine ?? '', /strength/);
    assert.match(card.prLine ?? '', /deadlift/);
  });

  it('includes derived sessions when positive', () => {
    const proj = buildAthletePublicProjection({ callSign: 'Sam', level: 1 });
    const card = buildAthletePageShareData(proj, { sessions: 12, daysTrained: 10 });
    assert.ok(card.stats.some((s) => s.label === 'Sessions' && s.value === '12'));
    assert.ok(card.stats.some((s) => s.label === 'Days' && s.value === '10'));
  });

  it('tablePicksLine ignores empty tables', () => {
    assert.equal(tablePicksLine({}), null);
    assert.equal(humanizePickId('full-gym'), 'full gym');
  });
});
