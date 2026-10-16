/**
 * CSV export → import round-trip test.
 *
 * Verifies that diary export and session CSV import preserve core fields.
 * Uses csvFieldEquivalence for field-level comparison.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { CompletedWorkoutLog } from '@/types';
import { decideExportDiary } from './exportDiary.ts';
import { decideImportSessionCsv } from './importSessionCsv.ts';
import { compareRows, type NormRow } from '@/lib/workout/csvFieldEquivalence.ts';
import { localDateKeyFromIso } from '@/lib/time/localDate.ts';

/**
 * Convert an exported diary row to a normalized row for comparison.
 * Note: Export uses human-readable names (e.g., "bench press") while
 * import returns exercise IDs (e.g., "bench-press"). We normalize
 * the export name to ID format for comparison.
 */
function normalizeExportRow(row: {
  date: string;
  lift: string;
  kg: string;
  reps: string;
}): NormRow {
  const weight = parseFloat(row.kg) || 0;
  // Convert human-readable name to ID format for comparison with import
  const exerciseId = row.lift.toLowerCase().replace(/\s+/g, '-');
  return {
    exercise: exerciseId,
    sets: 1, // Each export row represents one set
    reps: parseInt(row.reps, 10) || 0,
    weight_value: weight,
    weight_unit: weight > 0 ? 'kg' : '',
    timestamp: row.date,
  };
}

/**
 * Convert an imported workout log to normalized rows (one per set).
 */
function normalizeImportedLog(log: CompletedWorkoutLog): NormRow[] {
  const date = localDateKeyFromIso(log.completedAt) ?? '';
  const rows: NormRow[] = [];

  for (const ex of log.exercises ?? []) {
    const exerciseName = ex.exerciseId ?? '';
    for (const set of ex.sets ?? []) {
      rows.push({
        exercise: exerciseName,
        sets: 1,
        reps: set.reps ?? 0,
        weight_value: set.weight ?? 0,
        weight_unit: (set.weight ?? 0) > 0 ? 'kg' : '',
        timestamp: date,
      });
    }
  }

  return rows;
}

/**
 * Helper to run round-trip and compare.
 * Returns comparison results for reporting.
 */
function runRoundTrip(
  fixtures: (Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'id'>)[]
): {
  exportRows: ReturnType<typeof normalizeExportRow>[];
  importedRows: NormRow[];
  comparisonResults: { left: NormRow; right: NormRow; result: ReturnType<typeof compareRows> }[];
  exportCsv: string;
  importResult: { kind: string; reason?: string };
} {
  // Build complete logs from fixtures
  const logs: CompletedWorkoutLog[] = fixtures.map((f) => ({
    clientId: `cid-${f.id}`,
    revision: 1,
    workoutName: f.workoutName ?? 'Test Workout',
    startedAt: f.startedAt ?? '2026-08-17T10:00:00.000Z',
    completedAt: f.completedAt ?? '2026-08-17T11:00:00.000Z',
    durationSeconds: 3600,
    totalVolume: 0,
    exercises: f.exercises ?? [],
    ...f,
  }));

  // Export to CSV
  const exportDecision = decideExportDiary(logs);
  assert.equal(exportDecision.kind, 'ready', 'Export should produce rows');
  if (exportDecision.kind !== 'ready') {
    throw new Error('Export failed');
  }

  // Import from CSV
  const importDecision = decideImportSessionCsv(exportDecision.csv, 'metric');
  
  // Capture import result for debugging
  const importResult = importDecision.kind === 'ready' 
    ? { kind: importDecision.kind }
    : { kind: importDecision.kind, reason: importDecision.reason };

  assert.equal(importDecision.kind, 'ready', `Import should produce rows, got: ${importDecision.kind} (${(importDecision as { reason?: string }).reason || 'N/A'})`);
  if (importDecision.kind !== 'ready') {
    throw new Error('Import failed');
  }

  // Normalize both sides
  const exportRows = exportDecision.rows.map(normalizeExportRow);
  const importedRows: NormRow[] = [];
  for (const log of importDecision.workouts) {
    importedRows.push(...normalizeImportedLog(log));
  }

  // Compare each row
  const comparisonResults: { left: NormRow; right: NormRow; result: ReturnType<typeof compareRows> }[] = [];
  const maxLen = Math.max(exportRows.length, importedRows.length);
  for (let i = 0; i < maxLen; i++) {
    const left = exportRows[i] ?? {
      exercise: '',
      sets: 0,
      reps: 0,
      weight_value: 0,
      weight_unit: '',
      timestamp: '',
    };
    const right = importedRows[i] ?? {
      exercise: '',
      sets: 0,
      reps: 0,
      weight_value: 0,
      weight_unit: '',
      timestamp: '',
    };
    comparisonResults.push({
      left,
      right,
      result: compareRows(left, right),
    });
  }

  return { exportRows, importedRows, comparisonResults, exportCsv: exportDecision.csv, importResult };
}

describe('CSV export → import round-trip', () => {
  it('basic round-trip preserves exercise, reps, weight, and date', () => {
    const fixtures: (Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'id'>)[] = [
      {
        id: 'log-1',
        sessionTitle: 'Push Day',
        exercises: [
          {
            exerciseId: 'bench-press',
            sets: [{ reps: 5, weight: 100 }],
          },
        ],
      },
    ];

    const { comparisonResults } = runRoundTrip(fixtures);

    assert.equal(comparisonResults.length, 1, 'Should have one row');
    const { result } = comparisonResults[0];
    assert.equal(result.equal, true, `Expected equal, got mismatches: ${JSON.stringify(result.mismatches)}`);
  });

  it('round-trip with blank weight (bodyweight) preserves zeros', () => {
    const fixtures: (Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'id'>)[] = [
      {
        id: 'log-bw',
        sessionTitle: 'Bodyweight Day',
        exercises: [
          {
            exerciseId: 'push-up',
            sets: [{ reps: 20, weight: 0 }],
          },
        ],
      },
    ];

    const { comparisonResults } = runRoundTrip(fixtures);

    assert.equal(comparisonResults.length, 1);
    const { result, left, right } = comparisonResults[0];
    // Blank weight should come through as 0
    assert.equal(left.weight_value, 0);
    assert.equal(right.weight_value, 0);
    assert.equal(result.equal, true, `Expected equal, mismatches: ${JSON.stringify(result.mismatches)}`);
  });

  it('round-trip with multiple sets and multiple exercises', () => {
    const fixtures: (Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'id'>)[] = [
      {
        id: 'log-multi',
        sessionTitle: 'Heavy Day',
        exercises: [
          {
            exerciseId: 'squats',
            sets: [
              { reps: 5, weight: 140 },
              { reps: 5, weight: 140 },
              { reps: 5, weight: 140 },
            ],
          },
          {
            exerciseId: 'bench-press',
            sets: [
              { reps: 5, weight: 100 },
              { reps: 5, weight: 100 },
            ],
          },
        ],
      },
    ];

    const { comparisonResults } = runRoundTrip(fixtures);

    // 3 squat sets + 2 bench sets = 5 rows
    assert.equal(comparisonResults.length, 5);
    // All should be equal
    for (let i = 0; i < comparisonResults.length; i++) {
      const { result } = comparisonResults[i];
      assert.equal(result.equal, true, `Row ${i} expected equal, mismatches: ${JSON.stringify(result.mismatches)}`);
    }
  });

  it('round-trip with different dates preserves timestamps', () => {
    const fixtures: (Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'id'>)[] = [
      {
        id: 'log-mon',
        sessionTitle: 'Monday',
        completedAt: '2026-08-17T10:00:00.000Z',
        exercises: [
          { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] },
        ],
      },
      {
        id: 'log-wed',
        sessionTitle: 'Wednesday',
        completedAt: '2026-08-19T11:00:00.000Z',
        exercises: [
          { exerciseId: 'squats', sets: [{ reps: 5, weight: 120 }] },
        ],
      },
    ];

    const { comparisonResults } = runRoundTrip(fixtures);

    assert.equal(comparisonResults.length, 2);
    // First row should be Monday (2026-08-17)
    assert.equal(comparisonResults[0].left.timestamp, '2026-08-17');
    // Second row should be Wednesday (2026-08-19)
    assert.equal(comparisonResults[1].left.timestamp, '2026-08-19');
    
    for (let i = 0; i < comparisonResults.length; i++) {
      const { result } = comparisonResults[i];
      assert.equal(result.equal, true, `Row ${i} expected equal, mismatches: ${JSON.stringify(result.mismatches)}`);
    }
  });

  it('empty export produces no comparison rows', () => {
    const logs: CompletedWorkoutLog[] = [];
    const exportDecision = decideExportDiary(logs);
    assert.equal(exportDecision.kind, 'empty');

    const importDecision = decideImportSessionCsv('', 'metric');
    assert.equal(importDecision.kind, 'empty');
  });
});
