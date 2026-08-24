import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

/**
 * History CSV in/out is free forever. This path must never grow a premium
 * check. Discover the transfer files rather than list them — a stale
 * allowlist is how a paywall lands next to the importer and this guard stays
 * green.
 */

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

const TRANSFER_NAME =
  /^(importCsv|exportCsv|csvTransfer|importHevyMeasurements)/;

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

  it('the parser still names set-table, program-log, and MW dialects; 0.1 export includes MW', () => {
    const src = read('src/lib/workout/importCsv.ts');
    assert.match(src, /CsvFormat = 'set-table-a' \| 'set-table-b' \| 'program-log' \| 'mw'/);
    assert.match(src, /WorkoutCsvDialect = 'set-table-b' \| 'set-table-a' \| 'mw'/);
    assert.match(src, /export function workoutsToMwCsv/);
    assert.match(src, /export function workoutsToSetTableBCsv/);
    assert.match(src, /export function workoutsToSetTableACsv/);
    assert.match(src, /export function parseWorkoutCsv/);
    assert.doesNotMatch(src, /workoutsToBoostcampCsv/);
  });

  it('the Profile card wires workout-CSV import and export with no disabled gate', () => {
    const src = stripComments(read('src/components/profile/ProfileImportCard.tsx'));
    assert.match(src, /previewDiaryImport/);
    assert.match(src, /importDiaryText/);
    assert.match(src, /downloadWorkoutCsv\(/);
    assert.match(src, /handleExport\('set-table-b'\)/);
    assert.match(src, /handleExport\('set-table-a'\)/);
    assert.match(src, /handleExport\('mw'\)/);
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

  it('empty history is a header-only download, not a refuse', () => {
    const src = read('src/lib/workout/importCsvRestore.ts');
    assert.match(src, /count: existing.length/);
    assert.doesNotMatch(
      src,
      /error:\s*'empty'/,
      'empty persist must download the Strong header, not fail'
    );
    const card = stripComments(read('src/components/profile/ProfileImportCard.tsx'));
    assert.match(card, /downloadWorkoutCsv\(dialect\)/);
    assert.doesNotMatch(card, /previewWorkoutCsvText\(dialect\)/);
    assert.doesNotMatch(
      card,
      /oneExport|exportCap|exportLimit|exportedOnce/,
      'a second export must still be allowed'
    );
  });

  it('sample fixtures used by the parser tests still exist', () => {
    const dir = path.join(root, 'src/lib/workout/fixtures');
    const names = readdirSync(dir).filter((f) => f.endsWith('.csv')).sort();
    assert.deepEqual(names, [
      'hevy-empty.csv',
      'hevy-malformed-row.csv',
      'hevy-measurements-empty.csv',
      'hevy-measurements-malformed.csv',
      'hevy-measurements-one.csv',
      'hevy-one-workout.csv',
      'mw-native-sample.csv',
      'program-log-flatten-sample.csv',
      'program-log-sample.csv',
      'set-table-a-sample.csv',
      'set-table-b-sample.csv',
      'strong-empty.csv',
      'strong-malformed-row.csv',
      'strong-one-workout.csv',
    ]);
    const tests = read('src/lib/workout/importCsv.test.ts');
    for (const name of names) {
      assert.match(tests, new RegExp(name.replace('.', '\\.')), `tests must read ${name}`);
    }
  });
});
