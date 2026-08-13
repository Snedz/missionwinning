import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { __resetForTests } from '@/lib/storage/safeStorage';
import {
  extractFieldTestEvents,
  FIELD_TEST_GARAGE_ID,
  FIELD_TEST_OFFICIAL_IDS,
  FIELD_TEST_WORKOUT_NAME,
} from '@/lib/workout/fieldTest';
import {
  fieldTestBand,
  fieldTestTotal500,
  lookupFieldTestPoints,
  mdlPounds,
  parseFieldTestScaleKey,
  readFieldTestScaleKey,
  scoreFieldTestEvents,
  writeFieldTestScaleKey,
} from '@/lib/workout/fieldTestScore';

const KEY = { ageBand: '17-21' as const, column: 'm' as const };

function officialFourPlus(
  sdc: { id: string; reps: number; note?: string }
) {
  return [
    { exerciseId: FIELD_TEST_OFFICIAL_IDS.mdl, sets: [{ reps: 3, weight: 140 }] },
    { exerciseId: FIELD_TEST_OFFICIAL_IDS.hrp, sets: [{ reps: 10, weight: 0 }] },
    { exerciseId: sdc.id, sets: [{ reps: sdc.reps, weight: 0 }], note: sdc.note },
    { exerciseId: FIELD_TEST_OFFICIAL_IDS.plk, sets: [{ reps: 90, weight: 0 }] },
    { exerciseId: FIELD_TEST_OFFICIAL_IDS.run, sets: [{ reps: 1320, weight: 0 }] },
  ];
}

describe('lookupFieldTestPoints', () => {
  it('matches cited 17–21 M rows with no interpolation', () => {
    assert.equal(lookupFieldTestPoints('mdl', 340, KEY), 100);
    assert.equal(lookupFieldTestPoints('mdl', 140, KEY), 60);
    assert.equal(lookupFieldTestPoints('mdl', 130, KEY), 50);
    assert.equal(lookupFieldTestPoints('mdl', 70, KEY), 0);
    assert.equal(lookupFieldTestPoints('mdl', 335, KEY), 99);
    assert.equal(lookupFieldTestPoints('hrp', 57, KEY), 100);
    assert.equal(lookupFieldTestPoints('hrp', 10, KEY), 60);
    assert.equal(lookupFieldTestPoints('sdc', 89, KEY), 100);
    assert.equal(lookupFieldTestPoints('sdc', 148, KEY), 60);
    assert.equal(lookupFieldTestPoints('plk', 220, KEY), 100);
    assert.equal(lookupFieldTestPoints('plk', 90, KEY), 60);
    assert.equal(lookupFieldTestPoints('run', 802, KEY), 100);
    assert.equal(lookupFieldTestPoints('run', 1320, KEY), 60);
  });

  it('converts metric 154.2 kg ≈ 340 lb → 100', () => {
    assert.equal(mdlPounds(154.2, 'metric'), 340);
    assert.equal(lookupFieldTestPoints('mdl', mdlPounds(154.2, 'metric'), KEY), 100);
  });
});

describe('bands + 0–500 gate', () => {
  it('maps published rows to MW labels', () => {
    assert.equal(fieldTestBand(100, 'official'), 'maximum');
    assert.equal(fieldTestBand(90, 'official'), 'maximum');
    assert.equal(fieldTestBand(89, 'official'), 'strong');
    assert.equal(fieldTestBand(70, 'official'), 'strong');
    assert.equal(fieldTestBand(69, 'official'), 'minimum');
    assert.equal(fieldTestBand(60, 'official'), 'minimum');
    assert.equal(fieldTestBand(59, 'official'), 'below');
    assert.equal(fieldTestBand(0, 'official'), 'below');
    assert.equal(fieldTestBand(100, 'garage'), 'unscored');
    assert.equal(fieldTestBand(undefined, 'official'), 'unscored');
  });

  it('garage SDC drops the 0–500 total even when the other four score', () => {
    const raw = extractFieldTestEvents(
      officialFourPlus({ id: FIELD_TEST_GARAGE_ID, reps: 120 }),
      { namedFieldTest: true }
    );
    const scored = scoreFieldTestEvents(raw, KEY, 'imperial');
    assert.equal(scored.find((e) => e.slot === 'sdc')?.status, 'garage');
    assert.equal(scored.find((e) => e.slot === 'sdc')?.points, undefined);
    assert.equal(scored.filter((e) => e.points != null).length, 4);
    assert.equal(fieldTestTotal500(scored), undefined);
  });

  it('no scale key → raw only, no points, no total', () => {
    const raw = extractFieldTestEvents(
      officialFourPlus({ id: FIELD_TEST_OFFICIAL_IDS.sdc, reps: 148 }),
      { namedFieldTest: true }
    );
    const scored = scoreFieldTestEvents(raw, null, 'imperial');
    assert.ok(scored.every((e) => e.points == null));
    assert.ok(scored.every((e) => e.band === 'unscored'));
    assert.equal(fieldTestTotal500(scored), undefined);
    assert.equal(scored.find((e) => e.slot === 'mdl')?.raw, 140);
  });

  it('five official scores sum to 0–500', () => {
    const raw = extractFieldTestEvents(
      officialFourPlus({ id: FIELD_TEST_OFFICIAL_IDS.sdc, reps: 148 }),
      { namedFieldTest: true }
    );
    const scored = scoreFieldTestEvents(raw, KEY, 'imperial');
    assert.equal(fieldTestTotal500(scored), 300);
  });
});

describe('scale key storage', () => {
  beforeEach(() => {
    __resetForTests();
  });

  it('rejects junk and persists a published column', () => {
    assert.equal(parseFieldTestScaleKey({ ageBand: '12', column: 'm' }), null);
    assert.equal(parseFieldTestScaleKey({ ageBand: '17-21', column: 'x' }), null);
    assert.equal(readFieldTestScaleKey(), null);
    assert.equal(writeFieldTestScaleKey(KEY), true);
    assert.deepEqual(readFieldTestScaleKey(), KEY);
    writeFieldTestScaleKey(null);
    assert.equal(readFieldTestScaleKey(), null);
  });
});

describe('name constant', () => {
  it('stays Five-event field test', () => {
    assert.equal(FIELD_TEST_WORKOUT_NAME, 'Five-event field test');
  });
});
