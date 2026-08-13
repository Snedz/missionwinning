import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { accountUserIdFromSession } from './accountUserId.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');

describe('accountUserIdFromSession', () => {
  it('returns the session id and ignores a missing user', () => {
    assert.equal(accountUserIdFromSession({ id: 'user-session-1' }), 'user-session-1');
    assert.equal(accountUserIdFromSession(null), null);
    assert.equal(accountUserIdFromSession({ id: '   ' }), null);
  });

  it('account routes never read a client-chosen user id', () => {
    const exportSrc = readFileSync(path.join(root, 'app/api/account/export/route.ts'), 'utf8');
    const deleteSrc = readFileSync(path.join(root, 'app/api/account/delete/route.ts'), 'utf8');
    for (const [name, src] of [
      ['export', exportSrc],
      ['delete', deleteSrc],
    ] as const) {
      assert.match(src, /accountUserIdFromSession/, `${name} must mint the id from the session`);
      assert.doesNotMatch(
        src,
        /searchParams\.get\(\s*['"]userId['"]\s*\)/,
        `${name} must not take userId from the query`
      );
      assert.doesNotMatch(
        src,
        /parsed\.data\.userId|body\.userId/,
        `${name} must not take userId from the body`
      );
    }
  });
});
