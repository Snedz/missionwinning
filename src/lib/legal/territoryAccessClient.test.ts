/**
 * P2-5 — /api/geo errors are not an allow, and missing-country allows
 * are not session-cached.
 */
import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  TERRITORY_ACCESS_CACHE_KEY,
  canCacheTerritoryAccess,
  fetchTerritoryAccess,
  readCachedTerritoryAccess,
  unavailableTerritoryAccess,
  writeCachedTerritoryAccess,
  type TerritoryAccessClient,
} from './territoryAccessClient.ts';

class MemoryStorage implements Storage {
  private readonly map = new Map<string, string>();
  get length(): number {
    return this.map.size;
  }
  clear(): void {
    this.map.clear();
  }
  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  key(index: number): string | null {
    return [...this.map.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

function geoOk(body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

const cdnAllow: TerritoryAccessClient = {
  country: 'US',
  blocked: false,
  reason: null,
  message: null,
  source: 'cdn',
};

describe('canCacheTerritoryAccess', () => {
  it('refuses errors, missing-country allows, and accept-language allows', () => {
    assert.equal(canCacheTerritoryAccess(unavailableTerritoryAccess()), false);
    assert.equal(
      canCacheTerritoryAccess({
        country: null,
        blocked: false,
        reason: null,
        message: null,
        source: 'cdn',
      }),
      false
    );
    assert.equal(
      canCacheTerritoryAccess({
        country: 'US',
        blocked: false,
        reason: null,
        message: null,
        source: 'accept-language',
      }),
      false
    );
  });

  it('allows a CDN allow with a country, and any non-error block', () => {
    assert.equal(canCacheTerritoryAccess(cdnAllow), true);
    assert.equal(
      canCacheTerritoryAccess({
        country: 'DE',
        blocked: true,
        reason: 'europe',
        message: 'no',
        source: 'cdn',
      }),
      true
    );
  });
});

describe('fetchTerritoryAccess', () => {
  let storage: MemoryStorage;
  let previousFetch: typeof fetch | undefined;
  let previousStorage: Storage | undefined;

  beforeEach(() => {
    storage = new MemoryStorage();
    const g = globalThis as { sessionStorage?: Storage; fetch: typeof fetch };
    previousStorage = g.sessionStorage;
    previousFetch = g.fetch;
    g.sessionStorage = storage;
  });

  afterEach(() => {
    const g = globalThis as { sessionStorage?: Storage; fetch?: typeof fetch };
    if (previousStorage) g.sessionStorage = previousStorage;
    else delete g.sessionStorage;
    if (previousFetch) g.fetch = previousFetch;
  });

  it('fails closed on a non-OK geo response and does not cache', async () => {
    globalThis.fetch = (async () => new Response('no', { status: 500 })) as typeof fetch;
    const t = await fetchTerritoryAccess();
    assert.equal(t.blocked, true);
    assert.equal(t.source, 'error');
    assert.equal(t.reason, 'unknown_edge');
    assert.equal(storage.length, 0);
  });

  it('fails closed when fetch throws and does not cache', async () => {
    globalThis.fetch = (async () => {
      throw new Error('offline');
    }) as typeof fetch;
    const t = await fetchTerritoryAccess();
    assert.equal(t.blocked, true);
    assert.equal(t.source, 'error');
    assert.equal(storage.length, 0);
  });

  it('does not cache a missing-country allow', async () => {
    globalThis.fetch = (async () =>
      geoOk({
        country: null,
        blocked: false,
        source: 'cdn',
      })) as typeof fetch;
    const t = await fetchTerritoryAccess();
    assert.equal(t.blocked, false);
    assert.equal(storage.length, 0);
  });

  it('does not cache an accept-language allow', async () => {
    globalThis.fetch = (async () =>
      geoOk({
        country: 'US',
        blocked: false,
        source: 'accept-language',
      })) as typeof fetch;
    const t = await fetchTerritoryAccess();
    assert.equal(t.blocked, false);
    assert.equal(storage.length, 0);
  });

  it('caches a CDN allow with a country', async () => {
    let calls = 0;
    globalThis.fetch = (async () => {
      calls += 1;
      return geoOk({
        country: 'US',
        blocked: false,
        source: 'cdn',
      });
    }) as typeof fetch;
    const first = await fetchTerritoryAccess();
    const second = await fetchTerritoryAccess();
    assert.equal(first.blocked, false);
    assert.equal(second.country, 'US');
    assert.equal(calls, 1);
    assert.ok(storage.getItem(TERRITORY_ACCESS_CACHE_KEY));
  });

  it('drops a stale cached allow that is not cacheable', () => {
    storage.setItem(
      TERRITORY_ACCESS_CACHE_KEY,
      JSON.stringify({
        country: null,
        blocked: false,
        reason: null,
        message: null,
        source: 'error',
      })
    );
    assert.equal(readCachedTerritoryAccess(), null);
    assert.equal(storage.getItem(TERRITORY_ACCESS_CACHE_KEY), null);
  });

  it('writeCachedTerritoryAccess refuses an error or missing-country allow', () => {
    writeCachedTerritoryAccess(unavailableTerritoryAccess());
    writeCachedTerritoryAccess({
      country: null,
      blocked: false,
      reason: null,
      message: null,
      source: 'cdn',
    });
    assert.equal(storage.length, 0);
  });
});

describe('territoryAccessClient source', () => {
  it('has a named fail-closed helper and no blocked-false error return', () => {
    const src = readFileSync(join(import.meta.dirname, 'territoryAccessClient.ts'), 'utf8');
    assert.match(src, /unavailableTerritoryAccess/);
    assert.match(src, /canCacheTerritoryAccess/);
    assert.doesNotMatch(src, /blocked:\s*false/);
  });
});
