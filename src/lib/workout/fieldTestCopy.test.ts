import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');

const DISCOVER = [
  'src/i18n/fieldTestLocales.ts',
  'docs/help/field-test.md',
  'src/components/workout/FieldTestReceiptStrip.tsx',
];

/** Whole-word marks. ACFT is not AFT. Cite key is the one allowed exception. */
const FORBIDDEN =
  /\b(Army|DoD|AFT|MEPS)\b|Army Combat Fitness Test/i;

function walkIfMissing(rel: string): string[] {
  const abs = path.join(root, rel);
  try {
    if (statSync(abs).isFile()) return [rel];
  } catch {
    return [];
  }
  return [];
}

function discover(): string[] {
  const found = DISCOVER.flatMap(walkIfMissing);
  const i18nDir = path.join(root, 'src/i18n');
  for (const f of readdirSync(i18nDir)) {
    if (f === 'fieldTestLocales.ts') {
      const rel = `src/i18n/${f}`;
      if (!found.includes(rel)) found.push(rel);
    }
  }
  assert.ok(
    found.includes('src/i18n/fieldTestLocales.ts'),
    'copy guard must see fieldTestLocales.ts'
  );
  return found;
}

describe('field test public copy', () => {
  it('has no Army marks except fieldTestScoreCite', () => {
    for (const rel of discover()) {
      const src = readFileSync(path.join(root, rel), 'utf8');
      const withoutCite = src
        .replace(/fieldTestScoreCite:\s*'[^']*'/g, 'fieldTestScoreCite: ""')
        .replace(/fieldTestScoreCite:\s*"[^"]*"/g, 'fieldTestScoreCite: ""');
      const hit = FORBIDDEN.exec(withoutCite);
      assert.equal(
        hit,
        null,
        `${rel} has forbidden public copy ${JSON.stringify(hit?.[0])}`
      );
    }
  });

  it('cite key names the published tables', () => {
    const src = readFileSync(path.join(root, 'src/i18n/fieldTestLocales.ts'), 'utf8');
    assert.match(src, /fieldTestScoreCite:\s*'Points from the published ACFT scoring tables/);
    assert.doesNotMatch(src, /Army Combat Fitness Test/);
  });
});
