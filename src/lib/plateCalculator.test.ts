import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  calculatePlatesPerSide,
  defaultPlateInventory,
  formatBothSidesPlateCounts,
  IMPERIAL_BAR_LBS,
  IMPERIAL_PLATES_LBS,
  isBarLoadedEquipment,
  METRIC_BAR_KG,
  METRIC_PLATES_KG,
  nearestBarLoad,
  parsePlateInventory,
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

describe('nearestBarLoad', () => {
  it('loads 100 kg as 25 + 15 on each side of a 20 kg bar', () => {
    const r = nearestBarLoad(100, METRIC_BAR_KG, defaultPlateInventory('metric'));
    assert.equal(r.exact, true);
    assert.equal(r.achievedWeight, 100);
    assert.equal(r.delta, 0);
    assert.deepEqual(r.perSide, [25, 15]);
  });

  it('loads 225 lb as two 45s on each side of a 45 lb bar', () => {
    const r = nearestBarLoad(225, IMPERIAL_BAR_LBS, defaultPlateInventory('imperial'));
    assert.equal(r.exact, true);
    assert.equal(r.achievedWeight, 225);
    assert.deepEqual(r.perSide, [45, 45]);
  });

  it('loads 135 lb as one 45 on each side', () => {
    const r = nearestBarLoad(135, IMPERIAL_BAR_LBS, defaultPlateInventory('imperial'));
    assert.equal(r.exact, true);
    assert.deepEqual(r.perSide, [45]);
  });

  it('picks 100 kg when 101 kg cannot be made', () => {
    const r = nearestBarLoad(101, METRIC_BAR_KG, defaultPlateInventory('metric'));
    assert.equal(r.exact, false);
    assert.equal(r.achievedWeight, 100);
    assert.equal(r.delta, -1);
    assert.deepEqual(r.perSide, [25, 15]);
  });

  it('loads one 25 per side when that is closer than the empty bar', () => {
    const r = nearestBarLoad(60, METRIC_BAR_KG, [{ weight: 25, pairs: 2 }]);
    assert.equal(r.exact, false);
    assert.equal(r.achievedWeight, 70);
    assert.equal(r.delta, 10);
    assert.deepEqual(r.perSide, [25]);
  });

  it('treats a target under the bar as unreachable and keeps the empty bar', () => {
    const r = nearestBarLoad(10, METRIC_BAR_KG, defaultPlateInventory('metric'));
    assert.equal(r.exact, false);
    assert.equal(r.achievedWeight, METRIC_BAR_KG);
    assert.equal(r.delta, 10);
    assert.deepEqual(r.perSide, []);
  });

  it('treats a target past an empty rack as unreachable and keeps the empty bar', () => {
    const r = nearestBarLoad(200, METRIC_BAR_KG, [{ weight: 25, pairs: 0 }]);
    assert.equal(r.exact, false);
    assert.equal(r.achievedWeight, METRIC_BAR_KG);
    assert.deepEqual(r.perSide, []);
    assert.equal(r.delta, -180);
  });

  it('uses a 35 lb bar so 135 is 45 + 5 per side', () => {
    const r = nearestBarLoad(135, 35, defaultPlateInventory('imperial'));
    assert.equal(r.exact, true);
    assert.equal(r.achievedWeight, 135);
    assert.deepEqual(r.perSide, [45, 5]);
  });

  it('refuses a second 45 per side when the rack has one pair', () => {
    const r = nearestBarLoad(225, IMPERIAL_BAR_LBS, [{ weight: 45, pairs: 1 }]);
    assert.equal(r.exact, false);
    assert.equal(r.achievedWeight, 135);
    assert.deepEqual(r.perSide, [45]);
  });

  it('prefers the lighter total when two loads are equally far', () => {
    const r = nearestBarLoad(25, METRIC_BAR_KG, [{ weight: 5, pairs: 2 }]);
    assert.equal(r.exact, false);
    assert.equal(r.achievedWeight, 20);
    assert.equal(r.delta, -5);
    assert.deepEqual(r.perSide, []);
  });
});

describe('parsePlateInventory', () => {
  it('fills a missing rack from the defaults and clamps a huge pair count', () => {
    const missing = parsePlateInventory(null);
    assert.equal(missing.metric.find((row) => row.weight === 25)?.pairs, 4);
    assert.equal(missing.imperial.find((row) => row.weight === 45)?.pairs, 6);
    const clamped = parsePlateInventory({
      metric: [{ weight: 25, pairs: 99 }],
      imperial: 'nope',
    });
    assert.equal(clamped.metric.find((row) => row.weight === 25)?.pairs, 12);
    assert.equal(clamped.imperial.find((row) => row.weight === 45)?.pairs, 6);
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

  // New tests for the owned plates feature
  it('shows nearest label when weight cannot be built from owned plates', () => {
    // User only has 45s, cannot build 135 exactly with a 35lb bar
    const offer = setRowPlateBreakdown({
      equipment: 'Barbell',
      weight: 135,
      units: 'imperial',
      barWeight: 35,
      inventory: [{ weight: 45, pairs: 1 }],
    });
    assert.equal(offer.show, true);
    assert.equal(offer.platesLine, '2×45');
    assert.equal(offer.exact, false);
    assert.match(offer.nearestLabel ?? '', /Nearest:.*lb/);
  });

  it('shows exact without nearest label when weight is achievable', () => {
    const offer = setRowPlateBreakdown({
      equipment: 'Barbell',
      weight: 135,
      units: 'imperial',
      inventory: defaultPlateInventory('imperial'),
    });
    assert.equal(offer.show, true);
    assert.equal(offer.platesLine, '2×45');
    assert.equal(offer.exact, true);
    assert.equal(offer.nearestLabel, null);
  });

  it('shows add plates prompt when inventory is empty', () => {
    const offer = setRowPlateBreakdown({
      equipment: 'Barbell',
      weight: 135,
      units: 'imperial',
      inventory: [],
    });
    assert.equal(offer.show, true);
    assert.equal(offer.platesLine, null);
    assert.equal(offer.exact, false);
    assert.equal(offer.nearestLabel, 'Add plates to calculate');
  });

  it('shows add plates prompt when inventory has zero pairs', () => {
    const offer = setRowPlateBreakdown({
      equipment: 'Barbell',
      weight: 135,
      units: 'imperial',
      inventory: [{ weight: 45, pairs: 0 }],
    });
    assert.equal(offer.show, true);
    assert.equal(offer.platesLine, null);
    assert.equal(offer.nearestLabel, 'Add plates to calculate');
  });

  it('respects kg/lb units in nearest label', () => {
    const offer = setRowPlateBreakdown({
      equipment: 'Barbell',
      weight: 100,
      units: 'metric',
      inventory: [{ weight: 25, pairs: 1 }], // Only 25s, can't make 100 exactly
    });
    assert.equal(offer.show, true);
    assert.equal(offer.exact, false);
    assert.match(offer.nearestLabel ?? '', /Nearest:.*kg/);
  });

  it('uses default inventory when none provided', () => {
    // Default inventory can make 135 exactly
    const offer = setRowPlateBreakdown({
      equipment: 'Barbell',
      weight: 135,
      units: 'imperial',
    });
    assert.equal(offer.exact, true);
    assert.equal(offer.nearestLabel, null);
  });

  it('handles target beyond what inventory can build', () => {
    const offer = setRowPlateBreakdown({
      equipment: 'Barbell',
      weight: 500,
      units: 'imperial',
      inventory: [{ weight: 45, pairs: 2 }],
    });
    assert.equal(offer.show, true);
    assert.equal(offer.exact, false);
    assert.ok(offer.nearestLabel?.includes('Nearest:'));
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
