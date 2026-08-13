import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

/**
 * History CSV in/out is free forever. Strong paywalls export; Hevy caps graphs;
 * this path must never grow a premium check. Discover the transfer files rather
 * than list them — a stale allowlist is how a paywall lands next to the importer
 * and this guard stays green.
 */

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

const TRANSFER_NAME =
  /^(importCsv|exportCsv|csvTransfer)/;

function walkTs(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name === 'node_modules' || name.name === 'fixtures') continue;
      walkTs(full, out);
      continue;
    }
    if (/\.(ts|tsx)$/.test(name.name) && !name.name.includes('.test.')) {
      out.push(full);
    }
  }
  return out;
}

function csvTransferFiles(): string[] {
  const workout = path.join(root, 'src/lib/workout');
  const hits = walkTs(workout)
    .filter((f) => TRANSFER_NAME.test(path.basename(f)))
    .map((f) => path.relative(root, f));
  const card = 'src/components/profile/ProfileImportCard.tsx';
  hits.push(card);
  return hits.sort();
}

const PAYWALL =
  /\b(isPremium|requirePremium|isDemoPremium|isFreeBetaPremiumUnlocked|premiumRequired|paywall)\b/;

describe('csvHistoryFree', () => {
  it('discovers the CSV transfer surface (not an empty list)', () => {
    const files = csvTransferFiles();
    assert.ok(files.some((f) => f.endsWith('importCsv.ts')));
    assert.ok(files.some((f) => f.endsWith('importCsvRestore.ts')));
    assert.ok(files.some((f) => f.endsWith('ProfileImportCard.tsx')));
  });

  it('import/export never consult premium', () => {
    for (const rel of csvTransferFiles()) {
      const src = stripComments(read(rel));
      assert.doesNotMatch(
        src,
        PAYWALL,
        `${rel} reached a premium check — CSV history is free forever`
      );
    }
  });

  it('the parser still names Strong, Hevy, Boostcamp, and MW; 0.1 export is Strong/Hevy', () => {
    const src = read('src/lib/workout/importCsv.ts');
    assert.match(src, /CsvFormat = 'hevy' \| 'strong' \| 'boostcamp' \| 'mw'/);
    assert.match(src, /export function workoutsToMwCsv/);
    assert.match(src, /export function workoutsToStrongCsv/);
    assert.match(src, /export function workoutsToHevyCsv/);
    assert.match(src, /export function parseWorkoutCsv/);
    assert.doesNotMatch(src, /workoutsToBoostcampCsv/);
  });

  it('the Profile card wires Strong/Hevy import and export with no disabled gate', () => {
    const src = stripComments(read('src/components/profile/ProfileImportCard.tsx'));
    assert.match(src, /importWorkoutCsvText/);
    assert.match(src, /downloadWorkoutCsv\(/);
    assert.match(src, /handleExport\('strong'\)/);
    assert.match(src, /handleExport\('hevy'\)/);
    assert.doesNotMatch(src, /downloadWorkoutCsv\(\)/);
    assert.doesNotMatch(
      src,
      /disabled=\{[^}]*premium/i,
      'export/import must not disable on premium'
    );
  });

  it('CSV download filenames use localDateKey, never toISOString', () => {
    const src = read('src/lib/workout/importCsvRestore.ts');
    assert.match(src, /localDateKey\(\)/);
    assert.doesNotMatch(src, /toISOString/);
  });

  it('sample fixtures used by the parser tests still exist', () => {
    const dir = path.join(root, 'src/lib/workout/fixtures');
    const names = readdirSync(dir).filter((f) => f.endsWith('.csv')).sort();
    assert.deepEqual(names, [
      'boostcamp-flatten-sample.csv',
      'boostcamp-sample.csv',
      'hevy-sample.csv',
      'mw-native-sample.csv',
      'strong-sample.csv',
    ]);
    const tests = read('src/lib/workout/importCsv.test.ts');
    for (const name of names) {
      assert.match(tests, new RegExp(name.replace('.', '\\.')), `tests must read ${name}`);
    }
  });
});
