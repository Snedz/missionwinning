import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { shouldAppendTodayMoreDetails } from './shouldAppendTodayMore.ts';

describe('shouldAppendTodayMoreDetails', () => {
  it('requires below-fold ready and at least one reason to open', () => {
    assert.equal(
      shouldAppendTodayMoreDetails({
        belowFoldReady: false,
        showQuickLinks: true,
        showDetailsAccordion: true,
        spilledCount: 3,
      }),
      false
    );
    assert.equal(
      shouldAppendTodayMoreDetails({
        belowFoldReady: true,
        showQuickLinks: false,
        showDetailsAccordion: false,
        spilledCount: 0,
      }),
      false
    );
    assert.equal(
      shouldAppendTodayMoreDetails({
        belowFoldReady: true,
        showQuickLinks: true,
        showDetailsAccordion: false,
        spilledCount: 0,
      }),
      true
    );
    assert.equal(
      shouldAppendTodayMoreDetails({
        belowFoldReady: true,
        showQuickLinks: false,
        showDetailsAccordion: true,
        spilledCount: 0,
      }),
      true
    );
    assert.equal(
      shouldAppendTodayMoreDetails({
        belowFoldReady: true,
        showQuickLinks: false,
        showDetailsAccordion: false,
        spilledCount: 1,
      }),
      true
    );
  });

  it('HomeTodayDashboard wires the helper (.428)', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'HomeTodayDashboard.tsx'),
      'utf8'
    );
    assert.match(src, /shouldAppendTodayMoreDetails\(/);
    assert.doesNotMatch(
      src,
      /belowFoldReady\s*&&\s*\(\s*layout\.showQuickLinks/
    );
  });
});
