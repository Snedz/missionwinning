import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  calculatePlatesPerSide,
  formatBothSidesPlateCounts,
  IMPERIAL_BAR_LBS,
  IMPERIAL_PLATES_LBS,
  isBarLoadedEquipment,
  METRIC_BAR_KG,
  METRIC_PLATES_KG,
  parseBarWeightPref,
  resolveBarWeight,
  setRowPlateBreakdown,
  setRowPlateLine,
} from '@/lib/plateCalculator';

describe('plateCalculator', () => {
  it('loads metric plates for 100kg barbell', () => {
    const r = calculatePlatesPerSide(100, METRIC_BAR_KG, METRIC_PLATES_KG);
    assert.equal(r.achievedWeight, 100);
    assert.equal(r.remainder, 0);
    assert.ok(r.perSide.length >= 2);
  });

  it('loads imperial plates for 225lb barbell', () => {
    const r = calculatePlatesPerSide(225, IMPERIAL_BAR_LBS, IMPERIAL_PLATES_LBS);
    assert.equal(r.achievedWeight, 225);
    assert.equal(r.remainder, 0);
  });

  it('reports remainder when exact load impossible', () => {
    const r = calculatePlatesPerSide(102.5, METRIC_BAR_KG, METRIC_PLATES_KG);
    assert.ok(r.remainder >= 0);
    assert.ok(r.achievedWeight <= 102.5);
  });
});

describe('isBarLoadedEquipment', () => {
  it('is a closed list of catalog equipment, not a name guess', () => {
    assert.equal(isBarLoadedEquipment('Barbell'), true);
    assert.equal(isBarLoadedEquipment('trap bar'), true);
    assert.equal(isBarLoadedEquipment('Trap Bar'), true);
    assert.equal(isBarLoadedEquipment('Dumbbells'), false);
    assert.equal(isBarLoadedEquipment('Cable'), false);
    assert.equal(isBarLoadedEquipment('Machine'), false);
    assert.equal(isBarLoadedEquipment('Bodyweight'), false);
    assert.equal(isBarLoadedEquipment(undefined), false);
    assert.equal(isBarLoadedEquipment(''), false);
  });
});

describe('formatBothSidesPlateCounts', () => {
  it('counts both sides from a per-side stack', () => {
    assert.equal(formatBothSidesPlateCounts([45]), '2×45');
    assert.equal(formatBothSidesPlateCounts([45, 10]), '2×45 + 2×10');
    assert.equal(formatBothSidesPlateCounts([45, 45]), '4×45');
    assert.equal(formatBothSidesPlateCounts([]), '');
  });
});

describe('parseBarWeightPref / resolveBarWeight', () => {
  it('falls back to 20 / 45 on missing or invalid values', () => {
    assert.deepEqual(parseBarWeightPref(null), { metric: 20, imperial: 45 });
    assert.deepEqual(parseBarWeightPref({ metric: 0, imperial: -1 }), {
      metric: 20,
      imperial: 45,
    });
    assert.deepEqual(parseBarWeightPref({ metric: 15, imperial: 35 }), {
      metric: 15,
      imperial: 35,
    });
    assert.equal(resolveBarWeight('imperial'), 45);
    assert.equal(resolveBarWeight('metric'), 20);
    assert.equal(resolveBarWeight('imperial', 35), 35);
    assert.equal(resolveBarWeight('imperial', 0), 45);
  });
});

describe('setRowPlateBreakdown', () => {
  it('empty / 0 / missing equipment / dumbbells invent no plates', () => {
    assert.equal(
      setRowPlateBreakdown({ equipment: 'Barbell', weight: 0, units: 'imperial' }).show,
      false
    );
    assert.equal(
      setRowPlateBreakdown({ equipment: 'Barbell', weight: 0, units: 'metric' }).platesLine,
      null
    );
    assert.equal(
      setRowPlateBreakdown({ weight: 135, units: 'imperial' }).show,
      false
    );
    assert.equal(
      setRowPlateBreakdown({
        equipment: 'Dumbbells',
        weight: 135,
        units: 'imperial',
      }).show,
      false
    );
    assert.equal(
      setRowPlateBreakdown({
        equipment: 'Barbell',
        weight: Number.NaN,
        units: 'imperial',
      }).show,
      false
    );
    // Typing 135 hits 1 then 13 first — never invent plates under the bar.
    assert.equal(
      setRowPlateBreakdown({ equipment: 'Barbell', weight: 1, units: 'imperial' }).show,
      false
    );
    assert.equal(
      setRowPlateBreakdown({ equipment: 'Barbell', weight: 13, units: 'imperial' })
        .platesLine,
      null
    );
  });

  it('135 lb = 45 bar + 2×45', () => {
    const offer = setRowPlateBreakdown({
      equipment: 'Barbell',
      weight: 135,
      units: 'imperial',
    });
    assert.equal(offer.show, true);
    assert.equal(offer.barWeight, 45);
    assert.equal(offer.platesLine, '2×45');
    assert.equal(
      setRowPlateLine({ equipment: 'Barbell', weight: 135, units: 'imperial' }),
      '2×45'
    );
  });

  it('100 kg = 20 bar + 2×25 + 2×15', () => {
    const offer = setRowPlateBreakdown({
      equipment: 'Barbell',
      weight: 100,
      units: 'metric',
    });
    assert.equal(offer.show, true);
    assert.equal(offer.barWeight, 20);
    assert.equal(offer.platesLine, '2×25 + 2×15');
  });

  it('skipped hides plates even at 135', () => {
    const offer = setRowPlateBreakdown({
      equipment: 'Barbell',
      weight: 135,
      units: 'imperial',
      skipped: true,
    });
    assert.equal(offer.show, false);
    assert.equal(offer.platesLine, null);
    assert.equal(offer.barWeight, 45);
  });

  it('custom bar is an argument — 35 lb bar on 135 is not 2×45', () => {
    const offer = setRowPlateBreakdown({
      equipment: 'Barbell',
      weight: 135,
      units: 'imperial',
      barWeight: 35,
    });
    assert.equal(offer.show, true);
    assert.equal(offer.barWeight, 35);
    assert.equal(offer.platesLine, '2×45 + 2×5');
  });

  it('weight at or under the bar invents no plates', () => {
    assert.equal(
      setRowPlateBreakdown({
        equipment: 'Barbell',
        weight: 45,
        units: 'imperial',
      }).show,
      false
    );
    assert.equal(
      setRowPlateBreakdown({
        equipment: 'Barbell',
        weight: 20,
        units: 'metric',
      }).show,
      false
    );
  });
});

describe('set-row plate chrome', () => {
  const table = readFileSync(
    path.join(import.meta.dirname, '..', 'components', 'workout', 'SetLogTable.tsx'),
    'utf8'
  );
  const line = readFileSync(
    path.join(import.meta.dirname, '..', 'components', 'workout', 'SetLogPlateLine.tsx'),
    'utf8'
  );

  it('Skip is present and Log set is not gated on plates', () => {
    assert.match(line, /set-table-plates-skip/);
    assert.match(table, /SetLogPlateLine/);
    assert.match(table, /set-table-log-set/);
    assert.doesNotMatch(table, /disabled=\{[^}]*plate/);
    assert.doesNotMatch(line, /disabled/);
    const logBtn = /data-testid="set-table-log-set"[\s\S]*?<\/button>/.exec(table)?.[0] ?? '';
    assert.ok(logBtn.length > 0, 'Log set button missing');
    assert.doesNotMatch(logBtn, /disabled|plateSkipped|plateOffer\.show/);
  });
});
