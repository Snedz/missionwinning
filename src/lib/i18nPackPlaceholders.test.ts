/**
 * Locale packs must use the same `{{var}}` names as English (and as call sites).
 *
 * Machine-translated packs often "translate" interpolation keys (`{{peso}}` for
 * weight). Runtime then leaves `{{peso}}` literal while `weight` is ignored —
 * same defect class as LogConsole `n` vs `current` (`.483`), at pack scale.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const packsDir = path.join(root, 'src/i18n/packs');
const localesDir = path.join(root, 'src/i18n');

function placeholders(s: string): Set<string> {
  return new Set([...s.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]));
}

/** English templates from `*Locales.ts` string literals. */
function englishPlaceholders(): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const file of readdirSync(localesDir)) {
    if (!file.endsWith('Locales.ts')) continue;
    const text = readFileSync(path.join(localesDir, file), 'utf8');
    for (const m of text.matchAll(/(\w+):\s*'([^']*)'/g)) {
      const key = m[1];
      const vars = placeholders(m[2]);
      if (vars.size === 0) continue;
      map.set(key, vars);
    }
  }
  return map;
}

test('locale packs keep English interpolation key names', () => {
  const en = englishPlaceholders();
  assert.ok(en.size > 50, 'expected English locale templates with placeholders');

  const drifts: string[] = [];
  for (const file of readdirSync(packsDir).filter((f) => f.endsWith('.json'))) {
    if (file === 'en.json') continue;
    const data = JSON.parse(readFileSync(path.join(packsDir, file), 'utf8')) as Record<
      string,
      unknown
    >;
    for (const [key, expected] of en) {
      const val = data[key];
      if (typeof val !== 'string' || !val.includes('{{')) continue;
      const got = placeholders(val);
      if (got.size === 0) continue;
      if ([...expected].every((v) => got.has(v)) && [...got].every((v) => expected.has(v))) {
        continue;
      }
      drifts.push(
        `${file} ${key}: pack has {${[...got].sort().join(',')}} en wants {${[...expected].sort().join(',')}}`
      );
    }
  }

  assert.deepEqual(
    drifts,
    [],
    `locale packs translated interpolation keys — runtime shows {{peso}} instead of the value:\n  ${drifts.join('\n  ')}`
  );
});
