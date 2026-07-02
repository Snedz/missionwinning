import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { filterWorkoutsForEquipment, getTodaysWorkout } from './todaysWorkout';

describe('todaysWorkout equipment filter', () => {
  it('bodyweight users only get bodyweight-tier workouts', () => {
    const pool = filterWorkoutsForEquipment('bodyweight');
    assert.ok(pool.length >= 2);
    assert.ok(pool.every((w) => w.equipmentTier === 'bodyweight'));
  });

  it('full gym sees entire rotation', () => {
    const pool = filterWorkoutsForEquipment('full-gym');
    assert.ok(pool.some((w) => w.equipmentTier === 'full-gym'));
  });

  it('low impact filters to mobility and bodyweight', () => {
    const pool = filterWorkoutsForEquipment('full-gym', true);
    assert.ok(pool.every((w) => w.tag === 'Mobility' || w.equipmentTier === 'bodyweight'));
  });

  it('getTodaysWorkout respects equipment', () => {
    const bw = getTodaysWorkout(new Date('2026-06-29'), { equipment: 'bodyweight' });
    assert.equal(bw.equipmentTier, 'bodyweight');
  });
});
