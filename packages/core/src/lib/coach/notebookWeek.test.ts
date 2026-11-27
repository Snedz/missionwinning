import { test } from 'node:test';
import assert from 'node:assert/strict';
import parity from '../../fixtures/coach-parity.json';
import { generateNotebookWeek } from './notebookWeek';
import type { CompletedWorkoutLog } from '@/types';

const fixture = parity as {
  version: 1;
  timeZone: string;
  histories: Record<string, CompletedWorkoutLog[]>;
  cases: Array<{
    id: string;
    now: string;
    historyId: string;
    input: Omit<Parameters<typeof generateNotebookWeek>[0], 'history'>;
    expectedPlan: unknown;
  }>;
};

for (const item of fixture.cases) {
  test(`Coach parity: ${item.id}`, () => {
    assert.equal(fixture.version, 1);
    const history = fixture.histories[item.historyId];
    assert.ok(history);
    const original = process.env.TZ;
    try {
      process.env.TZ = fixture.timeZone;
      assert.deepEqual(generateNotebookWeek({ ...item.input, history }, new Date(item.now)), item.expectedPlan);
    } finally {
      if (original === undefined) delete process.env.TZ;
      else process.env.TZ = original;
    }
  });
}
