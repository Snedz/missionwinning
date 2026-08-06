import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

test('rest skip has outdoor-friendly aria and width', () => {
  const src = readFileSync(join(root, 'src/components/workout/RestTimerBar.tsx'), 'utf8');
  assert.match(src, /activeRestSkipAria|Skip rest/);
  assert.match(src, /min-w-\[5\.5rem\]/);
  assert.match(src, /data-testid="rest-skip"/);
});

test('victory feel + streak EN defaults stay plain', () => {
  const feel = readFileSync(join(root, 'src/components/workout/VictoryFeelStrip.tsx'), 'utf8');
  assert.match(feel, /Saved for readiness/);
  assert.doesNotMatch(feel, /feeds readiness on Today/);

  const locales = readFileSync(join(root, 'src/i18n/activeWorkoutLocales.ts'), 'utf8');
  assert.match(locales, /Saved for readiness/);
  assert.doesNotMatch(locales, /nice consistency/);
  assert.match(locales, /activeSetLogged: 'Set logged'/);
  assert.doesNotMatch(locales, /Set logged!/);
});
