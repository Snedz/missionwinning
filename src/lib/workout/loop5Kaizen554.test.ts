import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

test('LogConsole kind chips and BW control are tap targets', () => {
  const src = readFileSync(join(root, 'src/components/workout/LogConsole.tsx'), 'utf8');
  assert.match(src, /log-console-set-kinds/);
  assert.match(src, /tap-target/);
  assert.match(src, /aria-label=\{t\(setKindLabelKey/);
  // kind strip + expand + BW share tap-target language
  const taps = (src.match(/tap-target/g) || []).length;
  assert.ok(taps >= 3, `expected multiple tap-targets, got ${taps}`);
});

test('set-logged locale strings drop cheerleading bangs', () => {
  const locales = readFileSync(join(root, 'src/i18n/activeWorkoutLocales.ts'), 'utf8');
  assert.match(locales, /activeSetLogged: 'Set logged'/);
  assert.doesNotMatch(locales, /Serie registrada!/);
  assert.doesNotMatch(locales, /enregistrée !/);
  assert.doesNotMatch(locales, /gespeichert!/);
});
