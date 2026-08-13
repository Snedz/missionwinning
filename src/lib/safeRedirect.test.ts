import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeNextPath } from './safeRedirect.ts';

describe('sanitizeNextPath', () => {
  it('allows listed paths', () => {
    assert.equal(sanitizeNextPath('/log'), '/log');
    assert.equal(sanitizeNextPath('/coach'), '/coach');
  });

  it('blocks open redirects', () => {
    assert.equal(sanitizeNextPath('//example.test'), '/log');
    assert.equal(sanitizeNextPath('/\\example.test'), '/log');
    assert.equal(sanitizeNextPath('https://example.test'), '/log');
    assert.equal(sanitizeNextPath('/school/class/../welcome'), '/log');
    assert.equal(sanitizeNextPath('/join/class/not a code'), '/log');
  });

  it('allows school class paths', () => {
    assert.equal(sanitizeNextPath('/school/class/MWAB12'), '/school/class/MWAB12');
    assert.equal(sanitizeNextPath('/join/class/MWAB12'), '/join/class/MWAB12');
  });
});
