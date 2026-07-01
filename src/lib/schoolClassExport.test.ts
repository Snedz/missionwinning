import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatClassStandingsCsv } from '@/lib/schoolClassExport';

describe('schoolClassExport', () => {
  it('formats standings csv', () => {
    const csv = formatClassStandingsCsv('PE Class', 'MWA3K9', [
      { rank: 1, athleteLabel: 'Alex', bestTier: 'presidential', score: 100, lastTestAt: '2025-06-01' },
    ]);
    assert.match(csv, /MWA3K9/);
    assert.match(csv, /Alex/);
    assert.match(csv, /Rank,Athlete/);
  });
});
