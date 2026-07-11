import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getPrivateAccessPasswords,
  matchesPrivateAccessPassword,
  timingSafeSecretMatch,
} from './privateSession.ts';

describe('timingSafeSecretMatch', () => {
  it('matches equal strings', () => {
    assert.equal(timingSafeSecretMatch('Done', 'Done'), true);
  });

  it('rejects unequal strings', () => {
    assert.equal(timingSafeSecretMatch('Done', 'Nope'), false);
    assert.equal(timingSafeSecretMatch('Done', 'Done!'), false);
  });
});

describe('getPrivateAccessPasswords', () => {
  it('includes primary and comma-separated extras', () => {
    assert.deepEqual(getPrivateAccessPasswords('primary', 'Done, other'), [
      'primary',
      'Done',
      'other',
    ]);
  });

  it('dedupes and drops empties', () => {
    assert.deepEqual(getPrivateAccessPasswords('Done', 'Done, ,Done'), ['Done']);
  });
});

describe('matchesPrivateAccessPassword', () => {
  it('accepts primary or extras', () => {
    assert.equal(matchesPrivateAccessPassword('primary', 'primary', 'Done'), true);
    assert.equal(matchesPrivateAccessPassword('Done', 'primary', 'Done'), true);
    assert.equal(matchesPrivateAccessPassword('wrong', 'primary', 'Done'), false);
  });
});
