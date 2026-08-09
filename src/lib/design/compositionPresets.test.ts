import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  COMPOSITION_PRESETS,
  compositionPresetById,
  defaultCompositionPreset,
} from './compositionPresets';

describe('compositionPresets', () => {
  it('keeps exactly one shipped default (Field manual)', () => {
    const defaults = COMPOSITION_PRESETS.filter((p) => p.shippedDefault);
    assert.equal(defaults.length, 1);
    assert.equal(defaults[0]!.id, 'field-manual');
    assert.equal(defaultCompositionPreset().letter, 'A');
  });

  it('preserves B and C for future personalization without shipping them', () => {
    assert.equal(compositionPresetById('strong-table')?.letter, 'B');
    assert.equal(compositionPresetById('quiet-linear')?.letter, 'C');
    assert.equal(compositionPresetById('strong-table')?.shippedDefault, false);
    assert.equal(compositionPresetById('quiet-linear')?.shippedDefault, false);
  });

  it('never invents alternate typefaces or palettes in the registry', () => {
    for (const p of COMPOSITION_PRESETS) {
      assert.ok(!/inter|helvetica|rounded|gradient|dark mode/i.test(p.promise + p.label));
    }
  });
});
