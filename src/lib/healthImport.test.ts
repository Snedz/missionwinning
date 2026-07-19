import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  importActivitiesFromJson,
  parseHealthImportFile,
  parseHealthImportCsv,
  normalizeActivityType,
  coerceHealthImportRow,
} from './healthImport.ts';

describe('healthImport', () => {
  it('normalizes activity types', () => {
    assert.equal(normalizeActivityType('Running'), 'run');
    assert.equal(normalizeActivityType('Cycling'), 'bike');
    assert.equal(normalizeActivityType('8'), 'run');
  });

  it('parses wrapped activities array', () => {
    const rows = parseHealthImportFile(
      JSON.stringify({ activities: [{ date: '2026-01-01', type: 'walk', durationMin: 10 }] })
    );
    assert.equal(rows.length, 1);
  });

  it('parses Google Fit–style millis rows', () => {
    const row = coerceHealthImportRow({
      startTimeMillis: Date.parse('2026-07-01T12:00:00Z'),
      endTimeMillis: Date.parse('2026-07-01T12:30:00Z'),
      activityType: 8,
      distance: 4200,
    });
    assert.ok(row);
    assert.equal(row!.date, '2026-07-01');
    assert.equal(row!.durationMin, 30);
    assert.equal(row!.distanceKm, 4.2);
  });

  it('parses CSV', () => {
    const rows = parseHealthImportCsv(
      'date,type,durationMin,distanceKm,notes\n2026-07-01,walk,35,3.2,hi'
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0].type, 'walk');
    assert.equal(rows[0].durationMin, 35);
  });

  it('parseHealthImportFile accepts CSV text', () => {
    const rows = parseHealthImportFile('2026-07-01,run,20,3.0\n');
    assert.equal(rows.length, 1);
    assert.equal(rows[0].type, 'run');
  });

  it('skips invalid rows', () => {
    const result = importActivitiesFromJson([
      { date: 'bad', durationMin: 10 },
      { date: '2026-06-01', durationMin: 0 },
    ]);
    assert.equal(result.imported, 0);
    assert.equal(result.skipped, 2);
  });
});
