import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { rpeDefaultLabel, rpeLabelKey } from './rpeLabel.ts';

const root = join(import.meta.dirname, '..', '..', '..');

describe('rpeLabel', () => {
  it('maps storage ids to i18n keys and English floors', () => {
    assert.equal(rpeLabelKey('easy'), 'activeRpeEasy');
    assert.equal(rpeLabelKey('med'), 'activeRpeMed');
    assert.equal(rpeLabelKey('hard'), 'activeRpeHard');
    assert.equal(rpeDefaultLabel('easy'), 'Easy');
    assert.equal(rpeDefaultLabel('med'), 'Med');
    assert.equal(rpeDefaultLabel('hard'), 'Hard');
    // Unknown storage never paints the raw id as the chip
    assert.equal(rpeDefaultLabel('unknown'), 'Med');
    assert.notEqual(rpeDefaultLabel('med'), 'med');
  });

  it('SetLogRow and SetLogTable use floors, not defaultValue: r or raw set.rpe', () => {
    for (const rel of [
      'src/components/workout/SetLogRow.tsx',
      'src/components/workout/SetLogTable.tsx',
    ]) {
      const src = readFileSync(join(root, rel), 'utf8');
      const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      assert.match(code, /rpeLabelKey/);
      assert.match(code, /rpeDefaultLabel/);
      assert.doesNotMatch(code, /defaultValue:\s*r\s*\}/);
      // completed badge/span must not paint storage id alone
      assert.doesNotMatch(code, /\{set\.rpe\}/);
    }
  });
});
