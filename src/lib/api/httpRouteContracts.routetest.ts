/**
 * HTTP contracts for existing App Router handlers.
 *
 * Calls the real `GET`/`POST` exports. Supabase, Open Food Facts, and PayPal
 * are answered by a fetch stand-in on the fixture host — no live network.
 * Payments stay off: success on those routes is the fail-closed status, and
 * the body must not carry a payment URL.
 */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { makeNextRequest } from '@/lib/api/testRequest';
import { restoreEnv, setTestEnv, snapshotEnv } from '@/lib/testEnv';

const ROOT = path.join(import.meta.dirname, '..', '..', '..');
const FIXTURE_PATH = path.join(import.meta.dirname, 'fixtures', 'route-contracts.json');

const SESSION_COOKIE = 'sb-test-auth-token';
const SESSION_TOKEN = 'aaa.bbb.ccc';
const USER_ID = '3f9a1c2e-5b7d-4e8f-9a0b-1c2d3e4f5a6b';
const USER_EMAIL = 'athlete@example.com';

const AUTH_USER = {
  id: USER_ID,
  aud: 'authenticated',
  role: 'authenticated',
  email: USER_EMAIL,
  email_confirmed_at: '2026-01-02T00:00:00.000Z',
  app_metadata: { provider: 'email' },
  user_metadata: {},
  created_at: '2026-01-02T00:00:00.000Z',
};

type Shape = string | number | boolean | null | Shape[] | { [key: string]: Shape };

type Check = {
  kind: string;
  path: string;
  status: number;
  auth?: 'session' | 'bearer' | 'admin';
  body?: unknown;
  raw?: string;
  headers?: Record<string, string>;
  env?: Record<string, string>;
  shape?: Record<string, Shape>;
  bodyExpect?: Record<string, unknown>;
  absent?: string[];
};

type RouteCase = {
  id: string;
  file: string;
  export: 'GET' | 'POST' | 'DELETE';
  checks: Check[];
};

type Handler = (request: Request, ctx?: { params: Promise<Record<string, string>> }) => Promise<Response>;

const fixture = JSON.parse(readFileSync(FIXTURE_PATH, 'utf8')) as { routes: RouteCase[] };

const originalFetch = globalThis.fetch;
let ipSeq = 0;

function jsonResponse(body: unknown, status = 200, extra?: HeadersInit): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...Object.fromEntries(new Headers(extra)) },
  });
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function requestMethod(input: RequestInfo | URL, init?: RequestInit): string {
  const fromInit = init?.method;
  if (fromInit) return fromInit.toUpperCase();
  if (typeof input !== 'string' && !(input instanceof URL) && input.method) {
    return input.method.toUpperCase();
  }
  return 'GET';
}

function requestHeaders(input: RequestInfo | URL, init?: RequestInit): Headers {
  const headers = new Headers(init?.headers);
  if (typeof input !== 'string' && !(input instanceof URL)) {
    input.headers.forEach((value, key) => {
      if (!headers.has(key)) headers.set(key, value);
    });
  }
  return headers;
}

async function fixtureFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = new URL(requestUrl(input));
  const method = requestMethod(input, init);
  const headers = requestHeaders(input, init);
  const host = url.hostname;

  if (host === 'example.supabase.co') {
    if (url.pathname === '/auth/v1/user') {
      const auth = headers.get('authorization') ?? '';
      if (!auth.includes(SESSION_TOKEN)) {
        return jsonResponse({ message: 'invalid' }, 401);
      }
      return jsonResponse(AUTH_USER);
    }
    if (url.pathname.startsWith('/auth/v1/admin/users/')) {
      return jsonResponse({});
    }
    if (url.pathname.startsWith('/rest/v1/rpc/')) {
      return jsonResponse(4);
    }
    if (url.pathname.startsWith('/rest/v1/')) {
      const table = decodeURIComponent(url.pathname.slice('/rest/v1/'.length).split('/')[0] ?? '');
      const accept = headers.get('accept') ?? '';
      const prefer = headers.get('prefer') ?? '';
      const object = accept.includes('application/vnd.pgrst.object+json');
      if (method === 'HEAD' || prefer.includes('count=')) {
        return new Response(null, { status: 200, headers: { 'content-range': '*/0' } });
      }
      if (method === 'GET' && object) {
        if (table === 'mission_ids') {
          return jsonResponse({ mission_id: 4, user_id: USER_ID });
        }
        if (table === 'profiles') {
          return jsonResponse({
            id: USER_ID,
            email: USER_EMAIL,
            referral_code: 'MW-ABCDE',
            referred_by: null,
          });
        }
        return jsonResponse(
          { code: 'PGRST116', message: 'Cannot coerce the result to a single JSON object' },
          406
        );
      }
      if (method === 'GET') {
        return jsonResponse([], 200, { 'content-range': '*/0' });
      }
      if (object) return jsonResponse({ id: 'row-1' }, 201);
      return jsonResponse([], 201);
    }
  }

  if (host === 'world.openfoodfacts.org' || host.endsWith('.openfoodfacts.org')) {
    if (url.pathname.includes('search')) return jsonResponse({ products: [] });
    return jsonResponse({ status: 0, product: null });
  }

  if (host.endsWith('paypal.com')) {
    return jsonResponse({ error: 'denied' }, 401);
  }

  if (host === 'api.resend.com') {
    return jsonResponse({ id: 'email_test' });
  }

  throw new Error(`blocked network ${method} ${host}${url.pathname}`);
}

function installFetch(): void {
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) =>
    fixtureFetch(input, init)) as typeof fetch;
}

function matchesShape(actual: unknown, spec: Shape, at: string): void {
  if (spec === 'any') return;
  if (spec === 'string') {
    assert.equal(typeof actual, 'string', at);
    return;
  }
  if (spec === 'number') {
    assert.equal(typeof actual, 'number', at);
    return;
  }
  if (spec === 'boolean') {
    assert.equal(typeof actual, 'boolean', at);
    return;
  }
  if (spec === 'null') {
    assert.equal(actual, null, at);
    return;
  }
  if (spec === 'array') {
    assert.ok(Array.isArray(actual), at);
    return;
  }
  if (spec === 'nonEmptyArray') {
    assert.ok(Array.isArray(actual) && actual.length > 0, at);
    return;
  }
  if (spec === 'object') {
    assert.ok(actual !== null && typeof actual === 'object' && !Array.isArray(actual), at);
    return;
  }
  if (typeof spec === 'string' && spec.includes('|')) {
    const options = spec.split('|');
    if (options.includes('null') && actual === null) return;
    const rest = options.filter((o) => o !== 'null').join('|');
    matchesShape(actual, rest, at);
    return;
  }
  if (typeof spec === 'string' || typeof spec === 'number' || typeof spec === 'boolean' || spec === null) {
    assert.deepEqual(actual, spec, at);
    return;
  }
  assert.fail(`${at} has an unsupported shape spec`);
}

function assertContract(payload: unknown, check: Check, label: string): void {
  assert.ok(payload !== null && typeof payload === 'object', `${label} JSON object`);
  const record = payload as Record<string, unknown>;
  if (check.bodyExpect) {
    for (const [key, value] of Object.entries(check.bodyExpect)) {
      assert.deepEqual(record[key], value, `${label} ${key}`);
    }
  }
  if (check.shape) {
    for (const [key, spec] of Object.entries(check.shape)) {
      assert.ok(key in record, `${label} missing ${key}`);
      matchesShape(record[key], spec, `${label} ${key}`);
    }
  }
  for (const key of check.absent ?? []) {
    assert.equal(key in record, false, `${label} must not include ${key}`);
  }
}

function nextIp(): string {
  ipSeq += 1;
  return `10.90.${(ipSeq >> 8) & 255}.${ipSeq & 255}`;
}

async function callRoute(route: RouteCase, handler: Handler, check: Check): Promise<Response> {
  const headers: Record<string, string> = {
    'x-forwarded-for': nextIp(),
    ...(check.headers ?? {}),
  };
  const cookies: Record<string, string> = {};
  if (check.auth === 'session') cookies[SESSION_COOKIE] = SESSION_TOKEN;
  if (check.auth === 'bearer') headers.authorization = `Bearer ${SESSION_TOKEN}`;
  if (check.auth === 'admin') headers['x-beta-admin-secret'] = 'test-admin-secret';

  const hasBody = check.raw !== undefined || check.body !== undefined;
  const body =
    check.raw !== undefined ? check.raw : check.body !== undefined ? JSON.stringify(check.body) : undefined;
  if (hasBody && check.raw === undefined) headers['content-type'] = 'application/json';

  const request = makeNextRequest(`http://localhost${check.path}`, {
    method: route.export,
    headers,
    cookies,
    ...(body !== undefined ? { body } : {}),
  });
  return handler(request);
}

const handlers = new Map<string, Handler>();

async function loadHandler(route: RouteCase): Promise<Handler> {
  const cached = handlers.get(`${route.file}:${route.export}`);
  if (cached) return cached;
  const abs = path.join(ROOT, route.file);
  const mod = (await import(abs)) as Record<string, Handler>;
  const handler = mod[route.export];
  assert.equal(typeof handler, 'function', `${route.file} exports ${route.export}`);
  handlers.set(`${route.file}:${route.export}`, handler);
  return handler;
}

describe('HTTP route contracts', { concurrency: 1 }, () => {
  const envBefore = snapshotEnv();

  before(() => {
    installFetch();
    setTestEnv('PRIVATE_MODE', 'true');
    setTestEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    setTestEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
    setTestEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role');
    setTestEnv('PRIVATE_ACCESS_SECRET', 'test-gate-secret-32chars-min!!');
    setTestEnv('DEMO_PREMIUM', 'false');
    delete process.env.CRON_SECRET;
    delete process.env.BETA_ADMIN_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.PAYPAL_WEBHOOK_ID;
    delete process.env.PAYPAL_CLIENT_ID;
    delete process.env.PAYPAL_CLIENT_SECRET;
    delete process.env.RESEND_API_KEY;
    delete process.env.VERCEL;
    delete process.env.VERCEL_ENV;
    delete process.env.NEXT_PUBLIC_WEARABLES;
    delete process.env.NEXT_PUBLIC_SURFACES;
    delete process.env.NEXT_PUBLIC_FREE_BETA;
  });

  after(() => {
    globalThis.fetch = originalFetch;
    restoreEnv(envBefore);
  });

  it('every fixture names a route file that exists', () => {
    assert.ok(fixture.routes.length > 0);
    for (const route of fixture.routes) {
      assert.equal(route.file.startsWith('app/api/'), true, route.file);
      assert.equal(route.file.endsWith('/route.ts'), true, route.file);
      assert.ok(existsSync(path.join(ROOT, route.file)), route.file);
    }
  });

  for (const route of fixture.routes) {
    for (const check of route.checks) {
      it(`${route.id} ${check.kind}`, async () => {
        const snap = snapshotEnv();
        try {
          if (check.env) {
            for (const [key, value] of Object.entries(check.env)) setTestEnv(key, value);
          }
          const handler = await loadHandler(route);
          const response = await callRoute(route, handler, check);
          const text = await response.text();
          let payload: unknown = null;
          try {
            payload = text ? JSON.parse(text) : null;
          } catch {
            payload = text;
          }
          assert.equal(
            response.status,
            check.status,
            `${route.id} ${check.kind} status ${response.status} body ${text.slice(0, 400)}`
          );
          if (check.shape || check.bodyExpect || check.absent) {
            assertContract(payload, check, `${route.id} ${check.kind}`);
          }
        } finally {
          restoreEnv(snap);
        }
      });
    }
  }
});
