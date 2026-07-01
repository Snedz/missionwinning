import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatStoredGoal,
  goalPresetValue,
  parseGoalPresetId,
  GOAL_PRESET_DEFAULTS,
} from '@/lib/journeyGoals';

const t = (key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? key;

describe('journeyGoals', () => {
  it('parses goal: preset keys', () => {
    assert.equal(parseGoalPresetId('goal:strength'), 'strength');
    assert.equal(parseGoalPresetId('goal:fat_loss'), 'fat_loss');
    assert.equal(parseGoalPresetId('custom text'), null);
  });

  it('maps legacy English strings to presets', () => {
    assert.equal(parseGoalPresetId('Build strength and stay healthy'), 'strength');
  });

  it('formatStoredGoal translates presets', () => {
    assert.equal(
      formatStoredGoal(goalPresetValue('endurance'), t),
      GOAL_PRESET_DEFAULTS.endurance
    );
    assert.equal(formatStoredGoal('My custom goal', t), 'My custom goal');
  });

  it('includes national fitness goal presets', () => {
    assert.equal(parseGoalPresetId('goal:pft'), 'pft');
    assert.equal(parseGoalPresetId('goal:kids'), 'kids');
    assert.equal(
      formatStoredGoal(goalPresetValue('america_health'), t),
      GOAL_PRESET_DEFAULTS.america_health
    );
  });
});
