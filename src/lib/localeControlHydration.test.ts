/**
 * W1 — landing footer country line must not first-paint a geo guess.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const src = readFileSync(
  path.join(import.meta.dirname, '..', '..', 'src/components/i18n/LocaleCountryControl.tsx'),
  'utf8',
);

test('LocaleCountryControl does not detect country on first paint', () => {
  assert.doesNotMatch(
    src,
    /useState\(\(\) => saved/,
    'saved pref in useState initializer hydrates differently than SSR',
  );
  assert.doesNotMatch(
    src,
    /useState\([^)]*detectCountryHint/,
    'detectCountryHint in useState initializer is timezone-dependent',
  );
  assert.match(src, /detectCountryHint/);
  assert.match(src, /setReady\(true\)/);
});
