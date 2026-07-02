import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  importActivitiesFromJson,
  parseHealthImportFile,
  normalizeActivityType,
} from './healthImport';

describe('healthImport', () => {
  it('normalizes activity types', () => {
    assert.equal(normalizeActivityType('Running'), 'run');
    assert.equal(normalizeActivityType('Cycling'), 'bike');
  });

  it('parses wrapped activities array', () => {
    const rows = parseHealthImportFile(
      JSON.stringify({ activities: [{ date: '2026-01-01', type: 'walk', durationMin: 10 }] })
    );
    assert.equal(rows.length, 1);
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
