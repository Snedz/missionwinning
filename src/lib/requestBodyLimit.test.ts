import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { rejectOversizedBody } from './requestBodyLimit.ts';

describe('rejectOversizedBody', () => {
  it('allows missing content-length', () => {
    const req = new NextRequest('http://localhost/api/x', { method: 'POST' });
    assert.equal(rejectOversizedBody(req), null);
  });

  it('allows under limit', () => {
    const req = new NextRequest('http://localhost/api/x', {
      method: 'POST',
      headers: { 'content-length': '100' },
    });
    assert.equal(rejectOversizedBody(req, 1024), null);
  });

  it('rejects over limit with 413', () => {
    const req = new NextRequest('http://localhost/api/x', {
      method: 'POST',
      headers: { 'content-length': '99999' },
    });
    const res = rejectOversizedBody(req, 1024);
    assert.ok(res);
    assert.equal(res!.status, 413);
  });
});
