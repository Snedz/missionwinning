import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatClassReportHtml } from '@/lib/schoolClassReportHtml';

describe('schoolClassReportHtml', () => {
  it('builds printable html report', () => {
    const html = formatClassReportHtml(
      'PE Class',
      'MWA3K9',
      { uniqueAthletes: 2, totalTests: 3, tierCounts: { presidential: 1 } },
      [{ rank: 1, athleteLabel: 'Alex', bestTier: 'presidential', score: 100 }]
    );
    assert.match(html, /<!DOCTYPE html>/);
    assert.match(html, /MWA3K9/);
    assert.match(html, /Alex/);
    assert.match(html, /Presidential/);
  });

  it('escapes html in athlete names', () => {
    const html = formatClassReportHtml('PE', 'MWX', { uniqueAthletes: 0, totalTests: 0, tierCounts: {} }, [
      { rank: 1, athleteLabel: '<script>', bestTier: 'below', score: 0 },
    ]);
    assert.match(html, /&lt;script&gt;/);
    assert.doesNotMatch(html, /<script>/i);
  });
});
