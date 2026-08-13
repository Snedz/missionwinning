import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePlatesPerSide,
  IMPERIAL_BAR_LBS,
  IMPERIAL_PLATES_LBS,
  isBarLoadedEquipment,
  METRIC_BAR_KG,
  METRIC_PLATES_KG,
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

describe('setRowPlateLine', () => {
  it('prints per-side plates for 100 kg on a 20 kg bar', () => {
    assert.equal(
      setRowPlateLine({ equipment: 'Barbell', weight: 100, units: 'metric' }),
      '25 + 15'
    );
  });

  it('prints per-side plates for 225 lb on a 45 lb bar', () => {
    assert.equal(
      setRowPlateLine({ equipment: 'Barbell', weight: 225, units: 'imperial' }),
      '45 + 45'
    );
  });

  it('is null when plates do not apply', () => {
    assert.equal(
      setRowPlateLine({ equipment: 'Dumbbells', weight: 100, units: 'metric' }),
      null
    );
    assert.equal(
      setRowPlateLine({ equipment: 'Barbell', weight: 20, units: 'metric' }),
      null
    );
    assert.equal(
      setRowPlateLine({ equipment: 'Barbell', weight: 0, units: 'metric' }),
      null
    );
    assert.equal(setRowPlateLine({ weight: 100, units: 'metric' }), null);
  });
});
