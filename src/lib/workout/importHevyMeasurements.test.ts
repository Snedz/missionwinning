import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  HEVY_MEASUREMENTS_CSV_HEADER,
  hevyMeasurementDateKey,
  isHevyMeasurementsCsv,
  mergeBodyMetrics,
  parseHevyMeasurementsCsv,
} from '@/lib/workout/importHevyMeasurements';
import { detectCsvFormat } from '@/lib/workout/importCsv';

const fixture = (name: string) =>
  readFileSync(path.join(import.meta.dirname, 'fixtures', name), 'utf8');

const EMPTY = fixture('hevy-measurements-empty.csv');
const ONE = fixture('hevy-measurements-one.csv');
const MALFORMED = fixture('hevy-measurements-malformed.csv');
const HEVY_WORKOUT = fixture('hevy-one-workout.csv');

describe('importHevyMeasurements detect', () => {
  it('detects the official wide header, never by filename', () => {
    assert.equal(isHevyMeasurementsCsv(EMPTY), true);
    assert.equal(isHevyMeasurementsCsv(ONE), true);
    assert.equal(isHevyMeasurementsCsv(MALFORMED), true);
    assert.equal(detectCsvFormat(EMPTY), null, 'measurements are not a workout dialect');
    assert.equal(detectCsvFormat(ONE), null);
    assert.equal(detectCsvFormat(HEVY_WORKOUT), 'set-table-a');
    assert.equal(isHevyMeasurementsCsv(HEVY_WORKOUT), false);
  });

  it('a quoted official header is still measurements', () => {
    const quoted =
      '"date","weight_kg","fat_percent","neck_in","shoulder_in","chest_in",' +
      '"left_bicep_in","right_bicep_in","left_forearm_in","right_forearm_in",' +
      '"abdomen_in","waist_in","hips_in","left_thigh_in","right_thigh_in",' +
      '"left_calf_in","right_calf_in"\n' +
      '"9 Feb 2023, 00:00",83.69,,,,,,,,,,,,,,,\n';
    assert.equal(isHevyMeasurementsCsv(quoted), true);
    assert.equal(detectCsvFormat(quoted), null);
    const parsed = parseHevyMeasurementsCsv(quoted);
    assert.equal(parsed.error, undefined);
    assert.equal(parsed.entries.length, 1);
    assert.equal(parsed.entries[0].date, '2023-02-09');
    assert.equal(parsed.entries[0].weightKg, 83.69);
  });

  it('a metric _cm header is still measurements', () => {
    const csv =
      'date,weight_kg,fat_percent,waist_cm,chest_cm,hips_cm\n' +
      '"3 Jan 2024, 07:30",70.5,,80,98,95\n';
    assert.equal(isHevyMeasurementsCsv(csv), true);
    const parsed = parseHevyMeasurementsCsv(csv);
    assert.equal(parsed.error, undefined);
    assert.equal(parsed.entries[0].waistCm, 80);
    assert.equal(parsed.entries[0].chestCm, 98);
    assert.equal(parsed.entries[0].hipCm, 95);
  });
});

describe('importHevyMeasurements parse', () => {
  it('empty header-only is an error, not a silent wipe', () => {
    assert.equal(EMPTY.trimEnd(), HEVY_MEASUREMENTS_CSV_HEADER);
    const r = parseHevyMeasurementsCsv(EMPTY);
    assert.equal(r.error, 'no_data_rows');
    assert.equal(r.entries.length, 0);
    assert.equal(r.skippedRows, 0);
  });

  it('one row keeps the exact mapped cells — never invents', () => {
    const r = parseHevyMeasurementsCsv(ONE);
    assert.equal(r.error, undefined);
    assert.equal(r.entries.length, 1);
    assert.equal(r.entries[0].date, '2026-07-14');
    assert.equal(r.entries[0].weightKg, 82.5);
    assert.equal(r.entries[0].bodyFatPct, 16.2);
    assert.equal(r.entries[0].waistCm, undefined);
    assert.equal(r.skippedRows, 0);
  });

  it('malformed rows are skipped and counted; good cells stay', () => {
    const r = parseHevyMeasurementsCsv(MALFORMED);
    assert.equal(r.error, undefined);
    assert.equal(r.skippedRows, 2, 'bad date + non-numeric weight-only row');
    assert.equal(r.entries.length, 2);
    const byDate = new Map(r.entries.map((e) => [e.date, e]));
    assert.equal(byDate.get('2026-07-14')?.weightKg, 82.5);
    assert.equal(byDate.get('2026-07-16')?.weightKg, 81);
    assert.equal(byDate.get('2026-07-16')?.bodyFatPct, 18);
    assert.equal(byDate.has('2026-07-15'), false);
  });

  it('waist_in converts to cm; unmapped neck is skipped', () => {
    const csv =
      'date,neck_in,waist_in\n' +
      '"11 Jan 2024, 08:00",15.5,32\n';
    const r = parseHevyMeasurementsCsv(csv);
    assert.equal(r.error, undefined);
    assert.equal(r.entries.length, 1);
    assert.equal(r.entries[0].waistCm, 32 * 2.54);
    assert.equal(r.entries[0].weightKg, undefined, 'neck must not become weight');
  });

  it('right bicep wins over left for the one arm field', () => {
    const csv =
      'date,weight_kg,left_bicep_cm,right_bicep_cm\n' +
      '"7 Jan 2024, 08:00",,36,37.5\n';
    const r = parseHevyMeasurementsCsv(csv);
    assert.equal(r.entries[0].armCm, 37.5);
  });

  it('hevyMeasurementDateKey is a local calendar, not UTC', () => {
    assert.equal(hevyMeasurementDateKey('9 Feb 2023, 00:00'), '2023-02-09');
    assert.equal(hevyMeasurementDateKey('14 Jul 2026, 18:05'), '2026-07-14');
    assert.equal(hevyMeasurementDateKey('Jul 5, 2026, 10:21 AM'), '2026-07-05');
    assert.equal(hevyMeasurementDateKey('2026-07-14'), '2026-07-14');
    assert.equal(hevyMeasurementDateKey('not-a-date'), null);
  });
});

describe('importHevyMeasurements merge', () => {
  it('existing native fields win; missing fields fill; re-import is a no-op', () => {
    const existing = [{ date: '2026-07-14', weightKg: 80, waistCm: 90 }];
    const incoming = parseHevyMeasurementsCsv(ONE).entries;
    const once = mergeBodyMetrics(existing, incoming);
    assert.equal(once.added, 1, 'body fat is new; weight already here');
    assert.equal(once.duplicates, 1);
    const row = once.merged.find((e) => e.date === '2026-07-14');
    assert.equal(row?.weightKg, 80, 'native weight must not be replaced');
    assert.equal(row?.bodyFatPct, 16.2);
    assert.equal(row?.waistCm, 90);

    const again = mergeBodyMetrics(once.merged, incoming);
    assert.equal(again.added, 0);
    assert.equal(again.duplicates, 2);
    assert.equal(again.merged.length, once.merged.length);
  });

  it('a second file still adds a new date — no one-import cap', () => {
    const first = parseHevyMeasurementsCsv(ONE).entries;
    const secondCsv =
      `${HEVY_MEASUREMENTS_CSV_HEADER}\n` +
      '"20 Jul 2026, 08:00",81.0,,,,,,,,,,,,,,,\n';
    const second = parseHevyMeasurementsCsv(secondCsv).entries;
    const once = mergeBodyMetrics([], first);
    assert.equal(once.added, 2);
    const twice = mergeBodyMetrics(once.merged, second);
    assert.ok(twice.added >= 1, 'a second file must still add');
    assert.equal(twice.merged.length, 2);
  });
});
