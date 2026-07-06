import assert from 'node:assert/strict';
import { test, describe, beforeEach, afterEach } from 'node:test';
import { NextRequest } from 'next/server';
import { logApiRequest, withApiLogging } from './withApiLogging';

describe('withApiLogging', () => {
  const originalDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  let logged: string[];

  beforeEach(() => {
    logged = [];
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://example.ingest.sentry.io/1';
    const originalInfo = console.info;
    console.info = (msg?: unknown) => {
      if (typeof msg === 'string') logged.push(msg);
      originalInfo.call(console, msg);
    };
  });

  afterEach(() => {
    if (originalDsn === undefined) {
      delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    } else {
      process.env.NEXT_PUBLIC_SENTRY_DSN = originalDsn;
    }
  });

  test('returns handler response and logs structured entry', async () => {
    const handler = withApiLogging('test/ping', async () => {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    const res = await handler(new NextRequest('http://localhost/api/test/ping'));
    assert.equal(res.status, 200);
    assert.equal(logged.length, 1);
    const entry = JSON.parse(logged[0]!);
    assert.equal(entry.type, 'api_request');
    assert.equal(entry.route, 'test/ping');
    assert.equal(entry.method, 'GET');
    assert.equal(entry.status, 200);
  });

  test('logApiRequest is silent without DSN', () => {
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    logApiRequest({ route: 'x', method: 'GET', status: 200, durationMs: 1 });
    assert.equal(logged.length, 0);
  });

  test('maps thrown errors to 500', async () => {
    const handler = withApiLogging('test/boom', async () => {
      throw new Error('boom');
    });

    const res = await handler(new NextRequest('http://localhost/api/test/boom', { method: 'POST' }));
    assert.equal(res.status, 500);
    const body = (await res.json()) as { error: string };
    assert.equal(body.error, 'Internal server error');
    const apiLogs = logged.map((line) => JSON.parse(line) as { type: string; error?: boolean });
    const entry = apiLogs.find((l) => l.type === 'api_request' && l.error === true);
    assert.ok(entry);
  });
});
