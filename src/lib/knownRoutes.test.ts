import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { KNOWN_TOP_SEGMENTS, isKnownPath } from './knownRoutes';

function dirs(p: string): string[] {
  return readdirSync(p).filter(
    (n) => !n.startsWith('(') && !n.startsWith('[') && statSync(join(p, n)).isDirectory()
  );
}

describe('knownRoutes', () => {
  it('lists every top-level app route folder', () => {
    for (const d of [...dirs('app'), ...dirs('app/(app)')]) {
      assert.ok(KNOWN_TOP_SEGMENTS.has(d), `app folder "${d}" missing from KNOWN_TOP_SEGMENTS`);
    }
  });
  it('unknown paths are not known; real ones are', () => {
    assert.equal(isKnownPath('/definitely-not-a-page'), false);
    assert.equal(isKnownPath('/'), true);
    assert.equal(isKnownPath('/log'), true);
    assert.equal(isKnownPath('/robots.txt'), true);
  });
});
