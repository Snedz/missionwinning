/**
 * Calculators macro foot free-beta mute — always-on tool foot pitched
 * “Premium programs” while free beta unlocks depth.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('MacroCalculator free-beta uses open-beta macro foot', () => {
  const src = readFileSync(
    join(root, 'src/components/calculators/MacroCalculator.tsx'),
    'utf8'
  );
  assert.match(src, /calcMacroFootOpenBeta/);
  assert.match(src, /isFreeBeta/);
});

test('calculatorsLocales EN open-beta macro foot omits Premium pay pitch', () => {
  const src = readFileSync(join(root, 'src/i18n/calculatorsLocales.ts'), 'utf8');
  assert.match(src, /calcMacroFootOpenBeta:/);
  const m = src.match(/calcMacroFootOpenBeta:\s*(?:\n\s*)?'((?:\\'|[^'])*)'/m);
  assert.ok(m, 'missing EN calcMacroFootOpenBeta');
  assert.doesNotMatch(m[1]!, /Super Bundle/i);
  assert.doesNotMatch(m[1]!, /\b[Pp]remium\b/);
});
